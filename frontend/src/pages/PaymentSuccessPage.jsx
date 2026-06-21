import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { confirmPayment } from "../services/api";

// Strona docelowa po płatności. Odczytuje session_id z adresu, potwierdza płatność
// w backendzie (co zapisuje użytkownika na kurs) i prezentuje wynik.
export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");

  // status — bieżący stan potwierdzania: "loading" | "ok" | "error".
  const [status, setStatus] = useState("loading");
  const [courseId, setCourseId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Brak identyfikatora sesji płatności.");
      return;
    }
    confirmPayment(sessionId)
      .then((res) => {
        setCourseId(res.courseId);
        setStatus("ok");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(
          e.response?.data?.message ||
            e.response?.data?.error ||
            "Nie udało się potwierdzić płatności."
        );
      });
  }, [sessionId]);

  return (
    <div className="page">
      <div className="container">
        <div className="auth" style={{ textAlign: "center" }}>
          {status === "loading" && (
            <p className="loading">Potwierdzanie płatności…</p>
          )}

          {status === "ok" && (
            <>
              <div
                className="quiz-result__score"
                style={{ color: "var(--primary)" }}
              >
                ✓
              </div>
              <h1>Płatność zakończona</h1>
              <p className="auth__sub">
                Masz teraz dostęp do kursu. Miłej nauki!
              </p>
              <button
                className="btn btn--primary btn--block"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                Przejdź do kursu
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <h1>Coś poszło nie tak</h1>
              <div className="alert">{message}</div>
              <Link className="btn btn--ghost btn--block" to="/">
                Wróć do kursów
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
