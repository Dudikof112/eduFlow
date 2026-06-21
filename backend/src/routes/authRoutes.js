const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const auth = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimiters");
const controller = require("../controllers/authController");

// Publiczne: rejestracja i logowanie (z ograniczeniem liczby prób i walidacją wejścia).
router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Imię jest wymagane"),
    body("email").isEmail().withMessage("Podaj poprawny adres e-mail"),
    body("password").isLength({ min: 6 }).withMessage("Hasło musi mieć min. 6 znaków"),
  ],
  validate,
  controller.register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Podaj poprawny adres e-mail"),
    body("password").notEmpty().withMessage("Hasło jest wymagane"),
  ],
  validate,
  controller.login
);

// Konto zalogowanego użytkownika: dane, edycja profilu, zmiana hasła.
router.get("/me", auth, controller.me);
router.put("/profile", auth, controller.updateProfile);
router.put("/password", auth, controller.changePassword);

module.exports = router;
