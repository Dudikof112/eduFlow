const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const optionalAuth = require("../middlewares/optionalAuthMiddleware");
const role = require("../middlewares/roleMiddleware");
const { singleVideo } = require("../config/upload");
const controller = require("../controllers/lessonController");

// PUBLIC (wideo tylko dla zalogowanych -> optionalAuth): lekcje kursu
router.get("/:courseId", optionalAuth, controller.getLessonsByCourse);

// PANEL NAUCZYCIELA: utworzenie / edycja / usunięcie lekcji (prowadzący/admin)
router.post("/", auth, role(["creator", "admin"]), controller.create);
router.put("/:id", auth, role(["creator", "admin"]), controller.update);
router.delete("/:id", auth, role(["creator", "admin"]), controller.remove);

// PANEL NAUCZYCIELA: wgranie / usunięcie pliku wideo lekcji (prowadzący/admin)
// singleVideo (multer) obsługuje pole formularza "video".
router.post("/:id/video", auth, role(["creator", "admin"]), singleVideo, controller.uploadVideo);
router.delete("/:id/video", auth, role(["creator", "admin"]), controller.removeVideo);

module.exports = router;
