// Middleware de gestion d'erreurs
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Cette valeur existe déjà (email en double ?)' });
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Fichier trop volumineux (10 Mo maximum)' });
  }

  res.status(err.statusCode || 500).json({ message: err.message || 'Erreur serveur' });
}

module.exports = errorHandler;