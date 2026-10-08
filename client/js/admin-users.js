const moi = getUser();

function ligneUtilisateur(utilisateur) {
  const estMoi = utilisateur._id === moi.id;
  const date = new Date(utilisateur.createdAt).toLocaleDateString('fr-FR');

  return `
    <div class="flex items-center justify-between p-4">
      <div>
        <p class="font-medium text-gray-800">
          ${utilisateur.nom}
          ${estMoi ? '<span class="text-xs text-gray-400">(vous)</span>' : ''}
        </p>
        <p class="text-xs text-gray-500">${utilisateur.email} — inscrit le ${date}</p>
        ${utilisateur.filiere ? `<p class="text-xs text-gray-400">${utilisateur.filiere}</p>` : ''}
      </div>
      <div class="flex items-center gap-3">
        <select
          onchange="changerRole('${utilisateur._id}', this.value)"
          ${estMoi ? 'disabled' : ''}
          class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 ${estMoi ? 'bg-gray-50 text-gray-400' : ''}"
        >
          <option value="etudiant" ${utilisateur.role === 'etudiant' ? 'selected' : ''}>Étudiant</option>
          <option value="admin" ${utilisateur.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        <button
          onclick="supprimerUtilisateur('${utilisateur._id}')"
          ${estMoi ? 'disabled' : ''}
          class="text-sm ${estMoi ? 'text-gray-300' : 'text-red-500 hover:text-red-700'}"
        >
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

async function chargerUtilisateurs() {
  const conteneur = document.getElementById('liste-utilisateurs');
  conteneur.innerHTML = `<div class="flex justify-center py-10"><div class="spinner"></div></div>`;

  try {
    const { utilisateurs } = await api.getUsers();
    conteneur.innerHTML = utilisateurs.map(ligneUtilisateur).join('');
  } catch (err) {
    conteneur.innerHTML = `<p class="text-center text-red-500 py-10">${err.message}</p>`;
  }
}

async function changerRole(id, nouveauRole) {
  try {
    await api.updateUserRole(id, nouveauRole);
    await chargerUtilisateurs();
  } catch (err) {
    alert(err.message);
    await chargerUtilisateurs(); // on recharge pour annuler visuellement le select
  }
}

async function supprimerUtilisateur(id) {
  if (!confirm('Supprimer définitivement ce compte ?')) return;
  try {
    await api.deleteUser(id);
    await chargerUtilisateurs();
  } catch (err) {
    alert(err.message);
  }
}

chargerUtilisateurs();