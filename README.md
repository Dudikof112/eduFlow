# eduFlow — platforma e-learningowa

Aplikacja do nauki online: kursy, lekcje wideo, postęp, oceny i komentarze.

- **Backend:** Node.js + Express 5 + Sequelize (PostgreSQL), autoryzacja JWT
- **Frontend:** React 19 + React Router 7 + Vite + axios

---

## Wymagania

- Node.js 18+ (zalecane 20+)
- PostgreSQL 14+
- MongoDB 6+
- (opcjonalnie) Docker — najwygodniej uruchamia obie bazy

---

## 1. Bazy danych (PostgreSQL + MongoDB)

Aplikacja korzysta z **dwóch** baz: PostgreSQL (użytkownicy, kursy, lekcje, oceny, komentarze)
oraz MongoDB (testy online i podejścia do nich). Dane połączenia są w `backend/.env`:

```
DB_NAME=elearning
DB_USER=postgres
DB_PASSWORD=P@ssw0rd
DB_HOST=localhost
DB_PORT=5432
MONGO_URI=mongodb://localhost:27017/elearning
```

### PostgreSQL

### Opcja A — Docker (najszybciej)

Uruchamia bazę zgodną z `.env`:

```bash
docker run --name elearning-db \
  -e POSTGRES_PASSWORD=P@ssw0rd \
  -e POSTGRES_DB=elearning \
  -p 5432:5432 -d postgres:16
```

### Opcja B — lokalny PostgreSQL

Zaloguj się do `psql` i utwórz bazę:

```sql
CREATE DATABASE elearning;
```

(Jeśli Twój użytkownik/hasło są inne niż w `.env`, zmień wartości w `backend/.env`.)

### MongoDB

Najszybciej w Dockerze:

```bash
docker run --name elearning-mongo -p 27017:27017 -d mongo:7
```

Alternatywnie zainstaluj MongoDB lokalnie — domyślny adres `mongodb://localhost:27017` jest już
ustawiony w `.env`. **Obie bazy muszą działać** przed uruchomieniem `npm run seed` i backendu.

---

## 2. Backend (port 5000)

```bash
cd backend
npm install
npm run seed     # tworzy tabele i dane startowe (kursy, lekcje, konta testowe)
npm run dev      # uruchamia serwer na http://localhost:5000
```

> `npm run seed` **czyści obie bazy** i wypełnia je od nowa (konta, kursy, lekcje, oceny,
> komentarze oraz przykładowe testy w MongoDB) — uruchom go raz na początku (lub gdy chcesz
> zresetować dane). Do codziennego startu wystarczy `npm run dev`.
>
> Czat na żywo i powiadomienia działają przez **socket.io** na tym samym porcie 5000 (REST + WebSocket) — nie trzeba nic dodatkowo uruchamiać. Po pobraniu tej wersji uruchom `npm install` (doszły zależności `socket.io`, `socket.io-client`, a także `helmet`, `express-rate-limit`, `express-validator`).

---

## 3. Frontend (port 5173)

W **drugim** terminalu:

```bash
cd frontend
npm install
npm run dev      # uruchamia aplikację na http://localhost:5173
```

Otwórz przeglądarkę pod adresem, który wypisze Vite (domyślnie http://localhost:5173).

---

## Uruchomienie przez Docker (opcjonalnie)

Zamiast ręcznej instalacji można uruchomić **cały stack** (PostgreSQL + MongoDB + backend + frontend) jednym poleceniem:

```bash
docker compose up --build
```

Następnie **raz** wypełnij dane demo (konta, kursy, testy):

```bash
docker compose exec backend npm run seed
```

- Frontend: http://localhost:5173
- Backend (REST + socket.io): http://localhost:5000

Bazy danych mają trwałe wolumeny (`pgdata`, `mongodata`), więc dane przetrwają restart. Zatrzymanie: `docker compose down` (z usunięciem danych: `docker compose down -v`).

---

## 4. Płatności (Stripe — tryb testowy)

Kursy mogą być **darmowe** (zapis od razu) lub **płatne** (zakup przez Stripe Checkout).
Aby płatności działały:

1. Załóż darmowe konto na https://dashboard.stripe.com i przełącz je w **tryb testowy**.
2. Skopiuj **klucz tajny** (zaczyna się od `sk_test_`) do `backend/.env`:

```
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173
```

3. Zrestartuj backend. Na płatnym kursie pojawi się przycisk **„Kup dostęp za X zł"**,
   który przenosi na stronę Stripe. Użyj **karty testowej**: numer `4242 4242 4242 4242`,
   dowolna przyszła data ważności, dowolny CVC i kod pocztowy.
4. Po opłaceniu Stripe wróci do aplikacji, która potwierdzi płatność i przyzna dostęp do kursu.

**Webhook (opcjonalnie).** Potwierdzanie zakupu działa lokalnie **bez webhooka** — aplikacja
sama weryfikuje płatność po powrocie. Jeśli chcesz dodatkowo obsłużyć webhook Stripe, uruchom
Stripe CLI:

```
stripe listen --forward-to localhost:5000/payments/webhook
```

CLI wypisze sekret `whsec_...` — wstaw go do `STRIPE_WEBHOOK_SECRET` w `.env`.

> Po dodaniu/zmianie cen kursów uruchom ponownie `npm run seed` (przy włączonych bazach).

---

## Logowanie testowe

Skrypt `seed` zakłada dwa konta (hasło dla obu: **`haslo123`**):

| Rola       | Email                     | Hasło      |
|------------|---------------------------|------------|
| Kursant    | `student@example.com`     | `haslo123` |
| Prowadzący | `instructor@example.com`  | `haslo123` |
| Admin      | `admin@example.com`       | `haslo123` |

Możesz też założyć nowe konto przez formularz **Załóż konto** (wybierając rolę „prowadzący").

> Zapis na kurs, oznaczanie lekcji jako ukończonych i wystawianie ocen działa dla
> roli **Kursant** — zaloguj się jako `student@example.com`, żeby przetestować pełny przepływ.
>
> **Panel nauczyciela** (zakładka w menu po zalogowaniu) jest dostępny dla roli
> **Prowadzący** — zaloguj się jako `instructor@example.com`, aby tworzyć i edytować
> kursy, lekcje oraz testy bez ręcznego seedowania.
>
> **Panel administratora** jest dostępny dla roli **Admin** (`admin@example.com`) —
> zarządzanie użytkownikami, wszystkimi kursami i moderacja komentarzy. Konto admina
> powstaje przy `npm run seed`.

---

## Co potrafi aplikacja

- Rejestracja i logowanie (JWT, token trzymany w `localStorage`)
- Nawigacja z aktywnymi zakładkami i obszarem konta użytkownika
- Lista kursów z **wyszukiwaniem po nazwie, filtrami (tagi, język, poziom trudności, prowadzący, ocena), sortowaniem i paginacją** + strona kursu
- **Ulubione / lista życzeń** — zapisywanie kursów serduszkiem (na karcie i na stronie kursu) oraz osobna strona „Ulubione"
- **Rekomendacje** — sekcja „Podobne kursy" na stronie kursu (na podstawie wspólnych tagów)
- Zapis na kurs (z możliwością **anulowania**), pasek postępu, oznaczanie lekcji jako ukończonych
- **Wideo lekcji: link (np. YouTube) lub wgrany plik** — widoczne tylko dla zalogowanych (gość widzi program kursu, ale nie wideo)
- **Testy online (MongoDB)** — jednokrotny i **wielokrotny wybór**, **limit czasu** z auto-wysyłką, **losowanie pytań** (i losowy podzbiór z puli), **wyjaśnienia** po sprawdzeniu, próg zaliczenia, historia podejść oraz **świadectwo zaliczenia** do wydruku
- **Certyfikat PDF** po ukończeniu kursu (100% lekcji) — generowany na żądanie
- **Recenzje** — ocena w gwiazdkach z opcjonalnym tekstem, z możliwością edycji i usunięcia własnej; publiczna lista recenzji z autorami
- **Q&A pod lekcjami** — pytania i odpowiedzi przy każdej lekcji (odpowiadać może każdy zalogowany, autor/admin może usuwać)
- Komentarze do kursu (dyskusja) z moderacją administratora
- **Czat kursant–prowadzący na żywo** (socket.io; wiadomości utrwalane w MongoDB)
- **Powiadomienia w czasie rzeczywistym** — dzwonek w nawigacji z licznikiem nieprzeczytanych (nowa odpowiedź w Q&A, nowa wiadomość czatu)
- **Płatności Stripe** — kursy darmowe i płatne (zakup przez Stripe Checkout, karta testowa)
- **Panel nauczyciela** — tworzenie i edycja kursów, lekcji oraz testów z poziomu aplikacji (rola twórcy/admina); lekcja może mieć link wideo **lub wgrany plik** (zapisywany w `backend/uploads/videos`)
- **Statystyki dla prowadzącego** — liczba zapisów, **% ukończeń** i średnia ocena dla każdego kursu (w panelu nauczyciela)
- **Panel administratora** — zarządzanie użytkownikami (zmiana roli, usuwanie), wszystkimi kursami i moderacja komentarzy
- **Zabezpieczenia** — nagłówki bezpieczeństwa (helmet), ograniczanie liczby zapytań (rate limiting, ostrzejsze dla logowania/rejestracji) oraz walidacja danych wejściowych (express-validator)
- **Konto użytkownika** — profil (edycja imienia i e-maila, zmiana hasła) oraz kokpit **„Moje kursy"** z postępem i certyfikatami
- **Materiały do pobrania** pod lekcjami (PDF, dokumenty, archiwa, obrazy) — widoczne dla zalogowanych
- **Podział kursu na moduły/sekcje** — grupowanie lekcji, zarządzane z panelu nauczyciela

---

## Testy (backend)

Backend ma testy uruchamiane przez **Jest** (z **supertest**). Sprawdzają m.in. autoryzację tras
(odrzucanie żądań bez tokenu), walidację danych wejściowych oraz logikę middleware ról.
Nie wymagają działającej bazy danych.

```bash
cd backend
npm install      # jeśli jeszcze nie zainstalowano (doszły jest i supertest)
npm test
```

---

## Uwaga przy przenoszeniu projektu

`node_modules` są zależne od systemu operacyjnego. Jeśli kopiujesz projekt między
Windows / macOS / Linux, usuń `node_modules` i zainstaluj zależności od nowa:

```bash
# w katalogu backend i frontend osobno
rm -rf node_modules
npm install
```
