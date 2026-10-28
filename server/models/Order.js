const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    titre: String,
    prix: Number,
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    acheteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    articles: [orderItemSchema],
    total: { type: Number, required: true },
    adresseLivraison: { type: String, required: true },
    telephoneContact: { type: String, required: true },
    modePaiement: { type: String, enum: ['Wave', 'Orange Money', 'Paiement à la livraison'], default: 'Paiement à la livraison' },
    statut: { type: String, enum: ['en attente', 'confirmée', 'expédiée', 'livrée', 'annulée'], default: 'en attente' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
