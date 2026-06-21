const { Favorite, Course, User, Lesson } = require("../models");
const { attachRatings } = require("./courseService");

// Funkcja dodaje kurs do ulubionych użytkownika (bez duplikatów).
const addFavorite = async (userId, courseId) => {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const e = new Error("Nie znaleziono kursu");
    e.status = 404;
    throw e;
  }
  await Favorite.findOrCreate({ where: { userId, courseId } });
  return { success: true };
};

// Funkcja usuwa kurs z ulubionych użytkownika.
const removeFavorite = async (userId, courseId) => {
  await Favorite.destroy({ where: { userId, courseId } });
  return { success: true };
};

// Funkcja zwraca identyfikatory ulubionych kursów (lekka lista do oznaczania serduszek).
const getFavoriteIds = async (userId) => {
  const favs = await Favorite.findAll({
    where: { userId },
    attributes: ["courseId"],
    raw: true,
  });
  return favs.map((f) => f.courseId);
};

// Funkcja zwraca pełne dane ulubionych kursów (z autorem, liczbą lekcji i ocenami).
const getMyFavorites = async (userId) => {
  const ids = await getFavoriteIds(userId);
  if (!ids.length) return [];
  const courses = await Course.findAll({
    where: { id: ids },
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Lesson, attributes: ["id"] },
    ],
  });
  return await attachRatings(courses);
};

module.exports = { addFavorite, removeFavorite, getFavoriteIds, getMyFavorites };
