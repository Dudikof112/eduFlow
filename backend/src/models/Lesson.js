const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model lekcji. Przechowuje tytuł, kolejność oraz dwa niezależne źródła wideo:
// videoUrl (link, np. YouTube) i videoFile (ścieżka do wgranego pliku).
// Powiązanie z kursem (courseId) definiuje models/index.js.
const Lesson = sequelize.define("Lesson", {
  title: DataTypes.STRING,
  // Link do wideo (np. YouTube); wartość pusta (null) oznacza brak linku.
  videoUrl: DataTypes.STRING,
  // Publiczna ścieżka do wgranego pliku wideo (np. "/uploads/videos/...mp4"); null = brak pliku.
  videoFile: DataTypes.STRING,
  // Kolejność wyświetlania lekcji w obrębie kursu (rosnąco).
  orderIndex: DataTypes.INTEGER,
});

module.exports = Lesson;
