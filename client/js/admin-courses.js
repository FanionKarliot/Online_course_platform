let coursEnEdition = null;

function carteCoursAdmin(cours) {
  return `
    <div class="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
      <div>
        <p class="font-medium text-gray-800">${cours.titre}</p>
        <p class="text-xs text-gray-500">${cours.categorie} — ${cours.niveau} — ${cours.enseignant}</p>
      </div>
      <div class="flex gap-2">
        <a href="/pages/admin-course-manage.html?id=${cours._id}"
           class="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">
          <i class="fa-solid fa-gear"></i> Gérer
        </a>
        <button onclick="editerCours('${cours._id}')" class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button onclick="supprimerCours('${cours._id}')" class="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

async function chargerCoursAdmin() {
  const { cours } = await api.getCourses();
  document.getElementById('liste-cours-admin').innerHTML = cours.map(carteCoursAdmin).join('');
}

function ouvrirModaleCours(cours = null) {
  coursEnEdition = cours;
  document.getElementById('modale-titre').textContent = cours ? 'Modifier le cours' : 'Nouveau cours';
  document.getElementById('cours-id').value = cours?._id || '';
  document.getElementById('input-titre').value = cours?.titre || '';
  document.getElementById('input-description').value = cours?.description || '';
  document.getElementById('input-categorie').value = cours?.categorie || '';
  document.getElementById('input-niveau').value = cours?.niveau || 'debutant';
  document.getElementById('input-enseignant').value = cours?.enseignant || '';
  document.getElementById('modale-cours').classList.remove('hidden');
}

async function editerCours(id) {
  const { cours } = await api.getCourse(id);
  ouvrirModaleCours(cours);
}

async function supprimerCours(id) {
  if (!confirm('Supprimer ce cours et toutes ses données associées (chapitres, inscriptions, quiz) ?')) return;
  try {
    await api.deleteCourse(id);
    await chargerCoursAdmin();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('btn-nouveau-cours').addEventListener('click', () => ouvrirModaleCours());
document.getElementById('btn-annuler').addEventListener('click', () => {
  document.getElementById('modale-cours').classList.add('hidden');
});

document.getElementById('form-cours').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    titre: document.getElementById('input-titre').value,
    description: document.getElementById('input-description').value,
    categorie: document.getElementById('input-categorie').value,
    niveau: document.getElementById('input-niveau').value,
    enseignant: document.getElementById('input-enseignant').value,
  };
  const id = document.getElementById('cours-id').value;

  try {
    if (id) await api.updateCourse(id, body);
    else await api.createCourse(body);

    document.getElementById('modale-cours').classList.add('hidden');
    await chargerCoursAdmin();
  } catch (err) {
    alert(err.message);
  }
});

chargerCoursAdmin();