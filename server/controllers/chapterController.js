const { Chapter, Course } = require('../models');

// POST /api/courses/:courseId/chapters  (admin)
exports.addChapter = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const cours = await Course.findById(courseId);
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });

    const { titre, contenu, videoUrl, pdfUrl, ordre } = req.body;
    if (!titre || ordre === undefined) {
      return res.status(400).json({ message: 'Titre et ordre sont obligatoires' });
    }

    const chapitre = await Chapter.create({
      cours: courseId, titre, contenu, videoUrl, pdfUrl, ordre,
    });
    res.status(201).json({ chapitre });
  } catch (err) {
    next(err);
  }
};

// PUT /api/chapters/:id  (admin)
exports.updateChapter = async (req, res, next) => {
  try {
    const chapitre = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!chapitre) return res.status(404).json({ message: 'Chapitre introuvable' });
    res.json({ chapitre });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/chapters/:id  (admin)
exports.deleteChapter = async (req, res, next) => {
  try {
    const chapitre = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapitre) return res.status(404).json({ message: 'Chapitre introuvable' });
    res.json({ message: 'Chapitre supprimé' });
  } catch (err) {
    next(err);
  }
};