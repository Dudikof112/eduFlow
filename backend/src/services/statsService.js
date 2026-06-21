const { Course, Lesson, Enrollment, Progress, Rating } = require("../models");
const { fn, col } = require("sequelize");

// Funkcja zwraca statystyki kursów prowadzącego: liczbę zapisów, ukończeń (% kursantów,
// którzy ukończyli wszystkie lekcje) oraz średnią ocenę. Admin widzi wszystkie kursy.
const getInstructorStats = async (user) => {
  const where = user.role === "admin" ? {} : { creatorId: user.id };
  const courses = await Course.findAll({
    where,
    attributes: ["id", "title"],
    order: [["createdAt", "DESC"]],
  });

  const rows = [];
  for (const c of courses) {
    const lessons = await Lesson.findAll({
      where: { courseId: c.id },
      attributes: ["id"],
      raw: true,
    });
    const lessonIds = lessons.map((l) => l.id);
    const lessonCount = lessonIds.length;

    const enrollments = await Enrollment.count({ where: { courseId: c.id } });

    // ukończenia: liczba użytkowników, którzy ukończyli WSZYSTKIE lekcje kursu
    let completions = 0;
    if (lessonCount > 0) {
      const perUser = await Progress.findAll({
        attributes: ["userId", [fn("COUNT", col("id")), "done"]],
        where: { lessonId: lessonIds, completed: true },
        group: ["userId"],
        raw: true,
      });
      completions = perUser.filter((p) => parseInt(p.done, 10) >= lessonCount).length;
    }
    const completionRate =
      enrollments === 0 ? 0 : Math.min(100, Math.round((completions / enrollments) * 100));

    // średnia ocena i liczba ocen
    const ratingStats = await Rating.findOne({
      attributes: [
        [fn("AVG", col("value")), "avg"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: { courseId: c.id },
      raw: true,
    });
    const averageRating = Math.round((parseFloat(ratingStats.avg) || 0) * 10) / 10;
    const ratingCount = parseInt(ratingStats.count, 10) || 0;

    rows.push({
      courseId: c.id,
      title: c.title,
      lessonCount,
      enrollments,
      completions,
      completionRate,
      averageRating,
      ratingCount,
    });
  }

  const totals = {
    courses: rows.length,
    enrollments: rows.reduce((s, r) => s + r.enrollments, 0),
    completions: rows.reduce((s, r) => s + r.completions, 0),
  };
  return { rows, totals };
};

module.exports = { getInstructorStats };
