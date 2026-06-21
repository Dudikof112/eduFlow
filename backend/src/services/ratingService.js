const { Rating, User } = require("../models");

// Funkcja dodaje lub aktualizuje recenzję użytkownika dla kursu (ocena + opcjonalny tekst).
const addOrUpdateRating = async ({ userId, courseId, value, text }) => {
  const t = text && text.trim() ? text.trim() : null;
  const [rating, created] = await Rating.findOrCreate({
    where: { userId, courseId },
    defaults: { value, text: t },
  });
  if (!created) {
    await rating.update({ value, text: t });
  }
  return rating;
};

// Funkcja zwraca recenzje kursu (z autorem) oraz policzoną średnią i liczbę ocen.
const getCourseRatings = async (courseId) => {
  const ratings = await Rating.findAll({
    where: { courseId },
    include: [{ model: User, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
  });
  const avg = ratings.reduce((sum, r) => sum + r.value, 0) / (ratings.length || 1);
  return { ratings, average: avg.toFixed(2), count: ratings.length };
};

// Funkcja usuwa recenzję danego użytkownika dla kursu.
const deleteRating = async (userId, courseId) => {
  const rating = await Rating.findOne({ where: { userId, courseId } });
  if (!rating) {
    const e = new Error("Nie znaleziono recenzji");
    e.status = 404;
    throw e;
  }
  await rating.destroy();
  return { success: true };
};

module.exports = { addOrUpdateRating, getCourseRatings, deleteRating };
