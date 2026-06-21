const enrollmentService = require("../services/enrollmentService");

const enroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const result = await enrollmentService.enrollUser(userId, courseId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const unenroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const result = await enrollmentService.unenrollUser(userId, courseId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// GET /enrollments/mine — kursy zalogowanego użytkownika wraz z postępem.
const mine = async (req, res) => {
  try {
    res.json(await enrollmentService.getMyCourses(req.user.id));
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = {
  enroll,
  unenroll,
  mine,
};
