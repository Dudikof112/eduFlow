const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/enrollmentController");

// Moje kursy (z postępem) – PRZED trasami z parametrem
router.get("/mine", auth, controller.mine);

// zapis na kurs
router.post("/:courseId", auth, role(["student", "admin"]), controller.enroll);

// anulowanie zapisu
router.delete("/:courseId", auth, role(["student", "admin"]), controller.unenroll);

module.exports = router;
