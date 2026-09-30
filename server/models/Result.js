const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, required: true },      // bonnes réponses
    total: { type: Number, required: true },      // nombre de questions
    pourcentage: { type: Number, required: true },
    reussi: { type: Boolean, required: true },
    reponses: [Number],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);