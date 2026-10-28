require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');

const produitsDemo = [
  { titre: 'Robe wax imprimée', categorie: 'Robes', taille: 'M', etat: 'Très bon état', prix: 8500, prixOriginal: 15000, couleur: 'Orange', ville: 'Dakar', images: [] },
  { titre: 'Boubou brodé homme', categorie: 'Boubous & Tenues traditionnelles', taille: 'L', etat: 'Bon état', prix: 12000, prixOriginal: 25000, couleur: 'Bleu', ville: 'Saint-Louis', images: [] },
  { titre: 'Jean slim taille haute', categorie: 'Pantalons', taille: '38', etat: 'Bon état', prix: 4000, prixOriginal: 9000, couleur: 'Noir', ville: 'Thiès', images: [] },
  { titre: 'Sneakers montantes', categorie: 'Chaussures', taille: '42', etat: 'Satisfaisant', prix: 6000, prixOriginal: 20000, couleur: 'Blanc', ville: 'Dakar', images: [] },
  { titre: 'Sac à main en raphia', categorie: 'Accessoires', taille: 'Unique', etat: 'Neuf avec étiquette', prix: 5500, prixOriginal: 10000, couleur: 'Beige', ville: 'Kaolack', images: [] },
  { titre: 'Ensemble deux pièces', categorie: 'Ensembles', taille: 'S', etat: 'Très bon état', prix: 9000, prixOriginal: 18000, couleur: 'Vert', ville: 'Dakar', images: [] },
];

async function run() {
  await connectDB();

  let admin = await User.findOne({ email: 'admin.demo@dekkal.sn' });
  if (!admin) {
    admin = await User.create({
      nom: 'Administrateur Dëkkal',
      email: 'admin.demo@dekkal.sn',
      motDePasse: 'admin123',
      ville: 'Dakar',
      role: 'admin',
    });
  }

  let vendeur = await User.findOne({ email: 'vendeur.demo@dekkal.sn' });
  if (!vendeur) {
    vendeur = await User.create({
      nom: 'Boutique Demo',
      email: 'vendeur.demo@dekkal.sn',
      motDePasse: 'motdepasse123',
      ville: 'Dakar',
      role: 'vendeur',
    });
  }

  await Product.deleteMany({ vendeur: vendeur._id });
  await Product.insertMany(produitsDemo.map((p) => ({ ...p, vendeur: vendeur._id })));

  console.log('Données de démonstration insérées avec succès.');
  console.log('Compte admin demo -> email: admin.demo@dekkal.sn / mot de passe: admin123');
  console.log('Compte vendeur demo -> email: vendeur.demo@dekkal.sn / mot de passe: motdepasse123');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
