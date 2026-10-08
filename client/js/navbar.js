function afficherNavbar() {
  const connecte = estConnecte();
  const user = getUser();
  const pageActuelle = window.location.pathname;

  // --- Barre du haut (desktop uniquement à partir de md) ---
  const navbarHautHtml = `
    <nav class="bg-white shadow-sm px-6 py-4 hidden md:flex items-center justify-between">
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
                  <a href="/pages/admin-users.html" class="text-gray-700 hover:text-indigo-600">
                    <i class="fa-solid fa-users"></i> Utilisateurs
                  </a>
                ` : ''
              }
              <a href="/index.html" class="text-gray-700 hover:text-indigo-600">
                <i class="fa-solid fa-house"></i> Accueil
              </a>
              <a href="/pages/courses.html" class="text-gray-700 hover:text-indigo-600">
                <i class="fa-solid fa-book-open"></i> Cours
              </a>
              <a href="/pages/dashboard.html" class="text-gray-700 hover:text-indigo-600">
                <i class="fa-solid fa-gauge"></i> Tableau de bord
              </a>
              <a href="/pages/dashboard.html?onglet=notifications" class="relative text-gray-700 hover:text-indigo-600">
                <i class="fa-solid fa-bell"></i>
                <span id="badge-notif-haut" class="notif-badge hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5"></span>
              </a>
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

  // --- Barre du bas, icônes uniquement (mobile, en dessous de md) ---
  function itemBas(href, icone, actif, badgeId) {
    return `
      <a href="${href}" class="relative flex-1 flex flex-col items-center justify-center py-2 ${actif ? 'text-indigo-600' : 'text-gray-500'}">
        <i class="fa-solid ${icone} text-lg"></i>
        ${badgeId ? `<span id="${badgeId}" class="notif-badge hidden absolute top-1 right-1/4 bg-red-500 text-white text-[10px] rounded-full px-1.5"></span>` : ''}
      </a>
    `;
  }

  const navbarBasHtml = connecte
    ? `
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-stretch z-40">
        ${itemBas('/index.html', 'fa-house', pageActuelle === '/index.html')}
        ${itemBas('/pages/courses.html', 'fa-book-open', pageActuelle.includes('courses.html'))}
        ${itemBas('/pages/dashboard.html', 'fa-gauge', pageActuelle.includes('dashboard'))}
        ${itemBas('/pages/dashboard.html?onglet=notifications', 'fa-bell', false, 'badge-notif-bas')}
        ${user?.role === 'admin' ? itemBas('/pages/admin-courses.html', 'fa-user-shield', pageActuelle.includes('admin')) : ''}
        ${user?.role === 'admin' ? itemBas('/pages/admin-users.html', 'fa-users', pageActuelle.includes('admin-users')) : ''}
        <button onclick="deconnecter()" class="flex-1 flex flex-col items-center justify-center py-2 text-red-500">
          <i class="fa-solid fa-right-from-bracket text-lg"></i>
        </button>
      </nav>
    `
    : `
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-stretch z-40">
        ${itemBas('/pages/login.html', 'fa-right-to-bracket', pageActuelle.includes('login'))}
        ${itemBas('/pages/register.html', 'fa-user-plus', pageActuelle.includes('register'))}
      </nav>
    `;

  document.getElementById('navbar').innerHTML = navbarHautHtml + navbarBasHtml;

  // Espace pour que le contenu ne soit pas caché derrière la barre fixe sur mobile
  document.body.classList.add('md:pb-0', 'pb-16');

  if (connecte) chargerCompteurNotifications();
}

async function chargerCompteurNotifications() {
  try {
    const { nonLues } = await api.getNotifications();
    if (nonLues > 0) {
      document.querySelectorAll('.notif-badge').forEach((badge) => {
        badge.textContent = nonLues;
        badge.classList.remove('hidden');
      });
    }
  } catch (err) {
    console.error(err);
  }
}