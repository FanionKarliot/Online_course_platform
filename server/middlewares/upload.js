const multer = require('multer');
const path = require('path');
const fs = require('fs');

// On sépare les PDF et les futures images dans des sous-dossiers
const dossiers = ['uploads/pdf', 'uploads/images', 'uploads/certificats'];
dossiers.forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, 'uploads/pdf');
    else cb(null, 'uploads/images');
  },
  filename: (req, file, cb) => {
    const nomUnique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, nomUnique);
  },
});

const filtreFichier = (req, file, cb) => {
  const typesAutorises = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (typesAutorises.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Type de fichier non autorisé (PDF, JPEG, PNG, WEBP uniquement)'));
};

const upload = multer({
  storage,
  fileFilter: filtreFichier,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
});

module.exports = upload;