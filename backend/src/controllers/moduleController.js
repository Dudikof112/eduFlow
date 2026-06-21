const service = require("../services/moduleService");

// GET /modules/course/:courseId — moduły kursu (publiczne, do wyświetlenia struktury).
const listForCourse = async (req, res, next) => {
  try {
    res.json(await service.getModulesForCourse(req.params.courseId));
  } catch (err) {
    next(err);
  }
};

// POST /modules — utworzenie modułu (właściciel kursu/admin).
const create = async (req, res, next) => {
  try {
    res.status(201).json(await service.createModule(req.body, req.user));
  } catch (err) {
    next(err);
  }
};

// PUT /modules/:id — edycja modułu (właściciel kursu/admin).
const update = async (req, res, next) => {
  try {
    res.json(await service.updateModule(req.params.id, req.body, req.user));
  } catch (err) {
    next(err);
  }
};

// DELETE /modules/:id — usunięcie modułu (właściciel kursu/admin).
const remove = async (req, res, next) => {
  try {
    res.json(await service.deleteModule(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = { listForCourse, create, update, remove };
