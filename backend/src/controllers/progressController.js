const progressService = require("../services/progressService");

const completeLesson = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;

    const result = await progressService.completeLesson(userId, lessonId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const result = await progressService.getCourseProgress(userId, courseId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  completeLesson,
  getProgress
};