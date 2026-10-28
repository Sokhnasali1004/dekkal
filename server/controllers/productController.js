const Product = require('../models/Product');

// GET /api/produits  (filtres : categorie, taille, etat, prixMax, recherche, ville)
exports.listerProduits = async (req, res) => {
  try {
    const { categorie, taille, etat, prixMax, recherche, ville, tri } = req.query;
    const filtre = { statut: 'disponible' };

    if (categorie) filtre.categorie = categorie;
    if (taille) filtre.taille = taille;
    if (etat) filtre.etat = etat;
    if (ville) filtre.ville = new RegExp(ville, 'i');
    if (prixMax) filtre.prix = { $lte: Number(prixMax) };
    if (recherche) filtre.$text = { $search: recherche };

    let requete = Product.find(filtre).populate('vendeur', 'nom ville');

    if (tri === 'prix_asc') requete = requete.sort({ prix: 1 });
    else if (tri === 'prix_desc') requete = requete.sort({ prix: -1 });
    else requete = requete.sort({ createdAt: -1 });

    const produits = await requete.exec();
    res.json(produits);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des produits.', detail: err.message });
  }
};

exports.obtenirProduit = async (req, res) => {
  try {
    const produit = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { vues: 1 } },
      { new: true }
    ).populate('vendeur', 'nom ville telephone');

    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json(produit);
  } catch (err) {
    res.status(404).json({ message: 'Produit introuvable.' });
  }
};

exports.creerProduit = async (req, res) => {
  try {
    const produit = await Product.create({ ...req.body, vendeur: req.userId });
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ message: 'Impossible de créer le produit.', detail: err.message });
  }
};

exports.modifierProduit = async (req, res) => {
  const produit = await Product.findOne({ _id: req.params.id, vendeur: req.userId });
  if (!produit) return res.status(404).json({ message: 'Produit introuvable ou non autorisé.' });

  Object.assign(produit, req.body);
  await produit.save();
  res.json(produit);
};

exports.supprimerProduit = async (req, res) => {
  const resultat = await Product.deleteOne({ _id: req.params.id, vendeur: req.userId });
  if (resultat.deletedCount === 0) {
    return res.status(404).json({ message: 'Produit introuvable ou non autorisé.' });
  }
  res.json({ message: 'Produit supprimé.' });
};

exports.mesProduits = async (req, res) => {
  const produits = await Product.find({ vendeur: req.userId }).sort({ createdAt: -1 });
  res.json(produits);
};
