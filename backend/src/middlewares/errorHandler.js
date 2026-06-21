// Globalny handler błędów.
// W Express 5 odrzucone Promise z async-kontrolerów trafiają tu automatycznie,
// więc kontrolery bez try/catch (lesson, comment, rating...) nie wywalą serwera,
// tylko zwrócą czytelny JSON.
const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err.message);

  // Błędy walidacji / unikalności z Sequelize -> 400 zamiast 500
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({
      error: "Validation error",
      details: (err.errors || []).map((e) => e.message),
    });
  }

  // Błędy Mongoose (MongoDB) -> czytelne 400 zamiast 500
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Nieprawidłowy identyfikator" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: Object.values(err.errors || {}).map((e) => e.message),
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
};

module.exports = errorHandler;
