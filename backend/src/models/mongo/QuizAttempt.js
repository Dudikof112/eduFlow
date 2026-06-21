const mongoose = require("mongoose");

// Zapis pojedynczego podejścia do testu.
const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    userId: { type: Number, required: true, index: true }, // id usera z PostgreSQL
    courseId: { type: Number, required: true },
    // Udzielone odpowiedzi: lista obiektów { questionId, selected: [indeksy] }.
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    score: { type: Number, required: true }, // wynik w %
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
