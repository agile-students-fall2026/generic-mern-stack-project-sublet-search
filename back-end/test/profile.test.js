import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";
import fs from "fs";
import users from "../data/users.js";

use(chaiHttp);

const api = () => request.execute(app);
const as = (req, id) => req.set("x-user-id", id);

describe("Profile API", () => {
    let snapshot;

    beforeEach(() => {
        snapshot = structuredClone(users);
    });

    afterEach(() => {
        users.splice(0, users.length, ...snapshot);
    });

    describe("GET /api/users/me", () => {
        it("returns the full profile of the requesting user", async () => {
            const res = await as(api().get("/api/users/me"), "user1");

            expect(res).to.have.status(200);
            expect(res.body).to.include({ id: "user1", name: "Nana", school: "NYU" });
            expect(res.body.verifications).to.be.an("object");
        });

        it("never exposes the password", async () => {
            const res = await as(api().get("/api/users/me"), "user1");
            expect(res.body).to.not.have.property("password");
        });

        it("defaults to user1 without the header", async () => {
            const res = await api().get("/api/users/me");
            expect(res.body.id).to.equal("user1");
        });

        it("returns 404 for an unknown user", async () => {
            const res = await as(api().get("/api/users/me"), "nobody");
            expect(res).to.have.status(404);
        });
    });

    describe("PUT /api/users/me", () => {
        it("updates allowed fields and returns the updated user", async () => {
            const res = await as(api().put("/api/users/me"), "user1")
                .send({ name: "Nana K", bio: "New bio", school: "Columbia", city: "Boston", photo: "x.png" });

            expect(res).to.have.status(200);
            expect(res.body).to.include({ name: "Nana K", bio: "New bio", school: "Columbia", city: "Boston", photo: "x.png" });
            expect(res.body).to.not.have.property("password");

            const again = await as(api().get("/api/users/me"), "user1");
            expect(again.body.name).to.equal("Nana K");
        });

        it("ignores fields that are not editable", async () => {
            const res = await as(api().put("/api/users/me"), "user1")
                .send({ id: "hacked", email: "evil@x.com", password: "pw", name: "Ok" });

            expect(res.body.id).to.equal("user1");
            expect(res.body.email).to.equal("nana@nyu.edu");
            expect(users.find((u) => u.id === "user1").password).to.equal("password123");
            expect(res.body.name).to.equal("Ok");
        });

        it("keeps fields that are not sent", async () => {
            const res = await as(api().put("/api/users/me"), "user1").send({ name: "Only Name" });
            expect(res.body.bio).to.equal("CS Junior looking for summer sublets.");
        });

        it("returns 404 for an unknown user", async () => {
            const res = await as(api().put("/api/users/me"), "nobody").send({ name: "x" });
            expect(res).to.have.status(404);
        });
    });

    describe("PUT /api/users/me/verifications", () => {
        it("updates boolean flags only", async () => {
            const res = await as(api().put("/api/users/me/verifications"), "user1")
                .send({ govId: true, phone: "yes", other: true });

            expect(res).to.have.status(200);
            expect(res.body.verifications.govId).to.equal(true);
            expect(res.body.verifications.phone).to.equal(true); // unchanged: string ignored
            expect(res.body.verifications).to.not.have.property("other");
            expect(res.body).to.not.have.property("password");
        });

        it("works for a freshly signed-up user", async () => {
            const signup = await api().post("/api/signup")
                .send({ name: "New", email: "new@nyu.edu", password: "pw123456" });
            const res = await as(api().put("/api/users/me/verifications"), signup.body.id).send({ eduEmail: true });

            expect(res).to.have.status(200);
            expect(res.body.verifications.eduEmail).to.equal(true);
        });

        it("returns 404 for an unknown user", async () => {
            const res = await as(api().put("/api/users/me/verifications"), "nobody").send({ phone: true });
            expect(res).to.have.status(404);
        });
    });

    describe("GET /api/users/me/reviews", () => {
        it("returns reviews about the requesting user", async () => {
            const res = await as(api().get("/api/users/me/reviews"), "user1");

            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array").that.is.not.empty;
            expect(res.body.every((r) => r.targetUserId === "user1")).to.equal(true);
        });

        it("returns an empty array when there are none", async () => {
            const res = await as(api().get("/api/users/me/reviews"), "user2");
            expect(res.body).to.deep.equal([]);
        });
    });

    describe("POST /api/users/me/saved-listings/:listingId (toggle)", () => {
        it("adds then removes a listing", async () => {
            const add = await as(api().post("/api/users/me/saved-listings/1"), "user2");
            expect(add).to.have.status(200);
            expect(add.body.savedListingIds).to.include(1);

            const remove = await as(api().post("/api/users/me/saved-listings/1"), "user2");
            expect(remove.body.savedListingIds).to.not.include(1);
        });

        it("returns 404 for an unknown user", async () => {
            const res = await as(api().post("/api/users/me/saved-listings/1"), "nobody");
            expect(res).to.have.status(404);
        });
    });

    describe("saved listings are per user", () => {
        it("does not leak one user's saves to another", async () => {
            await as(api().post("/api/saved/1"), "user2");

            const user2 = await as(api().get("/api/saved"), "user2");
            const user3 = await as(api().get("/api/saved"), "user3");

            expect(user2.body.some((l) => l.id === 1)).to.equal(true);
            expect(user3.body.some((l) => l.id === 1)).to.equal(false);
        });
    });

    describe("payment methods (mutations)", () => {
        it("adds the first method as default, later ones as non-default", async () => {
            const first = await as(api().post("/api/users/me/payment-methods"), "user3")
                .send({ label: "Visa", last4: "1111", expiry: "01/30" });
            expect(first).to.have.status(201);
            expect(first.body).to.have.length(1);
            expect(first.body[0]).to.include({ label: "Visa", last4: "1111", isDefault: true });

            const second = await as(api().post("/api/users/me/payment-methods"), "user3")
                .send({ label: "Amex", last4: "2222" });
            expect(second.body).to.have.length(2);
            expect(second.body[1].isDefault).to.equal(false);
        });

        it("sets a new default", async () => {
            await as(api().post("/api/users/me/payment-methods"), "user3").send({ label: "A", last4: "1111" });
            const added = await as(api().post("/api/users/me/payment-methods"), "user3").send({ label: "B", last4: "2222" });
            const target = added.body[1].id;

            const res = await as(api().put(`/api/users/me/payment-methods/${target}/default`), "user3");

            expect(res).to.have.status(200);
            expect(res.body.filter((m) => m.isDefault).map((m) => m.id)).to.deep.equal([target]);
        });

        it("deletes a method", async () => {
            const added = await as(api().post("/api/users/me/payment-methods"), "user3").send({ label: "A", last4: "1111" });
            const res = await as(api().delete(`/api/users/me/payment-methods/${added.body[0].id}`), "user3");

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal([]);
        });

        it("returns 404 for an unknown user on every mutation", async () => {
            expect(await as(api().post("/api/users/me/payment-methods"), "nobody").send({})).to.have.status(404);
            expect(await as(api().put("/api/users/me/payment-methods/x/default"), "nobody")).to.have.status(404);
            expect(await as(api().delete("/api/users/me/payment-methods/x"), "nobody")).to.have.status(404);
        });
    });

    describe("profile picture", () => {
        const png = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "base64"
        );
        const upload = (id, buf = png, name = "me.png", type = "image/png") =>
            as(api().post("/api/users/me/photo"), id).attach("photo", buf, { filename: name, contentType: type });

        afterEach(async () => {
            await as(api().delete("/api/users/me/photo"), "user1");
            await as(api().delete("/api/users/me/photo"), "user2");
        });

        it("uploads an image and stores its URL on the profile", async () => {
            const res = await upload("user1");

            expect(res).to.have.status(201);
            expect(res.body.photo).to.match(/^\/uploads\/avatars\/avatar-.*\.png$/);
            expect(res.body).to.not.have.property("password");
            expect(fs.existsSync(`public${res.body.photo}`)).to.equal(true);

            const me = await as(api().get("/api/users/me"), "user1");
            expect(me.body.photo).to.equal(res.body.photo);
        });

        it("serves the uploaded file", async () => {
            const res = await upload("user1");
            const file = await api().get(res.body.photo);

            expect(file).to.have.status(200);
            expect(file.type).to.equal("image/png");
        });

        it("replaces the old file when a new picture is uploaded", async () => {
            const first = await upload("user1");
            const second = await upload("user1");

            expect(second.body.photo).to.not.equal(first.body.photo);
            expect(fs.existsSync(`public${first.body.photo}`)).to.equal(false);
            expect(fs.existsSync(`public${second.body.photo}`)).to.equal(true);
        });

        it("rejects a request with no file", async () => {
            const res = await as(api().post("/api/users/me/photo"), "user1");
            expect(res).to.have.status(400);
        });

        it("rejects a non-image file", async () => {
            const res = await upload("user1", Buffer.from("hello"), "note.txt", "text/plain");

            expect(res).to.have.status(400);
            expect(users.find((u) => u.id === "user1").photo).to.equal("");
        });

        it("rejects an image over 5 MB", async () => {
            const res = await upload("user1", Buffer.alloc(5 * 1024 * 1024 + 1), "big.png");

            expect(res).to.have.status(413);
            expect(users.find((u) => u.id === "user1").photo).to.equal("");
        });

        it("returns 404 for an unknown user and stores nothing", async () => {
            const res = await upload("nobody");
            expect(res).to.have.status(404);
        });

        it("only changes the requesting user's picture", async () => {
            await upload("user1");
            const other = await as(api().get("/api/users/me"), "user2");

            expect(other.body.photo).to.equal("");
        });

        it("removes the picture and deletes the file", async () => {
            const added = await upload("user1");
            const res = await as(api().delete("/api/users/me/photo"), "user1");

            expect(res).to.have.status(200);
            expect(res.body.photo).to.equal("");
            expect(fs.existsSync(`public${added.body.photo}`)).to.equal(false);
        });

        it("does not try to delete an external photo URL", async () => {
            await as(api().put("/api/users/me"), "user1").send({ photo: "https://example.com/a.png" });
            const res = await as(api().delete("/api/users/me/photo"), "user1");

            expect(res).to.have.status(200);
            expect(res.body.photo).to.equal("");
        });

        it("returns 404 when removing for an unknown user", async () => {
            const res = await as(api().delete("/api/users/me/photo"), "nobody");
            expect(res).to.have.status(404);
        });
    });
});
