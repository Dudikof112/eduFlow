const { Question, Answer, User, Lesson } = require("../models");
const notificationService = require("./notificationService");

// wspólne dołączenie autorów i odpowiedzi do pytania
const withRelations = {
  include: [
    { model: User, attributes: ["id", "name", "role"] },
    { model: Answer, include: [{ model: User, attributes: ["id", "name", "role"] }] },
  ],
};

// Funkcja zwraca pytania danej lekcji wraz z autorami i odpowiedziami.
const getQuestionsForLesson = async (lessonId) => {
  return await Question.findAll({
    where: { lessonId },
    ...withRelations,
    order: [["createdAt", "ASC"], [Answer, "createdAt", "ASC"]],
  });
};

// Funkcja dodaje pytanie pod lekcją i zwraca je wraz z relacjami.
const addQuestion = async ({ lessonId, courseId, userId, text }) => {
  if (!text || !text.trim()) {
    const e = new Error("Treść pytania jest wymagana");
    e.status = 400;
    throw e;
  }
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    const e = new Error("Nie znaleziono lekcji");
    e.status = 404;
    throw e;
  }
  const q = await Question.create({
    lessonId,
    courseId: courseId || lesson.courseId,
    userId,
    text: text.trim(),
  });
  return await Question.findByPk(q.id, withRelations);
};

// Funkcja dodaje odpowiedź do pytania i zwraca ją wraz z autorem.
const addAnswer = async ({ questionId, userId, text }) => {
  if (!text || !text.trim()) {
    const e = new Error("Treść odpowiedzi jest wymagana");
    e.status = 400;
    throw e;
  }
  const question = await Question.findByPk(questionId);
  if (!question) {
    const e = new Error("Nie znaleziono pytania");
    e.status = 404;
    throw e;
  }
  const a = await Answer.create({ questionId, userId, text: text.trim() });
  // Powiadomienie dla autora pytania (jeśli to nie on sam odpowiada).
  if (Number(question.userId) !== Number(userId)) {
    try {
      await notificationService.createNotification({
        userId: question.userId,
        type: "qa",
        text: "Nowa odpowiedź na Twoje pytanie",
        link: `/courses/${question.courseId}`,
      });
    } catch {
      /* brak powiadomienia nie może blokować dodania odpowiedzi */
    }
  }
  return await Answer.findByPk(a.id, {
    include: [{ model: User, attributes: ["id", "name", "role"] }],
  });
};

// Funkcja usuwa pytanie (autor lub admin) wraz z jego odpowiedziami.
const deleteQuestion = async (id, user) => {
  const question = await Question.findByPk(id);
  if (!question) {
    const e = new Error("Nie znaleziono pytania");
    e.status = 404;
    throw e;
  }
  if (question.userId !== user.id && user.role !== "admin") {
    const e = new Error("Brak uprawnień");
    e.status = 403;
    throw e;
  }
  await Answer.destroy({ where: { questionId: id } });
  await question.destroy();
  return { success: true };
};

// Funkcja usuwa odpowiedź (autor lub admin).
const deleteAnswer = async (id, user) => {
  const answer = await Answer.findByPk(id);
  if (!answer) {
    const e = new Error("Nie znaleziono odpowiedzi");
    e.status = 404;
    throw e;
  }
  if (answer.userId !== user.id && user.role !== "admin") {
    const e = new Error("Brak uprawnień");
    e.status = 403;
    throw e;
  }
  await answer.destroy();
  return { success: true };
};

module.exports = {
  getQuestionsForLesson,
  addQuestion,
  addAnswer,
  deleteQuestion,
  deleteAnswer,
};
