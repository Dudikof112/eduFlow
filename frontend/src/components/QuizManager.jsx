import { useEffect, useState, useCallback } from "react";
import {
  getCourseQuizzes,
  getQuizForEdit,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../services/api";

// Funkcja zwraca pusty szablon pytania (treść, dwie odpowiedzi, pierwsza poprawna, jednokrotny wybór).
const emptyQuestion = () => ({
  text: "",
  options: ["", ""],
  multiple: false,
  correctIndexes: [0],
  explanation: "",
});

// Komponent zarządza testami kursu: listą oraz edytorem z obsługą wielokrotnego wyboru,
// limitu czasu, losowania pytań, liczby pytań do pokazania i wyjaśnień. Props: courseId.
export default function QuizManager({ courseId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [form, setForm] = useState(null);

  const load = useCallback(() => {
    getCourseQuizzes(courseId).then(setQuizzes).catch(() => {});
  }, [courseId]);
  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => {
    setForm({
      title: "",
      passingScore: 60,
      timeLimit: 0,
      shuffle: false,
      questionsToShow: 0,
      questions: [emptyQuestion()],
    });
    setEditing("new");
  };
  const startEdit = async (id) => {
    try {
      const q = await getQuizForEdit(id);
      setForm({
        title: q.title,
        passingScore: q.passingScore,
        timeLimit: q.timeLimit || 0,
        shuffle: !!q.shuffle,
        questionsToShow: q.questionsToShow || 0,
        questions: q.questions.map((qq) => ({
          text: qq.text,
          options: [...qq.options],
          multiple: !!qq.multiple,
          correctIndexes: Array.isArray(qq.correctIndexes) ? [...qq.correctIndexes] : [0],
          explanation: qq.explanation || "",
        })),
      });
      setEditing(id);
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się wczytać testu.");
    }
  };
  const cancel = () => {
    setEditing(null);
    setForm(null);
  };

  // ===== Operacje na pytaniach i odpowiedziach =====
  const setQ = (i, patch) =>
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)),
    }));
  const addQuestion = () =>
    setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  const removeQuestion = (i) =>
    setForm((f) => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }));
  const setOption = (qi, oi, val) =>
    setQ(qi, { options: form.questions[qi].options.map((o, idx) => (idx === oi ? val : o)) });
  const addOption = (qi) => setQ(qi, { options: [...form.questions[qi].options, ""] });

  const removeOption = (qi, oi) => {
    setForm((f) => {
      const q = f.questions[qi];
      const options = q.options.filter((_, idx) => idx !== oi);
      // korekta indeksów poprawnych odpowiedzi po usunięciu opcji
      let correctIndexes = q.correctIndexes
        .filter((c) => c !== oi)
        .map((c) => (c > oi ? c - 1 : c));
      if (!q.multiple && correctIndexes.length === 0) correctIndexes = [0];
      return {
        ...f,
        questions: f.questions.map((qq, idx) =>
          idx === qi ? { ...qq, options, correctIndexes } : qq
        ),
      };
    });
  };

  // jednokrotny wybór — wskazanie jednej poprawnej odpowiedzi
  const setCorrectSingle = (qi, oi) => setQ(qi, { correctIndexes: [oi] });
  // wielokrotny wybór — dodanie/usunięcie poprawnej odpowiedzi
  const toggleCorrectMulti = (qi, oi) =>
    setForm((f) => {
      const q = f.questions[qi];
      const has = q.correctIndexes.includes(oi);
      const correctIndexes = has
        ? q.correctIndexes.filter((c) => c !== oi)
        : [...q.correctIndexes, oi].sort((a, b) => a - b);
      return {
        ...f,
        questions: f.questions.map((qq, idx) => (idx === qi ? { ...qq, correctIndexes } : qq)),
      };
    });
  // przełączenie trybu pytania (jednokrotny/wielokrotny)
  const toggleMultiple = (qi) =>
    setForm((f) => {
      const q = f.questions[qi];
      const multiple = !q.multiple;
      let correctIndexes = q.correctIndexes;
      if (!multiple) correctIndexes = correctIndexes.length ? [correctIndexes[0]] : [0];
      return {
        ...f,
        questions: f.questions.map((qq, idx) =>
          idx === qi ? { ...qq, multiple, correctIndexes } : qq
        ),
      };
    });

  // Funkcja sprawdza poprawność formularza przed wysłaniem.
  const valid = () => {
    if (!form.title.trim()) return false;
    if (!form.questions.length) return false;
    for (const q of form.questions) {
      if (!q.text.trim()) return false;
      if (q.options.length < 2) return false;
      if (q.options.some((o) => !o.trim())) return false;
      if (!q.correctIndexes || q.correctIndexes.length < 1) return false;
      if (q.correctIndexes.some((c) => c < 0 || c >= q.options.length)) return false;
    }
    return true;
  };

  const save = async () => {
    if (!valid()) {
      alert(
        "Uzupełnij tytuł, treść pytań, wszystkie odpowiedzi (bez pustych) i zaznacz min. jedną poprawną w każdym pytaniu."
      );
      return;
    }
    setBusy(true);
    const payload = {
      courseId,
      title: form.title.trim(),
      passingScore: Number(form.passingScore) || 60,
      timeLimit: Number(form.timeLimit) || 0,
      shuffle: !!form.shuffle,
      questionsToShow: Number(form.questionsToShow) || 0,
      questions: form.questions.map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()),
        multiple: !!q.multiple,
        correctIndexes: [...q.correctIndexes].sort((a, b) => a - b),
        explanation: (q.explanation || "").trim(),
      })),
    };
    try {
      if (editing === "new") await createQuiz(payload);
      else await updateQuiz(editing, payload);
      cancel();
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Błąd zapisu testu.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Usunąć ten test?")) return;
    try {
      await deleteQuiz(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Nie udało się usunąć testu.");
    }
  };

  return (
    <div className="tmanage">
      <div className="tmanage__head">
        <h3>Testy ({quizzes.length})</h3>
        {editing === null && (
          <button className="btn btn--ghost" onClick={startNew}>
            + Nowy test
          </button>
        )}
      </div>

      {editing !== null && form && (
        <div className="qeditor">
          <label className="field">
            <span>Tytuł testu</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>

          <div className="tform__row">
            <label className="field field--narrow">
              <span>Próg zaliczenia (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
              />
            </label>
            <label className="field field--narrow">
              <span>Limit czasu (min, 0 = brak)</span>
              <input
                type="number"
                min="0"
                value={form.timeLimit}
                onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
              />
            </label>
            <label className="field field--narrow">
              <span>Pytań do pokazania (0 = wszystkie)</span>
              <input
                type="number"
                min="0"
                value={form.questionsToShow}
                onChange={(e) => setForm({ ...form, questionsToShow: e.target.value })}
              />
            </label>
          </div>

          <label className="check-line">
            <input
              type="checkbox"
              checked={form.shuffle}
              onChange={(e) => setForm({ ...form, shuffle: e.target.checked })}
            />
            <span>Losuj kolejność pytań przy każdym podejściu</span>
          </label>

          {form.questions.map((q, qi) => (
            <div key={qi} className="qcard">
              <div className="qcard__head">
                <strong>Pytanie {qi + 1}</strong>
                <button
                  type="button"
                  className="btn btn--danger btn--xs"
                  onClick={() => removeQuestion(qi)}
                >
                  Usuń pytanie
                </button>
              </div>
              <label className="field">
                <span>Treść pytania</span>
                <input value={q.text} onChange={(e) => setQ(qi, { text: e.target.value })} />
              </label>

              <label className="check-line">
                <input
                  type="checkbox"
                  checked={q.multiple}
                  onChange={() => toggleMultiple(qi)}
                />
                <span>Wielokrotny wybór (więcej niż jedna poprawna odpowiedź)</span>
              </label>

              <div className="qoptions">
                {q.options.map((o, oi) => (
                  <div key={oi} className="qoption">
                    <input
                      type={q.multiple ? "checkbox" : "radio"}
                      name={`correct-${qi}`}
                      checked={q.correctIndexes.includes(oi)}
                      onChange={() =>
                        q.multiple ? toggleCorrectMulti(qi, oi) : setCorrectSingle(qi, oi)
                      }
                      title="Poprawna odpowiedź"
                    />
                    <input
                      className="qoption__text"
                      value={o}
                      onChange={(e) => setOption(qi, oi, e.target.value)}
                      placeholder={`Odpowiedź ${oi + 1}`}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--xs"
                        onClick={() => removeOption(qi, oi)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn--ghost btn--xs"
                  onClick={() => addOption(qi)}
                >
                  + Odpowiedź
                </button>
              </div>

              <label className="field">
                <span>Wyjaśnienie (pokazywane po sprawdzeniu, opcjonalne)</span>
                <textarea
                  rows={2}
                  value={q.explanation}
                  onChange={(e) => setQ(qi, { explanation: e.target.value })}
                />
              </label>
              <p className="qhint">
                {q.multiple
                  ? "Zaznacz wszystkie poprawne odpowiedzi (kwadraty)."
                  : "Zaznacz jedną poprawną odpowiedź (kółko)."}
              </p>
            </div>
          ))}

          <button type="button" className="btn btn--ghost" onClick={addQuestion}>
            + Dodaj pytanie
          </button>
          <div className="tform__actions">
            <button className="btn btn--primary" onClick={save} disabled={busy}>
              Zapisz test
            </button>
            <button className="btn btn--ghost" onClick={cancel}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      <ul className="tlist">
        {quizzes.map((q) => (
          <li key={q.id} className="tlist__item">
            <span className="tlist__main">
              {q.title}{" "}
              <span className="tlist__muted">
                · {q.questions?.length || 0} pytań · próg {q.passingScore}%
                {q.timeLimit > 0 ? ` · limit ${q.timeLimit} min` : ""}
              </span>
            </span>
            <span className="tlist__actions">
              <button className="btn btn--ghost btn--xs" onClick={() => startEdit(q.id)}>
                Edytuj
              </button>
              <button className="btn btn--danger btn--xs" onClick={() => remove(q.id)}>
                Usuń
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
