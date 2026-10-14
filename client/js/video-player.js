// ===== Lecteur vidéo des chapitres =====
const VIDEO_PAR_DEFAUT = '/assets/video-par-defaut.mp4';

// État du lecteur, partagé avec course-detail.js
const lecteur = {
  chapitres: [],
  index: -1,          // chapitre en cours de lecture (-1 = aucun)
  termines: [],       // ids des chapitres déjà terminés
  actif: false,       // vrai si l'étudiant est inscrit
  onTerminer: null,   // fonction fournie par course-detail.js
};

// ---------- Détection du type de lien ----------

function extraireIdYoutube(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function extraireIdVimeo(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

// ---------- Création de l'élément (par le DOM, jamais par innerHTML) ----------

function creerIframe(src) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.className = 'w-full h-full';
  iframe.title = 'Vidéo du chapitre';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  return iframe;
}

function creerLecteur(url) {
  const idYoutube = extraireIdYoutube(url);
  if (idYoutube) return creerIframe(`https://www.youtube-nocookie.com/embed/${idYoutube}`);

  const idVimeo = extraireIdVimeo(url);
  if (idVimeo) return creerIframe(`https://player.vimeo.com/video/${idVimeo}`);

  // Sinon : fichier vidéo local (balise HTML5)
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.preload = 'metadata';
  video.className = 'w-full h-full';
  return video;
}

// ---------- Reprise de lecture + fin de vidéo ----------

function cleReprise(chapitreId) {
  return `video-position-${chapitreId}`;
}

function brancherEvenements(video, chapitre) {
  let derniereSauvegarde = 0;

  // Au chargement : on se replace là où l'étudiant s'était arrêté
  video.addEventListener('loadedmetadata', () => {
    try {
      const position = parseFloat(localStorage.getItem(cleReprise(chapitre._id)));
      if (position > 5 && position < video.duration - 5) video.currentTime = position;
    } catch {
      /* localStorage indisponible : on démarre simplement au début */
    }
  });

  // Pendant la lecture : on mémorise la position toutes les 3 secondes
  video.addEventListener('timeupdate', () => {
    const maintenant = Date.now();
    if (maintenant - derniereSauvegarde < 3000) return;
    derniereSauvegarde = maintenant;
    try {
      localStorage.setItem(cleReprise(chapitre._id), video.currentTime);
    } catch {
      /* ignoré */
    }
  });

  // À la fin : on efface la position et on valide le chapitre automatiquement
  video.addEventListener('ended', async () => {
    try {
      localStorage.removeItem(cleReprise(chapitre._id));
    } catch {
      /* ignoré */
    }
    if (!lecteur.termines.includes(chapitre._id) && lecteur.onTerminer) {
      await lecteur.onTerminer(chapitre._id);
    }
  });
}

// ---------- Affichage ----------

function afficherChapitreCourant(autoplay) {
  const chapitre = lecteur.chapitres[lecteur.index];
  const zone = document.getElementById('zone-video');
  zone.innerHTML = '';

  const element = creerLecteur(chapitre.videoUrl || VIDEO_PAR_DEFAUT);
  zone.appendChild(element);

  if (element.tagName === 'VIDEO') {
    brancherEvenements(element, chapitre);

    element.addEventListener('error', () => {
      zone.innerHTML =
        '<p class="text-white text-sm p-6 text-center"><i class="fa-solid fa-triangle-exclamation"></i> Vidéo introuvable. Vérifiez le lien ou le fichier.</p>';
    });

    if (autoplay) element.play().catch(() => {});
  }

  rafraichirControles();
}

// Met à jour titre, boutons et surbrillance SANS toucher à la vidéo en cours
function rafraichirControles() {
  const chapitre = lecteur.chapitres[lecteur.index];
  if (!chapitre) return;

  document.getElementById('lecteur-position').textContent =
    `Chapitre ${lecteur.index + 1} sur ${lecteur.chapitres.length}`;
  document.getElementById('lecteur-titre').textContent = `${chapitre.ordre}. ${chapitre.titre}`;
  document.getElementById('lecteur-contenu').textContent = chapitre.contenu || '';

  document.getElementById('btn-precedent').disabled = lecteur.index === 0;
  document.getElementById('btn-suivant').disabled = lecteur.index === lecteur.chapitres.length - 1;

  const termine = lecteur.termines.includes(chapitre._id);
  const btn = document.getElementById('btn-terminer-lecteur');
  btn.disabled = termine;
  btn.className =
    'px-4 py-2 rounded-lg text-sm font-medium transition ' +
    (termine
      ? 'bg-green-100 text-green-700 cursor-default'
      : 'bg-indigo-600 text-white hover:bg-indigo-700');
  btn.innerHTML = termine
    ? '<i class="fa-solid fa-circle-check"></i> Chapitre terminé'
    : '<i class="fa-solid fa-check"></i> Marquer comme terminé';

  // Surbrillance du chapitre en cours dans la liste
  document.querySelectorAll('[data-chapitre-index]').forEach((el) => {
    const actif = Number(el.dataset.chapitreIndex) === lecteur.index;
    el.classList.toggle('border-indigo-400', actif);
    el.classList.toggle('bg-indigo-50', actif);
    el.classList.toggle('border-gray-200', !actif);
  });
}

// ---------- API utilisée par course-detail.js ----------

// Appelée à chaque (re)chargement de la page du cours
function mettreAJourLecteur(chapitres, termines, estInscrit, onTerminer) {
  lecteur.chapitres = chapitres;
  lecteur.termines = termines;
  lecteur.actif = estInscrit && chapitres.length > 0;
  lecteur.onTerminer = onTerminer;

  document.getElementById('bloc-lecteur').classList.toggle('hidden', !lecteur.actif);
  document.getElementById('lecteur-verrouille')
    .classList.toggle('hidden', estInscrit || chapitres.length === 0);

  if (!lecteur.actif) {
    lecteur.index = -1;
    return;
  }

  if (lecteur.index < 0 || lecteur.index >= chapitres.length) {
    // Première ouverture : on prépare le premier chapitre non terminé (sans lancer la lecture)
    const premier = chapitres.findIndex((c) => !termines.includes(c._id));
    lecteur.index = premier === -1 ? 0 : premier;
    afficherChapitreCourant(false);
  } else {
    // Rechargement après une action : la vidéo en cours n'est pas interrompue
    rafraichirControles();
  }
}

// Appelée par les boutons « Lire » de la liste et par Précédent / Suivant
function lireChapitre(index) {
  if (!lecteur.actif || index < 0 || index >= lecteur.chapitres.length) return;
  lecteur.index = index;
  afficherChapitreCourant(true);
  document.getElementById('bloc-lecteur').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('btn-precedent').addEventListener('click', () => lireChapitre(lecteur.index - 1));
document.getElementById('btn-suivant').addEventListener('click', () => lireChapitre(lecteur.index + 1));
document.getElementById('btn-terminer-lecteur').addEventListener('click', async () => {
  const chapitre = lecteur.chapitres[lecteur.index];
  if (chapitre && lecteur.onTerminer) await lecteur.onTerminer(chapitre._id);
});