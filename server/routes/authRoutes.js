const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protege } = require('../middleware/auth');

router.post('/inscription', ctrl.inscription);
router.post('/connexion', ctrl.connexion);
router.get('/profil', protege, ctrl.profil);

module.exports = router;
