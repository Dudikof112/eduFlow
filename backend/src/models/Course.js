const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Model kursu. Przechowuje podstawowe dane kursu: tytuł, opis, tagi (kategorie/tematy),
// język oraz cenę. Powiązania (twórca, lekcje, oceny, komentarze, zapisy) definiuje models/index.js.
const Course = sequelize.define("Course", {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  // Lista tagów wykorzystywana do filtrowania po temacie, np. ["JavaScript", "Frontend"].
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  // Język kursu prezentowany i filtrowany na liście, np. "Polski" / "English".
  language: {
    type: DataTypes.STRING,
    defaultValue: "Polski",
  },
  // Cena kursu w złotych (liczba całkowita). Wartość 0 oznacza kurs darmowy.
  price: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Poziom trudności kursu prezentowany i filtrowany na liście
  // (np. "Początkujący" / "Średniozaawansowany" / "Zaawansowany").
  level: {
    type: DataTypes.STRING,
    defaultValue: "Początkujący",
  },
});

module.exports = Course;
