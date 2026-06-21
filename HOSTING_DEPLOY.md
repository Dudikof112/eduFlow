# Wdrażanie eduFlow na Render.com (darmowy hosting)

## Przed wdrażaniem — przygotowanie

1. **Załóż konto na Render.com** (https://render.com) — darmowy tier na 750 godzin/miesiąc.
2. **Załóż konta na bazach danych:**
   - **PostgreSQL:** ElephantSQL (https://www.elephantsql.com) — 20 MB za darmo, lub PostgreSQL na Render.
   - **MongoDB:** MongoDB Atlas (https://www.mongodb.com/cloud/atlas) — 512 MB za darmo.
3. **Stripe API klucz:** ze swojego konta (https://dashboard.stripe.com) — `sk_test_…`

## Krok 1 — Wdróż backend na Render

1. Wejdź na https://render.com, zaloguj się.
2. Kliknij **New → Web Service**.
3. Połącz swoje GitHub (lub wgraj plik ZIP projektu).
4. Wybierz repozytorium `e_learning_platform`.
5. **Ustawienia serwisu:**
   - **Name:** `eduflow-backend`
   - **Environment:** `Node`
   - **Root directory:** `backend` (ważne — to tam jest package.json!)
   - **Build command:** `npm install`
   - **Start command:** `npm run dev` lub `npm start` (sprawdź package.json — powinno być `node src/app.js` albo `npm run start`)
6. **Environment variables** (dodaj zmienne z `backend/.env.example`):
   - `DB_HOST=` → wartość z ElephantSQL
   - `DB_PORT=5432`
   - `DB_USER=` → z ElephantSQL
   - `DB_PASSWORD=` → z ElephantSQL
   - `DB_NAME=` → z ElephantSQL
   - `MONGO_URI=` → connection string z MongoDB Atlas (np. `mongodb+srv://...`)
   - `JWT_SECRET=` → wygeneruj losowy string (min 20 znaków)
   - `PORT=5000`
   - `STRIPE_SECRET_KEY=` → `sk_test_…` ze Stripe
   - `STRIPE_WEBHOOK_SECRET=` → ze Stripe
   - `CLIENT_URL=` → URL frontu, który wdrożysz w kroku 2 (np. `https://eduflow-frontend.onrender.com`)
7. Kliknij **Create Web Service** — deployment startuje automatycznie.
8. Czekaj ~5 minut. Po sukcessie zobaczysz URL: `https://eduflow-backend.onrender.com` (lub nazwa, którą wpiszesz).

## Krok 2 — Wdróż frontend na Render

Frontend to statyczne pliki HTML/CSS/JS. Render obsługuje to poprzez **Static Site**:

1. Kliknij **New → Static Site**.
2. Połącz GitHub lub wgrań ZIP.
3. **Ustawienia:**
   - **Name:** `eduflow-frontend`
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/dist`
4. **Environment variables:**
   - `VITE_API_URL=` → URL backendu z kroku 1, np. `https://eduflow-backend.onrender.com`
5. Kliknij **Create Static Site**.
6. Czekaj ~3–5 minut. URL: `https://eduflow-frontend.onrender.com`.

## Krok 3 — Aktualizacja zmiennych backendu (ważne!)

Teraz znasz dokładne URL-e. Wróć do **Web Service** (backend) i **zaktualizuj**:
- `CLIENT_URL=https://eduflow-frontend.onrender.com` (znowu, jeśli jeszcze nie ustawiłeś).

Wdróż ponownie: Settings → Redeploy → Manual Deploy → Deploy.

## Krok 4 — Seed bazy (opcjonalnie)

Aby mieć dane startowe (konta testowe, kursy) na serwerze:

1. W terminalu (lokalnie):
```bash
cd backend
# Ustawiaj zmienne środowiskowe prowizoryczne, żeby podłączyć się do bazy na Render
export DB_HOST=your-elephant-sql-host
export DB_USER=...
export DB_PASSWORD=...
export DB_NAME=...
export MONGO_URI=mongodb+srv://...
npm run seed
```

Albo, jeśli Render ma terminal dostępu:
1. Wejdź na dashboard serwisu.
2. Kliknij **Shell** (jeśli dostępny).
3. Wpisz: `npm run seed`.

## Konto testowe na serwerze

Po seeedzie dostępne są:
- `student@example.com` / `haslo123`
- `instructor@example.com` / `haslo123`
- `admin@example.com` / `haslo123`

## Problemy i rozwiązania

**Backend pokazuje błędy połączenia z bazą:**
- Sprawdź, czy zmienne (`DB_HOST`, `MONGO_URI` itd.) są poprawnie ustawione na Render.
- ElephantSQL i MongoDB muszą pozwalać na połączenia z zewnątrz (sprawdź whitelist IP na ich panelach).

**Frontend pokazuje błąd „Cannot reach backend":**
- Sprawdź, czy `VITE_API_URL` wskazuje poprawny URL backendu.
- Jeśli zmienisz backend URL, **przebuduj frontend**: Settings → Redeploy.

**Brak danych startowych (konta, kursy):**
- Uruchom `npm run seed` (patrz krok 4) lub dodaj ręcznie przez panel admina.

**Stripe test nie działa:**
- Karty testowe: `4242 4242 4242 4242`, przyszły dzień/miesiąc, dowolny CVC.
- Sprawdź, czy `STRIPE_SECRET_KEY` to klucz **testowy** (`sk_test_`), a nie produkcyjny.

## Notki

- **Darmowy tier Render:** 750 godzin/miesiąc na 1 serwis → wystarczy dla pracy domowej / demka.
- **Bazy danych:** ElephantSQL i MongoDB Atlas mają darmowe limity (20 MB i 512 MB) — dla małych projektów to dość.
- **Stripe:** konta testowe i karty są bezpłatne, nie pobierają rzeczywistych pieniędzy.
- **Logs:** na panelu Render możesz podejrzeć logi serwera w przypadku błędów.

## Po wdrażaniu

Aplikacja jest dostępna pod URL-em frontu: `https://eduflow-frontend.onrender.com`.
Możesz ją pokazać prowadzącemu / oceniającemu jako link.

---

Powodzenia! 🚀
