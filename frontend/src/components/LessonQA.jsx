import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getLessonQuestions,
  askQuestion,
  answerQuestion,
  deleteQuestion,
  deleteAnswer,
} from "../services/api";

// Funkcja zwraca czytelną etykietę roli autora (lub null dla zwykłego kursanta).
const roleLabel = (r) =>
  r === "creator" ? "prowadzący" : r === "admin" ? "admin" : null;

// Komponent prezentuje sekcję pytań i odpowiedzi pod pojedynczą lekcją.
// Treść doczytuje się dopiero po rozwinięciu (lazy-load). Props: lessonId, courseId.
export default function LessonQA({ lessonId, courseId }) {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState("");
  const [answerText, setAnswerText] = useState({}); // id pytania -> treść odpowiedzi
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setQuestions(await getLessonQuestions(lessonId));
    } catch {
      /* ignorujemy */
    } finally {
      setLoaded(true);
    }
  }, [lessonId]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) load();
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.trim()) return;
    setBusy(true);
    try {
      await askQuestion(lessonId, { text: newQ.trim(), courseId });
      setNewQ("");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się dodać pytania.");
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (questionId) => {
    const text = (answerText[questionId] || "").trim();
    if (!text) return;
    setBusy(true);
    try {
      await answerQuestion(questionId, { text });
      setAnswerText((s) => ({ ...s, [questionId]: "" }));
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się dodać odpowiedzi.");
    } finally {
      setBusy(false);
    }
  };

  const removeQ = async (id) => {
    if (!window.confirm("Usunąć pytanie wraz z odpowiedziami?")) return;
    try {
      await deleteQuestion(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć.");
    }
  };
  const removeA = async (id) => {
    if (!window.confirm("Usunąć odpowiedź?")) return;
    try {
      await deleteAnswer(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć.");
    }
  };

  // czy bieżący użytkownik może usunąć wpis (autor lub administrator)
  const canModify = (authorId) =>
    isAuthenticated && user && (user.id === authorId || user.role === "admin");

  return (
    <div className="qa">
      <button className="qa__toggle" onClick={toggle}>
        💬 Pytania i odpowiedzi {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="qa__body">
          {!loaded && <p className="qa__muted">Ładowanie…</p>}
          {loaded && questions.length === 0 && (
            <p className="qa__muted">Brak pytań do tej lekcji. Zadaj pierwsze!</p>
          )}

          {questions.map((q) => (
            <div key={q.id} className="qa__item">
              <div className="qa__q">
                <div className="qa__meta">
                  <strong>{q.User?.name || "Użytkownik"}</strong>
                  {roleLabel(q.User?.role) && (
                    <span className="qa__tag">{roleLabel(q.User.role)}</span>
                  )}
                  <span className="qa__date">
                    {new Date(q.createdAt).toLocaleDateString("pl-PL")}
                  </span>
                  {canModify(q.userId) && (
                    <button className="qa__del" onClick={() => removeQ(q.id)}>
                      usuń
                    </button>
                  )}
                </div>
                <div className="qa__text">{q.text}</div>
              </div>

              {(q.Answers || []).map((a) => (
                <div key={a.id} className="qa__a">
                  <div className="qa__meta">
                    <strong>{a.User?.name || "Użytkownik"}</strong>
                    {roleLabel(a.User?.role) && (
                      <span className="qa__tag">{roleLabel(a.User.role)}</span>
                    )}
                    <span className="qa__date">
                      {new Date(a.createdAt).toLocaleDateString("pl-PL")}
                    </span>
                    {canModify(a.userId) && (
                      <button className="qa__del" onClick={() => removeA(a.id)}>
                        usuń
                      </button>
                    )}
                  </div>
                  <div className="qa__text">{a.text}</div>
                </div>
              ))}

              {isAuthenticated && (
                <div className="qa__answer-form">
                  <input
                    placeholder="Odpowiedz…"
                    value={answerText[q.id] || ""}
                    onChange={(e) =>
                      setAnswerText((s) => ({ ...s, [q.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submitAnswer(q.id);
                      }
                    }}
                  />
                  <button
                    className="btn btn--ghost btn--xs"
                    disabled={busy}
                    onClick={() => submitAnswer(q.id)}
                  >
                    Wyślij
                  </button>
                </div>
              )}
            </div>
          ))}

          {isAuthenticated ? (
            <form className="qa__ask" onSubmit={submitQuestion}>
              <textarea
                rows={2}
                placeholder="Zadaj pytanie do tej lekcji…"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
              />
              <button className="btn btn--primary btn--xs" disabled={busy || !newQ.trim()}>
                Zadaj pytanie
              </button>
            </form>
          ) : (
            <p className="qa__muted">Zaloguj się, aby zadać pytanie.</p>
          )}
        </div>
      )}
    </div>
  );
}
