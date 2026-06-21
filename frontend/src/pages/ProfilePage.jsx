import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../services/api";

// Strona konta użytkownika: edycja danych profilu (imię, e-mail) oraz zmiana hasła.
export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Stany formularza profilu.
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Stany formularza zmiany hasła.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      const updated = await updateProfile({ name, email });
      // Dane w aplikacji (np. nazwa w pasku nawigacji) aktualizują się od razu.
      updateUser({ ...user, name: updated.name, email: updated.email });
      setProfileMsg("Zapisano zmiany ✓");
    } catch (err) {
      setProfileMsg(
        err.response?.data?.error || err.response?.data?.message || "Nie udało się zapisać."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    setPassMsg("");
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPassMsg("Hasło zostało zmienione ✓");
    } catch (err) {
      setPassMsg(
        err.response?.data?.error || err.response?.data?.message || "Nie udało się zmienić hasła."
      );
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="hero hero--tight">
          <span className="hero__eyebrow">Twoje konto</span>
          <h1>Profil</h1>
          <p>Rola w serwisie: <strong>{user?.role}</strong></p>
        </header>

        <div className="tcard">
          <h3>Dane profilu</h3>
          <form className="tform" onSubmit={saveProfile}>
            <label className="field">
              <span>Imię i nazwisko</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button className="btn btn--primary" disabled={savingProfile}>
              Zapisz zmiany
            </button>
            {profileMsg && <p className="ok-note">{profileMsg}</p>}
          </form>
        </div>

        <div className="tcard">
          <h3>Zmiana hasła</h3>
          <form className="tform" onSubmit={savePassword}>
            <label className="field">
              <span>Bieżące hasło</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Nowe hasło (min. 6 znaków)</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <button className="btn btn--primary" disabled={savingPass}>
              Zmień hasło
            </button>
            {passMsg && <p className="ok-note">{passMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
