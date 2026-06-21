import { io } from "socket.io-client";
import { API_URL } from "./api";

// Pojedyncze połączenie socket.io współdzielone przez aplikację (czat + powiadomienia).
let socket = null;

// Funkcja zwraca połączenie socket.io, tworząc je przy pierwszym użyciu (z tokenem JWT).
// Zwraca null, gdy użytkownik nie jest zalogowany.
export function getSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

// Funkcja zamyka połączenie (np. przy wylogowaniu) i pozwala utworzyć je na nowo.
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
