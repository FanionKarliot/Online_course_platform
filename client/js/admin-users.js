const moi = getUser();

// On garde la liste complète en mémoire pour filtrer côté client
let tousLesUtilisateurs = [];

// ================= LIGNE UTILISATEUR =================
function ligneUtilisateur(utilisateur) {
  const estMoi = utilisateur._id === moi.id;
  const date = new Date(utilisateur.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const initiale = (utilisateur.nom || "?").charAt(0).toUpperCase();

  // Badge de rôle
  const badgeRole =
    utilisateur.role === "admin"
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider
                       bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
           <i class="fa-solid fa-shield text-[9px]"></i> Admin
         </span>`
      : `<span class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider
                       bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
           <i class="fa-solid fa-user text-[9px]"></i> Étudiant
         </span>`;

  return `
    <div class="ligne-user flex flex-col sm:flex-row sm:items-center gap-4 p-4">
      <!-- Avatar + infos -->
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <span class="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500
                     text-white font-bold flex items-center justify-center flex-shrink-0
                     shadow-md shadow-indigo-500/15">
          ${initiale}
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-medium text-gray-900 truncate">${utilisateur.nom}</p>
            ${badgeRole}
            ${estMoi ? '<span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Vous</span>' : ''}
          </div>
          <p class="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
            <i class="fa-solid fa-envelope text-[10px] text-gray-400"></i>
            ${utilisateur.email}
          </p>
          <p class="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
            <i class="fa-solid fa-calendar text-[10px]"></i>
            Inscrit le ${date}
            ${utilisateur.filiere ? ` • <i class="fa-solid fa-book-bookmark text-[10px]"></i> ${utilisateur.filiere}` : ""}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
        <div class="relative">
          <select
            onchange="changerRole('${utilisateur._id}', this.value)"
            ${estMoi ? "disabled" : ""}
            class="appearance-none cursor-pointer text-sm font-medium pr-9 pl-3 py-2 rounded-xl
                   border transition-all duration-200
                   ${estMoi
                     ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                     : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"}"
          >
            <option value="etudiant" ${utilisateur.role === "etudiant" ? "selected" : ""}>Étudiant</option>
            <option value="admin" ${utilisateur.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
          <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none
                    ${estMoi ? "text-gray-300" : "text-gray-400"}"></i>
        </div>

        <button
          onclick="supprimerUtilisateur('${utilisateur._id}')"
          ${estMoi ? "disabled" : ""}
          title="${estMoi ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer ce compte'}"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                 ${estMoi
                   ? "text-gray-300 cursor-not-allowed bg-gray-50"
                   : "text-gray-400 hover:text-rose-600 hover:bg-rose-50"}"
        >
          <i class="fa-solid fa-trash text-sm"></i>
        </button>
      </div>
    </div>
  `;
}

// ================= ÉTAT VIDE =================
function htmlEtatVide() {
  return `
    <div class="text-center py-14 px-6">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100
                  flex items-center justify-center text-indigo-500 text-2xl">
        <i class="fa-solid fa-user-slash"></i>
      </div>
      <h3 class="font-bold text-gray-800 mb-1">Aucun utilisateur trouvé</h3>
      <p class="text-sm text-gray-500">Essayez un autre filtre ou une autre recherche.</p>
    </div>
  `;
}

// ================= FILTRAGE =================
function filtrerUtilisateurs() {
  const recherche = document.getElementById("recherche-utilisateur").value.trim().toLowerCase();
  const role = document.getElementById("filtre-role").value;

  let liste = tousLesUtilisateurs;

  // Filtre recherche (nom ou email)
  if (recherche) {
    liste = liste.filter((u) => {
      const nom = (u.nom || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return nom.includes(recherche) || email.includes(recherche);
    });
  }

  // Filtre rôle
  if (role) {
    liste = liste.filter((u) => u.role === role);
  }

  // Tri : "moi" en premier, puis par nom
  liste = [...liste].sort((a, b) => {
    if (a._id === moi.id) return -1;
    if (b._id === moi.id) return 1;
    return (a.nom || "").localeCompare(b.nom || "");
  });

  afficherListe(liste);
}

// ================= AFFICHAGE =================
function afficherListe(liste) {
  const conteneur = document.getElementById("liste-utilisateurs");
  const compteur = document.getElementById("compteur-utilisateurs");

  // Compteur
  const n = liste.length;
  const total = tousLesUtilisateurs.length;
  if (n === total) {
    compteur.textContent = `${n} utilisateur${n > 1 ? "s" : ""}`;
  } else {
    compteur.textContent = `${n} utilisateur${n > 1 ? "s" : ""} sur ${total}`;
  }

  // Liste
  if (n === 0) {
    conteneur.innerHTML = htmlEtatVide();
  } else {
    conteneur.innerHTML = liste.map(ligneUtilisateur).join("");
  }
}

// ================= CHARGEMENT =================
async function chargerUtilisateurs() {
  const conteneur = document.getElementById("liste-utilisateurs");
  conteneur.innerHTML = `
    <div class="flex flex-col items-center justify-center py-14 gap-3">
      <div class="spinner"></div>
      <p class="text-sm text-gray-500">Chargement des utilisateurs…</p>
    </div>
  `;
  document.getElementById("compteur-utilisateurs").textContent = "";

  try {
    const { utilisateurs } = await api.getUsers();
    tousLesUtilisateurs = utilisateurs || [];
    filtrerUtilisateurs();
  } catch (err) {
    conteneur.innerHTML = `
      <div class="text-center py-14 px-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 text-2xl">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="font-bold text-gray-800 mb-1">Erreur de chargement</h3>
        <p class="text-sm text-gray-500">${err.message}</p>
      </div>
    `;
  }
}

// ================= ACTIONS =================
async function changerRole(id, nouveauRole) {
  try {
    await api.updateUserRole(id, nouveauRole);
    await chargerUtilisateurs();
  } catch (err) {
    alert(err.message);
    await chargerUtilisateurs(); // annule visuellement le changement
  }
}

async function supprimerUtilisateur(id) {
  if (!confirm("Supprimer définitivement ce compte ? Cette action est irréversible.")) return;
  try {
    await api.deleteUser(id);
    await chargerUtilisateurs();
  } catch (err) {
    alert(err.message);
  }
}

// ================= INITIALISATION =================
document.addEventListener("DOMContentLoaded", () => {
  // Écoute des filtres
  const inputRecherche = document.getElementById("recherche-utilisateur");
  const selectRole = document.getElementById("filtre-role");

  if (inputRecherche) {
    inputRecherche.addEventListener("input", filtrerUtilisateurs);
  }
  if (selectRole) {
    selectRole.addEventListener("change", filtrerUtilisateurs);
  }

  chargerUtilisateurs();
});