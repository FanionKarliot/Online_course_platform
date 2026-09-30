const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    titre: { type: String, required: true, trim: true },
    contenu: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    ordre: { type: Number, required: true },
  },
  { timestamps: true }
);

chapterSchema.index({ cours: 1, ordre: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);