import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getQuiz, submitQuiz as apiSubmit, getQuizAttempts } from "../services/api";

// Funkcja formatuje liczbę sekund jako MM:SS (do licznika czasu).
const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function QuizPage() {
  const { quizId } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState({}); // id pytania -> [wybrane indeksy]
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // sekundy (null = brak limitu)

  const loadAttempts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setAttempts(await getQuizAttempts(quizId));
    } catch {
      /* ignorujemy */
    }
  }, [quizId, isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    getQuiz(quizId)
      .then((q) => setQuiz(q))
      .catch(() => setError("Nie udało się wczytać testu."))
      .finally(() => setLoading(false));
    loadAttempts();
  }, [quizId, loadAttempts]);

  // Start licznika czasu po wczytaniu testu (jeśli ustawiono limit).
  useEffect(() => {
    if (quiz && quiz.timeLimit > 0) setTimeLeft(quiz.timeLimit * 60);
  }, [quiz]);

  const toggle = (q, oi) => {
    if (result) return; // po sprawdzeniu blokujemy zmiany
    setSelected((s) => {
      const cur = s[q.id] || [];
      if (q.multiple) {
        const next = cur.includes(oi) ? cur.filter((x) => x !== oi) : [...cur, oi];
        return { ...s, [q.id]: next };
      }
      return { ...s, [q.id]: [oi] };
    });
  };

  const allAnswered =
    quiz && quiz.questions.every((q) => (selected[q.id] || []).length > 0);

  const submit = useCallback(async () => {
    if (!quiz || submitting || result) return;
    setSubmitting(true);
    try {
      const answers = quiz.questions.map((q) => ({
        questionId: q.id,
        selected: selected[q.id] || [],
      }));
      const res = await apiSubmit(quizId, answers);
      setResult(res);
      setTimeLeft(null);
      loadAttempts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert(e.response?.data?.error || e.response?.data?.message || "Nie udało się wysłać odpowiedzi.");
    } finally {
      setSubmitting(false);
    }
  }, [quiz, submitting, result, selected, quizId, loadAttempts]);

  // Odliczanie czasu; po dojściu do zera test wysyła się automatycznie.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      submitRef.current();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result]);

  const reset = () => {
    setResult(null);
    setSelected({});
    if (quiz && quiz.timeLimit > 0) setTimeLeft(quiz.timeLimit * 60);
  };

  if (loading)
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Ładowanie testu…</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page">
        <div className="container">
          <div className="alert">{error}</div>
        </div>
      </div>
    );

  if (!quiz) return null;

  // Po sprawdzeniu renderujemy z wyników (zawierają poprawne odpowiedzi i wyjaśnienia).
  const reviewQuestions = result
    ? result.results.map((r) => ({
        id: r.questionId,
        text: r.text,
        options: r.options,
        multiple: r.multiple,
        correctIndexes: r.correctIndexes,
        given: r.given,
        isCorrect: r.isCorrect,
        explanation: r.explanation,
      }))
    : quiz.questions;

  return (
    <div className="page">
      <div className="container">
        <Link to={`/courses/${quiz.courseId}`} className="back-link no-print">
          ← Powrót do kursu
        </Link>

        <h1 className="detail__title">{quiz.title}</h1>
        <div className="detail__meta">
          <span>{quiz.questions.length} pytań</span>
          <span>Próg zaliczenia: {quiz.passingScore}%</span>
          {quiz.timeLimit > 0 && <span>Limit: {quiz.timeLimit} min</span>}
        </div>

        {/* Licznik czasu (gdy test ma limit i nie został jeszcze sprawdzony) */}
        {timeLeft !== null && !result && (
          <div className={`quiz-timer${timeLeft <= 30 ? " quiz-timer--low" : ""} no-print`}>
            ⏱ Pozostały czas: {fmt(timeLeft)}
          </div>
        )}

        {!isAuthenticated && (
          <div className="notice" style={{ marginTop: 16 }}>
            <Link to="/login">Zaloguj się</Link>, aby rozwiązać test.
          </div>
        )}

        {result && (
          <>
            <div
              className={`quiz-result ${
                result.passed ? "quiz-result--pass" : "quiz-result--fail"
              }`}
            >
              <div className="quiz-result__score">{result.score}%</div>
              <div>
                <strong>{result.passed ? "Zaliczone! 🎉" : "Niezaliczone"}</strong>
                <p>
                  Poprawne odpowiedzi: {result.correct} z {result.total}
                </p>
              </div>
            </div>

            {/* Świadectwo zaliczenia (do wydruku / zapisu PDF) */}
            {result.passed && (
              <div className="certificate">
                <div className="certificate__inner">
                  <div className="certificate__eyebrow">Świadectwo zaliczenia testu</div>
                  <h2 className="certificate__name">{user?.name || "Kursant"}</h2>
                  <p className="certificate__text">
                    zaliczył(a) test <strong>„{quiz.title}"</strong> z wynikiem{" "}
                    <strong>{result.score}%</strong>.
                  </p>
                  <p className="certificate__date">
                    Data: {new Date().toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <button className="btn btn--ghost no-print" onClick={() => window.print()}>
                  Drukuj / zapisz PDF
                </button>
              </div>
            )}
          </>
        )}

        <div className="section" style={{ marginTop: 24 }}>
          {reviewQuestions.map((q, qi) => {
            const sel = result ? q.given : selected[q.id] || [];
            return (
              <div key={q.id || qi} className="quiz-q">
                <div className="quiz-q__text">
                  {qi + 1}. {q.text}
                  {q.multiple && (
                    <span className="quiz-q__badge">wielokrotny wybór</span>
                  )}
                </div>
                <div className="quiz-q__options">
                  {q.options.map((opt, oi) => {
                    const isSel = sel.includes(oi);
                    let cls = "quiz-opt";
                    if (result) {
                      if (q.correctIndexes.includes(oi)) cls += " quiz-opt--correct";
                      else if (isSel) cls += " quiz-opt--wrong";
                    } else if (isSel) {
                      cls += " quiz-opt--selected";
                    }
                    return (
                      <button
                        type="button"
                        key={oi}
                        className={cls}
                        onClick={() => toggle(q, oi)}
                        disabled={!!result || !isAuthenticated}
                      >
                        <span className={`quiz-opt__dot${q.multiple ? " quiz-opt__dot--sq" : ""}`} />
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {result && q.explanation && (
                  <div className="quiz-q__explain">💡 {q.explanation}</div>
                )}
              </div>
            );
          })}
        </div>

        {isAuthenticated && !result && (
          <button
            className="btn btn--primary no-print"
            onClick={submit}
            disabled={submitting || !allAnswered}
          >
            {submitting
              ? "Sprawdzanie…"
              : allAnswered
              ? "Sprawdź wynik"
              : "Odpowiedz na wszystkie pytania"}
          </button>
        )}
        {result && (
          <button className="btn btn--ghost no-print" onClick={reset}>
            Rozwiąż ponownie
          </button>
        )}

        {isAuthenticated && attempts.length > 0 && (
          <div className="section no-print">
            <h2>Twoje podejścia</h2>
            {attempts.map((a) => (
              <div key={a._id} className="attempt-row">
                <span
                  style={{
                    fontWeight: 700,
                    color: a.passed ? "var(--primary)" : "var(--danger)",
                  }}
                >
                  {a.score}%
                </span>
                <span>{a.passed ? "zaliczone" : "niezaliczone"}</span>
                <span className="comment__date">
                  {new Date(a.createdAt).toLocaleString("pl-PL")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
