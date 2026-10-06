const { Course, Chapter } = require('../models');

// GET /api/courses  (catalogue public, avec recherche et filtres)
exports.getCourses = async (req, res, next) => {
  try {
    const { recherche, categorie, niveau } = req.query;
    const filtre = { publie: true };

    if (recherche) filtre.$text = { $search: recherche };
    if (categorie) filtre.categorie = categorie;
    if (niveau) filtre.niveau = niveau;

    const cours = await Course.find(filtre).sort({ createdAt: -1 });
    res.json({ count: cours.length, cours });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id  (détail d'un cours + ses chapitres)
exports.getCourseById = async (req, res, next) => {
  try {
    const cours = await Course.findById(req.params.id);
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });

    const chapitres = await Chapter.find({ cours: cours._id }).sort({ ordre: 1 });
    res.json({ cours, chapitres });
  } catch (err) {
    next(err);
  }
};

// POST /api/courses  (admin uniquement)
exports.createCourse = async (req, res, next) => {
  try {
    const { titre, description, categorie, niveau, image, enseignant } = req.body;
    if (!titre || !description || !categorie || !enseignant) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    const cours = await Course.create({ titre, description, categorie, niveau, image, enseignant });
    res.status(201).json({ cours });
  } catch (err) {
    next(err);
  }
};

// PUT /api/courses/:id  (admin uniquement)
exports.updateCourse = async (req, res, next) => {
  try {
    const cours = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });
    res.json({ cours });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/courses/:id  (admin uniquement)
exports.deleteCourse = async (req, res, next) => {
  try {
    const cours = await Course.findByIdAndDelete(req.params.id);
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });
    await Chapter.deleteMany({ cours: cours._id }); // nettoyage des chapitres liés
    res.json({ message: 'Cours supprimé' });
  } catch (err) {
    next(err);
  }
};