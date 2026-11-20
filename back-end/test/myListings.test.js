import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js"

use(chaiHttp);

const newListing = {
    title: "Test Loft",
    location: "1 Pine St, Seattle, WA",
    price: 1800,
    startDate: "2027-06-01",
    endDate: "2027-08-15",
    photos: ["/uploads/first.jpg"],
};

describe("Listings API", () => {
    it("should return all listings as an array", async () => {
        const res = await request.execute(app).get("/api/listings");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    it("should return the details of one listing", async () => {
        const res = await request.execute(app).get("/api/listings/1");

        expect(res).to.have.status(200);
        expect(res.body.id).to.equal(1);
        expect(res.body.photos).to.be.an("array");
    });

    it("should return 404 for a listing that does not exist", async () => {
        const res = await request.execute(app).get("/api/listings/999");

        expect(res).to.have.status(404);
        expect(res.body.error).to.equal("Listing not found.");
    });

    it("should create a listing", async () => {
        const res = await request.execute(app).post("/api/listings").send(newListing);

        expect(res).to.have.status(201);
        expect(res.body.price).to.equal("$1,800");
        expect(res.body.availability).to.equal("Jun 1 – Aug 15");
    });

    it("should reject a listing with missing fields", async () => {
        const res = await request.execute(app).post("/api/listings").send({ title: "Only a title" });

        expect(res).to.have.status(400);
    });

    it("should reject a listing with no photos", async () => {
        const res = await request.execute(app).post("/api/listings").send({ ...newListing, photos: [] });

        expect(res).to.have.status(400);
    });

    it("should update a listing", async () => {
        const created = await request.execute(app).post("/api/listings").send(newListing);

        const res = await request.execute(app).put(`/api/listings/${created.body.id}`).send({ title: "New Title" });

        expect(res).to.have.status(200);
        expect(res.body.title).to.equal("New Title");
    });
});

describe("My Listings API", () => {
    it("should return active and past listings", async () => {
        const res = await request.execute(app).get("/api/users/me/listings");

        expect(res).to.have.status(200);
        expect(res.body.active).to.be.an("array");
        expect(res.body.past).to.be.an("array");
    });

    it("should move a listing to past when it is taken down", async () => {
        const created = await request.execute(app).post("/api/listings").send(newListing);
        await request.execute(app).put(`/api/listings/${created.body.id}`).send({ active: false });

        const res = await request.execute(app).get("/api/users/me/listings");

        expect(res.body.past.some(listing => listing.id === created.body.id)).to.equal(true);
    });

    it("should delete a listing", async () => {
        const created = await request.execute(app).post("/api/listings").send(newListing);

        const res = await request.execute(app).delete(`/api/users/me/listings/${created.body.id}`);

        expect(res).to.have.status(204);
    });

    it("should not delete someone else's listing", async () => {
        const res = await request.execute(app).delete("/api/users/me/listings/3"); 

        expect(res).to.have.status(403);
    });
});

describe("Other API routes", () => {
    it("should return the user's payment methods as an array", async () => {
        const res = await request.execute(app).get("/api/users/me/payment-methods");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    it("should reject an image upload with no files", async () => {
        const res = await request.execute(app).post("/api/uploads/listing-images");

        expect(res).to.have.status(400);
    });
});