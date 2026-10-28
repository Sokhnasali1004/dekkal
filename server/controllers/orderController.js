const Order = require('../models/Order');
const Product = require('../models/Product');

// Le panier est géré côté client (localStorage) ; à la validation,
// le front envoie la liste d'articles et on crée la commande + on marque les produits vendus.
exports.creerCommande = async (req, res) => {
  try {
    const { articles, adresseLivraison, telephoneContact, modePaiement } = req.body;

    if (!articles || articles.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide.' });
    }

    const total = articles.reduce((somme, a) => somme + a.prix, 0);

    const commande = await Order.create({
      acheteur: req.userId,
      articles,
      total,
      adresseLivraison,
      telephoneContact,
      modePaiement,
    });

    await Product.updateMany(
      { _id: { $in: articles.map((a) => a.produit) } },
      { $set: { statut: 'vendu' } }
    );

    res.status(201).json(commande);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la commande.', detail: err.message });
  }
};

exports.mesCommandes = async (req, res) => {
  const commandes = await Order.find({ acheteur: req.userId }).sort({ createdAt: -1 });
  res.json(commandes);
};
