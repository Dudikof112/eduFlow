const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/notificationController");

// Moje powiadomienia (z licznikiem nieprzeczytanych)
router.get("/", auth, controller.list);
// Oznaczenie wszystkich jako przeczytane
router.post("/read-all", auth, controller.readAll);

module.exports = router;
