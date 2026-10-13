const ICONES_NOTIF = {
  info: 'fa-circle-info text-blue-500',
  succes: 'fa-circle-check text-green-500',
  quiz: 'fa-circle-question text-amber-500',
  certificat: 'fa-certificate text-purple-500',
  admin: 'fa-user-shield text-indigo-500',
};

// Évite d'injecter du HTML venant des données (titres de cours, etc.)
function echapperHtml(texte) {
  const div = document.createElement('div');
  div.textContent = texte;
  return div.innerHTML;
}

// Initiales pour l'avatar : « Rakoto Jean » → « RJ »
function initiales(nom = '') {
  return nom
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join('');
}

function afficherNavbar() {
  const connecte = estConnecte();
  const user = getUser();
  const pageActuelle = window.location.pathname;

  // ============ DESKTOP (barre du haut) ============
  const lienDesktop = (href, icone, label, actif) => `
    <a href="${href}"
       class="group relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
              transition-all duration-200
              ${actif
                ? 'text-indigo-700 bg-indigo-50'
                : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'}">
      <i class="fa-solid ${icone} text-[13px] transition-transform duration-200 group-hover:scale-110"></i>
      <span>${label}</span>
      ${actif ? '<span class="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></span>' : ''}
    </a>
  `;

  const navbarHautHtml = `
    <nav class="hidden md:block fixed top-0 left-0 right-0 z-50
              backdrop-blur-xl bg-white/80
              border-b border-gray-200/60
              shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">

        <!-- LOGO -->
        <a href="/index.html" class="flex items-center gap-2.5 group">
          <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600
                       flex items-center justify-center text-white shadow-md shadow-indigo-500/20
                       transition-transform duration-300 group-hover:scale-105">
            <i class="fa-solid fa-graduation-cap text-sm"></i>
          </span>
          <span class="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600
                       bg-clip-text text-transparent">
            CoursEnLigne
          </span>
        </a>

        <!-- LIENS -->
        <div class="flex items-center gap-1">
          ${
            connecte
              ? `
                ${lienDesktop('/index.html', 'fa-house', 'Accueil', pageActuelle === '/index.html')}
                ${user?.role === 'admin' ? `
                  ${lienDesktop('/pages/admin-courses.html', 'fa-user-shield', 'Admin', pageActuelle.includes('admin-courses'))}
                  ${lienDesktop('/pages/admin-users.html', 'fa-users', 'Utilisateurs', pageActuelle.includes('admin-users'))}
                ` : ''}
                ${lienDesktop('/pages/courses.html', 'fa-book-open', 'Cours', pageActuelle === '/pages/courses.html')}
                ${lienDesktop('/pages/dashboard.html', 'fa-gauge', 'Tableau de bord', pageActuelle.includes('dashboard'))}
              `
              : `
                ${lienDesktop('/pages/courses.html', 'fa-book-open', 'Cours', pageActuelle === '/pages/courses.html')}
              `
          }
        </div>

        <!-- ACTIONS (droite) -->
        <div class="flex items-center gap-2">
          ${
            connecte
              ? `
                <!-- Cloche notifications -->
                <button onclick="basculerNotifications()"
                        class="relative w-10 h-10 rounded-xl flex items-center justify-center
                               text-gray-600 hover:text-indigo-600 hover:bg-indigo-50
                               transition-all duration-200 group"
                        aria-label="Notifications">
                  <i class="fa-solid fa-bell text-[15px] transition-transform duration-200 group-hover:rotate-12"></i>
                  <span class="notif-badge hidden absolute top-1.5 right-1.5
                               min-w-[18px] h-[18px] px-1 rounded-full
                               bg-gradient-to-br from-rose-500 to-red-600 text-white
                               text-[10px] font-bold flex items-center justify-center
                               ring-2 ring-white shadow-sm"></span>
                </button>

                <!-- Avatar + nom + menu -->
                <div class="relative">
                  <button onclick="basculerMenuUtilisateur()"
                          id="btn-menu-user"
                          class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl
                                 hover:bg-gray-50 transition-colors duration-200 group">
                    <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500
                                 flex items-center justify-center text-white text-xs font-bold
                                 shadow-sm ring-2 ring-white">
                      ${initiales(user?.nom)}
                    </span>
                    <span class="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      ${echapperHtml(user?.nom || '')}
                    </span>
                    <i class="fa-solid fa-chevron-down text-[10px] text-gray-400
                              transition-transform duration-200 group-hover:text-gray-600"></i>
                  </button>

                  <!-- Menu déroulant -->
                  <div id="menu-user"
                       class="hidden absolute right-0 top-full mt-2 w-56
                              bg-white rounded-2xl shadow-xl shadow-gray-900/5
                              border border-gray-100 overflow-hidden
                              animate-[fadeIn_0.15s_ease-out]">
                    <div class="px-4 py-3 border-b border-gray-50">
                      <p class="text-xs text-gray-400">Connecté en tant que</p>
                      <p class="text-sm font-semibold text-gray-800 truncate">${echapperHtml(user?.nom || '')}</p>
                      <p class="text-xs text-gray-500 truncate">${echapperHtml(user?.email || '')}</p>
                    </div>
                    <a href="/pages/dashboard.html"
                       class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                              hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                      <i class="fa-solid fa-gauge w-4 text-center"></i> Mon tableau de bord
                    </a>
                    <a href="/pages/dashboard.html?onglet=notifications"
                       class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                              hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                      <i class="fa-solid fa-bell w-4 text-center"></i> Mes notifications
                    </a>
                    <button onclick="deconnecter()"
                            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600
                                   hover:bg-red-50 transition-colors border-t border-gray-50">
                      <i class="fa-solid fa-right-from-bracket w-4 text-center"></i> Se déconnecter
                    </button>
                  </div>
                </div>
              `
              : `
                <a href="/pages/login.html"
                   class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700
                          hover:text-indigo-700 hover:bg-gray-50 transition-colors">
                  Connexion
                </a>
                <a href="/pages/register.html"
                   class="px-4 py-2 rounded-xl text-sm font-medium text-white
                          bg-gradient-to-r from-indigo-600 to-violet-600
                          hover:from-indigo-700 hover:to-violet-700
                          shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30
                          transition-all duration-200">
                  Inscription
                </a>
              `
          }
        </div>
      </div>
    </nav>
  `;

  // ============ MOBILE (barre du bas) ============
  const classeItem = (actif) =>
    `relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2
     transition-all duration-200
     ${actif ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}`;

  const indicateurActif = `
    <span class="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5
                 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></span>
  `;

  function itemBas(href, icone, actif) {
    return `
      <a href="${href}" class="${classeItem(actif)}">
        ${actif ? indicateurActif : ''}
        <i class="fa-solid ${icone} text-lg"></i>
      </a>
    `;
  }

  const boutonNotifBas = `
    <button onclick="basculerNotifications()" class="${classeItem(false)}" aria-label="Notifications">
      <i class="fa-solid fa-bell text-lg"></i>
      <span class="notif-badge hidden absolute top-1.5 right-1/4
                   min-w-[16px] h-4 px-1 rounded-full
                   bg-gradient-to-br from-rose-500 to-red-600 text-white
                   text-[9px] font-bold flex items-center justify-center
                   ring-2 ring-white"></span>
    </button>
  `;

  const navbarBasHtml = connecte
    ? `
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40
                  backdrop-blur-xl bg-white/90
                  border-t border-gray-200/70
                  shadow-[0_-2px_10px_rgba(0,0,0,0.03)]
                  flex items-stretch">
        ${itemBas('/index.html', 'fa-house', pageActuelle === '/index.html')}
        ${itemBas('/pages/courses.html', 'fa-book-open', pageActuelle === '/pages/courses.html')}
        ${itemBas('/pages/dashboard.html', 'fa-gauge', pageActuelle.includes('dashboard'))}
        ${boutonNotifBas}
        ${user?.role === 'admin' ? itemBas('/pages/admin-courses.html', 'fa-user-shield', pageActuelle.includes('admin-course')) : ''}
      </nav>
    `
    : `
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40
                  backdrop-blur-xl bg-white/90
                  border-t border-gray-200/70
                  shadow-[0_-2px_10px_rgba(0,0,0,0.03)]
                  flex items-stretch">
        ${itemBas('/index.html', 'fa-house', pageActuelle === '/index.html')}
        ${itemBas('/pages/courses.html', 'fa-book-open', pageActuelle === '/pages/courses.html')}
        ${itemBas('/pages/login.html', 'fa-right-to-bracket', pageActuelle.includes('login'))}
        ${itemBas('/pages/register.html', 'fa-user-plus', pageActuelle.includes('register'))}
      </nav>
    `;

  document.getElementById('navbar').innerHTML = navbarHautHtml + navbarBasHtml;
  document.body.classList.add('pb-20', 'md:pb-0', 'md:pt-16');

  if (connecte) {
    creerPopupNotifications();
    chargerCompteurNotifications();
    initMenuUtilisateur();
  }
}

// ================= MENU UTILISATEUR =================
function basculerMenuUtilisateur() {
  document.getElementById('menu-user')?.classList.toggle('hidden');
}

function initMenuUtilisateur() {
  // Ferme le menu si on clique ailleurs
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('menu-user');
    const btn = document.getElementById('btn-menu-user');
    if (!menu || !btn) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.getElementById('menu-user')?.classList.add('hidden');
  });
}

// ================= POPUP DE NOTIFICATIONS =================
function creerPopupNotifications() {
  if (document.getElementById('popup-notifications')) return;

  const popup = document.createElement('div');
  popup.id = 'popup-notifications';
  popup.className = 'hidden';
  popup.innerHTML = `
    <div class="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-[2px]"
         onclick="fermerNotifications()"></div>
    <div class="fixed z-50
                bottom-20 left-3 right-3
                md:bottom-auto md:left-auto md:top-20 md:right-6 md:w-96
                bg-white rounded-2xl shadow-2xl shadow-gray-900/10
                border border-gray-100 overflow-hidden
                flex flex-col max-h-[70vh]
                animate-[slideUp_0.2s_ease-out]">
      <div class="flex items-center justify-between px-4 py-3
                  bg-gradient-to-r from-indigo-50 to-violet-50
                  border-b border-gray-100">
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          <i class="fa-solid fa-bell text-indigo-600"></i> Notifications
        </h3>
        <button onclick="fermerNotifications()"
                class="w-7 h-7 rounded-lg flex items-center justify-center
                       text-gray-400 hover:text-gray-700 hover:bg-white/60
                       transition-colors" aria-label="Fermer">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div id="popup-notif-liste" class="overflow-y-auto flex-1 divide-y divide-gray-50"></div>
      <div class="flex items-center justify-between px-4 py-3
                  border-t border-gray-100 bg-gray-50/50 text-sm">
        <button id="btn-tout-lire" onclick="toutMarquerLu()"
                class="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
          <i class="fa-solid fa-check-double text-xs"></i> Tout marquer comme lu
        </button>
        <a href="/pages/dashboard.html?onglet=notifications"
           class="text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1">
          Voir tout <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fermerNotifications();
  });
}

function ligneNotification(notif) {
  const date = new Date(notif.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const contenu = `
    <div class="flex items-start gap-3 px-4 py-3 ${notif.lue ? 'opacity-60' : 'bg-indigo-50/40'}">
      <i class="fa-solid ${ICONES_NOTIF[notif.type] || ICONES_NOTIF.info} mt-1"></i>
      <div class="flex-1">
        <p class="text-sm text-gray-700">${echapperHtml(notif.message)}</p>
        <p class="text-xs text-gray-400 mt-0.5">${date}</p>
      </div>
      ${!notif.lue ? '<span class="w-2 h-2 bg-indigo-500 rounded-full mt-2"></span>' : ''}
    </div>
  `;

  return notif.lien
    ? `<a href="${notif.lien}" onclick="ouvrirNotification(event, '${notif._id}')" class="block hover:bg-gray-50">${contenu}</a>`
    : contenu;
}

// Marque la notification comme lue puis ouvre la page liée
async function ouvrirNotification(event, id) {
  event.preventDefault();
  const destination = event.currentTarget.getAttribute('href');
  try {
    await api.markRead(id);
  } catch (err) {
    console.error(err); // on navigue quand même
  }
  window.location.href = destination;
}

function mettreAJourBadges(nonLues) {
  document.querySelectorAll('.notif-badge').forEach((badge) => {
    if (nonLues > 0) {
      badge.textContent = nonLues > 9 ? '9+' : nonLues;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

async function chargerContenuNotifications() {
  const liste = document.getElementById('popup-notif-liste');
  liste.innerHTML = '<div class="flex justify-center py-8"><div class="spinner"></div></div>';

  try {
    const { notifications, nonLues } = await api.getNotifications();

    liste.innerHTML =
      notifications.slice(0, 20).map(ligneNotification).join('') ||
      '<p class="text-center text-gray-400 text-sm py-8">Aucune notification</p>';

    document.getElementById('btn-tout-lire').classList.toggle('hidden', nonLues === 0);
    mettreAJourBadges(nonLues);
  } catch (err) {
    liste.innerHTML = `<p class="text-center text-red-500 text-sm py-8">${echapperHtml(err.message)}</p>`;
  }
}

function basculerNotifications() {
  const popup = document.getElementById('popup-notifications');
  if (popup.classList.contains('hidden')) {
    popup.classList.remove('hidden');
    chargerContenuNotifications();
  } else {
    fermerNotifications();
  }
}

function fermerNotifications() {
  document.getElementById('popup-notifications')?.classList.add('hidden');
}

async function toutMarquerLu() {
  try {
    await api.markAllRead();
    await chargerContenuNotifications();
  } catch (err) {
    alert(err.message);
  }
}

async function chargerCompteurNotifications() {
  try {
    const { nonLues } = await api.getNotifications();
    mettreAJourBadges(nonLues);
  } catch (err) {
    console.error(err);
  }
}