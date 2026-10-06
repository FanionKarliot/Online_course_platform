const quizId = new URLSearchParams(window.location.search).get('id');
let quizActuel = null;

function afficherQuestion(question, index) {
  const optionsHtml = question.options
    .map(
      (option, i) => `
        <label class="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-indigo-50 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
          <input type="radio" name="question-${index}" value="${i}" required class="accent-indigo-600" />
          <span class="text-gray-700">${option}</span>
        </label>
      `
    )
    .join('');

  return `
    <fieldset class="bg-white rounded-xl shadow-sm p-5">
      <legend class="font-medium text-gray-800 mb-3">${index + 1}. ${question.enonce}</legend>
      <div class="space-y-2">${optionsHtml}</div>
    </fieldset>
  `;
}

async function chargerQuiz() {
  try {
    const { quiz } = await api.getQuiz(quizId);
    quizActuel = quiz;

    document.getElementById('quiz-titre').textContent = quiz.titre;
    document.getElementById('quiz-info').textContent = `${quiz.questions.length} question(s) — ${quiz.noteMinimale}% requis pour réussir`;
    document.getElementById('form-quiz').innerHTML = quiz.questions.map(afficherQuestion).join('');

    document.getElementById('chargement').classList.add('hidden');
    document.getElementById('bloc-quiz').classList.remove('hidden');
  } catch (err) {
    document.getElementById('chargement').innerHTML = `<p class="text-red-500">${err.message}</p>`;
  }
}

function afficherResultat(resultat, correction) {
  const carte = document.getElementById('carte-resultat');
  const reussi = resultat.reussi;

  carte.className = `rounded-xl p-6 text-center mb-6 ${reussi ? 'bg-green-50' : 'bg-red-50'}`;
  carte.innerHTML = `
    <i class="fa-solid ${reussi ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-500'} text-5xl mb-3"></i>
    <p class="text-3xl font-bold ${reussi ? 'text-green-600' : 'text-red-600'}">${resultat.pourcentage}%</p>
    <p class="text-gray-600 mt-1">${resultat.score} / ${resultat.total} bonnes réponses</p>
    <p class="font-medium mt-2 ${reussi ? 'text-green-700' : 'text-red-700'}">
      ${reussi ? 'Quiz réussi !' : 'Quiz non validé, vous pouvez réessayer.'}
    </p>
  `;

  document.getElementById('liste-correction').innerHTML = correction
    .map(
      (c, i) => `
        <div class="bg-white rounded-lg p-4 border-l-4 ${c.correcte ? 'border-green-500' : 'border-red-500'}">
          <p class="font-medium text-gray-800">${i + 1}. ${c.enonce}</p>
          <p class="text-sm mt-1 ${c.correcte ? 'text-green-600' : 'text-red-600'}">
            <i class="fa-solid ${c.correcte ? 'fa-check' : 'fa-xmark'}"></i>
            Votre réponse : ${quizActuel.questions[i].options[c.reponseDonnee]}
          </p>
          ${
            !c.correcte
              ? `<p class="text-sm text-gray-500 mt-1"><i class="fa-solid fa-lightbulb"></i> Bonne réponse : ${quizActuel.questions[i].options[c.bonneReponse]}</p>`
              : ''
          }
        </div>
      `
    )
    .join('');

  document.getElementById('retour-cours').href = `/pages/course-detail.html?id=${quizActuel.cours}`;

  document.getElementById('bloc-quiz').classList.add('hidden');
  document.getElementById('bloc-resultat').classList.remove('hidden');
}

document.getElementById('form-quiz').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-soumettre');

  const reponses = quizActuel.questions.map((_, index) => {
    const champ = document.querySelector(`input[name="question-${index}"]:checked`);
    return champ ? parseInt(champ.value) : null;
  });

  if (reponses.includes(null)) {
    alert('Veuillez répondre à toutes les questions');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Correction en cours...';

  try {
    const { resultat, correction } = await api.soumettreQuiz(quizId, reponses);
    afficherResultat(resultat, correction);
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Soumettre mes réponses';
  }
});

chargerQuiz();