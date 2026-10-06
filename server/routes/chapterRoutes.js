const express = require('express');
const router = express.Router();
const { updateChapter, deleteChapter } = require('../controllers/chapterController');
const { protect, restrictTo } = require('../middlewares/auth');

router.put('/:id', protect, restrictTo('admin'), updateChapter);
router.delete('/:id', protect, restrictTo('admin'), deleteChapter);

module.exports = router;