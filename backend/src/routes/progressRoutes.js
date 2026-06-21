const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/progressController");

// mark lesson done
router.post(
  "/:lessonId/complete",
  auth,
  role(["student"]),
  controller.completeLesson
);

// course progress %
router.get(
  "/:courseId",
  auth,
  controller.getProgress
);

module.exports = router;