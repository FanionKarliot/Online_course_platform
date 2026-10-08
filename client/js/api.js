// le cœur de la partie client : toutes les routes du backend passent par ici, aucun fetch ailleurs écrit en dur
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const reponse = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    throw new Error(data.message || 'Erreur serveur');
  }
  return data;
}

const api = {
  // Auth
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch('/auth/me'),

  // Cours
  getCourses: (params = '') => apiFetch(`/courses${params}`),
  getCourse: (id) => apiFetch(`/courses/${id}`),

  // Inscriptions
  enroll: (coursId) => apiFetch('/enrollments', { method: 'POST', body: JSON.stringify({ coursId }) }),
  getMyEnrollments: () => apiFetch('/enrollments/me'),
  getEnrollment: (coursId) => apiFetch(`/enrollments/${coursId}`),
  terminerChapitre: (coursId, chapterId) =>
    apiFetch(`/enrollments/${coursId}/chapters/${chapterId}/terminer`, { method: 'PATCH' }),

  // Quiz
  getQuizzesByCourse: (coursId) => apiFetch(`/quizzes/course/${coursId}`),
  getQuiz: (id) => apiFetch(`/quizzes/${id}`),
  soumettreQuiz: (id, reponses) =>
    apiFetch(`/quizzes/${id}/soumettre`, { method: 'POST', body: JSON.stringify({ reponses }) }),
  getMesResultats: () => apiFetch('/quizzes/mes-resultats'),

  // Certificat
  getCertificat: (coursId) => apiFetch(`/certificates/${coursId}`),

  // Commentaires
  getComments: (coursId) => apiFetch(`/comments/course/${coursId}`),
  addComment: (coursId, texte) =>
    apiFetch('/comments', { method: 'POST', body: JSON.stringify({ coursId, texte }) }),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markAllRead: () => apiFetch('/notifications/tout-lire', { method: 'PATCH' }),

  // / Utilisateurs (admin)
  getUsers: () => apiFetch('/users'),
  updateUserRole: (id, role) =>
    apiFetch(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

    // Cours (admin)
  createCourse: (body) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(body) }),
  updateCourse: (id, body) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCourse: (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),

  // Chapitres (admin)
  addChapter: (coursId, body) =>
    apiFetch(`/courses/${coursId}/chapters`, { method: 'POST', body: JSON.stringify(body) }),
  updateChapter: (id, body) => apiFetch(`/chapters/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteChapter: (id) => apiFetch(`/chapters/${id}`, { method: 'DELETE' }),

  // Quiz (admin)
  createQuiz: (body) => apiFetch('/quizzes', { method: 'POST', body: JSON.stringify(body) }),
  getQuizAdmin: (id) => apiFetch(`/quizzes/${id}/admin`),
  updateQuiz: (id, body) => apiFetch(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteQuiz: (id) => apiFetch(`/quizzes/${id}`, { method: 'DELETE' }),
};