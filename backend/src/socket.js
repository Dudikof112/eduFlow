const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { setIO } = require("./realtime");
const chatService = require("./services/chatService");

// Funkcja inicjalizuje serwer socket.io na istniejącym serwerze HTTP.
// Zapewnia: uwierzytelnianie po JWT, osobisty pokój użytkownika (powiadomienia)
// oraz pokoje per wątek czatu (kurs + kursant) z kontrolą dostępu.
function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "*" },
  });

  // Uwierzytelnianie połączenia tokenem JWT przekazanym w handshake.auth.token.
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error("Brak tokenu"));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
      next();
    } catch {
      next(new Error("Nieprawidłowy token"));
    }
  });

  io.on("connection", (socket) => {
    // Osobisty pokój użytkownika — tu trafiają powiadomienia.
    socket.join(`user:${socket.user.id}`);

    // Dołączenie do wątku czatu po sprawdzeniu dostępu (kursant / prowadzący / admin).
    socket.on("chat:join", async ({ courseId, studentId }) => {
      try {
        await chatService.assertAccess(socket.user, courseId, studentId);
        socket.join(`chat:${courseId}:${studentId}`);
      } catch {
        /* brak dostępu — ignorujemy dołączenie */
      }
    });

    // Wysłanie wiadomości przez socket (alternatywa dla REST; oba rozsyłają na żywo).
    socket.on("chat:message", async ({ courseId, studentId, text }) => {
      try {
        await chatService.sendMessage(socket.user, courseId, studentId, text);
      } catch {
        /* błędy nie przerywają połączenia socketu */
      }
    });
  });

  setIO(io);
  return io;
}

module.exports = initSocket;
