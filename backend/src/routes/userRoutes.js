const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/userController");

// Wszystkie operacje na użytkownikach są dostępne tylko dla administratora.
router.get("/", auth, role(["admin"]), controller.list);
router.put("/:id/role", auth, role(["admin"]), controller.updateRole);
router.delete("/:id", auth, role(["admin"]), controller.remove);

module.exports = router;
