const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/chatController");

// Moje rozmowy – PRZED ":courseId/:studentId"
router.get("/threads", auth, controller.threads);

// Wiadomości w wątku (kurs + kursant)
router.get("/:courseId/:studentId", auth, controller.messages);

// Wyślij wiadomość
router.post("/:courseId/:studentId", auth, controller.send);

module.exports = router;
