const service = require("../services/statsService");

// GET /stats/instructor — statystyki kursów prowadzącego (lub wszystkich, gdy admin).
const getInstructor = async (req, res, next) => {
  try {
    res.json(await service.getInstructorStats(req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = { getInstructor };
