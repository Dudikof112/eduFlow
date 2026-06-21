const quizService = require("../services/quizService");

// POST /quizzes  (właściciel kursu/admin)
const create = async (req, res, next) => {
  try {
    const { courseId, title, passingScore, questions, timeLimit, shuffle, questionsToShow } = req.body;
    const quiz = await quizService.createQuiz(
      { courseId, title, passingScore, questions, timeLimit, shuffle, questionsToShow },
      req.user
    );
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
};

// GET /quizzes/:id/edit — pełny test do edycji, z poprawnymi odpowiedziami (właściciel/admin)
const getForEdit = async (req, res, next) => {
  try {
    res.json(await quizService.getQuizForEdit(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

// PUT /quizzes/:id — edycja testu (właściciel kursu/admin)
const update = async (req, res, next) => {
  try {
    res.json(await quizService.updateQuiz(req.params.id, req.body, req.user));
  } catch (err) {
    next(err);
  }
};

// DELETE /quizzes/:id — usunięcie testu (właściciel kursu/admin)
const remove = async (req, res, next) => {
  try {
    res.json(await quizService.deleteQuiz(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

// GET /quizzes/course/:courseId  (publiczne, bez poprawnych odpowiedzi)
const listForCourse = async (req, res, next) => {
  try {
    res.json(await quizService.getQuizzesForCourse(req.params.courseId));
  } catch (err) {
    next(err);
  }
};

// GET /quizzes/:id  (publiczne, bez poprawnych odpowiedzi)
const getOne = async (req, res, next) => {
  try {
    res.json(await quizService.getQuizById(req.params.id));
  } catch (err) {
    next(err);
  }
};

// POST /quizzes/:id/submit  (zalogowany) — sprawdza i zapisuje podejście
const submit = async (req, res, next) => {
  try {
    const result = await quizService.submitQuiz(
      req.params.id,
      req.user.id,
      req.body.answers
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /quizzes/:id/attempts  (zalogowany) — moje podejścia
const myAttempts = async (req, res, next) => {
  try {
    res.json(await quizService.getMyAttempts(req.params.id, req.user.id));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listForCourse, getOne, submit, myAttempts, getForEdit, update, remove };
