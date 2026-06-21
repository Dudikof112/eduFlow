import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourse, updateCourse } from "../services/api";
import CourseForm from "../components/CourseForm";
import ModuleManager from "../components/ModuleManager";
import LessonManager from "../components/LessonManager";
import QuizManager from "../components/QuizManager";

// Strona zarządzania pojedynczym kursem: edycja danych kursu oraz lekcji i testów.
export default function TeacherCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    getCourse(id).then(setCourse).catch(() => {});
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  const onSave = async (payload) => {
    setBusy(true);
    setSaved(false);
    try {
      await updateCourse(id, payload);
      setSaved(true);
      load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Nie udało się zapisać zmian."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!course) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Ładowanie…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <Link to="/teacher" className="back-link">
          ← Panel nauczyciela
        </Link>
        <header className="hero hero--tight">
          <span className="hero__eyebrow">Zarządzanie kursem</span>
          <h1>{course.title}</h1>
        </header>

        <div className="tcard">
          <h3>Dane kursu</h3>
          <CourseForm
            initial={course}
            onSubmit={onSave}
            submitLabel="Zapisz zmiany"
            busy={busy}
          />
          {saved && <p className="ok-note">Zapisano ✓</p>}
        </div>

        <div className="tcard">
          <ModuleManager courseId={id} />
        </div>
        <div className="tcard">
          <LessonManager courseId={id} />
        </div>
        <div className="tcard">
          <QuizManager courseId={id} />
        </div>
      </div>
    </div>
  );
}
