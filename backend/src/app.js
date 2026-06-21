const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const helmet = require("helmet");
require("dotenv").config();

const sequelize = require("./config/db");
const connectMongo = require("./config/mongo");
const errorHandler = require("./middlewares/errorHandler");
const { generalLimiter } = require("./middlewares/rateLimiters");
const initSocket = require("./socket");

const app = express();

// ===== Middleware =====
// helmet ustawia nagłówki bezpieczeństwa. Zasoby (np. wideo, materiały) muszą być
// dostępne z innego origin (frontend :5173), dlatego luzujemy politykę CORP.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());

// Ogólny limit liczby zapytań (ochrona przed nadużyciami).
app.use(generalLimiter);

// Webhook Stripe wymaga SUROWEGO body (do weryfikacji podpisu), dlatego rejestrowany
// jest przed globalnym express.json(). Pozostałe trasy korzystają z JSON poniżej.
app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/paymentController").webhook
);

app.use(express.json());

// Statyczne udostępnienie wgranych plików (np. wideo lekcji) spod /uploads.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ===== Modele (inicjalizacja relacji) =====
require("./models");

// ===== Trasy =====
// POPRAWKA: usunięty błędny import `const { auth } = ...` (był undefined i nieużywany)
// POPRAWKA: /auth montowane teraz tylko RAZ (wcześniej było zdublowane)
app.use("/auth", require("./routes/authRoutes"));
app.use("/courses", require("./routes/courseRoutes"));
app.use("/lessons", require("./routes/lessonRoutes"));
app.use("/enrollments", require("./routes/enrollmentRoutes"));
app.use("/progress", require("./routes/progressRoutes"));
app.use("/ratings", require("./routes/ratingRoutes"));
app.use("/comments", require("./routes/commentRoutes"));
app.use("/quizzes", require("./routes/quizRoutes"));
app.use("/certificates", require("./routes/certificateRoutes"));
app.use("/chat", require("./routes/chatRoutes"));
app.use("/payments", require("./routes/paymentRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/materials", require("./routes/materialRoutes"));
app.use("/modules", require("./routes/moduleRoutes"));
app.use("/qa", require("./routes/qaRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));
app.use("/favorites", require("./routes/favoriteRoutes"));
app.use("/stats", require("./routes/statsRoutes"));

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "API działa" });
});

// ===== Globalny handler błędów (MUSI być po trasach) =====
app.use(errorHandler);

// ===== Start serwera =====
// POPRAWKA: port z .env (z fallbackiem), start dopiero po połączeniu z bazą
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Postgres connected");

    // alter:true = wygodna auto-aktualizacja schematu w dev.
    // Na produkcji zamiast tego używa się migracji.
    await sequelize.sync({ alter: true });
    console.log("Modele (PostgreSQL) zsynchronizowane");

    // MongoDB (testy online). Gdyby był niedostępny, reszta API i tak wstaje.
    try {
      await connectMongo();
      console.log("MongoDB connected");
    } catch (e) {
      console.error(
        "UWAGA: brak połączenia z MongoDB — testy online nie będą działać:",
        e.message
      );
    }

    // Serwer HTTP wspólny dla REST (Express) i socket.io (czat na żywo + powiadomienia).
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`Backend działa na porcie ${PORT} (REST + socket.io)`);
    });
  } catch (err) {
    console.error("DB error:", err);
    process.exit(1);
  }
}

// Serwer startuje tylko przy bezpośrednim uruchomieniu (node src/app.js).
// Dzięki temu testy (supertest) mogą zaimportować aplikację bez łączenia z bazą.
if (require.main === module) {
  start();
}

module.exports = app;
