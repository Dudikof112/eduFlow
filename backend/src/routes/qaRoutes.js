const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/qaController");

// Lista pytań i odpowiedzi pod lekcją (publiczna)
router.get("/lesson/:lessonId", controller.listForLesson);

// Zadanie pytania pod lekcją (zalogowany)
router.post("/lesson/:lessonId", auth, controller.ask);

// Odpowiedź na pytanie (zalogowany)
router.post("/questions/:questionId/answers", auth, controller.answer);

// Usunięcie pytania / odpowiedzi (autor lub admin)
router.delete("/questions/:id", auth, controller.removeQuestion);
router.delete("/answers/:id", auth, controller.removeAnswer);

module.exports = router;
