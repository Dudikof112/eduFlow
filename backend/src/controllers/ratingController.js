const service = require("../services/ratingService");

// POST /ratings — dodanie/aktualizacja recenzji (ocena + tekst). userId z tokena.
const addRating = async (req, res, next) => {
  try {
    const data = await service.addOrUpdateRating({
      userId: req.user.id,
      courseId: req.body.courseId,
      value: req.body.value,
      text: req.body.text,
    });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// GET /ratings/:courseId — recenzje kursu (publiczne).
const getRatings = async (req, res, next) => {
  try {
    res.json(await service.getCourseRatings(req.params.courseId));
  } catch (err) {
    next(err);
  }
};

// DELETE /ratings/:courseId — usunięcie własnej recenzji.
const removeRating = async (req, res, next) => {
  try {
    res.json(await service.deleteRating(req.user.id, req.params.courseId));
  } catch (err) {
    next(err);
  }
};

module.exports = { addRating, getRatings, removeRating };
