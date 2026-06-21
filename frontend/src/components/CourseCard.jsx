import { useNavigate } from "react-router-dom";

export default function CourseCard({ course, favorite, onToggleFavorite }) {
  const navigate = useNavigate();
  const lessonCount = course.Lessons?.length;
  const instructor = course.User?.name || course.User?.email;
  const rating = course.averageRating || 0;

  return (
    <article className="card" onClick={() => navigate(`/courses/${course.id}`)}>
      {onToggleFavorite && (
        <button
          className={`fav-btn${favorite ? " fav-btn--on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(course.id, !favorite);
          }}
          title={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          aria-label="Ulubione"
        >
          {favorite ? "♥" : "♡"}
        </button>
      )}
      <div className="card__top">
        <span className="card__initial">
          {course.title?.[0]?.toUpperCase() || "?"}
        </span>
        {lessonCount > 0 && (
          <span className="card__badge">{lessonCount} lekcji</span>
        )}
      </div>
      <div className="card__body">
        {course.tags?.length > 0 && (
          <div className="card__tags">
            {course.tags.map((t) => (
              <span key={t} className="tag tag--sm">
                {t}
              </span>
            ))}
          </div>
        )}
        <h3 className="card__title">{course.title}</h3>
        <p className="card__desc">{course.description}</p>

        <div className="card__meta">
          {rating > 0 ? (
            <span className="card__rating">
              ★ {rating.toFixed(1)}
              <span className="card__rating-count"> ({course.ratingCount})</span>
            </span>
          ) : (
            <span className="card__rating card__rating--none">Brak ocen</span>
          )}
          {course.level && <span className="card__level">{course.level}</span>}
          {course.language && <span>· {course.language}</span>}
          <span
            className={`card__price${course.price > 0 ? "" : " card__price--free"}`}
          >
            {course.price > 0 ? `${course.price} zł` : "Darmowy"}
          </span>
        </div>
        {instructor && <div className="card__author">👤 {instructor}</div>}
      </div>
    </article>
  );
}
