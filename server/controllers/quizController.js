const { Quiz, Result, Enrollment, Notification } = require('../models');

// POST /api/quizzes  (admin crée un quiz pour un cours)
exports.createQuiz = async (req, res, next) => {
  try {
    const { cours, chapitre, titre, noteMinimale, questions } = req.body;

    if (!cours || !titre || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'cours, titre et au moins une question sont obligatoires' });
    }

    for (const q of questions) {
      if (!q.enonce || !q.options || q.options.length < 2 || q.bonneReponse === undefined) {
        return res.status(400).json({ message: 'Chaque question doit avoir un énoncé, au moins 2 options et une bonne réponse' });
      }
    }

    const quiz = await Quiz.create({ cours, chapitre, titre, noteMinimale, questions });
    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/course/:coursId  (liste des quiz d'un cours, SANS les bonnes réponses)
exports.getQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ cours: req.params.coursId }).select(
      '-questions.bonneReponse'
    );
    res.json({ count: quizzes.length, quizzes });
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/:id  (un quiz pour le passer, SANS les bonnes réponses)
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-questions.bonneReponse');
    if (!quiz) return res.status(404).json({ message: 'Quiz introuvable' });
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
};

// POST /api/quizzes/:id/soumettre  (étudiant soumet ses réponses)
exports.soumettreQuiz = async (req, res, next) => {
  try {
    const { reponses } = req.body; // tableau d'index, ex: [1, 0, 2, 3]

    // On recharge le quiz AVEC les bonnes réponses, côté serveur uniquement
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz introuvable' });

    if (!Array.isArray(reponses) || reponses.length !== quiz.questions.length) {
      return res.status(400).json({ message: `Il faut ${quiz.questions.length} réponse(s)` });
    }

    // Vérifier que l'étudiant est bien inscrit au cours
    const inscription = await Enrollment.findOne({ etudiant: req.user._id, cours: quiz.cours });
    if (!inscription) {
      return res.status(403).json({ message: "Vous devez être inscrit au cours pour passer ce quiz" });
    }

    // Correction automatique
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (reponses[i] === q.bonneReponse) score += 1;
    });

    const total = quiz.questions.length;
    const pourcentage = Math.round((score / total) * 100);
    const reussi = pourcentage >= quiz.noteMinimale;

    const resultat = await Result.create({
      etudiant: req.user._id,
      quiz: quiz._id,
      cours: quiz.cours,
      score,
      total,
      pourcentage,
      reussi,
      reponses,
    });

    await Notification.create({
      utilisateur: req.user._id,
      message: reussi
        ? `Quiz "${quiz.titre}" réussi avec ${pourcentage}% !`
        : `Quiz "${quiz.titre}" : ${pourcentage}%, non validé (minimum ${quiz.noteMinimale}%)`,
      type: 'quiz',
    });

    // On renvoie le détail question par question pour la correction affichée côté client
    const correction = quiz.questions.map((q, i) => ({
      enonce: q.enonce,
      reponseDonnee: reponses[i],
      bonneReponse: q.bonneReponse,
      correcte: reponses[i] === q.bonneReponse,
    }));

    res.status(201).json({ resultat, correction });
  } catch (err) {
    next(err);
  }
};

// GET /api/quizzes/mes-resultats  (historique des résultats de l'étudiant)
exports.getMesResultats = async (req, res, next) => {
  try {
    const resultats = await Result.find({ etudiant: req.user._id })
      .populate('quiz', 'titre')
      .populate('cours', 'titre')
      .sort({ createdAt: -1 });

    res.json({ count: resultats.length, resultats });
  } catch (err) {
    next(err);
  }
};