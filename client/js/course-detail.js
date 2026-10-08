const coursId = new URLSearchParams(window.location.search).get('id');
let inscriptionActuelle = null;
// if (!coursId) window.location.href = '/index.html';

function afficherChapitre(chapitre, estTermine) {
  return `
    <div class="flex items-center justify-between border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <i class="fa-solid ${estTermine ? 'fa-circle-check text-green-500' : 'fa-circle text-gray-300'}"></i>
        <div>
          <p class="font-medium text-gray-800">${chapitre.ordre}. ${chapitre.titre}</p>
          ${chapitre.videoUrl ? `<a href="${chapitre.videoUrl}" target="_blank" class="text-xs text-indigo-600 hover:underline"><i class="fa-solid fa-video"></i> Voir la vidéo</a>` : ''}
          ${chapitre.pdfUrl ? `<a href="${chapitre.pdfUrl}" target="_blank" class="text-xs text-indigo-600 hover:underline ml-3"><i class="fa-solid fa-file-pdf"></i> Support PDF</a>` : ''}
        </div>
      </div>
      ${
        inscriptionActuelle && !estTermine
          ? `<button onclick="terminerChapitre('${chapitre._id}')" class="text-sm bg-gray-100 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg">Marquer terminé</button>`
          : ''
      }
    </div>
  `;
}

function afficherQuiz(quiz, resultat) {
  return `
    <div class="flex items-center justify-between border border-gray-200 rounded-lg p-4">
      <div>
        <p class="font-medium text-gray-800">${quiz.titre}</p>
        <p class="text-xs text-gray-500">${quiz.questions.length} question(s) — minimum ${quiz.noteMinimale}%</p>
      </div>
      <a href="/pages/quiz.html?id=${quiz._id}"
         class="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700">
        ${resultat ? `Repasser (dernier : ${resultat.pourcentage}%)` : 'Passer le quiz'}
      </a>
    </div>
  `;
}

function afficherCommentaire(c) {
  const date = new Date(c.createdAt).toLocaleDateString('fr-FR');
  return `
    <div class="border-b border-gray-100 pb-3">
      <div class="flex items-center justify-between">
        <span class="font-medium text-gray-700 text-sm">${c.auteur?.nom || 'Utilisateur'}</span>
        <span class="text-xs text-gray-400">${date}</span>
      </div>
      <p class="text-gray-600 text-sm mt-1">${c.texte}</p>
    </div>
  `;
}

async function terminerChapitre(chapterId) {
  try {
    const { inscription } = await api.terminerChapitre(coursId, chapterId);
    inscriptionActuelle = inscription;
    await chargerPage(); // on recharge tout pour refléter la nouvelle progression
  } catch (err) {
    alert(err.message);
  }
}

async function sInscrire() {
  try {
    await api.enroll(coursId);
    await chargerPage();
  } catch (err) {
    alert(err.message);
  }
}

async function chargerPage() {
  try {
    const { cours, chapitres } = await api.getCourse(coursId);

    document.getElementById('cours-categorie').textContent = cours.categorie;
    document.getElementById('cours-titre').textContent = cours.titre;
    document.getElementById('cours-description').textContent = cours.description;
    document.getElementById('cours-enseignant').textContent = cours.enseignant;
    document.getElementById('cours-niveau').textContent = cours.niveau;

    // Récupérer mon inscription si connecté
    let resultats = [];
    if (estConnecte()) {
      try {
        const { inscription } = await api.getEnrollment(coursId);
        inscriptionActuelle = inscription;
      } catch {
        inscriptionActuelle = null;
      }
      const { resultats: mesResultats } = await api.getMesResultats();
      resultats = mesResultats;
    }

    // Affichage conditionnel : inscription / progression / certificat
    const btnInscription = document.getElementById('btn-inscription');
    const blocProgression = document.getElementById('bloc-progression');
    const btnCertificat = document.getElementById('btn-certificat');

    if (!estConnecte()) {
      btnInscription.onclick = () => (window.location.href = '/pages/login.html');
    } else if (!inscriptionActuelle) {
      btnInscription.classList.remove('hidden');
      btnInscription.onclick = sInscrire;
    } else {
      btnInscription.classList.add('hidden');
      blocProgression.classList.remove('hidden');
      document.getElementById('texte-progression').textContent = `${inscriptionActuelle.progression}%`;
      document.getElementById('barre-progression').style.width = `${inscriptionActuelle.progression}%`;

      if (inscriptionActuelle.termine) {
        btnCertificat.classList.remove('hidden');
        btnCertificat.onclick = async (e) => {
          e.preventDefault();
          try {
            const { url } = await api.getCertificat(coursId);
            window.open(url, '_blank');
          } catch (err) {
            alert(err.message);
          }
        };
      }
    }

    // Chapitres
    const chapitresTermines = inscriptionActuelle?.chapitresTermines || [];
    document.getElementById('liste-chapitres').innerHTML = chapitres
      .map((ch) => afficherChapitre(ch, chapitresTermines.includes(ch._id)))
      .join('') || '<p class="text-gray-400 text-sm">Aucun chapitre pour le moment</p>';

    // Quiz
    const { quizzes } = await api.getQuizzesByCourse(coursId);
    document.getElementById('liste-quiz').innerHTML = quizzes
      .map((q) => afficherQuiz(q, resultats.find((r) => r.quiz._id === q._id)))
      .join('') || '<p class="text-gray-400 text-sm">Aucun quiz pour le moment</p>';

    // Commentaires
    const { commentaires } = await api.getComments(coursId);
    document.getElementById('liste-commentaires').innerHTML = commentaires
      .map(afficherCommentaire)
      .join('') || '<p class="text-gray-400 text-sm">Aucun commentaire pour le moment</p>';

    // Formulaire de commentaire (seulement si inscrit)
    const formCommentaire = document.getElementById('form-commentaire');
    if (inscriptionActuelle) formCommentaire.classList.remove('hidden');

    document.getElementById('chargement').classList.add('hidden');
    document.getElementById('contenu').classList.remove('hidden');
  } catch (err) {
    // document.getElementById('chargement').innerHTML = `<p class="text-red-500">${err.message}</p>`;
    window.location.href = '/index.html';
  }
}

document.getElementById('form-commentaire').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('texte-commentaire');
  if (!input.value.trim()) return;

  try {
    await api.addComment(coursId, input.value.trim());
    input.value = '';
    await chargerPage();
  } catch (err) {
    alert(err.message);
  }
});

chargerPage();