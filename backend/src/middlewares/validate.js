const { validationResult } = require("express-validator");

// Middleware kończący łańcuch walidacji express-validator.
// Przy błędach zwraca 400 z czytelną listą pól i komunikatów.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Błędne dane wejściowe",
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
};

module.exports = validate;
