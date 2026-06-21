const { Enrollment, Course, Lesson, Progress } = require("../models");

const enrollUser = async (userId, courseId) => {
  // 1. sprawdź czy kurs istnieje
  const course = await Course.findByPk(courseId);
  if (!course) throw new Error("Course not found");

  // 2. sprawdź czy już zapisany
  const existing = await Enrollment.findOne({ where: { userId, courseId } });
  if (existing) {
    return existing;
  }

  // 3. zapis
  const enrollment = await Enrollment.create({ userId, courseId });

  // 4. auto-create progress dla wszystkich lekcji
  const lessons = await Lesson.findAll({ where: { courseId } });
  const progressRows = lessons.map((lesson) => ({
    userId,
    lessonId: lesson.id,
    completed: false,
  }));
  await Progress.bulkCreate(progressRows);

  return enrollment;
};

// Anulowanie zapisu: usuwa wpis zapisu ORAZ postęp użytkownika w lekcjach kursu.
const unenrollUser = async (userId, courseId) => {
  const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
  if (!enrollment) {
    const e = new Error("Nie jesteś zapisany na ten kurs");
    e.status = 400;
    throw e;
  }

  const lessons = await Lesson.findAll({
    where: { courseId },
    attributes: ["id"],
  });
  const lessonIds = lessons.map((l) => l.id);
  if (lessonIds.length) {
    await Progress.destroy({ where: { userId, lessonId: lessonIds } });
  }

  await enrollment.destroy();
  return { success: true };
};

const isUserEnrolled = async (userId, courseId) => {
  return await Enrollment.findOne({ where: { userId, courseId } });
};

// Funkcja zwraca kursy, na które użytkownik jest zapisany, wraz z postępem
// (liczba ukończonych lekcji i procent) — wykorzystywana w kokpicie „Moje kursy".
const getMyCourses = async (userId) => {
  const enrollments = await Enrollment.findAll({
    where: { userId },
    include: [
      {
        model: Course,
        include: [{ model: Lesson, attributes: ["id"] }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const result = [];
  for (const en of enrollments) {
    const course = en.Course;
    if (!course) continue;
    const lessonIds = (course.Lessons || []).map((l) => l.id);
    const total = lessonIds.length;
    let done = 0;
    if (total) {
      done = await Progress.count({
        where: { userId, lessonId: lessonIds, completed: true },
      });
    }
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const obj = course.toJSON();
    delete obj.Lessons;
    result.push({ ...obj, total, done, percent });
  }
  return result;
};

module.exports = {
  enrollUser,
  unenrollUser,
  isUserEnrolled,
  getMyCourses,
};
