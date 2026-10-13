const express = require('express');
const router = express.Router();
const {
  getMyNotifications, markAsRead, markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/tout-lire', markAllAsRead); // avant /:id/lue, même logique qu'à l'étape 6
router.patch('/:id/lue', markAsRead);

module.exports = router;