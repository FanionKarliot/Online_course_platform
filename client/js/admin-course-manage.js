const coursId = new URLSearchParams(window.location.search).get('id');
if (!coursId) window.location.href = '/pages/admin-courses.html';

let compteurQuestions = 0;

// ================= CHAPITRES =================

function ligneChapitre(chapitre) {
  return `
    <div class="flex items-center justify-between border border-gray-200 rounded-lg p-3">
      <span class="text-sm text-gray-700">${chapitre.ordre}. ${chapitre.titre}</span>
      <div class="flex gap-2">
        <button onclick='ouvrirFormChapitre(${JSON.stringify(chapitre)})' class="text-xs text-gray-500 hover:text-indigo-600">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button onclick="supprimerChapitre('${chapitre._id}')" class="text-xs text-gray-500 hover:text-red-600">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

function ouvrirFormChapitre(chapitre = null) {
  document.getElementById('chapitre-id').value = chapitre?._id || '';
  document.getElementById('chapitre-titre').value = chapitre?.titre || '';
  document.getElementById('chapitre-ordre').value = chapitre?.ordre || document.querySelectorAll('#liste-chapitres > div').length + 1;
  document.getElementById('chapitre-video').value = chapitre?.videoUrl || '';
  document.getElementById('chapitre-contenu').value = chapitre?.contenu || '';
  document.getElementById('form-chapitre').classList.remove('hidden');
}

document.getElementById('btn-ajouter-chapitre').addEventListener('click', () => ouvrirFormChapitre());
document.getElementById('btn-annuler-chapitre').addEventListener('click', () => {
  document.getElementById('form-chapitre').reset();
  document.getElementById('form-chapitre').classList.add('hidden');
});

document.getElementById('form-chapitre').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('chapitre-id').value;
  const body = {
    titre: document.getElementById('chapitre-titre').value,
    ordre: parseInt(document.getElementById('chapitre-ordre').value),
    videoUrl: document.getElementById('chapitre-video').value,
    contenu: document.getElementById('chapitre-contenu').value,
  };

  try {
    if (id) await api.updateChapter(id, body);
    else await api.addChapter(coursId, body);

    document.getElementById('form-chapitre').reset();
    document.getElementById('form-chapitre').classList.add('hidden');
    await chargerChapitres();
  } catch (err) {
    alert(err.message);
  }
});

async function supprimerChapitre(id) {
  if (!confirm('Supprimer ce chapitre ?')) return;
  try {
    await api.deleteChapter(id);
    await chargerChapitres();
  } catch (err) {
    alert(err.message);
  }
}

async function chargerChapitres() {
  const { chapitres } = await api.getCourse(coursId);
  document.getElementById('liste-chapitres').innerHTML =
    chapitres.map(ligneChapitre).join('') || '<p class="text-sm text-gray-400">Aucun chapitre</p>';
}

// ================= QUIZ =================

function ligneQuiz(quiz) {
  return `
    <div class="flex items-center justify-between border border-gray-200 rounded-lg p-3">
      <span class="text-sm text-gray-700">${quiz.titre} (${quiz.questions.length} question(s))</span>
      <div class="flex gap-2">
        <button onclick="ouvrirFormQuiz('${quiz._id}')" class="text-xs text-gray-500 hover:text-indigo-600">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button onclick="supprimerQuiz('${quiz._id}')" class="text-xs text-gray-500 hover:text-red-600">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

function blocQuestion(id, question = null) {
  const options = question?.options || ['', ''];
  const bonneReponse = question?.bonneReponse ?? 0;

  const optionsHtml = options
    .map(
      (valeur, i) => `
        <div class="flex items-center gap-2" data-option>
          <input type="radio" name="bonne-${id}" value="${i}" ${i === bonneReponse ? 'checked' : ''} class="accent-indigo-600" title="Bonne réponse" />
          <input type="text" value="${valeur}" placeholder="Option ${i + 1}" required
            class="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm option-texte" />
          <button type="button" onclick="retirerOption(this)" class="text-gray-400 hover:text-red-500 text-xs">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `
    )
    .join('');

  return `
    <div class="border border-gray-200 rounded-lg p-4" data-question>
      <div class="flex items-start justify-between mb-2">
        <input type="text" value="${question?.enonce || ''}" placeholder="Énoncé de la question" required
          class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm question-enonce" />
        <button type="button" onclick="retirerQuestion(this)" class="ml-2 text-gray-400 hover:text-red-500">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      <div class="space-y-2 pl-2" data-options>${optionsHtml}</div>
      <button type="button" onclick="ajouterOption(this, ${id})" class="text-xs text-indigo-600 hover:underline mt-2">
        <i class="fa-solid fa-plus"></i> Ajouter une option
      </button>
      <p class="text-xs text-gray-400 mt-1">Cochez la bonne réponse à gauche</p>
    </div>
  `;
}

function ajouterQuestion(question = null) {
  compteurQuestions++;
  const div = document.createElement('div');
  div.innerHTML = blocQuestion(compteurQuestions, question);
  document.getElementById('liste-questions').appendChild(div.firstElementChild);
}

function retirerQuestion(bouton) {
  bouton.closest('[data-question]').remove();
}

function ajouterOption(bouton, questionId) {
  const conteneurOptions = bouton.closest('[data-question]').querySelector('[data-options]');
  const index = conteneurOptions.children.length;
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="flex items-center gap-2" data-option>
      <input type="radio" name="bonne-${questionId}" value="${index}" class="accent-indigo-600" />
      <input type="text" placeholder="Option ${index + 1}" required
        class="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm option-texte" />
      <button type="button" onclick="retirerOption(this)" class="text-gray-400 hover:text-red-500 text-xs">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `;
  conteneurOptions.appendChild(div.firstElementChild);
}

function retirerOption(bouton) {
  const conteneurOptions = bouton.closest('[data-options]');
  if (conteneurOptions.children.length <= 2) {
    alert('Une question doit avoir au moins 2 options');
    return;
  }
  bouton.closest('[data-option]').remove();
  // Renumérote les valeurs des radios pour rester cohérent avec les index
  [...conteneurOptions.children].forEach((div, i) => {
    div.querySelector('input[type="radio"]').value = i;
  });
}

function ouvrirFormQuizVide() {
  document.getElementById('quiz-id').value = '';
  document.getElementById('quiz-titre').value = '';
  document.getElementById('quiz-note-min').value = 50;
  document.getElementById('liste-questions').innerHTML = '';
  ajouterQuestion(); // on démarre avec une question vide
  document.getElementById('form-quiz').classList.remove('hidden');
}

async function ouvrirFormQuiz(id) {
  const { quiz } = await api.getQuizAdmin(id);
  document.getElementById('quiz-id').value = quiz._id;
  document.getElementById('quiz-titre').value = quiz.titre;
  document.getElementById('quiz-note-min').value = quiz.noteMinimale;
  document.getElementById('liste-questions').innerHTML = '';
  quiz.questions.forEach((q) => ajouterQuestion(q));
  document.getElementById('form-quiz').classList.remove('hidden');
}

document.getElementById('btn-ajouter-quiz').addEventListener('click', ouvrirFormQuizVide);
document.getElementById('btn-ajouter-question').addEventListener('click', () => ajouterQuestion());
document.getElementById('btn-annuler-quiz').addEventListener('click', () => {
  document.getElementById('form-quiz').classList.add('hidden');
});

document.getElementById('form-quiz').addEventListener('submit', async (e) => {
  e.preventDefault();

  const questions = [...document.querySelectorAll('[data-question]')].map((divQuestion) => {
    const enonce = divQuestion.querySelector('.question-enonce').value;
    const options = [...divQuestion.querySelectorAll('.option-texte')].map((input) => input.value);
    const radioCoche = divQuestion.querySelector('input[type="radio"]:checked');
    const bonneReponse = radioCoche ? parseInt(radioCoche.value) : 0;
    return { enonce, options, bonneReponse };
  });

  if (questions.length === 0) {
    alert('Ajoutez au moins une question');
    return;
  }

  const id = document.getElementById('quiz-id').value;
  const body = {
    cours: coursId,
    titre: document.getElementById('quiz-titre').value,
    noteMinimale: parseInt(document.getElementById('quiz-note-min').value),
    questions,
  };

  try {
    if (id) await api.updateQuiz(id, body);
    else await api.createQuiz(body);

    document.getElementById('form-quiz').classList.add('hidden');
    await chargerQuiz();
  } catch (err) {
    alert(err.message);
  }
});

async function supprimerQuiz(id) {
  if (!confirm('Supprimer ce quiz et tous les résultats associés ?')) return;
  try {
    await api.deleteQuiz(id);
    await chargerQuiz();
  } catch (err) {
    alert(err.message);
  }
}

async function chargerQuiz() {
  const { quizzes } = await api.getQuizzesByCourse(coursId);
  document.getElementById('liste-quiz').innerHTML =
    quizzes.map(ligneQuiz).join('') || '<p class="text-sm text-gray-400">Aucun quiz</p>';
}

// ================= INITIALISATION =================

async function init() {
  try {
    const { cours } = await api.getCourse(coursId);
    document.getElementById('titre-cours').textContent = `Gérer : ${cours.titre}`;

    await chargerChapitres();
    await chargerQuiz();

    document.getElementById('chargement').classList.add('hidden');
    document.getElementById('contenu').classList.remove('hidden');
  } catch (err) {
    window.location.href = '/pages/admin-courses.html';
  }
}

init();