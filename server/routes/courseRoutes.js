const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse,
} = require('../controllers/courseController');
const { addChapter, updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protect, restrictTo } = require('../middlewares/auth');

// Routes publiques
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Routes admin (cours)
router.post('/', protect, restrictTo('admin'), createCourse);
router.put('/:id', protect, restrictTo('admin'), updateCourse);
router.delete('/:id', protect, restrictTo('admin'), deleteCourse);

// Routes admin (chapitres, imbriquées sous un cours)
router.post('/:courseId/chapters', protect, restrictTo('admin'), addChapter);

module.exports = router;