let coursEnEdition = null;
let coursGestionActuel = null;

function carteCoursAdmin(cours) {
  return `
    <div class="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
      <div>
        <p class="font-medium text-gray-800">${cours.titre}</p>
        <p class="text-xs text-gray-500">${cours.categorie} — ${cours.niveau} — ${cours.enseignant}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="ouvrirGestion('${cours._id}')" class="text-sm bg-gray-100 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">
          <i class="fa-solid fa-gear"></i> Gérer
        </button>
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
  return cours;
}

// --- Création / édition de cours ---

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
  if (!confirm('Supprimer ce cours et tous ses chapitres ?')) return;
//   await api.apiFetchDelete?.(); // voir note ci-dessous
  await fetch(`/api/courses/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  await chargerCoursAdmin();
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

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
  if (id) {
    await fetch(`/api/courses/${id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
  } else {
    await fetch('/api/courses', { method: 'POST', headers, body: JSON.stringify(body) });
  }

  document.getElementById('modale-cours').classList.add('hidden');
  await chargerCoursAdmin();
});

// --- Gestion chapitres + quiz ---

async function ouvrirGestion(coursId) {
  const { cours, chapitres } = await api.getCourse(coursId);
  coursGestionActuel = cours;

  document.getElementById('gestion-titre').textContent = `Gérer : ${cours.titre}`;
  document.getElementById('gestion-chapitres').innerHTML = chapitres
    .map((ch) => `<div class="text-sm bg-gray-50 rounded-lg px-3 py-2 flex justify-between">
        <span>${ch.ordre}. ${ch.titre}</span>
      </div>`)
    .join('') || '<p class="text-xs text-gray-400">Aucun chapitre</p>';

  const { quizzes } = await api.getQuizzesByCourse(coursId);
  document.getElementById('gestion-quiz').innerHTML = quizzes
    .map((q) => `<div class="text-sm bg-gray-50 rounded-lg px-3 py-2">${q.titre} (${q.questions.length} questions)</div>`)
    .join('') || '<p class="text-xs text-gray-400">Aucun quiz</p>';

  document.getElementById('modale-gestion').dataset.chapitreOrdre = chapitres.length + 1;
  document.getElementById('modale-gestion').classList.remove('hidden');
}

document.getElementById('btn-fermer-gestion').addEventListener('click', () => {
  document.getElementById('modale-gestion').classList.add('hidden');
});

document.getElementById('form-chapitre').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titre = document.getElementById('input-chapitre-titre').value;
  const videoUrl = document.getElementById('input-chapitre-video').value;
  const ordre = parseInt(document.getElementById('modale-gestion').dataset.chapitreOrdre);

  await fetch(`/api/courses/${coursGestionActuel._id}/chapters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ titre, videoUrl, ordre }),
  });

  document.getElementById('input-chapitre-titre').value = '';
  document.getElementById('input-chapitre-video').value = '';
  await ouvrirGestion(coursGestionActuel._id); // on rouvre pour rafraîchir la liste
});

document.getElementById('btn-nouveau-quiz').addEventListener('click', async () => {
  const titre = prompt('Titre du quiz :');
  if (!titre) return;

  // Saisie rapide de 3 questions via prompt() — suffisant pour un examen, pas pour de la prod
  const questions = [];
  for (let i = 1; i <= 3; i++) {
    const enonce = prompt(`Question ${i} — énoncé :`);
    if (!enonce) break;
    const optionsBrutes = prompt(`Question ${i} — options séparées par des virgules :`);
    const options = optionsBrutes.split(',').map((o) => o.trim());
    const bonneReponse = parseInt(prompt(`Question ${i} — index de la bonne réponse (0 à ${options.length - 1}) :`));
    questions.push({ enonce, options, bonneReponse });
  }

  if (questions.length === 0) return;

  await fetch('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ cours: coursGestionActuel._id, titre, noteMinimale: 50, questions }),
  });

  await ouvrirGestion(coursGestionActuel._id);
});

chargerCoursAdmin();