const { Enrollment, Course, Chapter, Notification } = require('../models');
const { recalculerProgression } = require('../services/progressionService');

// POST /api/enrollments  (étudiant s'inscrit à un cours)
exports.enroll = async (req, res, next) => {
  try {
    const { coursId } = req.body;
    if (!coursId) return res.status(400).json({ message: 'coursId est obligatoire' });

    const cours = await Course.findById(coursId);
    if (!cours) return res.status(404).json({ message: 'Cours introuvable' });

    const dejaInscrit = await Enrollment.findOne({ etudiant: req.user._id, cours: coursId });
    if (dejaInscrit) {
      return res.status(400).json({ message: 'Déjà inscrit à ce cours' });
    }

    const inscription = await Enrollment.create({ etudiant: req.user._id, cours: coursId });

    await Notification.create({
      utilisateur: req.user._id,
      message: `Vous êtes inscrit au cours "${cours.titre}"`,
      type: 'info',
    });

    res.status(201).json({ inscription });
  } catch (err) {
    next(err);
  }
};

// GET /api/enrollments/me  (historique des cours de l'étudiant connecté)
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const inscriptions = await Enrollment.find({ etudiant: req.user._id })
      .populate('cours', 'titre categorie niveau image')
      .sort({ createdAt: -1 });

    res.json({ count: inscriptions.length, inscriptions });
  } catch (err) {
    next(err);
  }
};

// GET /api/enrollments/:coursId  (détail de MA progression sur un cours)
exports.getEnrollmentForCourse = async (req, res, next) => {
  try {
    const inscription = await Enrollment.findOne({
      etudiant: req.user._id,
      cours: req.params.coursId,
    });
    if (!inscription) return res.status(404).json({ message: "Vous n'êtes pas inscrit à ce cours" });

    res.json({ inscription });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/enrollments/:coursId/chapters/:chapterId/terminer
exports.marquerChapitreTermine = async (req, res, next) => {
  try {
    const { coursId, chapterId } = req.params;

    const chapitre = await Chapter.findOne({ _id: chapterId, cours: coursId });
    if (!chapitre) return res.status(404).json({ message: 'Chapitre introuvable dans ce cours' });

    const inscription = await Enrollment.findOne({ etudiant: req.user._id, cours: coursId });
    if (!inscription) return res.status(404).json({ message: "Vous n'êtes pas inscrit à ce cours" });

    const dejaFait = inscription.chapitresTermines.some((id) => id.equals(chapterId));
    if (!dejaFait) {
      inscription.chapitresTermines.push(chapterId);
      await inscription.save();
    }

    const miseAJour = await recalculerProgression(inscription._id);

    if (miseAJour.termine) {
      await Notification.create({
        utilisateur: req.user._id,
        message: `Félicitations, vous avez terminé le cours !`,
        type: 'succes',
      });
    }

    res.json({ inscription: miseAJour });
  } catch (err) {
    next(err);
  }
};