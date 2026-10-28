// panier.js — page panier + validation de commande
import { api } from './api.js';
import { panier } from './cart.js';
import { estConnecte } from './auth.js';

const zoneListe = document.getElementById('zone-panier-liste');
const zoneTotal = document.getElementById('zone-panier-total');
const formeCommande = document.getElementById('forme-commande');
const zoneConnexionRequise = document.getElementById('zone-connexion-requise');

function rendre() {
  const articles = panier.liste();

  if (articles.length === 0) {
    zoneListe.innerHTML = `<p class="py-4">Votre panier est vide pour le moment. <a href="catalogue.html">Voir le catalogue</a></p>`;
    zoneTotal.textContent = '0';
    formeCommande?.classList.add('d-none');
    return;
  }

  zoneListe.innerHTML = articles.map((a) => `
    <div class="d-flex justify-content-between align-items-center border-bottom py-3">
      <div>
        <div class="titre">${a.titre}</div>
        <div class="meta">${a.prix.toLocaleString('fr-FR')} FCFA</div>
      </div>
      <button class="btn btn-sm btn-dekkal-outline" data-retirer="${a.produit}">Retirer</button>
    </div>`).join('');

  zoneTotal.textContent = panier.total().toLocaleString('fr-FR');

  zoneListe.querySelectorAll('[data-retirer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      panier.retirer(btn.dataset.retirer);
      rendre();
    });
  });

  formeCommande?.classList.toggle('d-none', !estConnecte());
  if (zoneConnexionRequise) zoneConnexionRequise.classList.toggle('d-none', estConnecte());
}

formeCommande?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const donnees = Object.fromEntries(new FormData(formeCommande));
  const bouton = formeCommande.querySelector('button[type="submit"]');
  bouton.disabled = true;
  bouton.textContent = 'Validation…';

  try {
    await api.post('/commandes', { ...donnees, articles: panier.liste() });
    panier.vider();
    zoneListe.innerHTML = `<div class="alert alert-success">Commande confirmée ! Le vendeur va vous contacter très vite.</div>`;
    formeCommande.classList.add('d-none');
  } catch (err) {
    alert(`Erreur : ${err.message}`);
  } finally {
    bouton.disabled = false;
    bouton.textContent = 'Valider la commande';
  }
});

rendre();
document.addEventListener('panier:maj', rendre);
