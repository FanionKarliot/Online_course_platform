const { User } = require('../models');

// GET /api/users  (admin uniquement — liste tous les utilisateurs)
exports.getUsers = async (req, res, next) => {
  try {
    const utilisateurs = await User.find().sort({ createdAt: -1 });
    res.json({ count: utilisateurs.length, utilisateurs });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/role  (admin uniquement — change le rôle d'un utilisateur)
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['etudiant', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide (etudiant ou admin uniquement)' });
    }

    // Empêcher un admin de se retirer lui-même ses propres droits par erreur
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'Vous ne pouvez pas retirer vos propres droits admin' });
    }

    const utilisateur = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({ utilisateur });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (admin uniquement — supprime un compte)
exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const utilisateur = await User.findByIdAndDelete(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable' });

    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
};