const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Progress = sequelize.define("Progress", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Progress;