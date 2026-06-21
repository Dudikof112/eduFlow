const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model modułu (sekcji) kursu — grupuje lekcje w logiczne części.
// Przechowuje tytuł i kolejność w obrębie kursu. Powiązania (kurs, lekcje) w models/index.js.
const Module = sequelize.define("Module", {
  title: DataTypes.STRING,
  // Kolejność wyświetlania modułu w kursie (rosnąco).
  orderIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Module;
