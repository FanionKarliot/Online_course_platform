const express = require('express');
const router = express.Router();
const {
  createQuiz, getQuizzesByCourse, getQuizById, getQuizByIdAdmin,
  updateQuiz, deleteQuiz, soumettreQuiz, getMesResultats,
} = require('../controllers/quizController');
const { protect, restrictTo } = require('../middlewares/auth');

router.post('/', protect, restrictTo('admin'), createQuiz);
router.get('/mes-resultats', protect, getMesResultats);
router.get('/course/:coursId', protect, getQuizzesByCourse);
router.get('/:id/admin', protect, restrictTo('admin'), getQuizByIdAdmin);
router.put('/:id', protect, restrictTo('admin'), updateQuiz);
router.delete('/:id', protect, restrictTo('admin'), deleteQuiz);
router.get('/:id', protect, getQuizById);
router.post('/:id/soumettre', protect, soumettreQuiz);

module.exports = router;