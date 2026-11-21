import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";

use(chaiHttp);


describe("Conversations API", () => {

    it("should return conversations for the current user", async () => {
        const res = await request
            .execute(app)
            .get("/api/conversations")
            .set("x-user-id", "user1");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body[0].userOne).to.equal("user1");
    });

    it("should return messages for a conversation", async () => {
        const res = await request
            .execute(app)
            .get("/api/conversations/1/messages");

        expect(res).to.have.status(200);
        expect(res.body.messages).to.be.an("array");
        expect(res.body.messages).to.not.be.empty;
    });

    
    it("should create a conversation", async () => {
        const res = await request
            .execute(app)
            .post("/api/conversations")
            .send({ userOne: "user1", userTwo: "user2" });

        expect(res).to.have.status(200);
        expect(res.body.userOne).to.equal("user1");
        expect(res.body.userTwo).to.equal("user2");
        expect(res.body.messages).to.be.an("array").that.is.empty;
    });

    it("should send a message", async () => {
        const res = await request
            .execute(app)
            .post("/api/conversations/1/messages")
            .send({ sender: "user1", content: "Test message" });

        expect(res).to.have.status(200);
        expect(res.body.sender).to.equal("user1");
        expect(res.body.content).to.equal("Test message");
    });

    it("should reject messages from a user outside the conversation", async () => {
        const res = await request
            .execute(app)
            .post("/api/conversations/1/messages")
            .send({ sender: "user3", content: "Test message" });

        expect(res).to.have.status(403);
    });



    it("should mark messages as read", async () => {
        await request
            .execute(app)
            .post("/api/conversations/1/messages")
            .send({ sender: "user2", content: "Unread message" });

        const res = await request
            .execute(app)
            .patch("/api/conversations/1/read")
            .send({ reader: "user1" });

        expect(res).to.have.status(200);

        const conversation = await request
            .execute(app)
            .get("/api/conversations/1/messages");


        expect(
            conversation.body.messages.every((message) => message.userOneRead)
        ).to.equal(true);
    });
});
