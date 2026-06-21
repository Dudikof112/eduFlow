const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model odpowiedzi na pytanie (sekcja Q&A). Powiązany z pytaniem i autorem.
// Relacje definiowane w models/index.js.
const Answer = sequelize.define("Answer", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  questionId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
});

module.exports = Answer;
