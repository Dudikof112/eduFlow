import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUsers, updateUserRole, deleteUser } from "../services/api";

const ROLES = ["student", "creator", "admin"];

// Komponent zarządza użytkownikami: prezentuje listę, pozwala zmienić rolę i usunąć konto.
export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    getUsers().then(setUsers).catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const onRole = async (id, role) => {
    setBusyId(id);
    try {
      await updateUserRole(id, role);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Nie udało się zmienić roli.");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    if (
      !window.confirm(
        "Usunąć użytkownika wraz z jego danymi (zapisy, oceny, komentarze) i utworzonymi kursami?"
      )
    )
      return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Nie udało się usunąć użytkownika.");
    }
  };

  return (
    <div className="tmanage">
      <h3>Użytkownicy ({users.length})</h3>
      <ul className="tlist">
        {users.map((u) => (
          <li key={u.id} className="tlist__item">
            <span className="tlist__main">
              <strong>{u.name}</strong>
              <span className="tlist__muted">· {u.email}</span>
            </span>
            <span className="tlist__actions">
              <select
                className="select select--sm"
                value={u.role}
                disabled={busyId === u.id || u.id === me?.id}
                onChange={(e) => onRole(u.id, e.target.value)}
                title={u.id === me?.id ? "Nie można zmienić własnej roli tutaj" : "Zmień rolę"}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                className="btn btn--danger btn--xs"
                onClick={() => onDelete(u.id)}
                disabled={u.id === me?.id}
                title={u.id === me?.id ? "Nie można usunąć własnego konta" : "Usuń"}
              >
                Usuń
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
