import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, removeFavorite } from "../services/api";
import CourseCard from "../components/CourseCard";

// Strona prezentuje ulubione kursy zalogowanego użytkownika.
// Kliknięcie serduszka usuwa kurs z listy (i z ulubionych).
export default function FavoritesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    getFavorites()
      .then((d) => setCourses(Array.isArray(d) ? d : []))
      .catch(() => setError("Nie udało się wczytać ulubionych."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const toggleFavorite = async (courseId, next) => {
    // na tej stronie pozostają wyłącznie ulubione, więc przełącznik je usuwa
    if (next) return;
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    try {
      await removeFavorite(courseId);
    } catch {
      load();
    }
  };

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="back-link">
          ← Wszystkie kursy
        </Link>
        <header className="hero hero--tight">
          <h1>Ulubione kursy</h1>
          <p>Kursy zapisane na później.</p>
        </header>

        {loading && <div className="loading">Ładowanie…</div>}
        {error && <div className="alert">{error}</div>}
        {!loading && !error && courses.length === 0 && (
          <div className="empty">
            Nie masz jeszcze ulubionych kursów. Kliknij ♡ na karcie kursu, aby dodać.
          </div>
        )}

        <div className="grid">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              favorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
