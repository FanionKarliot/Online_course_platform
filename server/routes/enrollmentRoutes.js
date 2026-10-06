const express = require('express');
const router = express.Router();
const {
  enroll, getMyEnrollments, getEnrollmentForCourse, marquerChapitreTermine,
} = require('../controllers/enrollmentController');
const { protect } = require('../middlewares/auth');

router.use(protect); // tout ce routeur exige d'être connecté

router.post('/', enroll);
router.get('/me', getMyEnrollments);
router.get('/:coursId', getEnrollmentForCourse);
router.patch('/:coursId/chapters/:chapterId/terminer', marquerChapitreTermine);

module.exports = router;