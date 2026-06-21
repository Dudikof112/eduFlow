const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/moduleController");

// PUBLIC: moduły kursu
router.get("/course/:courseId", controller.listForCourse);

// PANEL NAUCZYCIELA: tworzenie / edycja / usuwanie modułów (prowadzący/admin)
router.post("/", auth, role(["creator", "admin"]), controller.create);
router.put("/:id", auth, role(["creator", "admin"]), controller.update);
router.delete("/:id", auth, role(["creator", "admin"]), controller.remove);

module.exports = router;
