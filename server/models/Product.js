const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    categorie: {
      type: String,
      required: true,
      enum: ['Robes', 'Hauts', 'Pantalons', 'Ensembles', 'Chaussures', 'Accessoires', 'Boubous & Tenues traditionnelles'],
    },
    taille: { type: String, required: true },
    etat: {
      type: String,
      required: true,
      enum: ['Neuf avec étiquette', 'Très bon état', 'Bon état', 'Satisfaisant'],
      default: 'Bon état',
    },
    prix: { type: Number, required: true, min: 0 },
    prixOriginal: { type: Number, default: 0 },
    couleur: { type: String, default: '' },
    images: [{ type: String }],
    vendeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ville: { type: String, default: '' },
    statut: { type: String, enum: ['disponible', 'réservé', 'vendu'], default: 'disponible' },
    vues: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ titre: 'text', description: 'text', categorie: 'text' });

module.exports = mongoose.model('Product', productSchema);
