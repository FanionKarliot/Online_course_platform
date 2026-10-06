const express = require('express');
const router = express.Router();
const {
  createQuiz, getQuizzesByCourse, getQuizById, soumettreQuiz, getMesResultats,
} = require('../controllers/quizController');
const { protect, restrictTo } = require('../middlewares/auth');

router.post('/', protect, restrictTo('admin'), createQuiz);
router.get('/mes-resultats', protect, getMesResultats); // AVANT /:id pour éviter un conflit de route
router.get('/course/:coursId', protect, getQuizzesByCourse);
router.get('/:id', protect, getQuizById);
router.post('/:id/soumettre', protect, soumettreQuiz);

module.exports = router;