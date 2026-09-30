const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est obligatoire'], trim: true },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: 6,
      select: false, // jamais renvoyé par défaut
    },
    role: { type: String, enum: ['etudiant', 'admin'], default: 'etudiant' },
    filiere: { type: String, trim: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true }
);

// Hachage automatique avant sauvegarde
userSchema.pre('save', async function () {
  if (!this.isModified('motDePasse')) return;
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
});

// Comparaison du mot de passe à la connexion
userSchema.methods.comparerMotDePasse = function (motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('User', userSchema);