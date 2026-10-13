const express = require('express');
const router = express.Router();
const { getCertificat } = require('../controllers/certificateController');
const { protect } = require('../middlewares/auth');

router.get('/:coursId', protect, getCertificat);

module.exports = router;