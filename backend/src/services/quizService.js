const Quiz = require("../models/mongo/Quiz");
const QuizAttempt = require("../models/mongo/QuizAttempt");
const { assertCourseOwner } = require("../utils/ownership");

// Funkcja zwraca posortowany zbiór indeksów poprawnych odpowiedzi pytania.
// Korzysta z correctIndexes (nowe), a w razie ich braku z correctIndex (zgodność wstecz).
const correctSetOf = (q) => {
  if (Array.isArray(q.correctIndexes) && q.correctIndexes.length) {
    return [...new Set(q.correctIndexes)].sort((a, b) => a - b);
  }
  if (typeof q.correctIndex === "number") return [q.correctIndex];
  return [];
};

// Funkcja porównuje dwa posortowane zbiory liczb (równość zawartości).
const setsEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// Funkcja zwraca potasowaną kopię tablicy (algorytm Fishera-Yatesa).
const shuffleArr = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Funkcja informuje, czy pytanie jest wielokrotnego wyboru (flaga lub >1 poprawna odpowiedź).
const isMultiple = (q) =>
  !!q.multiple || (Array.isArray(q.correctIndexes) && q.correctIndexes.length > 1);

// ===== Tworzenie testu (właściciel kursu/admin) =====
const createQuiz = async (data, user) => {
  await assertCourseOwner(data.courseId, user);
  const { courseId, title, passingScore, questions, timeLimit, shuffle, questionsToShow } = data;
  return await Quiz.create({
    courseId,
    title,
    passingScore,
    questions,
    timeLimit: Number(timeLimit) || 0,
    shuffle: !!shuffle,
    questionsToShow: Number(questionsToShow) || 0,
  });
};

// Wersja DO LISTY (pełen zestaw pytań, bez ujawniania poprawnych odpowiedzi).
const toPublicList = (quiz) => ({
  id: quiz._id,
  courseId: quiz.courseId,
  title: quiz.title,
  passingScore: quiz.passingScore,
  timeLimit: quiz.timeLimit || 0,
  questions: quiz.questions.map((q) => ({
    id: q._id,
    text: q.text,
    options: q.options,
    multiple: isMultiple(q),
  })),
});

// Wersja DO ROZWIĄZANIA — z losowaniem kolejności i opcjonalnym podzbiorem pytań.
const toPublicTake = (quiz) => {
  let questions = quiz.questions.map((q) => ({
    id: q._id,
    text: q.text,
    options: q.options,
    multiple: isMultiple(q),
  }));
  // Tasujemy, gdy włączone losowanie lub gdy pokazujemy losowy podzbiór.
  if (quiz.shuffle || (quiz.questionsToShow && quiz.questionsToShow > 0)) {
    questions = shuffleArr(questions);
  }
  if (quiz.questionsToShow && quiz.questionsToShow > 0 && quiz.questionsToShow < questions.length) {
    questions = questions.slice(0, quiz.questionsToShow);
  }
  return {
    id: quiz._id,
    courseId: quiz.courseId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit || 0,
    questions,
  };
};

const getQuizzesForCourse = async (courseId) => {
  const quizzes = await Quiz.find({ courseId }).sort({ createdAt: -1 });
  return quizzes.map(toPublicList);
};

const getQuizById = async (id) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const e = new Error("Nie znaleziono testu");
    e.status = 404;
    throw e;
  }
  return toPublicTake(quiz);
};

// ===== Sprawdzenie odpowiedzi + zapis podejścia =====
// answers: tablica obiektów { questionId, selected: [indeksy] } — obsługuje też
// pojedynczy podzbiór pytań (losowanie) oraz wielokrotny wybór.
const submitQuiz = async (quizId, userId, answers) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const e = new Error("Nie znaleziono testu");
    e.status = 404;
    throw e;
  }

  const given = Array.isArray(answers) ? answers : [];
  // Mapa: id pytania -> posortowane wybrane indeksy.
  const byId = {};
  given.forEach((a) => {
    if (a && a.questionId !== undefined) {
      const sel = Array.isArray(a.selected) ? a.selected : a.selected != null ? [a.selected] : [];
      byId[String(a.questionId)] = [...new Set(sel)].sort((x, y) => x - y);
    }
  });

  // Oceniamy pytania, na które udzielono odpowiedzi (obsługa losowego podzbioru);
  // jeśli nic nie dopasowano, oceniamy wszystkie pytania.
  const answered = quiz.questions.filter((q) => byId[String(q._id)] !== undefined);
  const scored = answered.length ? answered : quiz.questions;

  let correct = 0;
  const results = scored.map((q) => {
    const sel = byId[String(q._id)] || [];
    const cset = correctSetOf(q);
    const ok = setsEqual(sel, cset);
    if (ok) correct++;
    return {
      questionId: q._id,
      text: q.text,
      options: q.options,
      multiple: isMultiple(q),
      correctIndexes: cset,
      given: sel,
      isCorrect: ok,
      explanation: q.explanation || null,
    };
  });

  const total = scored.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = score >= quiz.passingScore;

  await QuizAttempt.create({
    quizId: quiz._id,
    userId,
    courseId: quiz.courseId,
    answers: given,
    score,
    passed,
  });

  return { score, passed, correct, total, passingScore: quiz.passingScore, results };
};

// ===== Moje podejścia do danego testu =====
const getMyAttempts = async (quizId, userId) => {
  return await QuizAttempt.find({ quizId, userId }).sort({ createdAt: -1 });
};

// ===== Panel nauczyciela =====
// Pełna wersja testu DO EDYCJI (z poprawnymi odpowiedziami) — tylko właściciel kursu/admin.
const getQuizForEdit = async (id, user) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const e = new Error("Nie znaleziono testu");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(quiz.courseId, user);
  return {
    id: quiz._id,
    courseId: quiz.courseId,
    title: quiz.title,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit || 0,
    shuffle: !!quiz.shuffle,
    questionsToShow: quiz.questionsToShow || 0,
    questions: quiz.questions.map((q) => ({
      id: q._id,
      text: q.text,
      options: q.options,
      multiple: isMultiple(q),
      correctIndexes: correctSetOf(q),
      explanation: q.explanation || "",
    })),
  };
};

// Funkcja aktualizuje test po sprawdzeniu uprawnień właściciela kursu.
const updateQuiz = async (id, data, user) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const e = new Error("Nie znaleziono testu");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(quiz.courseId, user);
  const { title, passingScore, questions, timeLimit, shuffle, questionsToShow } = data;
  if (title !== undefined) quiz.title = title;
  if (passingScore !== undefined) quiz.passingScore = passingScore;
  if (questions !== undefined) quiz.questions = questions;
  if (timeLimit !== undefined) quiz.timeLimit = Number(timeLimit) || 0;
  if (shuffle !== undefined) quiz.shuffle = !!shuffle;
  if (questionsToShow !== undefined) quiz.questionsToShow = Number(questionsToShow) || 0;
  await quiz.save();
  return quiz;
};

// Funkcja usuwa test wraz z podejściami, po sprawdzeniu uprawnień właściciela kursu.
const deleteQuiz = async (id, user) => {
  const quiz = await Quiz.findById(id);
  if (!quiz) {
    const e = new Error("Nie znaleziono testu");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(quiz.courseId, user);
  await QuizAttempt.deleteMany({ quizId: quiz._id });
  await quiz.deleteOne();
  return { success: true };
};

module.exports = {
  createQuiz,
  getQuizzesForCourse,
  getQuizById,
  submitQuiz,
  getMyAttempts,
  getQuizForEdit,
  updateQuiz,
  deleteQuiz,
};
