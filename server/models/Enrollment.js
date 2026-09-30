const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cours: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    chapitresTermines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
    progression: { type: Number, default: 0, min: 0, max: 100 },
    termine: { type: Boolean, default: false },
    dateFin: { type: Date },
  },
  { timestamps: true }
);

// Un étudiant ne peut s'inscrire qu'une fois au même cours
enrollmentSchema.index({ etudiant: 1, cours: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);