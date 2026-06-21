import { useState } from "react";
import AdminUsers from "../components/AdminUsers";
import AdminCourses from "../components/AdminCourses";
import AdminComments from "../components/AdminComments";

// Strona panelu administratora. Przełącza między zakładkami: użytkownicy, kursy, komentarze.
export default function AdminPage() {
  // tab — aktywna zakładka panelu ("users" | "courses" | "comments").
  const [tab, setTab] = useState("users");

  return (
    <div className="page">
      <div className="container">
        <header className="hero hero--tight">
          <span className="hero__eyebrow">Panel administratora</span>
          <h1>Administracja</h1>
          <p>Zarządzaj użytkownikami, wszystkimi kursami i moderuj komentarze.</p>
        </header>

        <div className="tabs">
          <button
            className={`tab${tab === "users" ? " tab--active" : ""}`}
            onClick={() => setTab("users")}
          >
            Użytkownicy
          </button>
          <button
            className={`tab${tab === "courses" ? " tab--active" : ""}`}
            onClick={() => setTab("courses")}
          >
            Kursy
          </button>
          <button
            className={`tab${tab === "comments" ? " tab--active" : ""}`}
            onClick={() => setTab("comments")}
          >
            Komentarze
          </button>
        </div>

        <div className="tcard">
          {tab === "users" && <AdminUsers />}
          {tab === "courses" && <AdminCourses />}
          {tab === "comments" && <AdminComments />}
        </div>
      </div>
    </div>
  );
}
