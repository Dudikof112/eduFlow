const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = Comment;