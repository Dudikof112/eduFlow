import { useEffect, useState, useCallback } from "react";
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
} from "../services/api";

// Komponent zarządza modułami (sekcjami) jednego kursu: lista, dodawanie, edycja, usuwanie.
// Props: courseId — identyfikator kursu.
export default function ModuleManager({ courseId }) {
  const [modules, setModules] = useState([]);
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [form, setForm] = useState({ title: "", orderIndex: 0 });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getModules(courseId).then(setModules).catch(() => {});
  }, [courseId]);
  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setForm({ title: "", orderIndex: modules.length + 1 });
    setEditing("new");
  };
  const startEdit = (m) => {
    setForm({ title: m.title || "", orderIndex: m.orderIndex || 0 });
    setEditing(m.id);
  };
  const cancel = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing === "new") await createModule({ courseId, ...form });
      else await updateModule(editing, form);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Błąd zapisu modułu.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (
      !window.confirm(
        "Usunąć moduł? Lekcje pozostaną, ale stracą przypisanie do tego modułu."
      )
    )
      return;
    try {
      await deleteModule(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć modułu.");
    }
  };

  return (
    <div className="tmanage">
      <div className="tmanage__head">
        <h3>Moduły / sekcje ({modules.length})</h3>
        {editing === null && (
          <button className="btn btn--ghost" onClick={startNew}>
            + Dodaj moduł
          </button>
        )}
      </div>

      {editing !== null && (
        <form className="tform" onSubmit={save}>
          <div className="tform__row">
            <label className="field">
              <span>Nazwa modułu</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>
            <label className="field field--narrow">
              <span>Kolejność</span>
              <input
                type="number"
                value={form.orderIndex}
                onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
              />
            </label>
          </div>
          <div className="tform__actions">
            <button className="btn btn--primary" disabled={busy}>
              Zapisz
            </button>
            <button type="button" className="btn btn--ghost" onClick={cancel}>
              Anuluj
            </button>
          </div>
        </form>
      )}

      <ul className="tlist">
        {modules.map((m) => (
          <li key={m.id} className="tlist__item">
            <span className="tlist__main">
              <strong>{m.orderIndex}.</strong> {m.title}
            </span>
            <span className="tlist__actions">
              <button className="btn btn--ghost btn--xs" onClick={() => startEdit(m)}>
                Edytuj
              </button>
              <button className="btn btn--danger btn--xs" onClick={() => remove(m.id)}>
                Usuń
              </button>
            </span>
          </li>
        ))}
      </ul>
      {modules.length === 0 && (
        <p className="qhint">
          Brak modułów — lekcje pokażą się w sekcji „Lekcje bez modułu". Dodaj
          moduł, by pogrupować materiał kursu.
        </p>
      )}
    </div>
  );
}
