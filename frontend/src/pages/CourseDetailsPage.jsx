import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatThread from "../components/ChatThread";
import LessonQA from "../components/LessonQA";
import CourseCard from "../components/CourseCard";
import {
  getCourse,
  getComments,
  addComment as apiAddComment,
  getRatings,
  addRating as apiAddRating,
  deleteRating as apiDeleteRating,
  enrollCourse,
  unenrollCourse,
  createCheckout,
  completeLesson,
  getCourseDashboard,
  getCourseQuizzes,
  downloadCertificate,
  getFavoriteIds,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
  getRecommendations,
  API_URL,
} from "../services/api";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [quizzes, setQuizzes] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [reviewValue, setReviewValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [recs, setRecs] = useState([]);
  const [busy, setBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [c, cm, rt, qz] = await Promise.all([
        getCourse(id),
        getComments(id),
        getRatings(id),
        getCourseQuizzes(id),
      ]);
      setCourse(c);
      setComments(Array.isArray(cm) ? cm : []);
      setRating(rt || { average: 0, count: 0 });
      setQuizzes(Array.isArray(qz) ? qz : []);

      if (isAuthenticated) {
        try {
          setDashboard(await getCourseDashboard(id));
        } catch {
          setDashboard(null);
        }
      } else {
        setDashboard(null);
      }
    } catch {
      setError("Nie udało się wczytać kursu.");
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    loadAll();
  }, [loadAll]);

  const completedMap = {};
  (dashboard?.lessons || []).forEach((l) => {
    completedMap[l.id] = l.completed;
  });
  const isEnrolled = dashboard?.isEnrolled;

  const handleEnroll = async () => {
    setBusy(true);
    try {
      await enrollCourse(id);
      await loadAll();
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.error || "Nie udało się zapisać.");
    } finally {
      setBusy(false);
    }
  };

  // Funkcja rozpoczyna płatność za płatny kurs i przekierowuje przeglądarkę na stronę Stripe.
  const handleBuy = async () => {
    setBusy(true);
    try {
      const { url } = await createCheckout(id);
      window.location.href = url; // przekierowanie do Stripe Checkout
    } catch (e) {
      alert(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Nie udało się rozpocząć płatności. Sprawdź klucze Stripe w .env."
      );
      setBusy(false);
    }
  };

  const handleUnenroll = async () => {
    if (
      !window.confirm(
        "Na pewno anulować zapis na ten kurs? Twój postęp w tym kursie zostanie usunięty."
      )
    )
      return;
    setBusy(true);
    try {
      await unenrollCourse(id);
      await loadAll();
    } catch (e) {
      alert(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Nie udało się anulować zapisu."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async (lessonId) => {
    setBusy(true);
    try {
      await completeLesson(lessonId);
      await loadAll();
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.error || "Błąd.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setBusy(true);
    try {
      await apiAddComment({ courseId: id, content: newComment.trim() });
      setNewComment("");
      setComments(await getComments(id));
    } catch (e) {
      alert(e.response?.data?.error || "Nie udało się dodać komentarza.");
    } finally {
      setBusy(false);
    }
  };

  // wysyłka recenzji (ocena + opcjonalny tekst); aktualizuje istniejącą recenzję użytkownika
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewValue) {
      alert("Wybierz ocenę w gwiazdkach.");
      return;
    }
    setBusy(true);
    try {
      await apiAddRating({ courseId: id, value: reviewValue, text: reviewText });
      setRating(await getRatings(id));
    } catch (e) {
      alert(e.response?.data?.message || e.response?.data?.error || "Nie udało się zapisać recenzji.");
    } finally {
      setBusy(false);
    }
  };

  // usunięcie własnej recenzji
  const handleDeleteReview = async () => {
    if (!window.confirm("Usunąć swoją recenzję?")) return;
    setBusy(true);
    try {
      await apiDeleteRating(id);
      setReviewValue(0);
      setReviewText("");
      setRating(await getRatings(id));
    } catch (e) {
      alert(e.response?.data?.message || "Nie udało się usunąć recenzji.");
    } finally {
      setBusy(false);
    }
  };

  // wczytuje istniejącą recenzję bieżącego użytkownika do formularza (do edycji)
  useEffect(() => {
    if (!user || !Array.isArray(rating.ratings)) return;
    const mine = rating.ratings.find((r) => r.userId === user.id);
    if (mine) {
      setReviewValue(mine.value);
      setReviewText(mine.text || "");
    }
  }, [rating, user]);

  // podobne kursy (publiczne)
  useEffect(() => {
    getRecommendations(id)
      .then((d) => setRecs(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [id]);

  // status ulubionego dla zalogowanego użytkownika
  useEffect(() => {
    if (!isAuthenticated) {
      setIsFav(false);
      return;
    }
    getFavoriteIds()
      .then((ids) => setIsFav(ids.map(Number).includes(Number(id))))
      .catch(() => {});
  }, [id, isAuthenticated]);

  const toggleFav = async () => {
    const next = !isFav;
    setIsFav(next);
    try {
      if (next) await apiAddFavorite(id);
      else await apiRemoveFavorite(id);
    } catch {
      setIsFav(!next);
    }
  };

  const handleDownloadCertificate = async () => {
    setBusy(true);
    try {
      await downloadCertificate(id);
    } catch {
      alert("Nie udało się pobrać certyfikatu. Upewnij się, że kurs jest w pełni ukończony.");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Ładowanie…</div>
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

  if (!course) return null;

  const lessons = course.Lessons || [];
  const instructor = course.User?.name || course.User?.email;
  const myReview =
    user && Array.isArray(rating.ratings)
      ? rating.ratings.find((r) => r.userId === user.id)
      : null;
  const modules = course.Modules || [];

  // Funkcja zwraca lekcje należące do danego modułu (lub bez modułu, gdy moduleId = null).
  const lessonsByModule = (moduleId) =>
    lessons.filter((l) =>
      moduleId === null ? !l.moduleId : l.moduleId === moduleId
    );

  // Licznik nadaje lekcjom ciągłą numerację w obrębie całego kursu (przez wszystkie moduły).
  let lessonCounter = 0;

  // Funkcja renderuje pojedynczą lekcję: nagłówek, ewentualny odtwarzacz wideo i materiały.
  const renderLesson = (l) => {
    lessonCounter += 1;
    const idx = lessonCounter;
    const done = completedMap[l.id];
    return (
      <div key={l.id}>
        <div className={`lesson${done ? " lesson--done" : ""}`}>
          <span className="lesson__num">{done ? "✓" : idx}</span>
          <span className="lesson__title">{l.title}</span>
          {l.videoUrl && (
            <a className="btn btn--ghost" href={l.videoUrl} target="_blank" rel="noreferrer">
              ▶ Wideo
            </a>
          )}
          {isAuthenticated && isEnrolled && !done && (
            <button className="btn btn--ghost" onClick={() => handleComplete(l.id)} disabled={busy}>
              Ukończ
            </button>
          )}
        </div>
        {l.videoFile && (
          <div className="lesson-video">
            <video controls src={`${API_URL}${l.videoFile}`} />
          </div>
        )}
        {l.Materials && l.Materials.length > 0 && (
          <div className="lesson-materials">
            <span className="lesson-materials__label">Materiały:</span>
            {l.Materials.map((mat) => (
              <a
                key={mat.id}
                className="lesson-materials__link"
                href={`${API_URL}${mat.filePath}`}
                target="_blank"
                rel="noreferrer"
              >
                📎 {mat.originalName}
              </a>
            ))}
          </div>
        )}
        <LessonQA lessonId={l.id} courseId={course.id} />
      </div>
    );
  };

  return (
    <div className="page">
      <div className="container">
        <Link to="/" className="back-link">
          ← Wszystkie kursy
        </Link>

        <header>
          {course.tags?.length > 0 && (
            <div className="card__tags" style={{ marginBottom: 12 }}>
              {course.tags.map((t) => (
                <span key={t} className="tag tag--sm">
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="detail__title">{course.title}</h1>
          <div className="detail__meta">
            {instructor && (
              <span>
                Prowadzący: <strong>{instructor}</strong>
              </span>
            )}
            <span>{lessons.length} lekcji</span>
            {course.level && <span className="card__level">{course.level}</span>}
            {course.language && <span>{course.language}</span>}
            <span className="stars">
              ★ {Number(rating.average || 0)} ({rating.count || 0})
            </span>
            <span className="detail__price">
              {course.price > 0 ? `${course.price} zł` : "Darmowy"}
            </span>
          </div>
          <p>{course.description}</p>

          <div style={{ marginTop: 18 }}>
            {!isAuthenticated && (
              <div className="notice">
                <Link to="/login">Zaloguj się</Link>, aby zapisać się na kurs i
                śledzić postęp.
              </div>
            )}
            {isAuthenticated && !isEnrolled && course.price > 0 && (
              <button className="btn btn--primary" onClick={handleBuy} disabled={busy}>
                Kup dostęp za {course.price} zł
              </button>
            )}
            {isAuthenticated && !isEnrolled && !(course.price > 0) && (
              <button className="btn btn--primary" onClick={handleEnroll} disabled={busy}>
                Zapisz się na kurs (za darmo)
              </button>
            )}
            {isAuthenticated && isEnrolled && (
              <span
                style={{
                  display: "inline-flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span className="tag">✓ Jesteś zapisany</span>
                <button
                  className="btn btn--ghost"
                  onClick={handleUnenroll}
                  disabled={busy}
                >
                  Anuluj zapis
                </button>
              </span>
            )}
            {isAuthenticated && (
              <div style={{ marginTop: 12 }}>
                <button
                  className={`btn btn--ghost fav-toggle${isFav ? " fav-toggle--on" : ""}`}
                  onClick={toggleFav}
                >
                  {isFav ? "♥ W ulubionych" : "♡ Dodaj do ulubionych"}
                </button>
              </div>
            )}
          </div>
        </header>

        {isAuthenticated && isEnrolled && dashboard && (
          <section className="section">
            <h2>Twój postęp</h2>
            <div className="progress__bar">
              <div
                className="progress__fill"
                style={{ width: `${dashboard.progress.percent}%` }}
              />
            </div>
            <p style={{ marginTop: 8, color: "var(--muted)", fontSize: 14 }}>
              {dashboard.progress.done} z {dashboard.progress.total} lekcji ukończone —{" "}
              {dashboard.progress.percent}%
            </p>
            {dashboard.progress.percent === 100 && (
              <button
                className="btn btn--primary"
                style={{ marginTop: 14 }}
                onClick={handleDownloadCertificate}
                disabled={busy}
              >
                🎓 Pobierz certyfikat
              </button>
            )}
          </section>
        )}

        <section className="section">
          <h2>Program kursu</h2>
          {!isAuthenticated && (
            <div className="notice" style={{ marginBottom: 14 }}>
              🔒 Materiały wideo są dostępne po zalogowaniu.
            </div>
          )}
          {lessons.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Brak lekcji.</p>
          )}

          {modules.map((mod) => {
            const ls = lessonsByModule(mod.id);
            if (ls.length === 0) return null;
            return (
              <div key={mod.id} className="module-group">
                <h3 className="module-group__title">{mod.title}</h3>
                {ls.map(renderLesson)}
              </div>
            );
          })}

          {lessonsByModule(null).length > 0 && (
            <div className="module-group">
              {modules.length > 0 && (
                <h3 className="module-group__title">Pozostałe lekcje</h3>
              )}
              {lessonsByModule(null).map(renderLesson)}
            </div>
          )}
        </section>

        {quizzes.length > 0 && (
          <section className="section">
            <h2>Testy wiedzy</h2>
            {quizzes.map((q) => (
              <Link key={q.id} to={`/quiz/${q.id}`} className="quiz-item">
                <div>
                  <div className="quiz-item__title">{q.title}</div>
                  <div className="quiz-item__meta">
                    {q.questions.length} pytań · próg {q.passingScore}%
                  </div>
                </div>
                <span className="quiz-item__go">Rozwiąż →</span>
              </Link>
            ))}
          </section>
        )}

        <section className="section">
          <h2>Recenzje ({rating.count || 0})</h2>
          <div className="reviews__summary">
            <span className="stars">★ {Number(rating.average || 0)}</span>
            <span className="reviews__count">średnia z {rating.count || 0} ocen</span>
          </div>

          {isAuthenticated && isEnrolled && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="review-form__label">
                {myReview ? "Twoja recenzja" : "Dodaj recenzję"}
              </div>
              <div className="rating-row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`star-btn${n <= reviewValue ? " star-btn--on" : ""}`}
                    onClick={() => setReviewValue(n)}
                    title={`${n} / 5`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                placeholder="Napisz kilka słów o kursie (opcjonalnie)…"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="tform__actions">
                <button className="btn btn--primary" disabled={busy || !reviewValue}>
                  {myReview ? "Zaktualizuj recenzję" : "Dodaj recenzję"}
                </button>
                {myReview && (
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={busy}
                    onClick={handleDeleteReview}
                  >
                    Usuń recenzję
                  </button>
                )}
              </div>
            </form>
          )}
          {isAuthenticated && !isEnrolled && (
            <p className="reviews__note">Zapisz się na kurs, aby dodać recenzję.</p>
          )}
          {!isAuthenticated && (
            <p className="reviews__note">
              <Link to="/login">Zaloguj się</Link>, aby dodać recenzję.
            </p>
          )}

          <div className="reviews">
            {(rating.ratings || []).length === 0 && (
              <p className="reviews__note">Brak recenzji. Bądź pierwszy!</p>
            )}
            {(rating.ratings || []).map((r) => (
              <div key={r.id} className="review">
                <div className="review__head">
                  <span className="review__stars">
                    {"★".repeat(r.value)}
                    {"☆".repeat(5 - r.value)}
                  </span>
                  <span className="review__author">{r.User?.name || "Użytkownik"}</span>
                  <span className="review__date">
                    {new Date(r.createdAt).toLocaleDateString("pl-PL")}
                  </span>
                </div>
                {r.text && <div className="review__text">{r.text}</div>}
              </div>
            ))}
          </div>
        </section>

        {isAuthenticated &&
          user &&
          course.User &&
          course.User.id !== user.id && (
            <section className="section">
              <h2>Czat z prowadzącym</h2>
              <ChatThread courseId={id} studentId={user.id} />
            </section>
          )}

        <section className="section">
          <h2>Komentarze ({comments.length})</h2>

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} style={{ marginBottom: 20 }}>
              <textarea
                className="textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Napisz komentarz…"
              />
              <div style={{ marginTop: 10 }}>
                <button className="btn btn--primary" disabled={busy || !newComment.trim()}>
                  Dodaj komentarz
                </button>
              </div>
            </form>
          ) : (
            <div className="notice" style={{ marginBottom: 20 }}>
              <Link to="/login">Zaloguj się</Link>, aby dodać komentarz.
            </div>
          )}

          {comments.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Brak komentarzy. Bądź pierwszy!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment__author">
                {c.User?.name || c.User?.email || "Użytkownik"}
              </div>
              <div className="comment__body">{c.content}</div>
              {c.createdAt && (
                <div className="comment__date">
                  {new Date(c.createdAt).toLocaleDateString("pl-PL")}
                </div>
              )}
            </div>
          ))}
        </section>

        {recs.length > 0 && (
          <section className="section">
            <h2>Podobne kursy</h2>
            <div className="grid">
              {recs.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
