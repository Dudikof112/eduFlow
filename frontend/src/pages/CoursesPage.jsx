import { useEffect, useState } from "react";
import {
  getCourses,
  getTags,
  getLanguages,
  getInstructors,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/CourseCard";

const PAGE_SIZE = 9;
const LEVELS = ["Początkujący", "Średniozaawansowany", "Zaawansowany"];

export default function CoursesPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtry
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(null);
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("");

  // paginacja
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // listy do filtrów – wprost z danych, więc zawsze aktualne
  useEffect(() => {
    getTags().then((d) => setTags(Array.isArray(d) ? d : [])).catch(() => {});
    getLanguages().then((d) => setLanguages(Array.isArray(d) ? d : [])).catch(() => {});
    getInstructors().then((d) => setInstructors(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // identyfikatory ulubionych (do oznaczenia serduszek) – tylko dla zalogowanych
  useEffect(() => {
    if (!isAuthenticated) {
      setFavIds(new Set());
      return;
    }
    getFavoriteIds()
      .then((ids) => setFavIds(new Set(ids)))
      .catch(() => {});
  }, [isAuthenticated]);

  // dodanie/usunięcie z ulubionych z optymistyczną aktualizacją
  const toggleFavorite = async (courseId, next) => {
    setFavIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(courseId);
      else s.delete(courseId);
      return s;
    });
    try {
      if (next) await addFavorite(courseId);
      else await removeFavorite(courseId);
    } catch {
      // cofnięcie zmiany przy błędzie
      setFavIds((prev) => {
        const s = new Set(prev);
        if (next) s.delete(courseId);
        else s.add(courseId);
        return s;
      });
    }
  };

  // pobieranie z debounce 300 ms
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      setError("");
      getCourses({ search: query, tag, language, level, instructorId, minRating, sort, page, limit: PAGE_SIZE })
        .then((data) => {
          setCourses(Array.isArray(data.items) ? data.items : []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        })
        .catch(() =>
          setError("Nie udało się pobrać kursów. Czy backend działa na :5000?")
        )
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, tag, language, level, instructorId, minRating, sort, page]);

  // zmiana dowolnego filtra wraca na pierwszą stronę
  const resetPage = () => setPage(1);

  const goPrev = () => {
    setPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <span className="hero__eyebrow">Platforma e-learningowa</span>
          <h1>Ucz się tego, co naprawdę przydatne</h1>
          <p>
            Praktyczne kursy z programowania prowadzone krok po kroku. Wybierz
            kurs i zacznij już dziś.
          </p>
        </header>

        <div className="search">
          <span className="search__icon">🔍</span>
          <input
            className="search__input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Szukaj kursu po nazwie…"
          />
          {query && (
            <button
              className="search__clear"
              onClick={() => {
                setQuery("");
                resetPage();
              }}
              aria-label="Wyczyść"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters">
          <label className="filters__field">
            <span>Poziom</span>
            <select
              className="select"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                resetPage();
              }}
            >
              <option value="">Każdy</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>

          <label className="filters__field">
            <span>Prowadzący</span>
            <select
              className="select"
              value={instructorId}
              onChange={(e) => {
                setInstructorId(e.target.value);
                resetPage();
              }}
            >
              <option value="">Każdy</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </label>

          <label className="filters__field">
            <span>Język</span>
            <select
              className="select"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                resetPage();
              }}
            >
              <option value="">Każdy</option>
              {languages.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>

          <label className="filters__field">
            <span>Ocena</span>
            <select
              className="select"
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                resetPage();
              }}
            >
              <option value="">Każda</option>
              <option value="4.5">4.5 i więcej</option>
              <option value="4">4.0 i więcej</option>
              <option value="3.5">3.5 i więcej</option>
              <option value="3">3.0 i więcej</option>
            </select>
          </label>

          <label className="filters__field">
            <span>Sortuj</span>
            <select
              className="select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                resetPage();
              }}
            >
              <option value="">Najnowsze</option>
              <option value="rating">Najwyżej oceniane</option>
              <option value="popular">Najpopularniejsze</option>
              <option value="title">Alfabetycznie (A–Z)</option>
            </select>
          </label>
        </div>

        {tags.length > 0 && (
          <>
            <p className="filter-label">Kategoria / temat</p>
            <div className="chips">
              <button
                className={`chip${tag === null ? " chip--active" : ""}`}
                onClick={() => {
                  setTag(null);
                  resetPage();
                }}
              >
                Wszystkie
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  className={`chip${tag === t ? " chip--active" : ""}`}
                  onClick={() => {
                    setTag(tag === t ? null : t);
                    resetPage();
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {loading && <div className="loading">Ładowanie kursów…</div>}
        {error && <div className="alert">{error}</div>}

        {!loading && !error && (
          <p className="results-count">Znaleziono kursów: {total}</p>
        )}

        {!loading && !error && total === 0 && (
          <div className="empty">
            {query || tag || language || level || instructorId || minRating
              ? "Brak kursów dla wybranych kryteriów."
              : "Brak kursów. Uruchom npm run seed w katalogu backendu."}
          </div>
        )}

        <div className="grid">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              favorite={favIds.has(c.id)}
              onToggleFavorite={isAuthenticated ? toggleFavorite : undefined}
            />
          ))}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn--ghost" onClick={goPrev} disabled={page <= 1}>
              ← Poprzednia
            </button>
            <span className="pagination__info">
              Strona {page} z {totalPages}
            </span>
            <button className="btn btn--ghost" onClick={goNext} disabled={page >= totalPages}>
              Następna →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
