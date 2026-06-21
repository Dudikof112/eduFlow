const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/certificateController");

// Moje certyfikaty
router.get("/", auth, controller.list);

// Pobranie certyfikatu PDF dla danego kursu (generuje, jeśli kurs ukończony)
router.get("/:courseId/download", auth, controller.download);

module.exports = router;
