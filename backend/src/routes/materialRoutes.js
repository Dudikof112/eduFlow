const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const { singleMaterial } = require("../config/upload");
const controller = require("../controllers/materialController");

// Wgranie materiału do lekcji (multer obsługuje pole formularza "file")
router.post("/:lessonId", auth, role(["creator", "admin"]), singleMaterial, controller.upload);

// Usunięcie materiału
router.delete("/:id", auth, role(["creator", "admin"]), controller.remove);

module.exports = router;
