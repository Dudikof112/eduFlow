const role = require("../src/middlewares/roleMiddleware");

// Pomocniczy obiekt odpowiedzi z zapamiętywaniem statusu.
const mockRes = () => {
  const res = { statusCode: 200 };
  res.status = (c) => {
    res.statusCode = c;
    return res;
  };
  res.json = (b) => {
    res.body = b;
    return res;
  };
  return res;
};

describe("roleMiddleware", () => {
  test("przepuszcza dozwoloną rolę (wywołanie next)", () => {
    const req = { user: { id: 1, role: "creator" } };
    const res = mockRes();
    let nextCalled = false;
    role(["creator", "admin"])(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });

  test("blokuje niedozwoloną rolę statusem 403", () => {
    const req = { user: { id: 2, role: "student" } };
    const res = mockRes();
    let nextCalled = false;
    role(["creator", "admin"])(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  test("obsługuje wariant z osobnymi argumentami", () => {
    const req = { user: { id: 3, role: "admin" } };
    const res = mockRes();
    let nextCalled = false;
    role("creator", "admin")(req, res, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
