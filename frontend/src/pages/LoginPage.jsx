import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Nie udało się zalogować.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <form className="auth" onSubmit={submit}>
          <h1>Zaloguj się</h1>
          <p className="auth__sub">Wróć do nauki tam, gdzie skończyłeś.</p>

          {error && <div className="alert">{error}</div>}

          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="twoj@email.com"
            />
          </div>

          <div className="field">
            <label>Hasło</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Logowanie…" : "Zaloguj się"}
          </button>

          <p className="auth__switch">
            Nie masz konta? <Link to="/register">Załóż konto</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
