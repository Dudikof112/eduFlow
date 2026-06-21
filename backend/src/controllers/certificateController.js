const PDFDocument = require("pdfkit");
const certificateService = require("../services/certificateService");
const renderCertificate = require("../utils/certificatePdf");

// GET /certificates -> moje certyfikaty
const list = async (req, res, next) => {
  try {
    res.json(await certificateService.getUserCertificates(req.user.id));
  } catch (err) {
    next(err);
  }
};

// GET /certificates/:courseId/download -> generuje i strumieniuje PDF
const download = async (req, res, next) => {
  try {
    const { cert, user, course } = await certificateService.getCertificateData(
      req.user.id,
      req.params.courseId
    );

    const data = {
      studentName: user?.name || user?.email || "Kursant",
      courseTitle: course?.title || "Kurs",
      instructor: course?.User?.name || "",
      date: new Date(cert.createdAt).toLocaleDateString("pl-PL"),
      code: cert.code,
    };

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certyfikat-${cert.code}.pdf"`
    );

    doc.pipe(res);
    renderCertificate(doc, data);
    doc.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { list, download };
