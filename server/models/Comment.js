const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    texte: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);