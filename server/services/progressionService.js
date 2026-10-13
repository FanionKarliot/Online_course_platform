const { Chapter, Enrollment } = require('../models');

// Recalcule la progression d'une inscription à partir des chapitres terminés
async function recalculerProgression(enrollmentId) {
  const inscription = await Enrollment.findById(enrollmentId);
  if (!inscription) return null;

  const totalChapitres = await Chapter.countDocuments({ cours: inscription.cours });
  const nbTermines = inscription.chapitresTermines.length;

  const progression = totalChapitres === 0 ? 0 : Math.round((nbTermines / totalChapitres) * 100);
  const termine = progression === 100;

  inscription.progression = progression;
  inscription.termine = termine;
  if (termine && !inscription.dateFin) inscription.dateFin = new Date();

  await inscription.save();
  return inscription;
}

module.exports = { recalculerProgression };