const chatService = require("../services/chatService");

// GET /chat/threads -> moje rozmowy
const threads = async (req, res, next) => {
  try {
    res.json(await chatService.getThreads(req.user));
  } catch (err) {
    next(err);
  }
};

// GET /chat/:courseId/:studentId -> wiadomości w wątku
const messages = async (req, res, next) => {
  try {
    res.json(
      await chatService.getMessages(
        req.user,
        req.params.courseId,
        req.params.studentId
      )
    );
  } catch (err) {
    next(err);
  }
};

// POST /chat/:courseId/:studentId -> wyślij wiadomość
const send = async (req, res, next) => {
  try {
    const msg = await chatService.sendMessage(
      req.user,
      req.params.courseId,
      req.params.studentId,
      req.body.text
    );
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
};

module.exports = { threads, messages, send };
