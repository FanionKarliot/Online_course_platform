const { Notification } = require('../models');

// GET /api/notifications  (mes notifications, les plus récentes d'abord)
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ utilisateur: req.user._id }).sort({
      createdAt: -1,
    });
    const nonLues = notifications.filter((n) => !n.lue).length;

    res.json({ count: notifications.length, nonLues, notifications });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/lue  (marquer une notification comme lue)
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user._id },
      { lue: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification introuvable' });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/tout-lire  (tout marquer comme lu d'un coup)
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ utilisateur: req.user._id, lue: false }, { lue: true });
    res.json({ message: 'Toutes les notifications sont marquées comme lues' });
  } catch (err) {
    next(err);
  }
};