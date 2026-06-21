const mongoose = require("mongoose");

// Pojedyncze pytanie testu (zagnieżdżone w quizie).
// Obsługuje jednokrotny i wielokrotny wybór oraz opcjonalne wyjaśnienie.
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length >= 2,
      message: "Pytanie musi mieć co najmniej 2 odpowiedzi",
    },
  },
  // Pole zachowane dla zgodności ze starszymi danymi (jednokrotny wybór).
  correctIndex: { type: Number, min: 0 },
  // Indeksy poprawnych odpowiedzi — używane dla pytań wielokrotnego (i jednokrotnego) wyboru.
  correctIndexes: { type: [Number], default: undefined },
  // Czy pytanie dopuszcza wiele poprawnych odpowiedzi (wpływa na sposób oceniania i UI).
  multiple: { type: Boolean, default: false },
  // Wyjaśnienie prezentowane kursantowi po sprawdzeniu testu.
  explanation: { type: String },
});

const quizSchema = new mongoose.Schema(
  {
    // id kursu pochodzi z PostgreSQL (liczba) — tak łączymy obie bazy
    courseId: { type: Number, required: true, index: true },
    title: { type: String, required: true },
    passingScore: { type: Number, default: 60, min: 0, max: 100 }, // próg zaliczenia w %
    // Limit czasu na rozwiązanie w minutach (0 = brak limitu).
    timeLimit: { type: Number, default: 0, min: 0 },
    // Czy losować kolejność pytań przy każdym podejściu.
    shuffle: { type: Boolean, default: false },
    // Ile pytań losowo pokazać z puli (0 = wszystkie).
    questionsToShow: { type: Number, default: 0, min: 0 },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "Test musi mieć co najmniej jedno pytanie",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
