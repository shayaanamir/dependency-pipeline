const request = require("supertest");
const app = require("../src/app");

describe("Books API", () => {
  test("POST /books returns 201", async () => {
    const res = await request(app).post("/books").send({ title: "Dune", author: "Frank Herbert" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test("POST /books with invalid body returns 400", async () => {
    const res = await request(app).post("/books").send({ title: "" });
    expect(res.status).toBe(400);
  });

  test("GET /books/999 returns 404", async () => {
    const res = await request(app).get("/books/999");
    expect(res.status).toBe(404);
  });

  test("PUT then DELETE a book", async () => {
    const created = await request(app).post("/books").send({ title: "A", author: "B" });
    const id = created.body.id;
    const updated = await request(app).put(`/books/${id}`).send({ title: "A2", author: "B2" });
    expect(updated.body.title).toBe("A2");
    const del = await request(app).delete(`/books/${id}`);
    expect(del.status).toBe(204);
    expect((await request(app).get(`/books/${id}`)).status).toBe(404);
  });
});
