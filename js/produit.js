// produit.js — fiche produit dynamique (lecture de l'id via l'URL)
import { api } from './api.js';
import { panier } from './cart.js';

const zone = document.getElementById('zone-produit');
const id = new URLSearchParams(window.location.search).get('id');

function alerte(message, type = 'success') {
  const boite = document.createElement('div');
  boite.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
  boite.style.zIndex = 2000;
  boite.textContent = message;
  document.body.appendChild(boite);
  setTimeout(() => boite.remove(), 2500);
}

async function afficher() {
  if (!id) {
    zone.innerHTML = `<p>Aucun produit sélectionné.</p>`;
    return;
  }
  try {
    const p = await api.get(`/produits/${id}`);
    document.title = `${p.titre} — Dëkkal`;
    zone.innerHTML = `
      <div class="col-md-6">
        <div class="zone-image" style="aspect-ratio:1;">
          ${p.images?.[0] ? `<img src="${p.images[0]}" class="w-100 h-100 object-fit-cover" alt="${p.titre}">` : p.categorie}
          <span class="tampon-etat">${p.etat}</span>
        </div>
      </div>
      <div class="col-md-6">
        <div class="meta">${p.categorie} · Taille ${p.taille} · ${p.couleur || ''}</div>
        <h1 class="mt-1" style="font-size:2.2rem;">${p.titre}</h1>
        <div class="mb-3">
          <span class="prix fs-3">${p.prix.toLocaleString('fr-FR')} FCFA</span>
          ${p.prixOriginal ? `<span class="prix-original">${p.prixOriginal.toLocaleString('fr-FR')} FCFA</span>` : ''}
        </div>
        <p>${p.description || 'Aucune description fournie par le vendeur.'}</p>
        <p class="meta">Vendu par ${p.vendeur?.nom || 'un membre Dëkkal'} · ${p.ville || p.vendeur?.ville || ''}</p>
        <button id="btn-ajouter" class="btn btn-dekkal btn-lg mt-2" ${p.statut !== 'disponible' ? 'disabled' : ''}>
          ${p.statut === 'disponible' ? 'Ajouter au panier' : 'Déjà vendu'}
        </button>
      </div>`;

    document.getElementById('btn-ajouter')?.addEventListener('click', () => {
      const { deja } = panier.ajouter(p);
      alerte(deja ? 'Cet article est déjà dans votre panier.' : 'Article ajouté au panier !', deja ? 'warning' : 'success');
    });
  } catch (err) {
    zone.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

afficher();
