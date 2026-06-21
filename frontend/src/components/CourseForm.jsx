import { useState } from "react";

// Formularz danych kursu, używany przy tworzeniu i edycji.
// Props: initial (wartości startowe), onSubmit(payload), submitLabel, busy.
export default function CourseForm({
  initial = {},
  onSubmit,
  submitLabel = "Zapisz",
  busy,
}) {
  // Stany przechowują bieżące wartości pól formularza.
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [tags, setTags] = useState((initial.tags || []).join(", "));
  const [language, setLanguage] = useState(initial.language || "Polski");
  const [level, setLevel] = useState(initial.level || "Początkujący");
  const [price, setPrice] = useState(initial.price ?? 0);

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      // Tagi wpisane po przecinku zamieniane są na tablicę bez pustych elementów.
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      language: language.trim() || "Polski",
      level: level || "Początkujący",
      price: Number(price) || 0,
    });
  };

  return (
    <form className="tform" onSubmit={submit}>
      <label className="field">
        <span>Tytuł</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="field">
        <span>Opis</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="tform__row">
        <label className="field">
          <span>Tagi / kategorie (po przecinku)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Frontend, JavaScript, Podstawy"
          />
        </label>
        <label className="field">
          <span>Język</span>
          <input value={language} onChange={(e) => setLanguage(e.target.value)} />
        </label>
        <label className="field">
          <span>Poziom</span>
          <select className="select" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Początkujący">Początkujący</option>
            <option value="Średniozaawansowany">Średniozaawansowany</option>
            <option value="Zaawansowany">Zaawansowany</option>
          </select>
        </label>
        <label className="field">
          <span>Cena (zł, 0 = darmowy)</span>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
      </div>
      <button className="btn btn--primary" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  );
}
