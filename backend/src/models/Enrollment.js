const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Enrollment = sequelize.define("Enrollment", {
  status: {
    type: DataTypes.ENUM("active", "completed"),
    defaultValue: "active"
  }
});

module.exports = Enrollment;