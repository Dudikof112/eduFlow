import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <NavLink to="/" className="brand">
          <span className="brand__mark">e</span>
          eduFlow
        </NavLink>

        <nav className="nav__links">
          <NavLink to="/" className="nav__link" end>
            Kursy
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my-courses" className="nav__link">
                Moje kursy
              </NavLink>
              <NavLink to="/favorites" className="nav__link">
                Ulubione
              </NavLink>
            </>
          )}
          {isAuthenticated && (
            <NavLink to="/messages" className="nav__link">
              Wiadomości
            </NavLink>
          )}
          {isAuthenticated &&
            (user?.role === "creator" || user?.role === "admin") && (
              <NavLink to="/teacher" className="nav__link">
                Panel nauczyciela
              </NavLink>
            )}
          {isAuthenticated && user?.role === "admin" && (
            <NavLink to="/admin" className="nav__link">
              Panel admina
            </NavLink>
          )}
        </nav>

        <div className="nav__spacer" />

        {isAuthenticated ? (
          <div className="nav__user">
            <NotificationBell />
            <NavLink to="/profile" className="nav__name nav__name--link">
              {user?.name || user?.email}
            </NavLink>
            <button className="btn btn--ghost" onClick={handleLogout}>
              Wyloguj
            </button>
          </div>
        ) : (
          <div className="nav__user">
            <NavLink to="/login" className="nav__link">
              Zaloguj
            </NavLink>
            <NavLink to="/register" className="btn btn--primary">
              Załóż konto
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
