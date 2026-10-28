// compte.js — connexion / inscription / profil / mes annonces / mes commandes
import { api } from './api.js';
import { connecter, inscrire, estConnecte, utilisateurConnecte, deconnecter } from './auth.js';

const zoneAuth = document.getElementById('zone-auth');
const zoneProfil = document.getElementById('zone-profil');

function messageErreur(forme, texte) {
  let boite = forme.querySelector('.alert-danger');
  if (!boite) {
    boite = document.createElement('div');
    boite.className = 'alert alert-danger mt-3';
    forme.appendChild(boite);
  }
  boite.textContent = texte;
}

function initFormulaires() {
  const formeConnexion = document.getElementById('forme-connexion');
  const formeInscription = document.getElementById('forme-inscription');

  formeConnexion?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { email, motDePasse } = Object.fromEntries(new FormData(formeConnexion));
    try {
      await connecter(email, motDePasse);
      window.location.reload();
    } catch (err) {
      messageErreur(formeConnexion, err.message);
    }
  });

  formeInscription?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const donnees = Object.fromEntries(new FormData(formeInscription));
    try {
      await inscrire(donnees);
      window.location.reload();
    } catch (err) {
      messageErreur(formeInscription, err.message);
    }
  });
}

async function afficherMesProduits() {
  const zone = document.getElementById('zone-mes-produits');
  if (!zone) return;
  try {
    const produits = await api.get('/produits/mes-produits');
    zone.innerHTML = produits.length
      ? produits.map((p) => `
          <div class="d-flex justify-content-between border-bottom py-2">
            <span>${p.titre} — ${p.prix.toLocaleString('fr-FR')} FCFA</span>
            <span class="meta">${p.statut}</span>
          </div>`).join('')
      : `<p class="meta">Vous n'avez pas encore publié d'article.</p>`;
  } catch (err) {
    zone.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

async function afficherMesCommandes() {
  const zone = document.getElementById('zone-mes-commandes');
  if (!zone) return;
  try {
    const commandes = await api.get('/commandes');
    zone.innerHTML = commandes.length
      ? commandes.map((c) => `
          <div class="d-flex justify-content-between border-bottom py-2">
            <span>Commande du ${new Date(c.createdAt).toLocaleDateString('fr-FR')} — ${c.articles.length} article(s)</span>
            <span class="meta">${c.total.toLocaleString('fr-FR')} FCFA · ${c.statut}</span>
          </div>`).join('')
      : `<p class="meta">Aucune commande pour le moment.</p>`;
  } catch (err) {
    zone.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

function afficherProfil() {
  const user = utilisateurConnecte();
  zoneAuth.classList.add('d-none');
  zoneProfil.classList.remove('d-none');
  zoneProfil.querySelector('[data-nom]').textContent = user.nom;
  zoneProfil.querySelector('[data-email]').textContent = user.email;
  zoneProfil.querySelector('[data-role]').textContent = user.role;
  zoneProfil.querySelector('[data-ville]').textContent = user.ville || 'Non renseignée';
  
  if (user.role === 'admin') {
    const zoneBoutons = document.getElementById('btn-deconnexion-profil')?.parentElement;
    if (zoneBoutons && !document.getElementById('btn-acces-admin-profil')) {
      const btnAdmin = document.createElement('a');
      btnAdmin.id = 'btn-acces-admin-profil';
      btnAdmin.href = 'admin.html';
      btnAdmin.className = 'btn btn-dekkal me-2';
      btnAdmin.innerHTML = '👑 Tableau de bord Admin';
      zoneBoutons.insertBefore(btnAdmin, document.getElementById('btn-deconnexion-profil'));
    }
  }

  document.getElementById('btn-deconnexion-profil')?.addEventListener('click', deconnecter);
  afficherMesProduits();
  afficherMesCommandes();
}

if (estConnecte()) {
  afficherProfil();
} else {
  initFormulaires();
}
