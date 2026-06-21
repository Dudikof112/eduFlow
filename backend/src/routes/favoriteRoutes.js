const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/favoriteController");

// Identyfikatory ulubionych – PRZED ewentualnymi trasami z parametrem
router.get("/ids", auth, controller.ids);
// Pełna lista ulubionych
router.get("/", auth, controller.list);
// Dodanie / usunięcie ulubionego kursu
router.post("/:courseId", auth, controller.add);
router.delete("/:courseId", auth, controller.remove);

module.exports = router;
