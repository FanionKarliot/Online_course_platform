function carteInscription(inscription) {
  return `
    <a href="/pages/course-detail.html?id=${inscription.cours._id}"
       class="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
      <div class="flex-1">
        <p class="font-medium text-gray-800">${inscription.cours.titre}</p>
        <p class="text-xs text-gray-500">${inscription.cours.categorie} — ${inscription.cours.niveau}</p>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-xs">
          <div class="bg-indigo-600 h-2 rounded-full" style="width: ${inscription.progression}%"></div>
        </div>
      </div>
      <div class="text-right ml-4">
        ${
          inscription.termine
            ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"><i class="fa-solid fa-check"></i> Terminé</span>'
            : `<span class="text-xs text-gray-500">${inscription.progression}%</span>`
        }
      </div>
    </a>
  `;
}

function carteResultat(resultat) {
  const date = new Date(resultat.createdAt).toLocaleDateString('fr-FR');
  return `
    <div class="flex items-center justify-between bg-white rounded-xl shadow-sm p-4">
      <div>
        <p class="font-medium text-gray-800">${resultat.quiz.titre}</p>
        <p class="text-xs text-gray-500">${resultat.cours.titre} — ${date}</p>
      </div>
      <span class="text-sm font-bold px-3 py-1 rounded-full ${
        resultat.reussi ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }">
        ${resultat.pourcentage}%
      </span>
    </div>
  `;
}

function carteNotification(notif) {
  const date = new Date(notif.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const icones = { info: 'fa-circle-info text-blue-500', succes: 'fa-circle-check text-green-500',
    quiz: 'fa-circle-question text-amber-500', certificat: 'fa-certificate text-purple-500' };

  return `
    <div class="flex items-start gap-3 bg-white rounded-xl shadow-sm p-4 ${notif.lue ? 'opacity-60' : ''}">
      <i class="fa-solid ${icones[notif.type] || icones.info} mt-1"></i>
      <div class="flex-1">
        <p class="text-sm text-gray-700">${notif.message}</p>
        <p class="text-xs text-gray-400 mt-1">${date}</p>
      </div>
      ${!notif.lue ? '<span class="w-2 h-2 bg-indigo-500 rounded-full mt-1"></span>' : ''}
    </div>
  `;
}

async function chargerDashboard() {
  try {
    const [{ inscriptions }, { resultats }, { notifications }] = await Promise.all([
      api.getMyEnrollments(),
      api.getMesResultats(),
      api.getNotifications(),
    ]);

    // Statistiques
    const termines = inscriptions.filter((i) => i.termine).length;
    const moyenne = resultats.length
      ? Math.round(resultats.reduce((somme, r) => somme + r.pourcentage, 0) / resultats.length)
      : 0;

    document.getElementById('stat-inscrits').textContent = inscriptions.length;
    document.getElementById('stat-termines').textContent = termines;
    document.getElementById('stat-quiz').textContent = resultats.length;
    document.getElementById('stat-moyenne').textContent = `${moyenne}%`;

    // Contenu des onglets
    document.getElementById('onglet-cours').innerHTML =
      inscriptions.map(carteInscription).join('') ||
      '<p class="text-gray-400 text-center py-8">Aucun cours suivi pour le moment</p>';

    document.getElementById('onglet-resultats').innerHTML =
      resultats.map(carteResultat).join('') ||
      '<p class="text-gray-400 text-center py-8">Aucun quiz passé pour le moment</p>';

    document.getElementById('onglet-notifications').innerHTML =
      notifications.map(carteNotification).join('') ||
      '<p class="text-gray-400 text-center py-8">Aucune notification</p>';

    // Marquer tout comme lu en arrivant sur l'onglet notifications
    document.querySelector('[data-onglet="notifications"]').addEventListener('click', async () => {
      if (notifications.some((n) => !n.lue)) {
        await api.markAllRead();
        document.getElementById('badge-notif')?.classList.add('hidden');
      }
    }, { once: true });
  } catch (err) {
    console.error(err);
  }
}

// Gestion des onglets
document.querySelectorAll('.onglet-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.onglet-btn').forEach((b) => {
      b.classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
      b.classList.add('text-gray-500');
    });
    btn.classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
    btn.classList.remove('text-gray-500');

    document.querySelectorAll('.onglet-contenu').forEach((c) => c.classList.add('hidden'));
    document.getElementById(`onglet-${btn.dataset.onglet}`).classList.remove('hidden');
  });
});

chargerDashboard();