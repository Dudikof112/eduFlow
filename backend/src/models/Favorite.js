const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model ulubionego kursu (lista życzeń). Para userId + courseId jest unikalna.
// Relacje definiowane w models/index.js.
const Favorite = sequelize.define(
  "Favorite",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    indexes: [{ unique: true, fields: ["userId", "courseId"] }],
  }
);

module.exports = Favorite;
