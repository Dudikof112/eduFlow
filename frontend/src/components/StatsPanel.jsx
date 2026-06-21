import { useEffect, useState } from "react";
import { getInstructorStats } from "../services/api";

// Komponent prezentuje statystyki kursów prowadzącego: podsumowanie oraz tabelę
// z liczbą zapisów, ukończeń, procentem ukończeń i średnią oceną dla każdego kursu.
export default function StatsPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInstructorStats()
      .then(setData)
      .catch(() => setError("Nie udało się wczytać statystyk."));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <div className="loading">Ładowanie statystyk…</div>;
  if (!data.rows || data.rows.length === 0) return null;

  return (
    <section className="section">
      <h2>Statystyki</h2>
      <div className="stats-summary">
        <div className="stat-box">
          <div className="stat-box__num">{data.totals.courses}</div>
          <div className="stat-box__label">kursy</div>
        </div>
        <div className="stat-box">
          <div className="stat-box__num">{data.totals.enrollments}</div>
          <div className="stat-box__label">zapisy</div>
        </div>
        <div className="stat-box">
          <div className="stat-box__num">{data.totals.completions}</div>
          <div className="stat-box__label">ukończenia</div>
        </div>
      </div>

      <div className="stats-table">
        <div className="stats-row stats-row--head">
          <span>Kurs</span>
          <span>Lekcje</span>
          <span>Zapisy</span>
          <span>Ukończenia</span>
          <span>Ukończenia %</span>
          <span>Ocena</span>
        </div>
        {data.rows.map((r) => (
          <div key={r.courseId} className="stats-row">
            <span className="stats-row__title">{r.title}</span>
            <span>{r.lessonCount}</span>
            <span>{r.enrollments}</span>
            <span>{r.completions}</span>
            <span className="stats-row__pct">
              <span className="stats-bar">
                <span className="stats-bar__fill" style={{ width: `${r.completionRate}%` }} />
              </span>
              {r.completionRate}%
            </span>
            <span>
              {r.ratingCount > 0 ? `★ ${r.averageRating} (${r.ratingCount})` : "—"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
