import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAllNotificationsRead } from "../services/api";
import { getSocket } from "../services/socket";

// Komponent prezentuje dzwonek z liczbą nieprzeczytanych powiadomień oraz rozwijaną listą.
// Powiadomienia przychodzą na żywo przez socket.io, a lekkie odpytywanie służy jako zapas.
export default function NotificationBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getNotifications();
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch {
      /* ignorujemy */
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // zapasowe odświeżanie

    const socket = getSocket();
    const onNotif = (n) => {
      setItems((prev) => [n, ...prev].slice(0, 30));
      setUnread((u) => u + 1);
    };
    if (socket) socket.on("notification", onNotif);

    return () => {
      clearInterval(timer);
      if (socket) socket.off("notification", onNotif);
    };
  }, [load]);

  // zamykanie listy po kliknięciu poza komponentem
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    // otwarcie listy oznacza powiadomienia jako przeczytane
    if (next && unread > 0) {
      setUnread(0);
      try {
        await markAllNotificationsRead();
      } catch {
        /* ignorujemy */
      }
    }
  };

  const openItem = (n) => {
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="bell" ref={ref}>
      <button className="bell__btn" onClick={toggle} title="Powiadomienia">
        🔔
        {unread > 0 && <span className="bell__badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="bell__menu">
          <div className="bell__title">Powiadomienia</div>
          {items.length === 0 && <p className="bell__empty">Brak powiadomień.</p>}
          {items.map((n) => (
            <button
              key={n.id || n.createdAt}
              className={`bell__item${n.read ? "" : " bell__item--unread"}`}
              onClick={() => openItem(n)}
            >
              <div className="bell__text">{n.text}</div>
              <div className="bell__date">
                {new Date(n.createdAt).toLocaleString("pl-PL")}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
