const fs = require("fs");
const service = require("../services/lessonService");

// GET /lessons/:courseId — lekcje kursu (źródła wideo tylko dla zalogowanych: req.user z optionalAuth).
const getLessonsByCourse = async (req, res, next) => {
  try {
    res.json(await service.getLessonsByCourse(req.params.courseId, !!req.user));
  } catch (err) {
    next(err);
  }
};

// POST /lessons — utworzenie lekcji (właściciel kursu/admin).
const create = async (req, res, next) => {
  try {
    res.status(201).json(await service.createLesson(req.body, req.user));
  } catch (err) {
    next(err);
  }
};

// PUT /lessons/:id — edycja lekcji (właściciel kursu/admin).
const update = async (req, res, next) => {
  try {
    res.json(await service.updateLesson(req.params.id, req.body, req.user));
  } catch (err) {
    next(err);
  }
};

// DELETE /lessons/:id — usunięcie lekcji (właściciel kursu/admin).
const remove = async (req, res, next) => {
  try {
    res.json(await service.deleteLesson(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

// POST /lessons/:id/video — wgranie pliku wideo do lekcji (właściciel kursu/admin).
// Plik jest już zapisany przez multer; w razie błędu zapisu w bazie jest usuwany z dysku.
const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Brak pliku wideo" });
    }
    const lesson = await service.setLessonVideo(
      req.params.id,
      req.file.filename,
      req.user
    );
    res.json(lesson);
  } catch (err) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// DELETE /lessons/:id/video — usunięcie wgranego pliku wideo z lekcji (właściciel kursu/admin).
const removeVideo = async (req, res, next) => {
  try {
    res.json(await service.removeLessonVideo(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLessonsByCourse,
  create,
  update,
  remove,
  uploadVideo,
  removeVideo,
};
