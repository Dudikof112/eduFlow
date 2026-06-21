import { useEffect, useRef, useState, useCallback } from "react";
import { getChatMessages, sendChatMessage } from "../services/api";
import { getSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

// Wątek czatu dla pary (courseId, studentId). Działa na żywo przez socket.io:
// historia ładowana jest przez REST, a nowe wiadomości docierają zdarzeniem "chat:message".
export default function ChatThread({ courseId, studentId, title }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef(null);

  // dokładanie wiadomości z odrzuceniem duplikatów (po identyfikatorze _id)
  const appendMsg = useCallback((m) => {
    setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await getChatMessages(courseId, studentId);
      setMessages(Array.isArray(data) ? data : []);
      setError("");
    } catch {
      setError("Nie udało się wczytać wiadomości.");
    }
  }, [courseId, studentId]);

  useEffect(() => {
    load();
    const socket = getSocket();
    if (!socket) return;
    // dołączenie do pokoju wątku i nasłuch nowych wiadomości
    socket.emit("chat:join", { courseId, studentId });
    const onMsg = (m) => {
      if (
        Number(m.courseId) === Number(courseId) &&
        Number(m.studentId) === Number(studentId)
      ) {
        appendMsg(m);
      }
    };
    socket.on("chat:message", onMsg);
    return () => socket.off("chat:message", onMsg);
  }, [load, courseId, studentId, appendMsg]);

  // Przewijamy TYLKO wnętrze okna czatu (nie całą stronę).
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      // Zapis przez REST (pewne utrwalenie). Serwer rozsyła wiadomość przez socket;
      // dokładamy ją też z odpowiedzi REST (duplikaty są odrzucane po _id).
      const saved = await sendChatMessage(courseId, studentId, text.trim());
      setText("");
      if (saved && saved._id) appendMsg(saved);
    } catch {
      alert("Nie udało się wysłać wiadomości.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat">
      {title && <div className="chat__header">{title}</div>}

      <div className="chat__body" ref={bodyRef}>
        {messages.length === 0 && (
          <p className="chat__empty">Brak wiadomości. Napisz pierwszą!</p>
        )}
        {messages.map((m) => {
          const mine = Number(m.senderId) === Number(user?.id);
          return (
            <div key={m._id} className={`bubble ${mine ? "bubble--mine" : ""}`}>
              <div className="bubble__text">{m.text}</div>
              <div className="bubble__time">
                {new Date(m.createdAt).toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="alert" style={{ margin: "8px 0" }}>
          {error}
        </div>
      )}

      <form className="chat__form" onSubmit={send}>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Napisz wiadomość…"
        />
        <button className="btn btn--primary" disabled={sending || !text.trim()}>
          Wyślij
        </button>
      </form>
    </div>
  );
}
