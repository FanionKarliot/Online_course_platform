// Utilitaire de génération de token : server/config/jwt.js

const jwt = require('jsonwebtoken');

function genererToken(userId, role) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

module.exports = { genererToken };