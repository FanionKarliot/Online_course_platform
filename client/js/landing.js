function carteCoursUne(cours) {
  return `
    <a href="/pages/course-detail.html?id=${cours._id}"
       class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden block">
      <div class="h-36 bg-indigo-100 flex items-center justify-center">
        <i class="fa-solid fa-book-open text-4xl text-indigo-400"></i>
      </div>
      <div class="p-4">
        <span class="text-xs font-medium text-indigo-600 uppercase">${cours.categorie}</span>
        <h3 class="font-bold text-gray-800 mt-1 mb-2">${cours.titre}</h3>
        <p class="text-sm text-gray-500 line-clamp-2">${cours.description}</p>
      </div>
    </a>
  `;
}

// Adapte les boutons selon que le visiteur est connecté ou non
function adapterBoutons() {
  if (!estConnecte()) return;

  const heroBtn = document.getElementById('hero-cta-secondaire');
  heroBtn.href = '/pages/dashboard.html';
  heroBtn.innerHTML = '<i class="fa-solid fa-gauge"></i> Mon tableau de bord';

  const ctaFinal = document.getElementById('cta-final');
  ctaFinal.href = '/pages/courses.html';
  ctaFinal.textContent = 'Parcourir les cours';
}

async function chargerLanding() {
  adapterBoutons();

  try {
    const { cours } = await api.getCourses();

    document.getElementById('chiffre-cours').textContent = cours.length;
    document.getElementById('chiffre-categories').textContent =
      new Set(cours.map((c) => c.categorie)).size;

    document.getElementById('cours-une').innerHTML =
      cours.slice(0, 3).map(carteCoursUne).join('') ||
      '<p class="col-span-full text-center text-gray-400">Aucun cours pour le moment</p>';
  } catch (err) {
    console.error(err);
    document.getElementById('cours-une').innerHTML =
      '<p class="col-span-full text-center text-red-500">Impossible de charger les cours</p>';
  }
}

chargerLanding();