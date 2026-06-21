const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/paymentController");

// Rozpoczęcie płatności za kurs (tylko kursant/admin).
router.post("/checkout/:courseId", auth, role(["student", "admin"]), controller.checkout);

// Potwierdzenie płatności po powrocie ze Stripe.
router.post("/confirm", auth, controller.confirm);

// Uwaga: trasa webhooka (/payments/webhook) jest montowana w app.js PRZED express.json(),
// ponieważ weryfikacja podpisu Stripe wymaga surowego (nieparsowanego) body.

module.exports = router;
