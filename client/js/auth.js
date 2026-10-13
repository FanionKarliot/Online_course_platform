// Gestion de session
function sauvegarderSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
}

function estConnecte() {
  return !!localStorage.getItem('token');
}

function deconnecter() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// À appeler en haut des pages qui exigent d'être connecté
function exigerConnexion() {
  if (!estConnecte()) {
    window.location.href = '/pages/login.html';
  }
}

// À appeler en haut des pages admin
function exigerAdmin() {
  const user = getUser();
  if (!estConnecte() || !user || user.role !== 'admin') {
    window.location.href = '/index.html';
  }
}