import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Nie udało się utworzyć konta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <form className="auth" onSubmit={submit}>
          <h1>Załóż konto</h1>
          <p className="auth__sub">Dołącz i zacznij się uczyć już dziś.</p>

          {error && <div className="alert">{error}</div>}

          <div className="field">
            <label>Imię i nazwisko</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="Jan Kowalski"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="twoj@email.com"
            />
          </div>

          <div className="field">
            <label>Hasło</label>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              required
              minLength={4}
              placeholder="min. 4 znaki"
            />
          </div>

          <div className="field">
            <label>Chcę korzystać jako</label>
            <select
              className="input"
              name="role"
              value={form.role}
              onChange={onChange}
            >
              <option value="student">Kursant</option>
              <option value="creator">Prowadzący</option>
            </select>
          </div>

          <button className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Tworzenie konta…" : "Załóż konto"}
          </button>

          <p className="auth__switch">
            Masz już konto? <Link to="/login">Zaloguj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
