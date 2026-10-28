const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { protege } = require('../middleware/auth');

router.post('/', protege, ctrl.creerCommande);
router.get('/', protege, ctrl.mesCommandes);

module.exports = router;
