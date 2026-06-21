const jwt = require("jsonwebtoken");

// Jak authMiddleware, ale NIE odrzuca żądania bez tokenu.
// Jeśli token jest i jest poprawny -> ustawia req.user. W przeciwnym razie traktujemy jak gościa.
// Używane tam, gdzie treść jest publiczna, ale część danych (np. videoUrl) pokazujemy tylko zalogowanym.
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header) {
    const token = header.split(" ")[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // niepoprawny token -> po prostu gość
    }
  }
  next();
};

module.exports = optionalAuth;
