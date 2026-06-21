const Message = require("../models/mongo/Message");
const { Course, User } = require("../models");
const { getIO } = require("../realtime");
const notificationService = require("./notificationService");

// Dostęp do wątku ma kursant (studentId), prowadzący kurs (twórca) lub admin.
async function assertAccess(user, courseId, studentId) {
  const course = await Course.findByPk(courseId);
  if (!course) {
    const e = new Error("Nie znaleziono kursu");
    e.status = 404;
    throw e;
  }
  const isStudent = Number(user.id) === Number(studentId);
  const isTeacher = Number(user.id) === Number(course.creatorId);
  const isAdmin = user.role === "admin";
  if (!isStudent && !isTeacher && !isAdmin) {
    const e = new Error("Brak dostępu do tej rozmowy");
    e.status = 403;
    throw e;
  }
  return course;
}

const getMessages = async (user, courseId, studentId) => {
  await assertAccess(user, courseId, studentId);
  return await Message.find({ courseId, studentId }).sort({ createdAt: 1 });
};

const sendMessage = async (user, courseId, studentId, text) => {
  if (!text || !text.trim()) {
    const e = new Error("Wiadomość nie może być pusta");
    e.status = 400;
    throw e;
  }
  const course = await assertAccess(user, courseId, studentId);
  const msg = await Message.create({
    courseId: Number(courseId),
    studentId: Number(studentId),
    senderId: user.id,
    text: text.trim(),
  });

  // Rozesłanie na żywo do uczestników wątku (socket.io).
  const io = getIO();
  if (io) {
    io.to(`chat:${courseId}:${studentId}`).emit("chat:message", msg.toJSON());
  }

  // Powiadomienie dla drugiej strony rozmowy (nie dla nadawcy).
  const recipientId =
    Number(user.id) === Number(studentId) ? course.creatorId : Number(studentId);
  if (recipientId && Number(recipientId) !== Number(user.id)) {
    try {
      await notificationService.createNotification({
        userId: recipientId,
        type: "chat",
        text: "Nowa wiadomość na czacie kursu",
        link: "/messages",
      });
    } catch {
      /* brak powiadomienia nie może blokować wysyłki wiadomości */
    }
  }

  return msg;
};

// Lista wątków zalogowanego użytkownika (jako kursant LUB jako prowadzący).
const getThreads = async (user) => {
  // kursy, których jestem twórcą (rola prowadzącego w wątkach)
  const myCourses = await Course.findAll({
    where: { creatorId: user.id },
    attributes: ["id"],
  });
  const myCourseIds = myCourses.map((c) => c.id);

  const or = [{ studentId: user.id }];
  if (myCourseIds.length) or.push({ courseId: { $in: myCourseIds } });

  const messages = await Message.find({ $or: or }).sort({ createdAt: 1 });

  // grupowanie po (courseId, studentId); zostaje ostatnia wiadomość
  const map = new Map();
  for (const m of messages) {
    map.set(`${m.courseId}:${m.studentId}`, {
      courseId: m.courseId,
      studentId: m.studentId,
      lastMessage: m.text,
      lastAt: m.createdAt,
    });
  }
  const threads = [...map.values()];
  if (threads.length === 0) return [];

  // wzbogacenie: tytuł kursu + nazwa drugiej strony
  const courseIds = [...new Set(threads.map((t) => t.courseId))];
  const courses = await Course.findAll({
    where: { id: courseIds },
    attributes: ["id", "title", "creatorId"],
  });
  const courseById = {};
  courses.forEach((c) => (courseById[c.id] = c));

  const otherIds = new Set();
  threads.forEach((t) => {
    const course = courseById[t.courseId];
    const teacherId = course?.creatorId;
    const otherId =
      Number(user.id) === Number(t.studentId) ? teacherId : t.studentId;
    if (otherId) otherIds.add(otherId);
  });
  const users = await User.findAll({
    where: { id: [...otherIds] },
    attributes: ["id", "name", "email"],
  });
  const userById = {};
  users.forEach((u) => (userById[u.id] = u));

  return threads
    .map((t) => {
      const course = courseById[t.courseId];
      const teacherId = course?.creatorId;
      const iAmStudent = Number(user.id) === Number(t.studentId);
      const otherId = iAmStudent ? teacherId : t.studentId;
      const other = userById[otherId];
      return {
        courseId: t.courseId,
        studentId: t.studentId,
        courseTitle: course?.title || "Kurs",
        withName: other?.name || other?.email || "Użytkownik",
        myRole: iAmStudent ? "student" : "teacher",
        lastMessage: t.lastMessage,
        lastAt: t.lastAt,
      };
    })
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
};

module.exports = { getMessages, sendMessage, getThreads, assertAccess };
