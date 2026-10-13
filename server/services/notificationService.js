const { User, Notification } = require('../models');

/**
 * Envoie une notification à tous les administrateurs.
 * `exclure` : id d'un admin à ne pas notifier (ex. celui qui a déclenché l'action).
 * Les erreurs sont absorbées : une notification ratée ne doit jamais
 * faire échouer l'action principale (inscription, commentaire...).
 */
async function notifierAdmins({ message, lien = '', exclure = null }) {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    const cibles = admins.filter((a) => !exclure || !a._id.equals(exclure));
    if (cibles.length === 0) return;

    await Notification.insertMany(
      cibles.map((a) => ({ utilisateur: a._id, message, type: 'admin', lien }))
    );
  } catch (err) {
    console.error('[notifierAdmins]', err.message);
  }
}

module.exports = { notifierAdmins };