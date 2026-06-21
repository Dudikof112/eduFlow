const fs = require("fs");
const service = require("../services/materialService");

// POST /materials/:lessonId — wgranie materiału do lekcji (właściciel kursu/admin).
// Plik jest już zapisany przez multer; przy błędzie zapisu w bazie jest usuwany z dysku.
const upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Brak pliku" });
    res
      .status(201)
      .json(await service.addMaterial(req.params.lessonId, req.file, req.user));
  } catch (err) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// DELETE /materials/:id — usunięcie materiału (właściciel kursu/admin).
const remove = async (req, res, next) => {
  try {
    res.json(await service.deleteMaterial(req.params.id, req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, remove };
