// POPRAWKA: middleware wołany był jako role(["student","admin"]) (tablica),
// a wcześniej używał (...allowedRoles), więc allowedRoles = [["student","admin"]]
// i includes() zawsze dawał false -> każdy request leciał 403.
// Teraz obsługujemy OBA warianty wywołania:
//   role("student", "admin")  oraz  role(["student", "admin"])
const role = (...args) => {
  const allowedRoles =
    args.length === 1 && Array.isArray(args[0]) ? args[0] : args;

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No user" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

module.exports = role;
