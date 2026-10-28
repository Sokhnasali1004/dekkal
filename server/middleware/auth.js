const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifie le token JWT envoyé dans le header Authorization: Bearer <token>
function protege(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Connexion requise.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session invalide ou expirée.' });
  }
}

// Vérifie que l'utilisateur a le rôle admin
async function exigeAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé : privilèges administrateur requis.' });
    }
    req.adminUser = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Erreur lors de la vérification des droits.', detail: err.message });
  }
}

module.exports = { protege, exigeAdmin };

