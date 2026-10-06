const { Comment, Enrollment } = require('../models');

// POST /api/comments  (étudiant commente un cours)
exports.addComment = async (req, res, next) => {
  try {
    const { coursId, texte } = req.body;
    if (!coursId || !texte) {
      return res.status(400).json({ message: 'coursId et texte sont obligatoires' });
    }

    // On exige d'être inscrit pour commenter (évite le spam)
    const inscription = await Enrollment.findOne({ etudiant: req.user._id, cours: coursId });
    if (!inscription) {
      return res.status(403).json({ message: 'Vous devez être inscrit au cours pour commenter' });
    }

    const commentaire = await Comment.create({
      cours: coursId,
      auteur: req.user._id,
      texte,
    });

    const commentairePeuple = await commentaire.populate('auteur', 'nom');
    res.status(201).json({ commentaire: commentairePeuple });
  } catch (err) {
    next(err);
  }
};

// GET /api/comments/course/:coursId  (liste des commentaires d'un cours, public)
exports.getCommentsByCourse = async (req, res, next) => {
  try {
    const commentaires = await Comment.find({ cours: req.params.coursId })
      .populate('auteur', 'nom')
      .sort({ createdAt: -1 });

    res.json({ count: commentaires.length, commentaires });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id  (auteur ou admin uniquement)
exports.deleteComment = async (req, res, next) => {
  try {
    const commentaire = await Comment.findById(req.params.id);
    if (!commentaire) return res.status(404).json({ message: 'Commentaire introuvable' });

    const estAuteur = commentaire.auteur.equals(req.user._id);
    const estAdmin = req.user.role === 'admin';
    if (!estAuteur && !estAdmin) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce commentaire' });
    }

    await commentaire.deleteOne();
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    next(err);
  }
};