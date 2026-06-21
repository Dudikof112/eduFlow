import axios from "axios";

// Adres backendu — wykorzystywany też do budowania URL-i wgranych plików (np. wideo).
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_URL });

// Automatycznie dołącz token JWT do każdego żądania (jeśli zalogowany)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTH =====
export const registerApi = (payload) =>
  api.post("/auth/register", payload).then((r) => r.data);
export const loginApi = (payload) =>
  api.post("/auth/login", payload).then((r) => r.data);

// ===== KURSY =====
// filtry (wszystkie opcjonalne): { search, tag, language, minRating, sort, level, instructorId, page, limit }
// Zwraca { items, total, page, limit, totalPages }.
export const getCourses = (params = {}) => {
  const clean = {};
  ["search", "tag", "language", "minRating", "sort", "level", "instructorId", "page", "limit"].forEach(
    (k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== "") clean[k] = params[k];
    }
  );
  return api.get("/courses", { params: clean }).then((r) => r.data);
};
// listy do filtrów
export const getTags = () => api.get("/courses/tags").then((r) => r.data);
export const getLanguages = () =>
  api.get("/courses/languages").then((r) => r.data);
export const getInstructors = () =>
  api.get("/courses/instructors").then((r) => r.data);
export const getCourse = (id) => api.get(`/courses/${id}`).then((r) => r.data);
export const getCourseDashboard = (id) =>
  api.get(`/courses/${id}/dashboard`).then((r) => r.data);

// ===== LEKCJE =====
export const getLessons = (courseId) =>
  api.get(`/lessons/${courseId}`).then((r) => r.data);

// ===== ZAPISY / POSTĘP =====
export const enrollCourse = (courseId) =>
  api.post(`/enrollments/${courseId}`).then((r) => r.data);
export const unenrollCourse = (courseId) =>
  api.delete(`/enrollments/${courseId}`).then((r) => r.data);
export const completeLesson = (lessonId) =>
  api.post(`/progress/${lessonId}/complete`).then((r) => r.data);

// ===== KOMENTARZE =====
export const getComments = (courseId) =>
  api.get(`/comments/${courseId}`).then((r) => r.data);
export const addComment = (payload) =>
  api.post("/comments", payload).then((r) => r.data);

// ===== OCENY / RECENZJE =====
export const getRatings = (courseId) =>
  api.get(`/ratings/${courseId}`).then((r) => r.data);
export const addRating = (payload) =>
  api.post("/ratings", payload).then((r) => r.data);
export const deleteRating = (courseId) =>
  api.delete(`/ratings/${courseId}`).then((r) => r.data);

// ===== Q&A POD LEKCJAMI =====
export const getLessonQuestions = (lessonId) =>
  api.get(`/qa/lesson/${lessonId}`).then((r) => r.data);
export const askQuestion = (lessonId, payload) =>
  api.post(`/qa/lesson/${lessonId}`, payload).then((r) => r.data);
export const answerQuestion = (questionId, payload) =>
  api.post(`/qa/questions/${questionId}/answers`, payload).then((r) => r.data);
export const deleteQuestion = (id) =>
  api.delete(`/qa/questions/${id}`).then((r) => r.data);
export const deleteAnswer = (id) =>
  api.delete(`/qa/answers/${id}`).then((r) => r.data);

// ===== TESTY / QUIZY =====
export const getCourseQuizzes = (courseId) =>
  api.get(`/quizzes/course/${courseId}`).then((r) => r.data);
export const getQuiz = (id) => api.get(`/quizzes/${id}`).then((r) => r.data);
export const submitQuiz = (id, answers) =>
  api.post(`/quizzes/${id}/submit`, { answers }).then((r) => r.data);
export const getQuizAttempts = (id) =>
  api.get(`/quizzes/${id}/attempts`).then((r) => r.data);

// ===== CERTYFIKATY =====
export const getMyCertificates = () =>
  api.get("/certificates").then((r) => r.data);

// Pobiera PDF jako blob (token dokleja interceptor) i wymusza zapis pliku.
export const downloadCertificate = async (courseId) => {
  const res = await api.get(`/certificates/${courseId}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: "application/pdf" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `certyfikat.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// ===== CZAT =====
export const getChatThreads = () => api.get("/chat/threads").then((r) => r.data);
export const getChatMessages = (courseId, studentId) =>
  api.get(`/chat/${courseId}/${studentId}`).then((r) => r.data);
export const sendChatMessage = (courseId, studentId, text) =>
  api.post(`/chat/${courseId}/${studentId}`, { text }).then((r) => r.data);

// ===== PŁATNOŚCI (Stripe) =====
// Funkcja rozpoczyna płatność i zwraca URL do przekierowania na Stripe Checkout.
export const createCheckout = (courseId) =>
  api.post(`/payments/checkout/${courseId}`).then((r) => r.data);
// Funkcja potwierdza płatność po powrocie ze Stripe (na podstawie sessionId).
export const confirmPayment = (sessionId) =>
  api.post(`/payments/confirm`, { sessionId }).then((r) => r.data);

// ===== PANEL NAUCZYCIELA =====
// Kursy zalogowanego prowadzącego.
export const getMyCourses = () => api.get("/courses/mine").then((r) => r.data);
export const createCourse = (payload) =>
  api.post("/courses", payload).then((r) => r.data);
export const updateCourse = (id, payload) =>
  api.put(`/courses/${id}`, payload).then((r) => r.data);
export const deleteCourse = (id) =>
  api.delete(`/courses/${id}`).then((r) => r.data);

// Operacje na lekcjach (właściciel kursu/admin).
export const createLesson = (payload) =>
  api.post("/lessons", payload).then((r) => r.data);
export const updateLesson = (id, payload) =>
  api.put(`/lessons/${id}`, payload).then((r) => r.data);
export const deleteLesson = (id) =>
  api.delete(`/lessons/${id}`).then((r) => r.data);

// Operacje na testach (właściciel kursu/admin). getQuizForEdit zwraca poprawne odpowiedzi.
export const createQuiz = (payload) =>
  api.post("/quizzes", payload).then((r) => r.data);
export const updateQuiz = (id, payload) =>
  api.put(`/quizzes/${id}`, payload).then((r) => r.data);
export const deleteQuiz = (id) =>
  api.delete(`/quizzes/${id}`).then((r) => r.data);
export const getQuizForEdit = (id) =>
  api.get(`/quizzes/${id}/edit`).then((r) => r.data);

// ===== PANEL ADMINA =====
// Zarządzanie użytkownikami (tylko admin).
export const getUsers = () => api.get("/users").then((r) => r.data);
export const updateUserRole = (id, role) =>
  api.put(`/users/${id}/role`, { role }).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data);

// Moderacja komentarzy: lista wszystkich (admin) oraz usuwanie (autor lub admin).
export const getAllComments = () => api.get("/comments").then((r) => r.data);
export const deleteComment = (id) =>
  api.delete(`/comments/${id}`).then((r) => r.data);

// Wgranie pliku wideo do lekcji (multipart/form-data, pole formularza "video").
export const uploadLessonVideo = (id, file) => {
  const fd = new FormData();
  fd.append("video", file);
  return api.post(`/lessons/${id}/video`, fd).then((r) => r.data);
};
// Usunięcie wgranego pliku wideo z lekcji.
export const deleteLessonVideo = (id) =>
  api.delete(`/lessons/${id}/video`).then((r) => r.data);

// ===== KONTO UŻYTKOWNIKA =====
export const getMe = () => api.get("/auth/me").then((r) => r.data);
export const updateProfile = (payload) =>
  api.put("/auth/profile", payload).then((r) => r.data);
export const changePassword = (payload) =>
  api.put("/auth/password", payload).then((r) => r.data);
// Kursy zalogowanego użytkownika wraz z postępem (kokpit „Moje kursy").
export const getMyEnrolledCourses = () =>
  api.get("/enrollments/mine").then((r) => r.data);

// ===== TREŚĆ KURSU: materiały i moduły =====
// Materiały do pobrania (pliki pod lekcją).
export const uploadMaterial = (lessonId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(`/materials/${lessonId}`, fd).then((r) => r.data);
};
export const deleteMaterial = (id) =>
  api.delete(`/materials/${id}`).then((r) => r.data);

// Moduły (sekcje) kursu.
export const getModules = (courseId) =>
  api.get(`/modules/course/${courseId}`).then((r) => r.data);
export const createModule = (payload) =>
  api.post("/modules", payload).then((r) => r.data);
export const updateModule = (id, payload) =>
  api.put(`/modules/${id}`, payload).then((r) => r.data);
export const deleteModule = (id) =>
  api.delete(`/modules/${id}`).then((r) => r.data);

export default api;

// ===== POWIADOMIENIA =====
export const getNotifications = () =>
  api.get("/notifications").then((r) => r.data);
export const markAllNotificationsRead = () =>
  api.post("/notifications/read-all").then((r) => r.data);

// ===== ULUBIONE + REKOMENDACJE =====
export const getFavoriteIds = () =>
  api.get("/favorites/ids").then((r) => r.data);
export const getFavorites = () =>
  api.get("/favorites").then((r) => r.data);
export const addFavorite = (courseId) =>
  api.post(`/favorites/${courseId}`).then((r) => r.data);
export const removeFavorite = (courseId) =>
  api.delete(`/favorites/${courseId}`).then((r) => r.data);
export const getRecommendations = (id) =>
  api.get(`/courses/${id}/recommendations`).then((r) => r.data);

// ===== STATYSTYKI (prowadzący/admin) =====
export const getInstructorStats = () =>
  api.get("/stats/instructor").then((r) => r.data);
