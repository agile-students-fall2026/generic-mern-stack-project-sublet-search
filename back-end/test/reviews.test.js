
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";
import reviews from "../data/reviews.js";

use(chaiHttp);

describe("Received Reviews API", () => {
    it("should return reviews received by user1", async () => {
        const res = await request.execute(app).get("/api/users/user1/reviews/received");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(2);
        expect(res.body.every(
            review => review.targetUserId === "user1"
        )).to.equal(true);
    });

    it("should return an empty array for a user with no reviews", async () => {
        const res = await request.execute(app).get("/api/users/user2/reviews/received");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array").that.is.empty;
    });

    it("should return 404 for a nonexistent user", async () => {
        const res = await request.execute(app).get("/api/users/unknown/reviews/received");

        expect(res).to.have.status(404);
    });
});

describe("Submitted Reviews API", () => {
    it("should return reviews submitted by user2", async () => {
        const res = await request.execute(app).get("/api/users/user2/reviews/submitted");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);

        expect(res.body[0].authorUserId).to.equal("user2");
        expect(res.body[0].author).to.equal("Morgan");
    });

    it("should return reviews submitted by user3", async () => {
        const res = await request.execute(app).get("/api/users/user3/reviews/submitted");

        expect(res).to.have.status(200);
        expect(res.body).to.have.lengthOf(1);
        expect(res.body[0].author).to.equal("Jordan");
    });

    it("should return an empty array if the user has not submitted reviews", async () => {
        const res = await request.execute(app).get("/api/users/user1/reviews/submitted");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array").that.is.empty;
    });

    it("should return 404 for a nonexistent user", async () => {
        const res = await request.execute(app).get("/api/users/unknown/reviews/submitted");

        expect(res).to.have.status(404);
    });
});


describe("Like Reviews API", () => {
    beforeEach(() => {
        for (const review of reviews) {
            review.likes = 0;
            review.likedBy = [];
        }
    });

    it("should like a review", async () => {
        const res = await request.execute(app)
            .post("/api/reviews/1/like");

        expect(res).to.have.status(200);
        expect(res.body.likes).to.equal(1);
        expect(res.body.likedBy).to.include("user1");
    });

    it("should prevent duplicate likes from the same user", async () => {
        await request.execute(app).post("/api/reviews/1/like");

        const res = await request.execute(app).post("/api/reviews/1/like");

        expect(res).to.have.status(200);
        expect(res.body.likes).to.equal(1);
    });

    it("should allow different users to like the same review", async () => {
        await request.execute(app).post("/api/reviews/1/like").set("x-user-id", "user1");

        const res = await request.execute(app).post("/api/reviews/1/like").set("x-user-id", "user2");

        expect(res).to.have.status(200);
        expect(res.body.likes).to.equal(2);
    });

    it("should return 404 for a nonexistent review", async () => {
        const res = await request.execute(app).post("/api/reviews/999/like");

        expect(res).to.have.status(404);
        expect(res.body.error).to.equal("Review not found");
    });
});
