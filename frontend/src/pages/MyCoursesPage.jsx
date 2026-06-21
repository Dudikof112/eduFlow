import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyEnrolledCourses,
  getMyCertificates,
  downloadCertificate,
} from "../services/api";

// Kokpit „Moje kursy": prezentuje zapisane kursy z postępem oraz zdobyte certyfikaty.
export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyEnrolledCourses().catch(() => []),
      getMyCertificates().catch(() => []),
    ])
      .then(([c, ce]) => {
        setCourses(Array.isArray(c) ? c : []);
        setCerts(Array.isArray(ce) ? ce : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const onDownload = async (courseId) => {
    try {
      await downloadCertificate(courseId);
    } catch {
      alert("Nie udało się pobrać certyfikatu.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="hero hero--tight">
          <span className="hero__eyebrow">Twoja nauka</span>
          <h1>Moje kursy</h1>
          <p>
            Kursy, na które jesteś zapisany, wraz z postępem. Wróć do nauki jednym
            kliknięciem.
          </p>
        </header>

        {loading && <div className="loading">Ładowanie…</div>}

        {!loading && courses.length === 0 && (
          <div className="empty">
            Nie jesteś jeszcze zapisany na żaden kurs.{" "}
            <Link to="/">Przeglądaj kursy →</Link>
          </div>
        )}

        <div className="mc-list">
          {courses.map((c) => (
            <div key={c.id} className="mc-item">
              <div className="mc-item__head">
                <strong>{c.title}</strong>
                <span className="tlist__muted">
                  {c.done}/{c.total} lekcji
                </span>
              </div>
              <div className="progress__bar">
                <div
                  className="progress__fill"
                  style={{ width: `${c.percent}%` }}
                />
              </div>
              <div className="mc-item__foot">
                <span className="mc-percent">
                  {c.percent}%{c.percent === 100 ? " · ukończony 🎓" : ""}
                </span>
                <Link className="btn btn--primary btn--xs" to={`/courses/${c.id}`}>
                  {c.percent === 100
                    ? "Otwórz"
                    : c.percent > 0
                    ? "Kontynuuj"
                    : "Rozpocznij"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {certs.length > 0 && (
          <>
            <h2 className="mc-section">Twoje certyfikaty</h2>
            <ul className="tlist">
              {certs.map((ce) => (
                <li key={ce.id} className="tlist__item">
                  <span className="tlist__main">
                    🎓 <strong>{ce.Course?.title || "Kurs"}</strong>
                    <span className="tlist__muted">· nr {ce.code}</span>
                  </span>
                  <span className="tlist__actions">
                    <button
                      className="btn btn--ghost btn--xs"
                      onClick={() => onDownload(ce.courseId)}
                    >
                      Pobierz PDF
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
