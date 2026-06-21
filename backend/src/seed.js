require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const sequelize = require("./config/db");
const connectMongo = require("./config/mongo");
const { User, Course, Lesson, Rating, Comment, Enrollment, Progress, Module, Question, Answer } = require("./models");
const Quiz = require("./models/mongo/Quiz");
const QuizAttempt = require("./models/mongo/QuizAttempt");

// CZYŚCI obie bazy (Postgres: sync force; Mongo: deleteMany) i wypełnia danymi testowymi.
async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Postgres connected");
    await sequelize.sync({ force: true });
    console.log("Tabele odtworzone (force:true)");

    const passHash = await bcrypt.hash("haslo123", 10);
    const instructor = await User.create({ name: "Jan Prowadzący", email: "instructor@example.com", password: passHash, role: "creator" });
    const student = await User.create({ name: "Anna Kursantka", email: "student@example.com", password: passHash, role: "student" });
    const s1 = await User.create({ name: "Piotr Nowak", email: "piotr@example.com", password: passHash, role: "student" });
    const s2 = await User.create({ name: "Kasia Wójcik", email: "kasia@example.com", password: passHash, role: "student" });
    const s3 = await User.create({ name: "Marek Lis", email: "marek@example.com", password: passHash, role: "student" });
    // Konto administratora (panel admina) oraz konto prowadzącego (panel nauczyciela) powyżej.
    await User.create({ name: "Administrator", email: "admin@example.com", password: passHash, role: "admin" });
    const raters = [student, s1, s2, s3];

    const V = {
      js1: "https://www.youtube.com/watch?v=W6NZfCO5SIk", js2: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
      js3: "https://www.youtube.com/watch?v=N8ap4k_1QEQ", asy: "https://www.youtube.com/watch?v=V_Kr9OSfDeU",
      ts: "https://www.youtube.com/watch?v=BwuLxPH8IDs", react1: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
      react2: "https://www.youtube.com/watch?v=O6P86uwfdR0", html: "https://www.youtube.com/watch?v=qz0aGYrrlhU",
      css: "https://www.youtube.com/watch?v=1PnVor36_40", node1: "https://www.youtube.com/watch?v=SccSCuHhOw0",
      node2: "https://www.youtube.com/watch?v=lY6icfhap2o", node3: "https://www.youtube.com/watch?v=mbsmsi7l3r4",
      sql: "https://www.youtube.com/watch?v=qw--VYLpxG4", mongo: "https://www.youtube.com/watch?v=ofme2o29ngU",
      py1: "https://www.youtube.com/watch?v=rfscVS0vtbw", py2: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
      java: "https://www.youtube.com/watch?v=eIrMbAQSU34", spring: "https://www.youtube.com/watch?v=9SGDpanrc8U",
      git: "https://www.youtube.com/watch?v=RGOj5yH7evk", docker: "https://www.youtube.com/watch?v=pTFZFxd4hOI",
      vue: "https://www.youtube.com/watch?v=qZXt1Aom3Cs", fastapi: "https://www.youtube.com/watch?v=7t2alSnE2-I",
    };

    const courses = [
      { title: "JavaScript od podstaw", language: "Polski", tags: ["JavaScript", "Podstawy", "Web"],
        description: "Kompletny start z JavaScriptem: zmienne, funkcje, praca z DOM i podstawy asynchroniczności.",
        lessons: [["Wprowadzenie i środowisko", V.js1], ["Zmienne i typy danych", V.js2], ["Operatory i warunki", null], ["Pętle", null], ["Funkcje i zakresy", V.js3]] },
      { title: "JavaScript zaawansowany (ES2023)", language: "Polski", tags: ["JavaScript", "Zaawansowany"],
        description: "Domknięcia, prototypy, asynchroniczność i moduły. Nowoczesny JavaScript w praktyce.",
        lessons: [["Domknięcia i this", null], ["Prototypy i klasy", null], ["Promise, async/await", V.asy], ["Moduły ES", null], ["Obsługa błędów", null]] },
      { title: "TypeScript w praktyce", language: "Polski", tags: ["JavaScript", "Frontend", "Zaawansowany"],
        description: "Statyczne typowanie w JavaScript: typy, interfejsy, generyki i konfiguracja projektu.",
        lessons: [["Po co TypeScript", V.ts], ["Typy podstawowe", null], ["Interfejsy i typy", null], ["Generics", null]] },
      { title: "React dla początkujących", language: "Polski", tags: ["Frontend", "JavaScript", "Podstawy", "Web"],
        description: "Komponenty, propsy, hooki (useState, useEffect), listy i komunikacja z API.",
        lessons: [["React i JSX", V.react1], ["Komponenty i propsy", null], ["Stan z useState", V.react2], ["Efekty z useEffect", null], ["Listy i klucze", null]] },
      { title: "React zaawansowany", language: "English", tags: ["Frontend", "Zaawansowany"],
        description: "Context, własne hooki, optymalizacja wydajności i routing w większych aplikacjach.",
        lessons: [["Context API", null], ["Własne hooki", null], ["Wydajność i memo", null], ["Routing", null]] },
      { title: "Vue.js — podstawy", language: "Polski", tags: ["Frontend", "JavaScript", "Web", "Podstawy"],
        description: "Reaktywność, komponenty, dyrektywy i podstawy budowy aplikacji we Vue 3.",
        lessons: [["Czym jest Vue", V.vue], ["Reaktywność i dane", null], ["Komponenty", null], ["Dyrektywy", null]] },
      { title: "HTML i CSS od zera", language: "Polski", tags: ["Frontend", "Podstawy", "Web"],
        description: "Budowa strony krok po kroku: semantyczny HTML, stylowanie CSS, Flexbox i Grid.",
        lessons: [["Struktura HTML", V.html], ["Tekst i obrazy", null], ["Podstawy CSS", V.css], ["Flexbox", null], ["CSS Grid", null]] },
      { title: "CSS: animacje i responsywność", language: "Polski", tags: ["Frontend", "Web"],
        description: "Responsywne układy i płynne animacje: media queries, transitions, keyframes.",
        lessons: [["Media queries", null], ["Transitions", null], ["Animacje keyframes", null], ["Mobile-first", null]] },
      { title: "Node.js i Express API", language: "Polski", tags: ["Backend", "JavaScript", "API"],
        description: "Budowa REST API od zera: routing, middleware, baza danych i autoryzacja JWT.",
        lessons: [["Pierwszy serwer Express", V.node1], ["Routing i middleware", V.node2], ["Połączenie z bazą", null], ["JWT i logowanie", V.node3], ["Obsługa błędów", null]] },
      { title: "Projektowanie REST API", language: "English", tags: ["Backend", "API", "Zaawansowany"],
        description: "Dobre praktyki: zasoby, statusy HTTP, wersjonowanie, paginacja i filtrowanie.",
        lessons: [["Zasoby i metody HTTP", null], ["Kody odpowiedzi", null], ["Wersjonowanie", null], ["Paginacja i filtrowanie", null]] },
      { title: "Express + MongoDB: pełny backend", language: "Polski", tags: ["Backend", "JavaScript", "Bazy danych"],
        description: "Kompletny backend: Express, Mongoose, modele, walidacja i autoryzacja.",
        lessons: [["Konfiguracja projektu", null], ["Modele Mongoose", null], ["CRUD i walidacja", null], ["Autoryzacja", null]] },
      { title: "Bezpieczeństwo aplikacji webowych", language: "Polski", tags: ["Backend", "Zaawansowany"],
        description: "Najczęstsze zagrożenia (XSS, CSRF, SQL injection) i jak się przed nimi bronić.",
        lessons: [["Zagrożenia OWASP", null], ["XSS i CSRF", null], ["Bezpieczne hasła i JWT", null], ["HTTPS i nagłówki", null]] },
      { title: "Bazy danych: SQL i PostgreSQL", language: "Polski", tags: ["Bazy danych", "Podstawy"],
        description: "Zapytania SQL, relacje, złączenia, indeksy i transakcje na przykładzie PostgreSQL.",
        lessons: [["SELECT, WHERE, ORDER BY", V.sql], ["JOIN i relacje", null], ["Indeksy", null], ["Transakcje", null]] },
      { title: "SQL zaawansowany", language: "Polski", tags: ["Bazy danych", "Zaawansowany"],
        description: "Podzapytania, funkcje okienkowe, CTE i optymalizacja zapytań.",
        lessons: [["Podzapytania", null], ["Funkcje okienkowe", null], ["CTE (WITH)", null], ["Optymalizacja", null]] },
      { title: "MongoDB w praktyce", language: "Polski", tags: ["Bazy danych", "Backend"],
        description: "Bazy dokumentowe: kolekcje, zapytania, agregacje i modelowanie danych.",
        lessons: [["Dokumenty i kolekcje", V.mongo], ["Zapytania", null], ["Agregacje", null], ["Modelowanie", null]] },
      { title: "Python dla początkujących", language: "Polski", tags: ["Python", "Podstawy"],
        description: "Składnia Pythona, struktury danych, funkcje, moduły i praca z plikami.",
        lessons: [["Pierwszy program", V.py1], ["Typy i zmienne", null], ["Listy i słowniki", V.py2], ["Funkcje", null], ["Praca z plikami", null]] },
      { title: "Analiza danych w Pythonie", language: "English", tags: ["Python", "Zaawansowany"],
        description: "NumPy, pandas i wizualizacja: od surowych danych do czytelnych wykresów.",
        lessons: [["NumPy", null], ["pandas — DataFrame", null], ["Czyszczenie danych", null], ["Wykresy", null]] },
      { title: "REST API w Pythonie (FastAPI)", language: "Polski", tags: ["Python", "Backend", "API"],
        description: "Szybkie API w FastAPI: ścieżki, modele Pydantic, walidacja i dokumentacja.",
        lessons: [["Pierwsze API w FastAPI", V.fastapi], ["Modele Pydantic", null], ["Walidacja", null], ["Dokumentacja Swagger", null]] },
      { title: "Java od podstaw", language: "Polski", tags: ["Java", "Podstawy"],
        description: "Podstawy programowania obiektowego w Javie: typy, klasy, dziedziczenie, kolekcje.",
        lessons: [["Składnia i typy", V.java], ["Klasy i obiekty", null], ["Dziedziczenie", null], ["Kolekcje", null]] },
      { title: "Spring Boot — wprowadzenie", language: "Polski", tags: ["Java", "Backend"],
        description: "Budowa aplikacji webowej i REST API w Spring Boot krok po kroku.",
        lessons: [["Pierwsza aplikacja", V.spring], ["Kontrolery REST", null], ["Wstrzykiwanie zależności", null], ["Połączenie z bazą", null]] },
      { title: "Programowanie obiektowe (OOP)", language: "Polski", tags: ["Podstawy", "Java"],
        description: "Filary OOP: klasy, dziedziczenie, polimorfizm, hermetyzacja i abstrakcja.",
        lessons: [["Klasy i obiekty", null], ["Dziedziczenie", null], ["Polimorfizm", null], ["Hermetyzacja", null]] },
      { title: "Algorytmy i struktury danych", language: "Polski", tags: ["Podstawy", "Zaawansowany"],
        description: "Złożoność, sortowania, wyszukiwanie oraz podstawowe struktury danych.",
        lessons: [["Złożoność obliczeniowa", null], ["Sortowania", null], ["Wyszukiwanie", null], ["Listy, stosy, kolejki", null]] },
      { title: "Git i GitHub", language: "Polski", tags: ["Podstawy"],
        description: "Kontrola wersji w praktyce: commity, gałęzie, praca zdalna i pull requesty.",
        lessons: [["Repozytorium i commit", V.git], ["Gałęzie i scalanie", null], ["Repo zdalne", null], ["Pull requesty", null]] },
      { title: "Docker dla programistów", language: "English", tags: ["Backend", "Zaawansowany"],
        description: "Konteneryzacja aplikacji: obrazy, Dockerfile, docker-compose, wolumeny i sieci.",
        lessons: [["Obrazy i kontenery", V.docker], ["Dockerfile", null], ["docker-compose", null], ["Wolumeny i sieci", null]] },
    ];

    const ratingPatterns = [[5,5,4],[4,5,5,5],[3,4,4],[5,4,5],[3,3,4],[4,4,5],[5,5,5],[2,4,3],[4,5,4],[3,4,5]];
    const sampleComments = ["Świetny kurs, dużo praktyki!", "Bardzo przydatne, polecam.", "Konkretnie i na temat.", "Dobre tempo i przykłady."];

    // Mapa: indeks kursu -> cena w zł. Kursy spoza mapy są darmowe (price = 0).
    const PAID = { 2: 49, 4: 79, 8: 99, 12: 59, 17: 89, 22: 69 };

    const byTitle = {};
    for (let idx = 0; idx < courses.length; idx++) {
      const c = courses[idx];
      // Poziom trudności: wywnioskowany z tagów, a w pozostałych przypadkach rotowany.
      const level = c.tags.includes("Zaawansowany")
        ? "Zaawansowany"
        : c.tags.includes("Podstawy")
        ? "Początkujący"
        : ["Początkujący", "Średniozaawansowany", "Zaawansowany"][idx % 3];
      const course = await Course.create({
        title: c.title,
        description: c.description,
        tags: c.tags,
        language: c.language,
        price: PAID[idx] || 0,
        level,
        creatorId: instructor.id,
      });
      byTitle[c.title] = course;
      let i = 1;
      for (const [title, videoUrl] of c.lessons) {
        await Lesson.create({ title, videoUrl, orderIndex: i++, courseId: course.id });
      }
      const pattern = ratingPatterns[idx % ratingPatterns.length];
      for (let r = 0; r < pattern.length; r++) {
        await Rating.create({ userId: raters[r].id, courseId: course.id, value: pattern[r] });
      }
      await Comment.create({ userId: raters[0].id, courseId: course.id, content: sampleComments[idx % sampleComments.length] });
      if (idx % 2 === 0) await Comment.create({ userId: raters[1].id, courseId: course.id, content: sampleComments[(idx + 1) % sampleComments.length] });
    }

    // ===== Przykładowe zapisy kursanta + częściowy postęp (kokpit „Moje kursy") =====
    // Funkcja zapisuje kursanta na kurs i oznacza pierwszych `doneCount` lekcji jako ukończone.
    const enrollWithProgress = async (course, doneCount) => {
      if (!course) return;
      await Enrollment.create({ userId: student.id, courseId: course.id });
      const courseLessons = await Lesson.findAll({
        where: { courseId: course.id },
        order: [["orderIndex", "ASC"]],
      });
      for (let i = 0; i < courseLessons.length; i++) {
        await Progress.create({
          userId: student.id,
          lessonId: courseLessons[i].id,
          completed: i < doneCount,
        });
      }
    };
    await enrollWithProgress(byTitle["JavaScript od podstaw"], 2); // w trakcie
    await enrollWithProgress(byTitle["React dla początkujących"], 0); // rozpoczęty
    await enrollWithProgress(byTitle["Bazy danych: SQL i PostgreSQL"], 4); // ukończony

    // ===== Przykładowe moduły (podział na sekcje) dla jednego kursu =====
    const jsCourse = byTitle["JavaScript od podstaw"];
    if (jsCourse) {
      const m1 = await Module.create({ courseId: jsCourse.id, title: "Podstawy języka", orderIndex: 1 });
      const m2 = await Module.create({ courseId: jsCourse.id, title: "Funkcje i praktyka", orderIndex: 2 });
      const jsLessons = await Lesson.findAll({
        where: { courseId: jsCourse.id },
        order: [["orderIndex", "ASC"]],
      });
      for (let i = 0; i < jsLessons.length; i++) {
        jsLessons[i].moduleId = i < 3 ? m1.id : m2.id;
        await jsLessons[i].save();
      }

      // pokazowe recenzje z tekstem (uzupełnienie istniejących ocen)
      const setReview = async (uid, value, text) => {
        const rr = await Rating.findOne({ where: { userId: uid, courseId: jsCourse.id } });
        if (rr) await rr.update({ value, text });
      };
      await setReview(student.id, 5, "Świetny wstęp do JS — jasne przykłady i dobre tempo.");
      await setReview(s1.id, 4, "Konkretnie i przystępnie. Przydałoby się więcej ćwiczeń.");

      // pokazowy wątek Q&A pod pierwszą lekcją
      if (jsLessons[0]) {
        const q = await Question.create({
          lessonId: jsLessons[0].id,
          courseId: jsCourse.id,
          userId: student.id,
          text: "Czym różni się let od var?",
        });
        await Answer.create({
          questionId: q.id,
          userId: instructor.id,
          text: "let ma zasięg blokowy, a var funkcyjny. W praktyce używaj let i const.",
        });
      }
    }

    // ===== MongoDB: testy/quizy dla większości kursów =====
    await connectMongo();
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});

    const quizzes = {
      "JavaScript od podstaw": [
        ["Które słowo kluczowe tworzy zmienną o zasięgu blokowym?", ["var", "let", "function", "global"], 1],
        ["Co zwraca typeof null?", ['"null"', '"object"', '"undefined"', '"number"'], 1],
        ["Która metoda dodaje element na koniec tablicy?", ["push()", "pop()", "shift()", "slice()"], 0],
      ],
      "JavaScript zaawansowany (ES2023)": [
        ["Co zwraca funkcja async?", ["Promise", "Callback", "Wartość synchronicznie", "null"], 0],
        ["Czym jest domknięcie (closure)?", ["Funkcja z dostępem do zewnętrznego zakresu", "Pętla", "Typ danych", "Moduł"], 0],
      ],
      "TypeScript w praktyce": [
        ["Jaki typ oznacza dowolną wartość?", ["any", "void", "never", "unknown-only"], 0],
        ["Czym jest interfejs w TS?", ["Opis kształtu obiektu", "Pętla", "Funkcja", "Klasa CSS"], 0],
      ],
      "React dla początkujących": [
        ["Który hook przechowuje stan komponentu?", ["useState", "useMemo", "useRef", "useFetch"], 0],
        ["Czym jest JSX?", ["Składnia łącząca JS i HTML-podobny zapis", "Baza danych", "Serwer", "Styl CSS"], 0],
        ["Co przekazujemy do komponentu z zewnątrz?", ["props", "state", "hooki", "klasy"], 0],
      ],
      "React zaawansowany": [
        ["Do czego służy Context API?", ["Współdzielenie danych bez przekazywania propsów", "Routing", "Stylowanie", "Testy"], 0],
        ["Co robi useMemo?", ["Zapamiętuje wynik obliczeń", "Tworzy stan", "Pobiera dane", "Renderuje listę"], 0],
      ],
      "Vue.js — podstawy": [
        ["Która wersja Vue jest najnowsza w kursie?", ["Vue 1", "Vue 2", "Vue 3", "Vue 5"], 2],
        ["Dyrektywa do wyświetlania listy to:", ["v-for", "v-if", "v-bind", "v-model"], 0],
      ],
      "HTML i CSS od zera": [
        ["Który tag tworzy nagłówek najwyższego poziomu?", ["<h1>", "<head>", "<header>", "<top>"], 0],
        ["Która właściwość ustawia kolor tekstu?", ["color", "background", "font", "text"], 0],
        ["Flexbox włączamy przez:", ["display: flex", "float: left", "position: absolute", "grid: on"], 0],
      ],
      "Node.js i Express API": [
        ["Czym jest Express?", ["Bazą danych", "Frameworkiem webowym", "Menedżerem pakietów", "Silnikiem szablonów"], 1],
        ["Co przechowuje nagłówek Authorization przy JWT?", ["Ciasteczko", "Token Bearer", "Hasło", "Adres IP"], 1],
      ],
      "Projektowanie REST API": [
        ["Który kod HTTP oznacza 'nie znaleziono'?", ["200", "301", "404", "500"], 2],
        ["Metoda do pobrania zasobu to:", ["GET", "POST", "DELETE", "PUT"], 0],
      ],
      "Express + MongoDB: pełny backend": [
        ["Biblioteka ODM do MongoDB w Node to:", ["Mongoose", "Sequelize", "Prisma-SQL", "Knex"], 0],
        ["Co definiuje strukturę dokumentu w Mongoose?", ["Schema", "Tabela", "Widok", "Indeks"], 0],
      ],
      "Bezpieczeństwo aplikacji webowych": [
        ["XSS to atak polegający na:", ["Wstrzyknięciu skryptu", "Przeciążeniu serwera", "Kradzieży dysku", "Szyfrowaniu plików"], 0],
        ["Hasła w bazie powinny być:", ["Zapisane jawnie", "Zahashowane", "W komentarzu", "W URL"], 1],
      ],
      "Bazy danych: SQL i PostgreSQL": [
        ["Które polecenie pobiera dane?", ["SELECT", "INSERT", "UPDATE", "DELETE"], 0],
        ["JOIN służy do:", ["Łączenia tabel", "Usuwania danych", "Tworzenia bazy", "Sortowania plików"], 0],
      ],
      "SQL zaawansowany": [
        ["CTE w SQL zapisujemy słowem:", ["WITH", "JOIN", "GROUP", "HAVING"], 0],
        ["Funkcja okienkowa używa klauzuli:", ["OVER", "WHERE", "LIMIT", "SET"], 0],
      ],
      "MongoDB w praktyce": [
        ["Dane w MongoDB przechowywane są jako:", ["Wiersze", "Dokumenty", "Pliki CSV", "Grafy"], 1],
        ["Operacje łączące etapy to:", ["Agregacje", "Transakcje SQL", "Widoki", "Triggery"], 0],
      ],
      "Python dla początkujących": [
        ["Jak utworzyć listę w Pythonie?", ["[]", "{}", "()", "<>"], 0],
        ["Które słowo definiuje funkcję?", ["def", "func", "function", "fn"], 0],
        ["Wcięcia w Pythonie są:", ["Obowiązkowe", "Opcjonalne", "Zabronione", "Tylko w klasach"], 0],
      ],
      "Analiza danych w Pythonie": [
        ["Główna struktura w pandas to:", ["DataFrame", "Array", "Vector", "Table"], 0],
        ["Biblioteka do obliczeń numerycznych to:", ["NumPy", "Flask", "Django", "Requests"], 0],
      ],
      "REST API w Pythonie (FastAPI)": [
        ["FastAPI do walidacji używa:", ["Pydantic", "Mongoose", "Joi", "Yup"], 0],
        ["FastAPI generuje dokumentację:", ["Automatycznie (Swagger)", "Ręcznie", "Wcale", "Tylko w PDF"], 0],
      ],
      "Java od podstaw": [
        ["Metoda startowa programu w Javie to:", ["main", "start", "run", "init"], 0],
        ["Java jest językiem:", ["Obiektowym", "Wyłącznie funkcyjnym", "Skryptowym bez typów", "Asemblerem"], 0],
      ],
      "Spring Boot — wprowadzenie": [
        ["Adnotacja kontrolera REST to:", ["@RestController", "@Entity", "@Service", "@Bean"], 0],
        ["Spring Boot upraszcza:", ["Konfigurację aplikacji", "Pisanie HTML", "Kompilację C++", "Tworzenie grafiki"], 0],
      ],
      "Programowanie obiektowe (OOP)": [
        ["Ukrywanie szczegółów implementacji to:", ["Hermetyzacja", "Dziedziczenie", "Polimorfizm", "Rekurencja"], 0],
        ["Dziedziczenie pozwala:", ["Tworzyć klasę na bazie innej", "Usuwać obiekty", "Sortować listy", "Łączyć tabele"], 0],
      ],
      "Algorytmy i struktury danych": [
        ["Złożoność wyszukiwania binarnego to:", ["O(log n)", "O(n)", "O(n^2)", "O(1) zawsze"], 0],
        ["Stos działa według zasady:", ["LIFO", "FIFO", "losowej", "alfabetycznej"], 0],
      ],
      "Git i GitHub": [
        ["Polecenie zapisujące zmiany lokalnie to:", ["git commit", "git push", "git clone", "git status"], 0],
        ["Propozycja zmian na GitHub to:", ["Pull request", "Commit", "Branch", "Fork-only"], 0],
      ],
      "Docker dla programistów": [
        ["Plik z instrukcją budowy obrazu to:", ["Dockerfile", "docker.json", "image.yml", "build.sh"], 0],
        ["Uruchomiona instancja obrazu to:", ["Kontener", "Wolumen", "Sieć", "Rejestr"], 0],
      ],
    };

    let quizCount = 0;
    for (const [title, qs] of Object.entries(quizzes)) {
      const course = byTitle[title];
      if (!course) continue;
      await Quiz.create({
        courseId: course.id,
        title: "Test wiedzy: " + title,
        passingScore: 60,
        questions: qs.map(([text, options, correctIndex]) => ({ text, options, correctIndex })),
      });
      quizCount++;
    }

    console.log("Dodano testy (MongoDB): " + quizCount);

    // ===== Pokazowy test z nowymi możliwościami (limit czasu, losowanie, wielokrotny wybór) =====
    const jsQuiz = await Quiz.findOne({ courseId: byTitle["JavaScript od podstaw"].id });
    if (jsQuiz) {
      jsQuiz.timeLimit = 5; // 5 minut
      jsQuiz.shuffle = true; // losowa kolejność pytań
      jsQuiz.questions[0].explanation =
        "let oraz const mają zasięg blokowy; var ma zasięg funkcyjny.";
      jsQuiz.questions.push({
        text: "Które z poniższych są typami prymitywnymi w JavaScript?",
        options: ["string", "number", "object", "boolean"],
        correctIndexes: [0, 1, 3],
        multiple: true,
        explanation: "object nie jest typem prymitywnym (jest typem złożonym).",
      });
      jsQuiz.markModified("questions");
      await jsQuiz.save();
      console.log("Zaktualizowano pokazowy test (JavaScript od podstaw)");
    }

    await mongoose.connection.close();

    console.log("\n✅ Dane startowe dodane: " + courses.length + " kursów, " + quizCount + " testów");
    console.log("--------------------------------------------------");
    console.log("Logowanie testowe (hasło dla wszystkich: haslo123):");
    console.log("  Prowadzący: instructor@example.com");
    console.log("  Kursant:    student@example.com");
    console.log("  Admin:      admin@example.com");
    console.log("--------------------------------------------------\n");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
