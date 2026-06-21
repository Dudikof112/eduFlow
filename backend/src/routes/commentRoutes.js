const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/commentController");

// MODERACJA (admin): wszystkie komentarze – PRZED "/:courseId"
router.get("/", auth, role(["admin"]), controller.list);

// Dodanie komentarza wymaga zalogowania (auth)
router.post("/", auth, controller.addComment);

// Usunięcie komentarza – autor lub admin (sprawdzane w serwisie)
router.delete("/:id", auth, controller.remove);

// Odczyt komentarzy kursu zostaje publiczny (podgląd kursu)
router.get("/:courseId", controller.getComments);

module.exports = router;
