const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QuizResult = sequelize.define("QuizResult", {
  correctCount: DataTypes.INTEGER,
  wrongCount: DataTypes.INTEGER,
  scorePercent: DataTypes.FLOAT
});

module.exports = QuizResult;