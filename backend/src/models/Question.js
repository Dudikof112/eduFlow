const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model pytania zadanego pod lekcją (sekcja Q&A). Powiązany z lekcją, kursem i autorem.
// Relacje definiowane w models/index.js.
const Question = sequelize.define("Question", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
});

module.exports = Question;
