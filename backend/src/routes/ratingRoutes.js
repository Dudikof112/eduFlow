const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const auth = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const controller = require("../controllers/ratingController");

// Dodanie/aktualizacja recenzji wymaga zalogowania (ocena 1–5)
router.post(
  "/",
  auth,
  [body("value").isInt({ min: 1, max: 5 }).withMessage("Ocena musi być liczbą 1–5")],
  validate,
  controller.addRating
);

// Usunięcie własnej recenzji
router.delete("/:courseId", auth, controller.removeRating);

// Odczyt recenzji publiczny
router.get("/:courseId", controller.getRatings);

module.exports = router;
