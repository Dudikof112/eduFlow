const fs = require("fs");
const path = require("path");
const { Material, Lesson } = require("../models");
const { assertCourseOwner } = require("../utils/ownership");
const { MATERIAL_DIR } = require("../config/upload");

// Funkcja dodaje materiał (plik) do lekcji po sprawdzeniu uprawnień właściciela kursu.
const addMaterial = async (lessonId, file, user) => {
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) {
    const e = new Error("Nie znaleziono lekcji");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(lesson.courseId, user);
  return await Material.create({
    lessonId,
    fileName: file.filename,
    originalName: file.originalname,
    filePath: `/uploads/materials/${file.filename}`,
  });
};

// Funkcja usuwa materiał (z dysku i z bazy) po sprawdzeniu uprawnień właściciela kursu.
const deleteMaterial = async (materialId, user) => {
  const material = await Material.findByPk(materialId);
  if (!material) {
    const e = new Error("Nie znaleziono materiału");
    e.status = 404;
    throw e;
  }
  const lesson = await Lesson.findByPk(material.lessonId);
  if (lesson) await assertCourseOwner(lesson.courseId, user);
  const fp = path.join(MATERIAL_DIR, path.basename(material.filePath || ""));
  if (material.filePath && fs.existsSync(fp)) fs.unlinkSync(fp);
  await material.destroy();
  return { success: true };
};

module.exports = { addMaterial, deleteMaterial };
