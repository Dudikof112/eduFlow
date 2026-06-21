import { useEffect, useState, useCallback } from "react";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonVideo,
  deleteLessonVideo,
  getModules,
  uploadMaterial,
  deleteMaterial,
  API_URL,
} from "../services/api";

// Komponent zarządza lekcjami jednego kursu: listą, dodawaniem, edycją, usuwaniem,
// przypisaniem do modułu, wgrywaniem pliku wideo oraz materiałami do pobrania.
// Props: courseId — identyfikator kursu, którego lekcje są edytowane.
export default function LessonManager({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [busy, setBusy] = useState(false);
  // editing — null (nic), "new" (nowa lekcja) lub id edytowanej lekcji.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    videoUrl: "",
    orderIndex: 0,
    moduleId: "",
  });
  // identyfikatory lekcji w trakcie wgrywania (do pokazania stanu).
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadingMaterialId, setUploadingMaterialId] = useState(null);

  const load = useCallback(() => {
    getLessons(courseId).then(setLessons).catch(() => {});
    getModules(courseId).then(setModules).catch(() => {});
  }, [courseId]);
  useEffect(() => {
    load();
  }, [load]);

  // pomocniczo: nazwa modułu po jego id
  const moduleName = (id) => modules.find((m) => m.id === id)?.title;

  const startNew = () => {
    setForm({ title: "", videoUrl: "", orderIndex: lessons.length + 1, moduleId: "" });
    setEditing("new");
  };
  const startEdit = (l) => {
    setForm({
      title: l.title || "",
      videoUrl: l.videoUrl || "",
      orderIndex: l.orderIndex || 0,
      moduleId: l.moduleId ? String(l.moduleId) : "",
    });
    setEditing(l.id);
  };
  const cancel = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing === "new") await createLesson({ ...form, courseId });
      else await updateLesson(editing, form);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Błąd zapisu lekcji.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Usunąć tę lekcję?")) return;
    try {
      await deleteLesson(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć lekcji.");
    }
  };

  // ===== Wideo =====
  const onUpload = async (lessonId, file) => {
    setUploadingId(lessonId);
    try {
      await uploadLessonVideo(lessonId, file);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Nie udało się wgrać pliku wideo.");
    } finally {
      setUploadingId(null);
    }
  };
  const onRemoveVideo = async (lessonId) => {
    if (!window.confirm("Usunąć wgrany plik wideo z tej lekcji?")) return;
    try {
      await deleteLessonVideo(lessonId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć pliku.");
    }
  };

  // ===== Materiały =====
  const onUploadMaterial = async (lessonId, file) => {
    setUploadingMaterialId(lessonId);
    try {
      await uploadMaterial(lessonId, file);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Nie udało się wgrać materiału.");
    } finally {
      setUploadingMaterialId(null);
    }
  };
  const onDeleteMaterial = async (id) => {
    if (!window.confirm("Usunąć ten materiał?")) return;
    try {
      await deleteMaterial(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć materiału.");
    }
  };

  return (
    <div className="tmanage">
      <div className="tmanage__head">
        <h3>Lekcje ({lessons.length})</h3>
        {editing === null && (
          <button className="btn btn--ghost" onClick={startNew}>
            + Dodaj lekcję
          </button>
        )}
      </div>

      {editing !== null && (
        <form className="tform" onSubmit={save}>
          <label className="field">
            <span>Tytuł lekcji</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <div className="tform__row">
            <label className="field">
              <span>Link do wideo — np. YouTube (opcjonalnie)</span>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </label>
            <label className="field field--narrow">
              <span>Moduł</span>
              <select
                className="select"
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
              >
                <option value="">— bez modułu —</option>
                {modules.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.title}
                  </option>
                ))}
              </select>
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
          <p className="qhint">
            Plik wideo i materiały do pobrania dodasz przy lekcji na liście poniżej
            (po jej zapisaniu).
          </p>
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
        {lessons.map((l) => (
          <li key={l.id} className="tlist__item tlist__item--col">
            <div className="tlist__row">
              <span className="tlist__main">
                <strong>{l.orderIndex}.</strong> {l.title}{" "}
                {l.videoFile ? (
                  <span className="tag tag--sm">plik wideo</span>
                ) : l.videoUrl ? (
                  <span className="tag tag--sm">link wideo</span>
                ) : (
                  <span className="tlist__muted">bez wideo</span>
                )}
                {l.moduleId && (
                  <span className="tlist__muted">· moduł: {moduleName(l.moduleId) || "?"}</span>
                )}
              </span>
              <span className="tlist__actions">
                <button className="btn btn--ghost btn--xs" onClick={() => startEdit(l)}>
                  Edytuj
                </button>
                <button className="btn btn--danger btn--xs" onClick={() => remove(l.id)}>
                  Usuń
                </button>
              </span>
            </div>

            <div className="tlist__row tlist__row--video">
              <label className="btn btn--ghost btn--xs">
                {uploadingId === l.id
                  ? "Wysyłanie…"
                  : l.videoFile
                  ? "Zmień plik wideo"
                  : "Wgraj plik wideo"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  disabled={uploadingId === l.id}
                  onChange={(e) => e.target.files[0] && onUpload(l.id, e.target.files[0])}
                />
              </label>
              {l.videoFile && (
                <button className="btn btn--danger btn--xs" onClick={() => onRemoveVideo(l.id)}>
                  Usuń plik
                </button>
              )}
            </div>

            <div className="tlist__row tlist__row--video">
              {l.Materials && l.Materials.length > 0 && (
                <ul className="mat-list">
                  {l.Materials.map((mat) => (
                    <li key={mat.id} className="mat-item">
                      <a href={`${API_URL}${mat.filePath}`} target="_blank" rel="noreferrer">
                        📎 {mat.originalName}
                      </a>
                      <button
                        className="btn btn--danger btn--xs"
                        onClick={() => onDeleteMaterial(mat.id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className="btn btn--ghost btn--xs">
                {uploadingMaterialId === l.id ? "Wysyłanie…" : "+ Materiał do pobrania"}
                <input
                  type="file"
                  hidden
                  disabled={uploadingMaterialId === l.id}
                  onChange={(e) =>
                    e.target.files[0] && onUploadMaterial(l.id, e.target.files[0])
                  }
                />
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
