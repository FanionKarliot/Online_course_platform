const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categorie: { type: String, required: true, trim: true },
    niveau: { type: String, enum: ['debutant', 'intermediaire', 'avance'], default: 'debutant' },
    image: { type: String, default: '' },
    enseignant: { type: String, required: true, trim: true },
    publie: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Recherche texte sur titre et description
courseSchema.index({ titre: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);