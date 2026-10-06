const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { protect, restrictTo } = require('../middlewares/auth');

// POST /api/upload  (admin uniquement, pour PDF de chapitre ou image de cours)
router.post('/', protect, restrictTo('admin'), upload.single('fichier'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
  res.status(201).json({ url: `/${req.file.path.replace(/\\/g, '/')}` });
});

module.exports = router;