const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  enonce: { type: String, required: true },
  options: {
    type: [String],
    validate: [(v) => v.length >= 2, 'Il faut au moins 2 options'],
  },
  bonneReponse: { type: Number, required: true }, // index de la bonne option
});

const quizSchema = new mongoose.Schema(
  {
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    chapitre: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }, // optionnel
    titre: { type: String, required: true, trim: true },
    noteMinimale: { type: Number, default: 50 }, // % pour réussir
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);