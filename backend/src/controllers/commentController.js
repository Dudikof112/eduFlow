const service = require("../services/commentService");

const addComment = async (req, res) => {
  // POPRAWKA: userId bierzemy z tokena (req.user), NIE z req.body.
  // Wcześniej każdy mógł podać dowolne userId w body.
  const data = await service.addComment({
    userId: req.user.id,
    courseId: req.body.courseId,
    content: req.body.content,
  });
  res.status(201).json(data);
};

const getComments = async (req, res) => {
  const data = await service.getCourseComments(req.params.courseId);
  res.json(data);
};

// GET /comments — wszystkie komentarze (moderacja, tylko admin).
const list = async (req, res, next) => {
  try {
    res.json(await service.getAllComments());
  } catch (err) {
    next(err);
  }
};

// DELETE /comments/:id — usunięcie komentarza (autor lub admin).
const remove = async (req, res, next) => {
  try {
    res.json(await service.deleteComment(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addComment,
  getComments,
  list,
  remove,
};
