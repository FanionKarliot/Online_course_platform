function afficherNavbar() {
  const connecte = estConnecte();
  const user = getUser();

  const navbarHtml = `
    <nav class="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <a href="/index.html" class="text-xl font-bold text-indigo-600">
        <i class="fa-solid fa-graduation-cap"></i> CoursEnLigne
      </a>
      <div class="flex items-center gap-4">
        ${
          connecte
            ? `
              ${user?.role === 'admin' ? `
                  <a href="/pages/admin-courses.html" class="text-gray-700 hover:text-indigo-600">
                    <i class="fa-solid fa-user-shield"></i> Admin
                  </a>
                ` : ''
              }
              <a href="/pages/dashboard.html" class="text-gray-700 hover:text-indigo-600">
                <i class="fa-solid fa-gauge"></i> Tableau de bord
              </a>
              <button id="btn-notifications" class="relative text-gray-700 hover:text-indigo-600">
                <i class="fa-solid fa-bell"></i>
                <span id="badge-notif" class="hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5"></span>
              </button>
              <span class="text-gray-500 text-sm">${user?.nom || ''}</span>
              <button onclick="deconnecter()" class="text-red-500 hover:text-red-700">
                <i class="fa-solid fa-right-from-bracket"></i>
              </button>
            `
            : `
              <a href="/pages/login.html" class="text-gray-700 hover:text-indigo-600">Connexion</a>
              <a href="/pages/register.html" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Inscription</a>
            `
        }
      </div>
    </nav>
  `;

  document.getElementById('navbar').innerHTML = navbarHtml;

  if (connecte) chargerCompteurNotifications();
}

async function chargerCompteurNotifications() {
  try {
    const { nonLues } = await api.getNotifications();
    const badge = document.getElementById('badge-notif');
    if (nonLues > 0) {
      badge.textContent = nonLues;
      badge.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
  }
}