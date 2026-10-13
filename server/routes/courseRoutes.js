const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse, addSupport, deleteSupport
} = require('../controllers/courseController');
const { addChapter, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protect, restrictTo } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Routes publiques
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Routes admin (cours)
router.post('/', protect, restrictTo('admin'), createCourse);
router.put('/:id', protect, restrictTo('admin'), updateCourse);
router.delete('/:id', protect, restrictTo('admin'), deleteCourse);

// Routes admin (chapitres, imbriquées sous un cours)
router.post('/:courseId/chapters', protect, restrictTo('admin'), addChapter);
router.post('/:id/supports', protect, restrictTo('admin'), upload.pdf.single('fichier'), addSupport);
router.delete('/:id/supports/:supportId', protect, restrictTo('admin'), deleteSupport);

module.exports = router;