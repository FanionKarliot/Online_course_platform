const express = require('express');
const router = express.Router();
const { addComment, getCommentsByCourse, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

router.get('/course/:coursId', getCommentsByCourse); // public
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;