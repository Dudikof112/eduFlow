const {
  User,
  Course,
  Enrollment,
  Progress,
  Rating,
  Comment,
  Payment,
} = require("../models");
const QuizAttempt = require("../models/mongo/QuizAttempt");
const courseService = require("./courseService");

// Dozwolone role, na które administrator może przestawić konto.
const ALLOWED_ROLES = ["student", "creator", "admin"];

// Funkcja zwraca listę wszystkich użytkowników (bez haseł) na potrzeby panelu admina.
const getAllUsers = async () => {
  return await User.findAll({
    attributes: ["id", "name", "email", "role", "createdAt"],
    order: [["createdAt", "ASC"]],
  });
};

// Funkcja zmienia rolę użytkownika po sprawdzeniu, czy podana rola jest dozwolona.
const updateUserRole = async (userId, role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    const e = new Error("Nieprawidłowa rola");
    e.status = 400;
    throw e;
  }
  const user = await User.findByPk(userId);
  if (!user) {
    const e = new Error("Nie znaleziono użytkownika");
    e.status = 404;
    throw e;
  }
  user.role = role;
  await user.save();
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

// Funkcja usuwa użytkownika wraz z jego danymi (zapisy, postępy, oceny, komentarze,
// płatności, podejścia do testów) oraz kursami, których jest twórcą.
// actingUser to administrator wykonujący operację (nie może usunąć samego siebie).
const deleteUser = async (userId, actingUser) => {
  if (Number(userId) === Number(actingUser.id)) {
    const e = new Error("Nie można usunąć własnego konta");
    e.status = 400;
    throw e;
  }
  const user = await User.findByPk(userId);
  if (!user) {
    const e = new Error("Nie znaleziono użytkownika");
    e.status = 404;
    throw e;
  }

  // Usunięcie kursów utworzonych przez użytkownika (wraz z lekcjami, testami, zapisami itd.).
  const courses = await Course.findAll({
    where: { creatorId: userId },
    attributes: ["id"],
  });
  for (const c of courses) {
    await courseService.deleteCourse(c.id, actingUser);
  }

  // Usunięcie pozostałych danych powiązanych z użytkownikiem.
  await Progress.destroy({ where: { userId } });
  await Enrollment.destroy({ where: { userId } });
  await Rating.destroy({ where: { userId } });
  await Comment.destroy({ where: { userId } });
  await Payment.destroy({ where: { userId } });
  await QuizAttempt.deleteMany({ userId });
  await user.destroy();

  return { success: true };
};

module.exports = { getAllUsers, updateUserRole, deleteUser };
