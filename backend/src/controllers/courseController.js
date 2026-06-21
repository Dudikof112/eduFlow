const courseService = require("../services/courseService");

// GET /courses?search=&tag=&language=&minRating=&sort=&level=&instructorId=&page=&limit=
const list = async (req, res) => {
  const { search, tag, language, minRating, sort, level, instructorId, page, limit } = req.query;
  const data = await courseService.listCourses({
    search,
    tag,
    language,
    minRating,
    sort,
    level,
    instructorId,
    page,
    limit,
  });
  res.json(data);
};

// GET /courses/tags  -> wszystkie używane tagi (do filtrów)
const tags = async (req, res) => {
  const data = await courseService.getAllTags();
  res.json(data);
};

// GET /courses/languages  -> wszystkie języki (do filtrów)
const languages = async (req, res) => {
  const data = await courseService.getLanguages();
  res.json(data);
};

// GET /courses/instructors  -> lista prowadzących (do filtra)
const instructors = async (req, res) => {
  try {
    res.json(await courseService.getInstructors());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /courses/:id  -> pojedynczy kurs + lekcje (publiczny; wideo tylko dla zalogowanych)
const getOne = async (req, res) => {
  const data = await courseService.getCourseById(req.params.id, !!req.user);
  res.json(data);
};

// GET /courses/:id/recommendations  -> podobne kursy (publiczne)
const recommendations = async (req, res) => {
  try {
    res.json(await courseService.getRecommendations(req.params.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /courses/:courseId/dashboard  -> pełny pulpit kursu (wymaga logowania)
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const data = await courseService.getCourseDashboard(courseId, userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /courses/mine  -> kursy zalogowanego prowadzącego (panel nauczyciela)
const mine = async (req, res, next) => {
  try {
    res.json(await courseService.getMyCourses(req.user.id));
  } catch (err) {
    next(err);
  }
};

// POST /courses  -> utworzenie kursu (prowadzący/admin)
const create = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user.id);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

// PUT /courses/:id  -> aktualizacja kursu (właściciel/admin)
const update = async (req, res, next) => {
  try {
    const course = await courseService.updateCourse(
      req.params.id,
      req.body,
      req.user
    );
    res.json(course);
  } catch (err) {
    next(err);
  }
};

// DELETE /courses/:id  -> usunięcie kursu wraz z powiązaniami (właściciel/admin)
const remove = async (req, res, next) => {
  try {
    res.json(await courseService.deleteCourse(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  list,
  tags,
  languages,
  instructors,
  getOne,
  recommendations,
  getDashboard,
  mine,
  create,
  update,
  remove,
};
