const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model recenzji kursu. Przechowuje ocenę w gwiazdkach (1–5) oraz opcjonalny tekst recenzji.
// Jeden użytkownik ma jedną recenzję na kurs (para userId + courseId). Relacje w models/index.js.
const Rating = sequelize.define("Rating", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  value: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  // Treść recenzji (opcjonalna) — ocena może być sama lub z opisem słownym.
  text: { type: DataTypes.TEXT },
});

module.exports = Rating;
