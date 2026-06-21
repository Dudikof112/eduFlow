const fs = require("fs");
const path = require("path");
const { Lesson, Progress, Material } = require("../models");
const { assertCourseOwner } = require("../utils/ownership");
const { UPLOAD_DIR } = require("../config/upload");

// Funkcja zwraca lekcje kursu posortowane według kolejności (orderIndex).
// Parametr includeVideo decyduje, czy dołączyć źródła wideo (tylko dla zalogowanych).
const getLessonsByCourse = async (courseId, includeVideo = false) => {
  const lessons = await Lesson.findAll({
    where: { courseId },
    include: [{ model: Material }],
    order: [["orderIndex", "ASC"]],
  });
  if (includeVideo) return lessons;
  // Gościowi nie udostępniamy linków, plików wideo ani materiałów.
  return lessons.map((l) => ({
    ...l.toJSON(),
    videoUrl: null,
    videoFile: null,
    Materials: [],
  }));
};

// Funkcja tworzy lekcję w kursie po sprawdzeniu uprawnień właściciela.
const createLesson = async (data, user) => {
  await assertCourseOwner(data.courseId, user);
  const { title, videoUrl, orderIndex, courseId, moduleId } = data;
  return await Lesson.create({
    title,
    videoUrl: videoUrl || null,
    orderIndex: Number(orderIndex) || 0,
    courseId,
    moduleId: moduleId || null,
  });
};

// Funkcja aktualizuje lekcję po sprawdzeniu uprawnień właściciela kursu.
const updateLesson = async (lessonId, data, user) => {
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    const e = new Error("Nie znaleziono lekcji");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(lesson.courseId, user);
  const { title, videoUrl, orderIndex, moduleId } = data;
  if (title !== undefined) lesson.title = title;
  if (videoUrl !== undefined) lesson.videoUrl = videoUrl || null;
  if (orderIndex !== undefined) lesson.orderIndex = Number(orderIndex) || 0;
  if (moduleId !== undefined) lesson.moduleId = moduleId || null;
  await lesson.save();
  return lesson;
};

// Funkcja usuwa lekcję wraz z powiązanymi postępami oraz wgranym plikiem wideo (jeśli istnieje).
const deleteLesson = async (lessonId, user) => {
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    const e = new Error("Nie znaleziono lekcji");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(lesson.courseId, user);
  removeFileIfExists(lesson.videoFile);
  await Progress.destroy({ where: { lessonId } });
  await lesson.destroy();
  return { success: true };
};

// Funkcja usuwa z dysku plik wideo wskazywany publiczną ścieżką (jeśli istnieje).
const removeFileIfExists = (publicPath) => {
  if (!publicPath) return;
  const fp = path.join(UPLOAD_DIR, path.basename(publicPath));
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
};

// Funkcja zapisuje w lekcji ścieżkę do wgranego pliku wideo (po sprawdzeniu uprawnień).
// Wcześniejszy plik tej lekcji jest usuwany, aby nie pozostawały osierocone pliki.
const setLessonVideo = async (lessonId, filename, user) => {
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    const e = new Error("Nie znaleziono lekcji");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(lesson.courseId, user);
  removeFileIfExists(lesson.videoFile);
  lesson.videoFile = `/uploads/videos/${filename}`;
  await lesson.save();
  return lesson;
};

// Funkcja usuwa wgrany plik wideo z lekcji (z dysku i z bazy), po sprawdzeniu uprawnień.
const removeLessonVideo = async (lessonId, user) => {
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    const e = new Error("Nie znaleziono lekcji");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(lesson.courseId, user);
  removeFileIfExists(lesson.videoFile);
  lesson.videoFile = null;
  await lesson.save();
  return lesson;
};

module.exports = {
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  setLessonVideo,
  removeLessonVideo,
};
