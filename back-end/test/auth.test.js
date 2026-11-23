import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";
import users from "../data/users.js";

use(chaiHttp);

const api = () => request.execute(app);

describe("Auth API", () => {
    const originalLength = users.length;

    afterEach(() => {
        users.length = originalLength;
    });

    describe("POST /api/signup", () => {
        const body = { name: "Riley", email: "Riley@NYU.edu", password: "secret123" };

        it("creates a user and returns only public fields", async () => {
            const res = await api().post("/api/signup").send(body);

            expect(res).to.have.status(201);
            expect(res.body).to.have.all.keys("id", "name", "email");
            expect(res.body.email).to.equal("riley@nyu.edu");
            expect(res.body).to.not.have.property("password");
        });

        it("gives the new user complete profile defaults", async () => {
            const res = await api().post("/api/signup").send(body);
            const stored = users.find((u) => u.id === res.body.id);

            expect(stored.verifications).to.deep.equal({ eduEmail: false, govId: false, phone: false });
            expect(stored.savedListingIds).to.deep.equal([]);
            expect(stored.bio).to.equal("");
        });

        it("assigns an id that does not collide with existing users", async () => {
            const a = await api().post("/api/signup").send(body);
            const b = await api().post("/api/signup").send({ ...body, email: "other@nyu.edu" });

            expect(a.body.id).to.not.equal(b.body.id);
            expect(users.filter((u) => u.id === a.body.id)).to.have.length(1);
        });

        it("rejects missing fields", async () => {
            for (const missing of ["name", "email", "password"]) {
                const payload = { ...body };
                delete payload[missing];
                const res = await api().post("/api/signup").send(payload);
                expect(res).to.have.status(400);
            }
        });

        it("rejects a duplicate email, case-insensitively", async () => {
            const res = await api().post("/api/signup").send({ ...body, email: "NANA@nyu.edu" });

            expect(res).to.have.status(409);
            expect(res.body.error).to.be.a("string");
        });

        it("lets a new user log in and open their profile", async () => {
            const signup = await api().post("/api/signup").send(body);
            const login = await api().post("/api/login").send({ email: body.email, password: body.password });
            expect(login).to.have.status(200);

            const me = await api().get("/api/users/me").set("x-user-id", signup.body.id);
            expect(me).to.have.status(200);
            expect(me.body.name).to.equal("Riley");
        });
    });

    describe("POST /api/login", () => {
        it("logs in a seeded user", async () => {
            const res = await api().post("/api/login").send({ email: "nana@nyu.edu", password: "password123" });

            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({ id: "user1", name: "Nana", email: "nana@nyu.edu" });
        });

        it("ignores email case", async () => {
            const res = await api().post("/api/login").send({ email: "NANA@NYU.EDU", password: "password123" });
            expect(res).to.have.status(200);
        });

        it("rejects a wrong password", async () => {
            const res = await api().post("/api/login").send({ email: "nana@nyu.edu", password: "nope" });
            expect(res).to.have.status(401);
        });

        it("rejects an unknown email", async () => {
            const res = await api().post("/api/login").send({ email: "ghost@nyu.edu", password: "password123" });
            expect(res).to.have.status(401);
        });

        it("rejects missing credentials", async () => {
            expect(await api().post("/api/login").send({ email: "nana@nyu.edu" })).to.have.status(400);
            expect(await api().post("/api/login").send({ password: "x" })).to.have.status(400);
            expect(await api().post("/api/login").send({})).to.have.status(400);
        });
    });

    describe("POST /api/forgot-password", () => {
        it("acknowledges a request without changing any password", async () => {
            const user = users.find((u) => u.id === "user2");
            const before = user.password;

            const res = await api().post("/api/forgot-password").send({ email: "morgan@nyu.edu", newPassword: "takeover" });

            expect(res).to.have.status(200);
            expect(res.body.message).to.be.a("string");
            expect(user.password).to.equal(before);

            const login = await api().post("/api/login").send({ email: "morgan@nyu.edu", password: "takeover" });
            expect(login).to.have.status(401);
        });

        it("answers the same for unknown emails so accounts cannot be enumerated", async () => {
            const known = await api().post("/api/forgot-password").send({ email: "nana@nyu.edu" });
            const unknown = await api().post("/api/forgot-password").send({ email: "ghost@nyu.edu" });

            expect(unknown).to.have.status(200);
            expect(unknown.body).to.deep.equal(known.body);
        });

        it("returns 400 without an email", async () => {
            expect(await api().post("/api/forgot-password").send({})).to.have.status(400);
            expect(await api().post("/api/forgot-password").send({ email: "  " })).to.have.status(400);
        });
    });

    describe("POST /api/auth/logout", () => {
        it("returns 204", async () => {
            const res = await api().post("/api/auth/logout");
            expect(res).to.have.status(204);
        });
    });
});
