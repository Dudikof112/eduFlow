import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyCourses, createCourse, deleteCourse } from "../services/api";
import CourseForm from "../components/CourseForm";
import StatsPanel from "../components/StatsPanel";

// Strona główna panelu nauczyciela: prezentuje kursy prowadzącego i pozwala tworzyć nowe.
export default function TeacherDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    getMyCourses().then(setCourses).catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (payload) => {
    setBusy(true);
    try {
      await createCourse(payload);
      setShowForm(false);
      load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nie udało się utworzyć kursu."
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (
      !window.confirm(
        "Usunąć kurs wraz z lekcjami, testami i zapisami? Tej operacji nie można cofnąć."
      )
    )
      return;
    try {
      await deleteCourse(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć kursu.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="hero hero--tight">
          <span className="hero__eyebrow">Panel nauczyciela</span>
          <h1>Twoje kursy</h1>
          <p>
            Twórz kursy, dodawaj lekcje i testy. Zmiany są od razu widoczne na
            publicznej liście kursów.
          </p>
        </header>

        <StatsPanel />

        <div style={{ marginBottom: 18 }}>
          <button
            className="btn btn--primary"
            onClick={() => setShowForm((s) => !s)}
          >
            {showForm ? "Zamknij formularz" : "+ Nowy kurs"}
          </button>
        </div>

        {showForm && (
          <div className="tcard">
            <h3>Nowy kurs</h3>
            <CourseForm
              onSubmit={onCreate}
              submitLabel="Utwórz kurs"
              busy={busy}
            />
          </div>
        )}

        {courses.length === 0 ? (
          <div className="empty">
            Nie masz jeszcze kursów. Utwórz pierwszy powyżej.
          </div>
        ) : (
          <ul className="tlist tlist--cards">
            {courses.map((c) => (
              <li key={c.id} className="tlist__item">
                <span className="tlist__main">
                  <strong>{c.title}</strong>
                  <span className="tlist__muted">
                    {" "}
                    · {c.lessonCount} lekcji ·{" "}
                    {c.price > 0 ? `${c.price} zł` : "darmowy"} · {c.language}
                  </span>
                </span>
                <span className="tlist__actions">
                  <Link
                    className="btn btn--ghost btn--xs"
                    to={`/teacher/courses/${c.id}`}
                  >
                    Zarządzaj
                  </Link>
                  <button
                    className="btn btn--danger btn--xs"
                    onClick={() => onDelete(c.id)}
                  >
                    Usuń
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
