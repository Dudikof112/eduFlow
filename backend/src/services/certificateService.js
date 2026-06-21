const crypto = require("crypto");
const { Certificate, Course, User } = require("../models");
const enrollmentService = require("./enrollmentService");
const progressService = require("./progressService");

// Wydaje certyfikat, jeśli kurs jest ukończony (100% lekcji). Idempotentne:
// jeśli certyfikat już istnieje, zwraca istniejący (jeden na użytkownika i kurs).
const issueCertificate = async (userId, courseId) => {
  const enrolled = await enrollmentService.isUserEnrolled(userId, courseId);
  if (!enrolled) {
    const e = new Error("Nie jesteś zapisany na ten kurs");
    e.status = 403;
    throw e;
  }

  const progress = await progressService.getCourseProgress(userId, courseId);
  if (progress.total === 0 || progress.percent < 100) {
    const e = new Error("Kurs nie został jeszcze ukończony");
    e.status = 400;
    throw e;
  }

  let cert = await Certificate.findOne({ where: { userId, courseId } });
  if (!cert) {
    const code =
      "EDU-" +
      new Date().getFullYear() +
      "-" +
      crypto.randomBytes(3).toString("hex").toUpperCase();
    cert = await Certificate.create({ userId, courseId, code });
  }
  return cert;
};

const getUserCertificates = async (userId) => {
  return await Certificate.findAll({
    where: { userId },
    include: [{ model: Course, attributes: ["id", "title"] }],
    order: [["createdAt", "DESC"]],
  });
};

// Komplet danych potrzebnych do wygenerowania PDF (gwarantuje też uprawnienia + rekord).
const getCertificateData = async (userId, courseId) => {
  const cert = await issueCertificate(userId, courseId);
  const user = await User.findByPk(userId, { attributes: ["id", "name", "email"] });
  const course = await Course.findByPk(courseId, {
    include: [{ model: User, attributes: ["id", "name"] }],
  });
  return { cert, user, course };
};

module.exports = { issueCertificate, getUserCertificates, getCertificateData };
