const path = require("path");

const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");

// Rysuje certyfikat na przekazanym dokumencie pdfkit.
// data: { studentName, courseTitle, instructor, date, code }
function renderCertificate(doc, data) {
  const { studentName, courseTitle, instructor, date, code } = data;

  // Czcionki Unicode (obsługa polskich znaków – domyślna Helvetica ich nie ma)
  doc.registerFont("Sans", path.join(FONT_DIR, "DejaVuSans.ttf"));
  doc.registerFont("Sans-Bold", path.join(FONT_DIR, "DejaVuSans-Bold.ttf"));

  const W = doc.page.width;
  const H = doc.page.height;

  // Tło
  doc.rect(0, 0, W, H).fill("#f6f3ec");

  // Podwójna ramka
  doc.lineWidth(3).strokeColor("#15674a").rect(28, 28, W - 56, H - 56).stroke();
  doc.lineWidth(1).strokeColor("#b8862f").rect(40, 40, W - 80, H - 80).stroke();

  // Nagłówek marki
  doc
    .fillColor("#15674a")
    .font("Sans-Bold")
    .fontSize(16)
    .text("eduFlow", 0, 70, { width: W, align: "center", characterSpacing: 2 });

  // Tytuł
  doc
    .fillColor("#1b1a17")
    .font("Sans-Bold")
    .fontSize(38)
    .text("CERTYFIKAT UKOŃCZENIA", 0, 120, { width: W, align: "center" });

  // Formuła
  doc
    .fillColor("#54504a")
    .font("Sans")
    .fontSize(16)
    .text("Niniejszym zaświadcza się, że", 0, 198, { width: W, align: "center" });

  // Imię kursanta
  doc
    .fillColor("#1b1a17")
    .font("Sans-Bold")
    .fontSize(34)
    .text(studentName, 0, 232, { width: W, align: "center" });

  doc
    .fillColor("#54504a")
    .font("Sans")
    .fontSize(16)
    .text("ukończył(a) kurs", 0, 292, { width: W, align: "center" });

  // Tytuł kursu (węższy box, by długie tytuły się zawijały)
  doc
    .fillColor("#15674a")
    .font("Sans-Bold")
    .fontSize(24)
    .text(courseTitle, 80, 322, { width: W - 160, align: "center" });

  // Stopka: data / numer / prowadzący
  const footY = H - 120;
  doc.fillColor("#54504a").font("Sans").fontSize(12);
  doc.text("Data: " + date, 60, footY, { width: 250, align: "left" });
  doc.text("Nr certyfikatu: " + code, 0, footY, { width: W, align: "center" });
  if (instructor) {
    doc.text("Prowadzący: " + instructor, W - 310, footY, { width: 250, align: "right" });
  }
}

module.exports = renderCertificate;
