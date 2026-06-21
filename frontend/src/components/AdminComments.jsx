import { useEffect, useState, useCallback } from "react";
import { getAllComments, deleteComment } from "../services/api";

// Komponent prezentuje wszystkie komentarze z kursów i pozwala administratorowi je usuwać.
export default function AdminComments() {
  const [comments, setComments] = useState([]);

  const load = useCallback(() => {
    getAllComments().then(setComments).catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id) => {
    if (!window.confirm("Usunąć ten komentarz?")) return;
    try {
      await deleteComment(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Nie udało się usunąć komentarza.");
    }
  };

  return (
    <div className="tmanage">
      <h3>Komentarze ({comments.length})</h3>
      {comments.length === 0 && <div className="empty">Brak komentarzy.</div>}
      <ul className="tlist">
        {comments.map((c) => (
          <li key={c.id} className="tlist__item">
            <span className="tlist__main" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
              <span>{c.content}</span>
              <span className="tlist__muted">
                {c.User?.name || "—"} · kurs: {c.Course?.title || "—"}
              </span>
            </span>
            <span className="tlist__actions">
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
