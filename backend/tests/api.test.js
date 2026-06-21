const request = require("supertest");
const app = require("../src/app");

// Testy integracyjne API, które NIE wymagają bazy danych — odrzucenie następuje
// w warstwie middleware (autoryzacja / walidacja) jeszcze przed dostępem do bazy.
describe("Bezpieczeństwo i routing (bez bazy danych)", () => {
  test("GET /auth/me bez tokenu zwraca 401", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /courses/mine bez tokenu zwraca 401", async () => {
    const res = await request(app).get("/courses/mine");
    expect(res.status).toBe(401);
  });

  test("POST /ratings bez tokenu zwraca 401", async () => {
    const res = await request(app).post("/ratings").send({ courseId: 1, value: 5 });
    expect(res.status).toBe(401);
  });

  test("POST /auth/register z błędnymi danymi zwraca 400 i listę błędów", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "", email: "zly-email", password: "123" });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
