let tousLesCours = [];

function carteCoursHtml(cours) {
  return `
    <a href="/pages/course-detail.html?id=${cours._id}"
       class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden block">
      <div class="h-40 bg-indigo-100 flex items-center justify-center">
        <i class="fa-solid fa-book-open text-4xl text-indigo-400"></i>
      </div>
      <div class="p-4">
        <span class="text-xs font-medium text-indigo-600 uppercase">${cours.categorie}</span>
        <h3 class="font-bold text-gray-800 mt-1 mb-2">${cours.titre}</h3>
        <p class="text-sm text-gray-500 line-clamp-2">${cours.description}</p>
        <div class="flex items-center justify-between mt-3">
          <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${cours.niveau}</span>
          <span class="text-xs text-gray-400"><i class="fa-solid fa-chalkboard-user"></i> ${cours.enseignant}</span>
        </div>
      </div>
    </a>
  `;
}

function afficherCours(liste) {
  const conteneur = document.getElementById('liste-cours');

  if (liste.length === 0) {
    conteneur.innerHTML = `
      <p class="col-span-full text-center text-gray-400 py-10">
        <i class="fa-solid fa-circle-info"></i> Aucun cours trouvé
      </p>`;
    return;
  }

  conteneur.innerHTML = liste.map(carteCoursHtml).join('');
}

function remplirFiltreCategories(liste) {
  const select = document.getElementById('filtre-categorie');
  const categories = [...new Set(liste.map((c) => c.categorie))];
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

async function chargerCours() {
  const conteneur = document.getElementById('liste-cours');
  conteneur.innerHTML = `<div class="col-span-full flex justify-center py-10"><div class="spinner"></div></div>`;

  try {
    const { cours } = await api.getCourses();
    tousLesCours = cours;
    afficherCours(cours);
    remplirFiltreCategories(cours);
  } catch (err) {
    conteneur.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">${err.message}</p>`;
  }
}

function appliquerFiltres() {
  const recherche = document.getElementById('recherche').value.toLowerCase();
  const categorie = document.getElementById('filtre-categorie').value;
  const niveau = document.getElementById('filtre-niveau').value;

  const resultat = tousLesCours.filter((c) => {
    const correspondRecherche =
      !recherche ||
      c.titre.toLowerCase().includes(recherche) ||
      c.description.toLowerCase().includes(recherche);
    const correspondCategorie = !categorie || c.categorie === categorie;
    const correspondNiveau = !niveau || c.niveau === niveau;
    return correspondRecherche && correspondCategorie && correspondNiveau;
  });

  afficherCours(resultat);
}

document.getElementById('recherche').addEventListener('input', appliquerFiltres);
document.getElementById('filtre-categorie').addEventListener('change', appliquerFiltres);
document.getElementById('filtre-niveau').addEventListener('change', appliquerFiltres);

chargerCours();