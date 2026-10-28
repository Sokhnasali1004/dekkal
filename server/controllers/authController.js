const jwt = require('jsonwebtoken');
const User = require('../models/User');

function genererToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse, ville, telephone, role } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont requis.' });
    }

    const existe = await User.findOne({ email: email.toLowerCase() });
    if (existe) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const utilisateur = await User.create({ nom, email, motDePasse, ville, telephone, role });
    const token = genererToken(utilisateur._id);

    res.status(201).json({ token, utilisateur: utilisateur.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'inscription.", detail: err.message });
  }
};

exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const utilisateur = await User.findOne({ email: (email || '').toLowerCase() });

    if (!utilisateur || !(await utilisateur.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = genererToken(utilisateur._id);
    res.json({ token, utilisateur: utilisateur.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la connexion.', detail: err.message });
  }
};

exports.profil = async (req, res) => {
  const utilisateur = await User.findById(req.userId);
  if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  res.json(utilisateur.toSafeObject());
};
