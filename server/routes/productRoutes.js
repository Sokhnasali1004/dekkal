const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { protege } = require('../middleware/auth');

router.get('/', ctrl.listerProduits);
router.get('/mes-produits', protege, ctrl.mesProduits);
router.get('/:id', ctrl.obtenirProduit);
router.post('/', protege, ctrl.creerProduit);
router.put('/:id', protege, ctrl.modifierProduit);
router.delete('/:id', protege, ctrl.supprimerProduit);

module.exports = router;
