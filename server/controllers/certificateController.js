const { Enrollment, Course, User, Notification } = require('../models');
const { genererCertificat } = require('../services/certificatService');

// GET /api/certificates/:coursId  (génère ou renvoie le certificat de l'étudiant)
exports.getCertificat = async (req, res, next) => {
  try {
    const inscription = await Enrollment.findOne({
      etudiant: req.user._id,
      cours: req.params.coursId,
    });

    if (!inscription) return res.status(404).json({ message: "Vous n'êtes pas inscrit à ce cours" });
    if (!inscription.termine) {
      return res.status(400).json({ message: 'Cours non terminé, certificat indisponible' });
    }

    const cours = await Course.findById(req.params.coursId);
    const url = await genererCertificat({
      nomEtudiant: req.user.nom,
      titreCours: cours.titre,
      dateFin: inscription.dateFin,
      enrollmentId: inscription._id,
    });

    await Notification.create({
      utilisateur: req.user._id,
      message: `Votre certificat pour "${cours.titre}" est prêt`,
      type: 'certificat',
    });

    res.json({ url });
  } catch (err) {
    next(err);
  }
};