const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Quiz = sequelize.define("Quiz", {
  title: DataTypes.STRING
});

module.exports = Quiz;