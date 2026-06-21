const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Katalog na wgrane pliki wideo. Tworzony przy starcie, jeśli nie istnieje.
const UPLOAD_DIR = path.join(__dirname, "../../uploads/videos");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Konfiguracja zapisu na dysk: katalog docelowy i unikalna nazwa pliku z oryginalnym rozszerzeniem.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `lesson-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

// Filtr przepuszcza wyłącznie pliki wideo (na podstawie typu MIME).
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("video/")) cb(null, true);
  else cb(new Error("Dozwolone są tylko pliki wideo"));
};

// Instancja multera z limitem rozmiaru pliku (200 MB).
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
});

// Middleware obsługujące pojedynczy plik z pola "video".
// Błędy multera (zły typ, za duży plik) zamienia na czytelną odpowiedź 400.
const singleVideo = (req, res, next) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Błąd przesyłania pliku" });
    }
    next();
  });
};

// ===== Materiały do pobrania (dokumenty pod lekcją) =====
// Osobny katalog i uploader dla plików materiałów (PDF, dokumenty, archiwa, obrazy).
const MATERIAL_DIR = path.join(__dirname, "../../uploads/materials");
fs.mkdirSync(MATERIAL_DIR, { recursive: true });

const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MATERIAL_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `material-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// Dozwolone rozszerzenia plików materiałów.
const ALLOWED_MATERIAL_EXT = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
  ".txt", ".csv", ".zip", ".png", ".jpg", ".jpeg", ".gif",
];
const materialFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MATERIAL_EXT.includes(ext)) cb(null, true);
  else cb(new Error("Niedozwolony typ pliku (dozwolone m.in. pdf, docx, pptx, xlsx, zip, obrazy)"));
};

const materialUpload = multer({
  storage: materialStorage,
  fileFilter: materialFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Middleware obsługujące pojedynczy plik materiału z pola "file" (błędy -> 400).
const singleMaterial = (req, res, next) => {
  materialUpload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Błąd przesyłania pliku" });
    }
    next();
  });
};

module.exports = { upload, singleVideo, UPLOAD_DIR, singleMaterial, MATERIAL_DIR };
