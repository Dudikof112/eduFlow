const { Progress, Lesson } = require("../models");
const enrollmentService = require("./enrollmentService");

const completeLesson = async (userId, lessonId) => {
  // 1. znajdź lekcję
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  // 2. sprawdź enrollment
  const enrolled = await enrollmentService.isUserEnrolled(
    userId,
    lesson.courseId
  );

  if (!enrolled) {
    throw new Error("Not enrolled in course");
  }

  // 3. update progress
  const progress = await Progress.findOne({
    where: { userId, lessonId }
  });

  if (!progress) throw new Error("Progress row missing");

  progress.completed = true;
  await progress.save();

  return progress;
};

const getCourseProgress = async (userId, courseId) => {
  const lessons = await Lesson.findAll({
    where: { courseId }
  });

  const total = lessons.length;

  const done = await Progress.count({
    where: {
      userId,
      completed: true
    },
    include: [
      {
        model: Lesson,
        where: { courseId }
      }
    ]
  });

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    total,
    done,
    percent
  };
};

module.exports = {
  completeLesson,
  getCourseProgress
};