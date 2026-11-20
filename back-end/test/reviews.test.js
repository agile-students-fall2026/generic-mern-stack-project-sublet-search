
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";

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
