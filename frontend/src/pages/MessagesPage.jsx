import { useEffect, useState } from "react";
import { getChatThreads } from "../services/api";
import ChatThread from "../components/ChatThread";

export default function MessagesPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    getChatThreads()
      .then((d) => setThreads(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h1 className="detail__title">Wiadomości</h1>

        {loading && <div className="loading">Ładowanie…</div>}

        {!loading && threads.length === 0 && (
          <div className="empty">
            Brak rozmów. Napisz do prowadzącego ze strony kursu.
          </div>
        )}

        {!loading && threads.length > 0 && (
          <div className="messages-layout">
            <div className="thread-list">
              {threads.map((t) => {
                const isActive =
                  active &&
                  active.courseId === t.courseId &&
                  active.studentId === t.studentId;
                return (
                  <button
                    key={`${t.courseId}:${t.studentId}`}
                    className={`thread-item${isActive ? " thread-item--active" : ""}`}
                    onClick={() => setActive(t)}
                  >
                    <div className="thread-item__name">{t.withName}</div>
                    <div className="thread-item__course">{t.courseTitle}</div>
                    <div className="thread-item__last">{t.lastMessage}</div>
                  </button>
                );
              })}
            </div>

            <div className="thread-view">
              {active ? (
                <ChatThread
                  courseId={active.courseId}
                  studentId={active.studentId}
                  title={`${active.withName} · ${active.courseTitle}`}
                />
              ) : (
                <div className="empty">Wybierz rozmowę z listy.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
