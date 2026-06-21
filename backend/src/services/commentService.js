const { Comment, User, Course } = require("../models");

const addComment = async (data) => {
  const comment = await Comment.create(data);
  // dołączamy autora (bez hasła) do odpowiedzi
  return await Comment.findByPk(comment.id, {
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });
};

const getCourseComments = async (courseId) => {
  return await Comment.findAll({
    where: { courseId },
    // POPRAWKA: tylko bezpieczne pola autora (wcześniej leciało też hasło)
    include: [{ model: User, attributes: ["id", "name", "email"] }],
    order: [["createdAt", "DESC"]],
  });
};

// Funkcja zwraca wszystkie komentarze z autorem i tytułem kursu (moderacja przez admina).
const getAllComments = async () => {
  return await Comment.findAll({
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Course, attributes: ["id", "title"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

// Funkcja usuwa komentarz. Uprawnienie ma autor komentarza lub administrator.
const deleteComment = async (commentId, user) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    const e = new Error("Nie znaleziono komentarza");
    e.status = 404;
    throw e;
  }
  if (user.role !== "admin" && Number(comment.userId) !== Number(user.id)) {
    const e = new Error("Brak uprawnień do tego komentarza");
    e.status = 403;
    throw e;
  }
  await comment.destroy();
  return { success: true };
};

module.exports = {
  addComment,
  getCourseComments,
  getAllComments,
  deleteComment,
};
