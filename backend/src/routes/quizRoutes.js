const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/quizController");

// Tworzenie testu — tylko prowadzący/admin
router.post("/", auth, role(["creator", "admin"]), controller.create);

// Lista testów kursu (publiczny podgląd) — PRZED "/:id"
router.get("/course/:courseId", controller.listForCourse);

// Moje podejścia do testu (zalogowany) — PRZED "/:id"
router.get("/:id/attempts", auth, controller.myAttempts);

// PANEL NAUCZYCIELA: pełny test do edycji (właściciel/admin) — PRZED "/:id"
router.get("/:id/edit", auth, role(["creator", "admin"]), controller.getForEdit);

// Rozwiązanie testu (zalogowany) + zapis podejścia
router.post("/:id/submit", auth, controller.submit);

// PANEL NAUCZYCIELA: edycja / usunięcie testu (właściciel/admin)
router.put("/:id", auth, role(["creator", "admin"]), controller.update);
router.delete("/:id", auth, role(["creator", "admin"]), controller.remove);

// Pojedynczy test (publiczny, bez poprawnych odpowiedzi)
router.get("/:id", controller.getOne);

module.exports = router;
