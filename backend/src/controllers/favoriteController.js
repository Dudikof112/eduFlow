const service = require("../services/favoriteService");

// GET /favorites — pełna lista ulubionych kursów.
const list = async (req, res, next) => {
  try {
    res.json(await service.getMyFavorites(req.user.id));
  } catch (err) {
    next(err);
  }
};

// GET /favorites/ids — identyfikatory ulubionych (do oznaczania na liście).
const ids = async (req, res, next) => {
  try {
    res.json(await service.getFavoriteIds(req.user.id));
  } catch (err) {
    next(err);
  }
};

// POST /favorites/:courseId — dodanie do ulubionych.
const add = async (req, res, next) => {
  try {
    res.status(201).json(await service.addFavorite(req.user.id, req.params.courseId));
  } catch (err) {
    next(err);
  }
};

// DELETE /favorites/:courseId — usunięcie z ulubionych.
const remove = async (req, res, next) => {
  try {
    res.json(await service.removeFavorite(req.user.id, req.params.courseId));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, ids, add, remove };
