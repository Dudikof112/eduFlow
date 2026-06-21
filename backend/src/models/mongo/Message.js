const mongoose = require("mongoose");

// Wątek czatu identyfikujemy parą (courseId, studentId).
// Rozmawiają w nim: kursant (studentId) oraz prowadzący kurs (twórca kursu z PostgreSQL).
// senderId = kto wysłał daną wiadomość (kursant albo prowadzący).
const messageSchema = new mongoose.Schema(
  {
    courseId: { type: Number, required: true, index: true }, // id kursu z PostgreSQL
    studentId: { type: Number, required: true, index: true }, // id kursanta z PostgreSQL
    senderId: { type: Number, required: true }, // id nadawcy z PostgreSQL
    text: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ courseId: 1, studentId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
