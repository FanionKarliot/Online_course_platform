const { User } = require('../models');
const { genererToken } = require('../config/jwt');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { nom, email, motDePasse, filiere } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires' });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const user = await User.create({ nom, email, motDePasse, filiere });
    const token = genererToken(user._id, user.role);

    res.status(201).json({
      token,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe sont obligatoires' });
    }

    const user = await User.findOne({ email }).select('+motDePasse');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const motDePasseOk = await user.comparerMotDePasse(motDePasse);
    if (!motDePasseOk) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = genererToken(user._id, user.role);

    res.json({
      token,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};