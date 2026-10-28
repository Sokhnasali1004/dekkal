// cart.js — panier persistant en localStorage, avec un petit bus d'évènements
const CLE_PANIER = 'dekkal_panier';

function lireP() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PANIER)) || [];
  } catch {
    return [];
  }
}

function ecrireP(articles) {
  localStorage.setItem(CLE_PANIER, JSON.stringify(articles));
  document.dispatchEvent(new CustomEvent('panier:maj', { detail: articles }));
}

export const panier = {
  liste: () => lireP(),

  ajouter(produit) {
    const articles = lireP();
    if (articles.some((a) => a.produit === produit._id)) {
      return { deja: true };
    }
    articles.push({
      produit: produit._id,
      titre: produit.titre,
      prix: produit.prix,
      image: produit.images?.[0] || '',
    });
    ecrireP(articles);
    return { deja: false };
  },

  retirer(idProduit) {
    ecrireP(lireP().filter((a) => a.produit !== idProduit));
  },

  vider() {
    ecrireP([]);
  },

  total() {
    return lireP().reduce((somme, a) => somme + a.prix, 0);
  },

  nombre() {
    return lireP().length;
  },
};
