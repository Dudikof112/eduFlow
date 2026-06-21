import { createContext, useContext, useState, useCallback } from "react";
import { loginApi, registerApi } from "../services/api";
import { disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const persist = useCallback((tk, usr) => {
    setToken(tk);
    setUser(usr);
    if (tk) localStorage.setItem("token", tk);
    else localStorage.removeItem("token");
    if (usr) localStorage.setItem("user", JSON.stringify(usr));
    else localStorage.removeItem("user");
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await loginApi({ email, password });
      persist(data.token, data.user);
      return data;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      // backend zwraca utworzonego usera; zaraz po tym logujemy automatycznie
      await registerApi(payload);
      return login(payload.email, payload.password);
    },
    [login]
  );

  const logout = useCallback(() => {
    disconnectSocket();
    persist(null, null);
  }, [persist]);

  // Funkcja podmienia dane zalogowanego użytkownika (np. po edycji profilu),
  // zachowując token. Aktualizuje też kopię w localStorage.
  const updateUser = useCallback((usr) => {
    setUser(usr);
    if (usr) localStorage.setItem("user", JSON.stringify(usr));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musi być użyte wewnątrz <AuthProvider>");
  return ctx;
}
