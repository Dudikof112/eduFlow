import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Owija trasy wymagające zalogowania. Opcjonalny props `roles` ogranicza dostęp do wskazanych
// ról (np. ["creator", "admin"]). Niezalogowany -> /login; brak wymaganej roli -> strona główna.
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
