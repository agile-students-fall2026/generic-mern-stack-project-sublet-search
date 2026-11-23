import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";
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
});
