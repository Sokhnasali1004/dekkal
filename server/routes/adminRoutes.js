const express = require('express');
const router = express.Router();
const { protege, exigeAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Toutes les routes admin nécessitent d'être connecté ET d'avoir le rôle admin
router.use(protege, exigeAdmin);

// Statistiques
router.get('/stats', adminController.obtenirStats);

// Produits
router.get('/produits', adminController.listerProduits);
router.post('/produits', adminController.creerProduit);
router.put('/produits/:id', adminController.modifierProduit);
router.delete('/produits/:id', adminController.supprimerProduit);

// Commandes
router.get('/commandes', adminController.listerCommandes);
router.put('/commandes/:id/statut', adminController.changerStatutCommande);
router.delete('/commandes/:id', adminController.supprimerCommande);

// Utilisateurs
router.get('/utilisateurs', adminController.listerUtilisateurs);
router.put('/utilisateurs/:id/role', adminController.changerRoleUtilisateur);
router.delete('/utilisateurs/:id', adminController.supprimerUtilisateur);

module.exports = router;
