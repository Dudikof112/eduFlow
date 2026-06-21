const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model materiału do pobrania przypisanego do lekcji.
// Przechowuje nazwę pliku na dysku, oryginalną nazwę (do wyświetlenia) i publiczną ścieżkę.
// Powiązanie z lekcją (lessonId) definiuje models/index.js.
const Material = sequelize.define("Material", {
  // Nazwa pliku zapisanego na serwerze (unikalna).
  fileName: DataTypes.STRING,
  // Oryginalna nazwa pliku przesłana przez użytkownika (pokazywana na liście).
  originalName: DataTypes.STRING,
  // Publiczna ścieżka do pobrania pliku (np. "/uploads/materials/...").
  filePath: DataTypes.STRING,
});

module.exports = Material;
