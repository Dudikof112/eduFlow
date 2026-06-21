import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getCourses, deleteCourse } from "../services/api";

// Komponent prezentuje wszystkie kursy w systemie i pozwala je edytować lub usuwać.
// Edycja korzysta z istniejącej strony zarządzania kursem (admin ma do niej dostęp).
export default function AdminCourses() {
  const [courses, setCourses] = useState([]);

  const load = useCallback(() => {
    getCourses({}).then(setCourses).catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [load]);

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
      alert(err.response?.data?.message || err.response?.data?.error || "Nie udało się usunąć kursu.");
    }
  };

  return (
    <div className="tmanage">
      <h3>Wszystkie kursy ({courses.length})</h3>
      <ul className="tlist">
        {courses.map((c) => (
          <li key={c.id} className="tlist__item">
            <span className="tlist__main">
              <strong>{c.title}</strong>
              <span className="tlist__muted">
                {" "}
                · {c.User?.name || "—"} · {c.price > 0 ? `${c.price} zł` : "darmowy"}
              </span>
            </span>
            <span className="tlist__actions">
              <Link className="btn btn--ghost btn--xs" to={`/teacher/courses/${c.id}`}>
                Edytuj
              </Link>
              <button className="btn btn--danger btn--xs" onClick={() => onDelete(c.id)}>
                Usuń
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
