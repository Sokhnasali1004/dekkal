const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/admin/stats — Récupérer les statistiques globales
exports.obtenirStats = async (req, res) => {
  try {
    const [totalUsers, totalProduits, totalCommandes, users, produits, commandes] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      User.find({}, 'role'),
      Product.find({}, 'categorie statut prix'),
      Order.find({}, 'total statut'),
    ]);

    const chiffreAffaires = commandes
      .filter((c) => c.statut !== 'annulée')
      .reduce((sum, c) => sum + (c.total || 0), 0);

    const produitsDisponibles = produits.filter((p) => p.statut === 'disponible').length;
    const produitsVendus = produits.filter((p) => p.statut === 'vendu').length;

    const categories = {};
    produits.forEach((p) => {
      categories[p.categorie] = (categories[p.categorie] || 0) + 1;
    });

    const statutsCommandes = {};
    commandes.forEach((c) => {
      statutsCommandes[c.statut] = (statutsCommandes[c.statut] || 0) + 1;
    });

    const utilisateursParRole = {
      admin: users.filter((u) => u.role === 'admin').length,
      vendeur: users.filter((u) => u.role === 'vendeur').length,
      acheteur: users.filter((u) => u.role === 'acheteur').length,
    };

    res.json({
      chiffreAffaires,
      totalCommandes,
      totalProduits,
      totalUtilisateurs: totalUsers,
      produitsDisponibles,
      produitsVendus,
      categories,
      statutsCommandes,
      utilisateursParRole,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques.', detail: err.message });
  }
};

// GET /api/admin/produits — Lister tous les produits (avec filtres)
exports.listerProduits = async (req, res) => {
  try {
    const { categorie, statut, recherche } = req.query;
    const filtre = {};

    if (categorie) filtre.categorie = categorie;
    if (statut) filtre.statut = statut;
    if (recherche) {
      filtre.$or = [
        { titre: { $regex: recherche, $options: 'i' } },
        { description: { $regex: recherche, $options: 'i' } },
      ];
    }

    const produits = await Product.find(filtre)
      .populate('vendeur', 'nom email ville telephone')
      .sort({ createdAt: -1 });

    res.json(produits);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des produits.', detail: err.message });
  }
};

// POST /api/admin/produits — Créer un produit
exports.creerProduit = async (req, res) => {
  try {
    const produit = await Product.create({
      ...req.body,
      vendeur: req.body.vendeur || req.userId,
    });
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ message: 'Impossible de créer le produit.', detail: err.message });
  }
};

// PUT /api/admin/produits/:id — Modifier un produit
exports.modifierProduit = async (req, res) => {
  try {
    const produit = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!produit) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json(produit);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la modification.', detail: err.message });
  }
};

// DELETE /api/admin/produits/:id — Supprimer un produit
exports.supprimerProduit = async (req, res) => {
  try {
    const resultat = await Product.findByIdAndDelete(req.params.id);
    if (!resultat) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', detail: err.message });
  }
};

// GET /api/admin/commandes — Lister toutes les commandes
exports.listerCommandes = async (req, res) => {
  try {
    const { statut } = req.query;
    const filtre = {};
    if (statut) filtre.statut = statut;

    const commandes = await Order.find(filtre)
      .populate('acheteur', 'nom email telephone ville')
      .sort({ createdAt: -1 });

    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des commandes.', detail: err.message });
  }
};

// PUT /api/admin/commandes/:id/statut — Mettre à jour le statut d'une commande
exports.changerStatutCommande = async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Order.findByIdAndUpdate(req.params.id, { statut }, { new: true });
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    res.json(commande);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du statut.', detail: err.message });
  }
};

// DELETE /api/admin/commandes/:id — Supprimer une commande
exports.supprimerCommande = async (req, res) => {
  try {
    const commande = await Order.findByIdAndDelete(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    res.json({ message: 'Commande supprimée avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', detail: err.message });
  }
};

// GET /api/admin/utilisateurs — Lister les utilisateurs
exports.listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await User.find({}, '-motDePasse').sort({ createdAt: -1 });
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du chargement des utilisateurs.', detail: err.message });
  }
};

// PUT /api/admin/utilisateurs/:id/role — Modifier le rôle d'un utilisateur
exports.changerRoleUtilisateur = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['acheteur', 'vendeur', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }
    const utilisateur = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-motDePasse');
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(utilisateur);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la modification du rôle.', detail: err.message });
  }
};

// DELETE /api/admin/utilisateurs/:id — Supprimer un utilisateur
exports.supprimerUtilisateur = async (req, res) => {
  try {
    const utilisateur = await User.findByIdAndDelete(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression.', detail: err.message });
  }
};
