const User = require("./User");
const Course = require("./Course");
const Lesson = require("./Lesson");
const Enrollment = require("./Enrollment");
const Progress = require("./Progress");
const Rating = require("./Rating");
const Comment = require("./Comment");
const Certificate = require("./Certificate");
const Payment = require("./Payment");
const Material = require("./Material");
const Module = require("./Module");
const Question = require("./Question");
const Answer = require("./Answer");
const Notification = require("./Notification");
const Favorite = require("./Favorite");

// UWAGA: modele Quiz/Question/QuizResult przeniesione do MongoDB (Mongoose)
// -> src/models/mongo/Quiz.js oraz src/models/mongo/QuizAttempt.js

// =======================
// USER - COURSE (creator)
// =======================
User.hasMany(Course, { foreignKey: "creatorId" });
Course.belongsTo(User, { foreignKey: "creatorId" });

// =======================
// ENROLLMENT (many-to-many USER <-> COURSE)
// =======================
User.hasMany(Enrollment, { foreignKey: "userId" });
Course.hasMany(Enrollment, { foreignKey: "courseId" });

Enrollment.belongsTo(User, { foreignKey: "userId" });
Enrollment.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// LESSONS
// =======================
Course.hasMany(Lesson, { foreignKey: "courseId" });
Lesson.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// PROGRESS (USER + COURSE + LESSON)
// =======================
User.hasMany(Progress, { foreignKey: "userId" });
Course.hasMany(Progress, { foreignKey: "courseId" });
Lesson.hasMany(Progress, { foreignKey: "lessonId" });

Progress.belongsTo(User, { foreignKey: "userId" });
Progress.belongsTo(Course, { foreignKey: "courseId" });
Progress.belongsTo(Lesson, { foreignKey: "lessonId" });

// =======================
// RATING (USER -> COURSE)
// =======================
User.hasMany(Rating, { foreignKey: "userId" });
Course.hasMany(Rating, { foreignKey: "courseId" });

Rating.belongsTo(User, { foreignKey: "userId" });
Rating.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// COMMENT (USER -> COURSE)
// =======================
User.hasMany(Comment, { foreignKey: "userId" });
Course.hasMany(Comment, { foreignKey: "courseId" });

Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// CERTIFICATE
// =======================
User.hasMany(Certificate, { foreignKey: "userId" });
Course.hasMany(Certificate, { foreignKey: "courseId" });

Certificate.belongsTo(User, { foreignKey: "userId" });
Certificate.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// PAYMENT (USER -> COURSE)
// =======================
User.hasMany(Payment, { foreignKey: "userId" });
Course.hasMany(Payment, { foreignKey: "courseId" });

Payment.belongsTo(User, { foreignKey: "userId" });
Payment.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// MATERIAL (LESSON -> MATERIAL)
// =======================
Lesson.hasMany(Material, { foreignKey: "lessonId" });
Material.belongsTo(Lesson, { foreignKey: "lessonId" });

// =======================
// MODULE (COURSE -> MODULE -> LESSON)
// =======================
Course.hasMany(Module, { foreignKey: "courseId" });
Module.belongsTo(Course, { foreignKey: "courseId" });
Module.hasMany(Lesson, { foreignKey: "moduleId" });
Lesson.belongsTo(Module, { foreignKey: "moduleId" });

// =======================
// Q&A (LESSON -> QUESTION -> ANSWER)
// =======================
Lesson.hasMany(Question, { foreignKey: "lessonId" });
Question.belongsTo(Lesson, { foreignKey: "lessonId" });
Question.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Question, { foreignKey: "userId" });
Question.hasMany(Answer, { foreignKey: "questionId" });
Answer.belongsTo(Question, { foreignKey: "questionId" });
Answer.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Answer, { foreignKey: "userId" });

// =======================
// NOTIFICATION (USER -> NOTIFICATION)
// =======================
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// =======================
// FAVORITE (USER <-> COURSE)
// =======================
User.hasMany(Favorite, { foreignKey: "userId" });
Favorite.belongsTo(User, { foreignKey: "userId" });
Course.hasMany(Favorite, { foreignKey: "courseId" });
Favorite.belongsTo(Course, { foreignKey: "courseId" });

// =======================
// EXPORT
// =======================
module.exports = {
  User,
  Course,
  Lesson,
  Enrollment,
  Progress,
  Rating,
  Comment,
  Certificate,
  Payment,
  Material,
  Module,
  Question,
  Answer,
  Notification,
  Favorite,
};
