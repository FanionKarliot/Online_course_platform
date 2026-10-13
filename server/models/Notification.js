const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'succes', 'quiz', 'certificat', 'admin'],
      default: 'info',
    },
    lien: { type: String, default: '' }, // page ouverte au clic (optionnel)
    lue: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);