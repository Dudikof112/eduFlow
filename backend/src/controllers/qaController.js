const service = require("../services/qaService");

// GET /qa/lesson/:lessonId — pytania i odpowiedzi pod lekcją (publiczne).
const listForLesson = async (req, res, next) => {
  try {
    res.json(await service.getQuestionsForLesson(req.params.lessonId));
  } catch (err) {
    next(err);
  }
};

// POST /qa/lesson/:lessonId — zadanie pytania (zalogowany).
const ask = async (req, res, next) => {
  try {
    res.status(201).json(
      await service.addQuestion({
        lessonId: req.params.lessonId,
        courseId: req.body.courseId,
        userId: req.user.id,
        text: req.body.text,
      })
    );
  } catch (err) {
    next(err);
  }
};

// POST /qa/questions/:questionId/answers — odpowiedź na pytanie (zalogowany).
const answer = async (req, res, next) => {
  try {
    res.status(201).json(
      await service.addAnswer({
        questionId: req.params.questionId,
        userId: req.user.id,
        text: req.body.text,
      })
    );
  } catch (err) {
    next(err);
  }
};

// DELETE /qa/questions/:id — usunięcie pytania (autor lub admin).
const removeQuestion = async (req, res, next) => {
  try {
    res.json(await service.deleteQuestion(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

// DELETE /qa/answers/:id — usunięcie odpowiedzi (autor lub admin).
const removeAnswer = async (req, res, next) => {
  try {
    res.json(await service.deleteAnswer(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = { listForLesson, ask, answer, removeQuestion, removeAnswer };
