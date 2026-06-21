const { Course } = require("../models");

// Funkcja weryfikuje, czy użytkownik może zarządzać danym kursem.
// Dostęp ma twórca kursu (creatorId) oraz administrator.
// Rzuca błąd 404, gdy kurs nie istnieje, lub 403 przy braku uprawnień.
// Zwraca obiekt kursu, aby wywołujący mógł go ponownie wykorzystać.
const assertCourseOwner = async (courseId, user) => {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const e = new Error("Nie znaleziono kursu");
    e.status = 404;
    throw e;
  }
  if (user.role !== "admin" && Number(course.creatorId) !== Number(user.id)) {
    const e = new Error("Brak uprawnień do tego kursu");
    e.status = 403;
    throw e;
  }
  return course;
};

module.exports = { assertCourseOwner };
