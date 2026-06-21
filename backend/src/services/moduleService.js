const { Module, Lesson } = require("../models");
const { assertCourseOwner } = require("../utils/ownership");

// Funkcja zwraca moduły kursu posortowane według kolejności.
const getModulesForCourse = async (courseId) => {
  return await Module.findAll({
    where: { courseId },
    order: [["orderIndex", "ASC"], ["id", "ASC"]],
  });
};

// Funkcja tworzy moduł w kursie po sprawdzeniu uprawnień właściciela.
const createModule = async ({ courseId, title, orderIndex }, user) => {
  await assertCourseOwner(courseId, user);
  return await Module.create({
    courseId,
    title,
    orderIndex: Number(orderIndex) || 0,
  });
};

// Funkcja aktualizuje moduł po sprawdzeniu uprawnień właściciela kursu.
const updateModule = async (moduleId, data, user) => {
  const mod = await Module.findByPk(moduleId);
  if (!mod) {
    const e = new Error("Nie znaleziono modułu");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(mod.courseId, user);
  if (data.title !== undefined) mod.title = data.title;
  if (data.orderIndex !== undefined) mod.orderIndex = Number(data.orderIndex) || 0;
  await mod.save();
  return mod;
};

// Funkcja usuwa moduł; lekcje z tego modułu pozostają, ale tracą przypisanie (moduleId = null).
const deleteModule = async (moduleId, user) => {
  const mod = await Module.findByPk(moduleId);
  if (!mod) {
    const e = new Error("Nie znaleziono modułu");
    e.status = 404;
    throw e;
  }
  await assertCourseOwner(mod.courseId, user);
  await Lesson.update({ moduleId: null }, { where: { moduleId } });
  await mod.destroy();
  return { success: true };
};

module.exports = { getModulesForCourse, createModule, updateModule, deleteModule };
