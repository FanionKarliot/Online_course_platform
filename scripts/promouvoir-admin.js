require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../server/models');

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage : node scripts/promouvoir-admin.js email@exemple.com');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: 'admin' },
    { new: true }
  );
  console.log(user ? `${user.email} est maintenant admin` : 'Utilisateur introuvable');
  await mongoose.disconnect();
})();