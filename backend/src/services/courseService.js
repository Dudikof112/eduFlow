const { Course, Lesson, Progress, Rating, Comment, Enrollment, User, Payment, Material, Module, Question, Answer, Favorite } = require("../models");
const { Op, fn, col } = require("sequelize");
const Quiz = require("../models/mongo/Quiz");
const QuizAttempt = require("../models/mongo/QuizAttempt");
const { assertCourseOwner } = require("../utils/ownership");

const getCourseDashboard = async (courseId, userId) => {
  // 1. kurs + creator
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        attributes: ["id", "email", "role"],
      },
    ],
  });

  if (!course) throw new Error("Course not found");

  // 2. lekcje
  const lessons = await Lesson.findAll({
    where: { courseId },
    order: [["id", "ASC"]],
  });

  // 3. enrollment check
  const enrollment = await Enrollment.findOne({
    where: { userId, courseId },
  });

  const isEnrolled = !!enrollment;

  // 4. progress usera (per lekcja)
  const progressRows = await Progress.findAll({
    where: { userId },
    include: [
      {
        model: Lesson,
        where: { courseId },
      },
    ],
  });

  const progressMap = {};
  progressRows.forEach((p) => {
    progressMap[p.lessonId] = p.completed;
  });

  const totalLessons = lessons.length;

  const doneLessons = progressRows.filter((p) => p.completed).length;

  const progressPercent =
    totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100);

  // 5. rating
  const ratings = await Rating.findAll({
    where: { courseId },
  });

  // POPRAWKA: pole w modelu Rating nazywa się "value", nie "rating".
  // Wcześniej r.rating było undefined -> suma = NaN -> avg = NaN.
  const avgRating =
    ratings.length === 0
      ? 0
      : ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;

  // 6. comments + user
  const comments = await Comment.findAll({
    where: { courseId },
    include: [
      {
        model: User,
        attributes: ["id", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // 7. enrollment count
  const enrolledCount = await Enrollment.count({
    where: { courseId },
  });

  // 8. lekcje ze statusami
  const lessonsWithStatus = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    completed: !!progressMap[lesson.id],
  }));

  // FINAL RESPONSE
  return {
    course,
    isEnrolled,
    enrolledCount,
    progress: {
      total: totalLessons,
      done: doneLessons,
      percent: progressPercent,
    },
    rating: {
      avg: Number(avgRating.toFixed(1)),
      count: ratings.length,
    },
    lessons: lessonsWithStatus,
    comments,
  };
};

// ===== Lista kursów (publiczna): szukanie, tag, język, min. ocena, sortowanie =====
const listCourses = async ({ search, tag, language, minRating, sort, level, instructorId, page, limit } = {}) => {
  const where = {};
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    // Op.iLike = dopasowanie bez rozróżniania wielkości liter (PostgreSQL)
    where[Op.or] = [
      { title: { [Op.iLike]: q } },
      { description: { [Op.iLike]: q } },
    ];
  }
  if (tag && tag.trim()) {
    // tags @> ARRAY['tag'] -> kurs zawiera dany tag
    where.tags = { [Op.contains]: [tag.trim()] };
  }
  if (language && language.trim()) {
    where.language = language.trim();
  }
  if (level && level.trim()) {
    where.level = level.trim();
  }
  if (instructorId) {
    where.creatorId = Number(instructorId);
  }

  const courses = await Course.findAll({
    where,
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Lesson, attributes: ["id"] },
    ],
  });

  // średnie oceny: jedno zapytanie AVG + COUNT pogrupowane po kursie
  const stats = await Rating.findAll({
    attributes: [
      "courseId",
      [fn("AVG", col("value")), "avg"],
      [fn("COUNT", col("id")), "count"],
    ],
    group: ["courseId"],
    raw: true,
  });
  const statById = {};
  stats.forEach((s) => {
    statById[s.courseId] = {
      avg: Math.round((parseFloat(s.avg) || 0) * 10) / 10,
      count: parseInt(s.count, 10) || 0,
    };
  });

  let result = courses.map((c) => {
    const json = c.toJSON();
    const s = statById[c.id] || { avg: 0, count: 0 };
    json.averageRating = s.avg;
    json.ratingCount = s.count;
    return json;
  });

  // filtr po minimalnej średniej ocenie
  const min = parseFloat(minRating);
  if (!isNaN(min) && min > 0) {
    result = result.filter((c) => c.averageRating >= min);
  }

  // sortowanie
  if (sort === "rating") {
    result.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sort === "popular") {
    result.sort((a, b) => b.ratingCount - a.ratingCount);
  } else if (sort === "title") {
    result.sort((a, b) => (a.title || "").localeCompare(b.title || "", "pl"));
  } else {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // paginacja (po filtrach i sortowaniu); domyślnie 9 kursów na stronę
  const total = result.length;
  const lim = Math.min(Math.max(Number(limit) || 9, 1), 50);
  const totalPages = Math.max(1, Math.ceil(total / lim));
  const pg = Math.min(Math.max(Number(page) || 1, 1), totalPages);
  const items = result.slice((pg - 1) * lim, (pg - 1) * lim + lim);

  return { items, total, page: pg, limit: lim, totalPages };
};

// ===== Wszystkie używane tagi (do listy filtrów) =====
const getAllTags = async () => {
  const courses = await Course.findAll({ attributes: ["tags"] });
  const set = new Set();
  courses.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
  return [...set].sort((a, b) => a.localeCompare(b, "pl"));
};

// Funkcja zwraca listę prowadzących (twórców), którzy mają jakiekolwiek kursy — do filtra.
const getInstructors = async () => {
  const courses = await Course.findAll({ attributes: ["creatorId"], raw: true });
  const ids = [...new Set(courses.map((c) => c.creatorId).filter(Boolean))];
  if (!ids.length) return [];
  const users = await User.findAll({
    where: { id: ids },
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
  return users.map((u) => ({ id: u.id, name: u.name }));
};

// Funkcja dołącza do listy kursów średnią ocenę i liczbę ocen (jednym zapytaniem AVG+COUNT).
const attachRatings = async (courses) => {
  const ids = courses.map((c) => c.id);
  const statById = {};
  if (ids.length) {
    const stats = await Rating.findAll({
      attributes: ["courseId", [fn("AVG", col("value")), "avg"], [fn("COUNT", col("id")), "count"]],
      where: { courseId: ids },
      group: ["courseId"],
      raw: true,
    });
    stats.forEach((s) => {
      statById[s.courseId] = {
        avg: Math.round((parseFloat(s.avg) || 0) * 10) / 10,
        count: parseInt(s.count, 10) || 0,
      };
    });
  }
  return courses.map((c) => {
    const json = c.toJSON();
    const s = statById[c.id] || { avg: 0, count: 0 };
    json.averageRating = s.avg;
    json.ratingCount = s.count;
    return json;
  });
};

// Funkcja zwraca podobne kursy na podstawie wspólnych tagów (z pominięciem bieżącego).
const getRecommendations = async (courseId, limit = 4) => {
  const course = await Course.findByPk(courseId);
  if (!course) return [];
  const tags = course.tags || [];
  const includes = [
    { model: User, attributes: ["id", "name", "email"] },
    { model: Lesson, attributes: ["id"] },
  ];
  const candidates = await Course.findAll({
    where: {
      id: { [Op.ne]: course.id },
      ...(tags.length ? { tags: { [Op.overlap]: tags } } : {}),
    },
    include: includes,
  });
  // im więcej wspólnych tagów, tym wyżej na liście
  const scored = candidates
    .map((c) => ({ c, shared: (c.tags || []).filter((t) => tags.includes(t)).length }))
    .sort((a, b) => b.shared - a.shared);
  let top = scored.slice(0, limit).map((s) => s.c);
  // gdy brak wspólnych tagów — pokazujemy kilka innych kursów
  if (top.length === 0) {
    top = await Course.findAll({
      where: { id: { [Op.ne]: course.id } },
      include: includes,
      limit,
    });
  }
  return await attachRatings(top);
};

// ===== Wszystkie języki kursów (do listy filtrów) =====
const getLanguages = async () => {
  const courses = await Course.findAll({ attributes: ["language"] });
  const set = new Set();
  courses.forEach((c) => c.language && set.add(c.language));
  return [...set].sort((a, b) => a.localeCompare(b, "pl"));
};

// ===== Pojedynczy kurs + lekcje (publiczny) =====
// includeVideo = czy dołączyć linki do wideo (tylko dla zalogowanych)
const getCourseById = async (courseId, includeVideo = false) => {
  const course = await Course.findByPk(courseId, {
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      { model: Lesson, include: [{ model: Material }] },
      { model: Module },
    ],
    order: [[Lesson, "orderIndex", "ASC"]],
  });

  if (!course) throw new Error("Course not found");

  const data = course.toJSON();
  // moduły posortowane według kolejności
  if (Array.isArray(data.Modules)) {
    data.Modules.sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);
  }
  // Wideo i materiały widoczne tylko dla zalogowanych — gościowi je ukrywamy
  if (!includeVideo && Array.isArray(data.Lessons)) {
    data.Lessons = data.Lessons.map((l) => ({
      ...l,
      videoUrl: null,
      videoFile: null,
      Materials: [],
    }));
  }
  return data;
};

// ===== Kursy prowadzącego (panel nauczyciela) =====
// Funkcja zwraca kursy utworzone przez danego użytkownika wraz z liczbą lekcji.
const getMyCourses = async (userId) => {
  const courses = await Course.findAll({
    where: { creatorId: userId },
    include: [{ model: Lesson, attributes: ["id"] }],
    order: [["createdAt", "DESC"]],
  });
  return courses.map((c) => {
    const obj = c.toJSON();
    const lessonCount = (obj.Lessons || []).length;
    delete obj.Lessons;
    return { ...obj, lessonCount };
  });
};

// Funkcja tworzy nowy kurs przypisany do zalogowanego prowadzącego.
const createCourse = async (data, userId) => {
  const { title, description, tags, language, price, level } = data;
  return await Course.create({
    title,
    description,
    tags: Array.isArray(tags) ? tags : [],
    language: language || "Polski",
    price: Number(price) || 0,
    level: level || "Początkujący",
    creatorId: userId,
  });
};

// Funkcja aktualizuje dane kursu po sprawdzeniu uprawnień właściciela.
const updateCourse = async (courseId, data, user) => {
  const course = await assertCourseOwner(courseId, user);
  const { title, description, tags, language, price, level } = data;
  if (title !== undefined) course.title = title;
  if (description !== undefined) course.description = description;
  if (tags !== undefined) course.tags = Array.isArray(tags) ? tags : [];
  if (language !== undefined) course.language = language;
  if (price !== undefined) course.price = Number(price) || 0;
  if (level !== undefined) course.level = level;
  await course.save();
  return course;
};

// Funkcja usuwa kurs wraz ze wszystkimi powiązaniami (lekcje, postępy, zapisy,
// oceny, komentarze, płatności oraz testy i podejścia w MongoDB).
const deleteCourse = async (courseId, user) => {
  const course = await assertCourseOwner(courseId, user);

  const lessons = await Lesson.findAll({ where: { courseId }, attributes: ["id"] });
  const lessonIds = lessons.map((l) => l.id);
  if (lessonIds.length) {
    await Progress.destroy({ where: { lessonId: lessonIds } });
    await Material.destroy({ where: { lessonId: lessonIds } });
  }
  // Q&A: najpierw odpowiedzi do pytań kursu, potem pytania
  const questions = await Question.findAll({ where: { courseId }, attributes: ["id"] });
  const questionIds = questions.map((q) => q.id);
  if (questionIds.length) await Answer.destroy({ where: { questionId: questionIds } });
  await Question.destroy({ where: { courseId } });

  await Module.destroy({ where: { courseId } });
  await Favorite.destroy({ where: { courseId } });
  await Lesson.destroy({ where: { courseId } });
  await Enrollment.destroy({ where: { courseId } });
  await Rating.destroy({ where: { courseId } });
  await Comment.destroy({ where: { courseId } });
  await Payment.destroy({ where: { courseId } });
  await Quiz.deleteMany({ courseId });
  await QuizAttempt.deleteMany({ courseId });
  await course.destroy();

  return { success: true };
};

module.exports = {
  getCourseDashboard,
  listCourses,
  getCourseById,
  getAllTags,
  getLanguages,
  getInstructors,
  attachRatings,
  getRecommendations,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
