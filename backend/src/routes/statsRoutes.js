const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/statsController");

// Statystyki dla prowadzącego/admina
router.get("/instructor", auth, role(["creator", "admin"]), controller.getInstructor);

module.exports = router;
