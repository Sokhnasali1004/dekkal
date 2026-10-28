// js/admin.js — Contrôleur principal de l'espace Administrateur Dëkkal
import {
  estAdminConnecte,
  adminConnexion,
  adminDeconnexion,
  adminUtilisateurActuel,
  adminObtenirStats,
  adminListerProduits,
  adminCreerProduit,
  adminModifierProduit,
  adminSupprimerProduit,
  adminListerCommandes,
  adminChangerStatutCommande,
  adminSupprimerCommande,
  adminListerUtilisateurs,
  adminChangerRole,
  adminSupprimerUtilisateur,
  estSupabaseConfigure,
  obtenirConfigSupabase,
  sauvegarderConfigSupabase,
} from './supabase.js';

// Cache des instances modales Bootstrap
let modalProduitBS = null;
let modalCommandeBS = null;
let modalSupabaseBS = null;

// État local des filtres
let filtresProduits = { recherche: '', categorie: '', statut: '' };
let filtresCommandes = { statut: '' };

// ----------------------------------------------------------------------------
// GESTIONNAIRE DE TOASTS
// ----------------------------------------------------------------------------
function afficherToast(message, type = 'succes') {
  const conteneur = document.getElementById('toast-container');
  if (!conteneur) return;

  const toast = document.createElement('div');
  toast.className = `toast-dekkal ${type}`;
  
  const icones = {
    succes: '✓',
    erreur: '✕',
    info: 'ℹ',
  };

  toast.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <span class="fw-bold">${icones[type] || '•'}</span>
      <span>${message}</span>
    </div>
    <button type="button" class="btn-close btn-close-white ms-2" style="font-size:0.7rem;"></button>
  `;

  toast.querySelector('.btn-close')?.addEventListener('click', () => toast.remove());
  conteneur.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ----------------------------------------------------------------------------
// GESTION DE L'AFFICHAGE & AUTHENTIFICATION
// ----------------------------------------------------------------------------
function majIndicateurSupabase() {
  const point = document.getElementById('indicateur-supabase-point');
  const texte = document.getElementById('indicateur-supabase-texte');
  if (estSupabaseConfigure()) {
    point.style.background = '#81c784';
    texte.textContent = 'Supabase lié';
    texte.classList.add('text-success');
    texte.classList.remove('text-warning');
  } else {
    point.style.background = '#ffb74d';
    texte.textContent = 'Mode Démo local';
    texte.classList.add('text-warning');
    texte.classList.remove('text-success');
  }
}

function basculerEcran() {
  const ecranAuth = document.getElementById('ecran-auth-admin');
  const ecranDashboard = document.getElementById('ecran-dashboard-admin');
  const zoneUser = document.getElementById('zone-admin-user');

  if (estAdminConnecte()) {
    const user = adminUtilisateurActuel();
    ecranAuth.classList.add('d-none');
    ecranDashboard.classList.remove('d-none');
    zoneUser.classList.remove('d-none');

    document.getElementById('admin-user-nom').textContent = user.nom || 'Administrateur';
    document.getElementById('admin-user-email').textContent = user.email || '';

    // Charger les données
    chargerDonneesGlobales();
  } else {
    ecranAuth.classList.remove('d-none');
    ecranDashboard.classList.add('d-none');
    zoneUser.classList.add('d-none');
  }
}

// ----------------------------------------------------------------------------
// GESTION DES ONGLETS
// ----------------------------------------------------------------------------
function initOnglets() {
  const boutons = document.querySelectorAll('#admin-onglets .nav-link');
  const sections = document.querySelectorAll('.section-onglet');

  boutons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cible = btn.getAttribute('data-onglet');

      boutons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      sections.forEach((sec) => {
        if (sec.id === `section-${cible}`) {
          sec.classList.remove('d-none');
        } else {
          sec.classList.add('d-none');
        }
      });

      // Rafraîchir les données de l'onglet actif
      if (cible === 'tableau-de-bord') chargerDashboard();
      if (cible === 'produits') chargerProduits();
      if (cible === 'commandes') chargerCommandes();
      if (cible === 'utilisateurs') chargerUtilisateurs();
    });
  });

  // Liens de redirection rapide interne
  document.querySelectorAll('[data-nav-vers]').forEach((el) => {
    el.addEventListener('click', () => {
      const vers = el.getAttribute('data-nav-vers');
      document.querySelector(`#admin-onglets [data-onglet="${vers}"]`)?.click();
    });
  });
}

// ----------------------------------------------------------------------------
// ONGLET 1 : DASHBOARD & STATISTIQUES
// ----------------------------------------------------------------------------
async function chargerDashboard() {
  try {
    const stats = await adminObtenirStats();

    // 1. KPI Cards
    document.getElementById('kpi-chiffre-affaires').textContent = `${stats.chiffreAffaires.toLocaleString('fr-FR')} FCFA`;
    document.getElementById('kpi-total-commandes').textContent = stats.totalCommandes;
    document.getElementById('kpi-detail-commandes').textContent = `${(stats.statutsCommandes['confirmée'] || 0) + (stats.statutsCommandes['livrée'] || 0)} confirmées / livrées`;
    
    document.getElementById('kpi-total-produits').textContent = stats.totalProduits;
    document.getElementById('kpi-detail-produits').textContent = `${stats.produitsDisponibles} dispo · ${stats.produitsVendus} vendus`;

    document.getElementById('kpi-total-utilisateurs').textContent = stats.totalUtilisateurs;
    document.getElementById('kpi-detail-utilisateurs').textContent = `${stats.utilisateursParRole.acheteur || 0} acheteurs · ${stats.utilisateursParRole.vendeur || 0} vendeurs`;

    // Mettre à jour les compteurs des onglets
    document.getElementById('compteur-ong-produits').textContent = stats.totalProduits;
    document.getElementById('compteur-ong-commandes').textContent = stats.totalCommandes;
    document.getElementById('compteur-ong-utilisateurs').textContent = stats.totalUtilisateurs;

    // 2. Répartition Catégories
    const zoneCat = document.getElementById('liste-repartition-categories');
    const totalProds = stats.totalProduits || 1;
    const catEntries = Object.entries(stats.categories || {});

    if (catEntries.length === 0) {
      zoneCat.innerHTML = '<p class="meta mb-0">Aucun produit dans le catalogue.</p>';
    } else {
      zoneCat.innerHTML = catEntries
        .map(([cat, count]) => {
          const pct = Math.round((count / totalProds) * 100);
          return `
            <div>
              <div class="d-flex justify-content-between small mb-1">
                <span>${cat}</span>
                <span class="meta">${count} (${pct}%)</span>
              </div>
              <div class="barre-progression">
                <div class="segment" style="width:${pct}%; background:var(--laiton);"></div>
              </div>
            </div>`;
        })
        .join('');
    }

    // 3. Répartition Statuts Commandes
    const zoneStatuts = document.getElementById('liste-repartition-statuts-commandes');
    const totalCmds = stats.totalCommandes || 1;
    const statutsEntries = Object.entries(stats.statutsCommandes || {});

    if (statutsEntries.length === 0) {
      zoneStatuts.innerHTML = '<p class="meta mb-0">Aucune commande pour le moment.</p>';
    } else {
      const couleursStatut = {
        'en attente': '#ffb74d',
        'confirmée': '#64b5f6',
        'expédiée': '#ba68c8',
        'livrée': '#81c784',
        'annulée': '#e57373',
      };
      zoneStatuts.innerHTML = statutsEntries
        .map(([st, count]) => {
          const pct = Math.round((count / totalCmds) * 100);
          const couleur = couleursStatut[st] || 'var(--laiton)';
          return `
            <div>
              <div class="d-flex justify-content-between small mb-1">
                <span class="badge-statut ${st.replace(/\s+/g, '')}">${st}</span>
                <span class="meta">${count} commande(s) (${pct}%)</span>
              </div>
              <div class="barre-progression">
                <div class="segment" style="width:${pct}%; background:${couleur};"></div>
              </div>
            </div>`;
        })
        .join('');
    }

    // 4. Activité récente (5 dernières commandes et 5 derniers produits)
    const [commandes, produits] = await Promise.all([
      adminListerCommandes(),
      adminListerProduits(),
    ]);

    const zoneDernieresCmds = document.getElementById('zone-dernieres-commandes');
    if (commandes.length === 0) {
      zoneDernieresCmds.innerHTML = '<p class="meta">Aucune commande récente.</p>';
    } else {
      zoneDernieresCmds.innerHTML = commandes.slice(0, 5).map((c) => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div>
            <div class="fw-medium small">${c.acheteur?.nom || 'Client'} — ${Number(c.total).toLocaleString('fr-FR')} FCFA</div>
            <div class="meta" style="font-size:0.72rem;">${new Date(c.created_at).toLocaleDateString('fr-FR')} · ${c.articles?.length || 0} article(s)</div>
          </div>
          <span class="badge-statut ${c.statut.replace(/\s+/g, '')}">${c.statut}</span>
        </div>
      `).join('');
    }

    const zoneDerniersProds = document.getElementById('zone-derniers-produits');
    if (produits.length === 0) {
      zoneDerniersProds.innerHTML = '<p class="meta">Aucun article dans le catalogue.</p>';
    } else {
      zoneDerniersProds.innerHTML = produits.slice(0, 5).map((p) => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div class="d-flex align-items-center gap-2">
            ${p.images && p.images[0] ? `<img src="${p.images[0]}" class="miniature-produit" style="width:36px; height:42px;">` : ''}
            <div>
              <div class="fw-medium small">${p.titre}</div>
              <div class="meta" style="font-size:0.72rem;">${p.categorie} · ${Number(p.prix).toLocaleString('fr-FR')} FCFA</div>
            </div>
          </div>
          <span class="badge-statut ${p.statut}">${p.statut}</span>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Erreur chargement dashboard:', err);
    afficherToast(`Erreur dashboard : ${err.message}`, 'erreur');
  }
}

// ----------------------------------------------------------------------------
// ONGLET 2 : GESTION DES PRODUITS
// ----------------------------------------------------------------------------
async function chargerProduits() {
  const tbody = document.getElementById('tbody-produits');
  try {
    const produits = await adminListerProduits(filtresProduits);
    if (!produits || produits.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 meta">Aucun produit ne correspond à ces critères.</td></tr>';
      return;
    }

    tbody.innerHTML = produits.map((p) => {
      const imgUrl = (p.images && p.images[0]) || 'https://via.placeholder.com/150x200?text=Dëkkal';
      return `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${imgUrl}" alt="${p.titre}" class="miniature-produit">
              <div>
                <div class="fw-medium">${p.titre}</div>
                <div class="meta" style="font-size:0.72rem;">${p.couleur || 'Sans couleur'}</div>
              </div>
            </div>
          </td>
          <td><span class="meta">${p.categorie}</span></td>
          <td>
            <div class="small">${p.taille}</div>
            <div class="meta" style="font-size:0.72rem;">${p.etat}</div>
          </td>
          <td>
            <div class="fw-medium text-warning">${Number(p.prix).toLocaleString('fr-FR')}</div>
            ${p.prix_original ? `<div class="meta text-decoration-line-through" style="font-size:0.72rem;">${Number(p.prix_original).toLocaleString('fr-FR')}</div>` : ''}
          </td>
          <td>
            <div class="small">${p.vendeur?.nom || 'Dëkkal'}</div>
            <div class="meta" style="font-size:0.72rem;">${p.ville || 'Dakar'}</div>
          </td>
          <td>
            <span class="badge-statut ${p.statut}">${p.statut}</span>
          </td>
          <td><span class="meta">${p.vues || 0}</span></td>
          <td class="text-end">
            <div class="d-inline-flex gap-2">
              <button class="btn btn-action py-1 px-2 btn-modifier-produit" data-id="${p.id}" title="Modifier">
                ✎
              </button>
              <button class="btn btn-action btn-danger-action py-1 px-2 btn-supprimer-produit" data-id="${p.id}" title="Supprimer">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attacher les écouteurs de modification et suppression
    tbody.querySelectorAll('.btn-modifier-produit').forEach((btn) => {
      btn.addEventListener('click', () => ouvrirModalProduit(btn.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-supprimer-produit').forEach((btn) => {
      btn.addEventListener('click', () => executerSuppressionProduit(btn.getAttribute('data-id')));
    });

  } catch (err) {
    console.error('Erreur chargement produits:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${err.message}</td></tr>`;
  }
}

async function ouvrirModalProduit(id = null) {
  const modalEl = document.getElementById('modal-produit');
  const titreEl = document.getElementById('modal-produit-titre');
  const idEl = document.getElementById('modal-produit-id');

  // Réinitialiser le formulaire
  document.getElementById('forme-modal-produit').reset();

  if (id) {
    titreEl.textContent = 'Modifier le produit';
    idEl.value = id;
    try {
      const produits = await adminListerProduits();
      const p = produits.find((item) => item.id === id);
      if (p) {
        document.getElementById('modal-produit-nom').value = p.titre || '';
        document.getElementById('modal-produit-categorie').value = p.categorie || 'Robes';
        document.getElementById('modal-produit-taille').value = p.taille || '';
        document.getElementById('modal-produit-etat').value = p.etat || 'Très bon état';
        document.getElementById('modal-produit-statut').value = p.statut || 'disponible';
        document.getElementById('modal-produit-prix').value = p.prix || '';
        document.getElementById('modal-produit-prix-original').value = p.prix_original || '';
        document.getElementById('modal-produit-couleur').value = p.couleur || '';
        document.getElementById('modal-produit-ville').value = p.ville || 'Dakar';
        document.getElementById('modal-produit-image').value = (p.images && p.images[0]) || '';
        document.getElementById('modal-produit-description').value = p.description || '';
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    titreEl.textContent = 'Ajouter un produit';
    idEl.value = '';
    document.getElementById('modal-produit-statut').value = 'disponible';
  }

  modalProduitBS = new bootstrap.Modal(modalEl);
  modalProduitBS.show();
}

async function enregistrerFormulaireProduit(e) {
  e.preventDefault();
  const id = document.getElementById('modal-produit-id').value;
  const donnees = {
    titre: document.getElementById('modal-produit-nom').value,
    categorie: document.getElementById('modal-produit-categorie').value,
    taille: document.getElementById('modal-produit-taille').value,
    etat: document.getElementById('modal-produit-etat').value,
    statut: document.getElementById('modal-produit-statut').value,
    prix: Number(document.getElementById('modal-produit-prix').value),
    prix_original: Number(document.getElementById('modal-produit-prix-original').value || 0),
    couleur: document.getElementById('modal-produit-couleur').value,
    ville: document.getElementById('modal-produit-ville').value,
    image: document.getElementById('modal-produit-image').value,
    description: document.getElementById('modal-produit-description').value,
  };

  try {
    if (id) {
      await adminModifierProduit(id, {
        ...donnees,
        images: donnees.image ? [donnees.image] : [],
      });
      afficherToast('Produit mis à jour avec succès.', 'succes');
    } else {
      await adminCreerProduit(donnees);
      afficherToast('Nouveau produit ajouté au catalogue.', 'succes');
    }

    modalProduitBS?.hide();
    chargerProduits();
    chargerDashboard();
  } catch (err) {
    console.error('Erreur enregistrement produit:', err);
    afficherToast(`Erreur : ${err.message}`, 'erreur');
  }
}

async function executerSuppressionProduit(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
    return;
  }
  try {
    await adminSupprimerProduit(id);
    afficherToast('Article supprimé du catalogue.', 'info');
    chargerProduits();
    chargerDashboard();
  } catch (err) {
    console.error('Erreur suppression produit:', err);
    afficherToast(`Erreur : ${err.message}`, 'erreur');
  }
}

// ----------------------------------------------------------------------------
// ONGLET 3 : GESTION DES COMMANDES
// ----------------------------------------------------------------------------
async function chargerCommandes() {
  const tbody = document.getElementById('tbody-commandes');
  try {
    const commandes = await adminListerCommandes(filtresCommandes);
    if (!commandes || commandes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 meta">Aucune commande trouvée.</td></tr>';
      return;
    }

    tbody.innerHTML = commandes.map((c) => {
      const dateStr = new Date(c.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const clientNom = c.acheteur?.nom || 'Client inconnu';
      const clientEmail = c.acheteur?.email || '';
      const clientTel = c.telephone_contact || c.acheteur?.telephone || 'Non renseigné';
      const nbArticles = c.articles?.length || 0;

      return `
        <tr>
          <td>
            <div class="fw-medium font-monospace small">#${c.id.slice(0, 8)}</div>
            <div class="meta" style="font-size:0.72rem;">${dateStr}</div>
          </td>
          <td>
            <div class="fw-medium">${clientNom}</div>
            <div class="meta" style="font-size:0.72rem;">${clientTel} · ${clientEmail}</div>
          </td>
          <td>
            <span class="meta">${nbArticles} article(s)</span>
          </td>
          <td>
            <div class="fw-bold text-warning">${Number(c.total).toLocaleString('fr-FR')} FCFA</div>
          </td>
          <td>
            <span class="small">${c.mode_paiement || 'Paiement livraison'}</span>
          </td>
          <td>
            <select class="form-select form-select-sm select-statut-commande" data-id="${c.id}" style="font-size:0.78rem; min-width:130px;">
              <option value="en attente" ${c.statut === 'en attente' ? 'selected' : ''}>En attente</option>
              <option value="confirmée" ${c.statut === 'confirmée' ? 'selected' : ''}>Confirmée</option>
              <option value="expédiée" ${c.statut === 'expédiée' ? 'selected' : ''}>Expédiée</option>
              <option value="livrée" ${c.statut === 'livrée' ? 'selected' : ''}>Livrée</option>
              <option value="annulée" ${c.statut === 'annulée' ? 'selected' : ''}>Annulée</option>
            </select>
          </td>
          <td class="text-end">
            <div class="d-inline-flex gap-2">
              <button class="btn btn-action py-1 px-2 btn-detail-commande" data-id="${c.id}" title="Voir détails">
                👁 Détails
              </button>
              <button class="btn btn-action btn-danger-action py-1 px-2 btn-supprimer-commande" data-id="${c.id}" title="Supprimer">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Écouteurs de changement de statut
    tbody.querySelectorAll('.select-statut-commande').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const id = sel.getAttribute('data-id');
        const nouveauStatut = e.target.value;
        try {
          await adminChangerStatutCommande(id, nouveauStatut);
          afficherToast(`Statut de la commande mis à jour : ${nouveauStatut}`, 'succes');
          chargerDashboard();
        } catch (err) {
          afficherToast(`Erreur mise à jour commande: ${err.message}`, 'erreur');
        }
      });
    });

    // Écouteurs de détails et suppression
    tbody.querySelectorAll('.btn-detail-commande').forEach((btn) => {
      btn.addEventListener('click', () => afficherModalDetailCommande(btn.getAttribute('data-id')));
    });

    tbody.querySelectorAll('.btn-supprimer-commande').forEach((btn) => {
      btn.addEventListener('click', () => executerSuppressionCommande(btn.getAttribute('data-id')));
    });

  } catch (err) {
    console.error('Erreur chargement commandes:', err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">${err.message}</td></tr>`;
  }
}

async function afficherModalDetailCommande(id) {
  const corps = document.getElementById('modal-commande-corps');
  corps.innerHTML = '<p class="meta">Chargement des détails…</p>';

  modalCommandeBS = new bootstrap.Modal(document.getElementById('modal-commande-detail'));
  modalCommandeBS.show();

  try {
    const commandes = await adminListerCommandes();
    const c = commandes.find((item) => item.id === id);
    if (!c) {
      corps.innerHTML = '<p class="text-danger">Commande introuvable.</p>';
      return;
    }

    const articles = c.articles || [];

    corps.innerHTML = `
      <div class="row g-3 mb-3 border-bottom pb-3">
        <div class="col-sm-6">
          <label>Identifiant Commande</label>
          <div class="font-monospace small">#${c.id}</div>
        </div>
        <div class="col-sm-6">
          <label>Date</label>
          <div>${new Date(c.created_at).toLocaleString('fr-FR')}</div>
        </div>
        <div class="col-sm-6">
          <label>Destinataire</label>
          <div class="fw-medium">${c.acheteur?.nom || 'Client'}</div>
          <div class="meta small">${c.acheteur?.email || ''}</div>
          <div class="meta small">Tél : ${c.telephone_contact || 'Non renseigné'}</div>
        </div>
        <div class="col-sm-6">
          <label>Adresse de livraison</label>
          <div>${c.adresse_livraison || 'Non renseignée'}</div>
          <div class="meta small mt-1">Mode de paiement : <strong>${c.mode_paiement}</strong></div>
        </div>
      </div>

      <h4 class="fs-6 text-uppercase letter-spacing-1 mb-2">Articles commandés (${articles.length})</h4>
      <div class="d-flex flex-column gap-2 mb-3">
        ${articles.map((art) => `
          <div class="d-flex justify-content-between align-items-center border p-2" style="background:var(--obsidienne-3); border-color:var(--ligne) !important;">
            <div class="d-flex align-items-center gap-3">
              ${art.image ? `<img src="${art.image}" class="miniature-produit" style="width:36px; height:46px;">` : ''}
              <div>
                <div class="small fw-medium">${art.titre || 'Article'}</div>
              </div>
            </div>
            <div class="text-warning fw-bold small">${Number(art.prix).toLocaleString('fr-FR')} FCFA</div>
          </div>
        `).join('')}
      </div>

      <div class="d-flex justify-content-between align-items-center pt-2 border-top">
        <span class="fs-5">Total de la commande :</span>
        <span class="fs-4 text-warning fw-bold">${Number(c.total).toLocaleString('fr-FR')} FCFA</span>
      </div>
    `;
  } catch (err) {
    corps.innerHTML = `<p class="text-danger">${err.message}</p>`;
  }
}

async function executerSuppressionCommande(id) {
  if (!confirm('Voulez-vous supprimer cette commande ?')) return;
  try {
    await adminSupprimerCommande(id);
    afficherToast('Commande supprimée.', 'info');
    chargerCommandes();
    chargerDashboard();
  } catch (err) {
    afficherToast(`Erreur : ${err.message}`, 'erreur');
  }
}

// ----------------------------------------------------------------------------
// ONGLET 4 : GESTION DES UTILISATEURS
// ----------------------------------------------------------------------------
async function chargerUtilisateurs() {
  const tbody = document.getElementById('tbody-utilisateurs');
  try {
    const utilisateurs = await adminListerUtilisateurs();
    if (!utilisateurs || utilisateurs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 meta">Aucun utilisateur enregistré.</td></tr>';
      return;
    }

    tbody.innerHTML = utilisateurs.map((u) => {
      const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—';
      return `
        <tr>
          <td>
            <div class="fw-medium">${u.nom || 'Sans nom'}</div>
          </td>
          <td>
            <div class="meta">${u.email}</div>
          </td>
          <td><span class="small">${u.ville || 'Dakar'}</span></td>
          <td><span class="small">${u.telephone || '—'}</span></td>
          <td>
            <span class="badge-role ${u.role}">${u.role}</span>
          </td>
          <td>
            <select class="form-select form-select-sm select-role-user" data-id="${u.id}" style="font-size:0.78rem; min-width:120px;">
              <option value="acheteur" ${u.role === 'acheteur' ? 'selected' : ''}>Acheteur</option>
              <option value="vendeur" ${u.role === 'vendeur' ? 'selected' : ''}>Vendeur</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrateur</option>
            </select>
          </td>
          <td><span class="meta" style="font-size:0.75rem;">${dateStr}</span></td>
          <td class="text-end">
            <button class="btn btn-action btn-danger-action py-1 px-2 btn-supprimer-user" data-id="${u.id}" title="Supprimer utilisateur">
              ✕
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Écouteurs de changement de rôle
    tbody.querySelectorAll('.select-role-user').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const id = sel.getAttribute('data-id');
        const nouveauRole = e.target.value;
        try {
          await adminChangerRole(id, nouveauRole);
          afficherToast(`Rôle mis à jour : ${nouveauRole}`, 'succes');
          chargerDashboard();
        } catch (err) {
          afficherToast(`Erreur mise à jour rôle : ${err.message}`, 'erreur');
        }
      });
    });

    // Écouteurs de suppression d'utilisateur
    tbody.querySelectorAll('.btn-supprimer-user').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Voulez-vous supprimer ce compte utilisateur ?')) return;
        try {
          await adminSupprimerUtilisateur(id);
          afficherToast('Utilisateur supprimé.', 'info');
          chargerUtilisateurs();
          chargerDashboard();
        } catch (err) {
          afficherToast(`Erreur : ${err.message}`, 'erreur');
        }
      });
    });

  } catch (err) {
    console.error('Erreur chargement utilisateurs:', err);
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${err.message}</td></tr>`;
  }
}

// ----------------------------------------------------------------------------
// INITIALISATION GLOBALE
// ----------------------------------------------------------------------------
function chargerDonneesGlobales() {
  chargerDashboard();
  chargerProduits();
  chargerCommandes();
  chargerUtilisateurs();
}

function initEvenements() {
  // Formulaire de connexion Admin
  const formeLogin = document.getElementById('forme-connexion-admin');
  const alerteLogin = document.getElementById('auth-admin-alerte');

  formeLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('input-admin-email').value;
    const mdp = document.getElementById('input-admin-mdp').value;
    const btn = document.getElementById('btn-submit-login');

    try {
      btn.disabled = true;
      btn.textContent = 'Connexion en cours...';
      alerteLogin.classList.add('d-none');

      await adminConnexion(email, mdp);
      afficherToast('Connexion administrateur réussie.', 'succes');
      basculerEcran();
    } catch (err) {
      alerteLogin.textContent = err.message || 'Impossible de se connecter.';
      alerteLogin.classList.remove('d-none');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Se connecter au tableau de bord';
    }
  });

  // Bouton Remplir Démo
  document.getElementById('btn-remplir-demo')?.addEventListener('click', () => {
    document.getElementById('input-admin-email').value = 'admin.demo@dekkal.sn';
    document.getElementById('input-admin-mdp').value = 'admin123';
  });

  // Bouton Déconnexion
  document.getElementById('btn-admin-deconnexion')?.addEventListener('click', () => {
    adminDeconnexion();
    basculerEcran();
    afficherToast('Vous êtes déconnecté de l\'espace admin.', 'info');
  });

  // Boutons d'actualisation manuelle
  document.getElementById('btn-rafraichir-stats')?.addEventListener('click', () => {
    chargerDashboard();
    afficherToast('Données actualisées.', 'info');
  });
  document.getElementById('btn-rafraichir-commandes')?.addEventListener('click', () => {
    chargerCommandes();
    afficherToast('Commandes actualisées.', 'info');
  });

  // Filtres Produits
  document.getElementById('filtre-produits-recherche')?.addEventListener('input', (e) => {
    filtresProduits.recherche = e.target.value;
    chargerProduits();
  });
  document.getElementById('filtre-produits-categorie')?.addEventListener('change', (e) => {
    filtresProduits.categorie = e.target.value;
    chargerProduits();
  });
  document.getElementById('filtre-produits-statut')?.addEventListener('change', (e) => {
    filtresProduits.statut = e.target.value;
    chargerProduits();
  });
  document.getElementById('btn-reinitialiser-filtres-produits')?.addEventListener('click', () => {
    document.getElementById('filtre-produits-recherche').value = '';
    document.getElementById('filtre-produits-categorie').value = '';
    document.getElementById('filtre-produits-statut').value = '';
    filtresProduits = { recherche: '', categorie: '', statut: '' };
    chargerProduits();
  });

  // Filtre Commandes
  document.getElementById('filtre-commandes-statut')?.addEventListener('change', (e) => {
    filtresCommandes.statut = e.target.value;
    chargerCommandes();
  });

  // Formulaire d'ajout / modification de produit
  document.getElementById('btn-nouveau-produit')?.addEventListener('click', () => ouvrirModalProduit(null));
  document.getElementById('forme-modal-produit')?.addEventListener('submit', enregistrerFormulaireProduit);

  // Configuration Supabase Modal
  const modalSupabaseEl = document.getElementById('modal-config-supabase');
  document.getElementById('btn-modal-supabase')?.addEventListener('click', () => {
    const config = obtenirConfigSupabase();
    document.getElementById('config-supabase-url').value = config.url;
    document.getElementById('config-supabase-key').value = config.anonKey;
    modalSupabaseBS = new bootstrap.Modal(modalSupabaseEl);
    modalSupabaseBS.show();
  });

  document.getElementById('forme-config-supabase')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('config-supabase-url').value;
    const anonKey = document.getElementById('config-supabase-key').value;
    sauvegarderConfigSupabase(url, anonKey);
    majIndicateurSupabase();
    modalSupabaseBS?.hide();
    afficherToast('Configuration Supabase enregistrée.', 'succes');
    chargerDonneesGlobales();
  });

  document.getElementById('btn-reinitialiser-demo-mode')?.addEventListener('click', () => {
    sauvegarderConfigSupabase('', '');
    document.getElementById('config-supabase-url').value = '';
    document.getElementById('config-supabase-key').value = '';
    majIndicateurSupabase();
    modalSupabaseBS?.hide();
    afficherToast('Mode Démo local réactivé.', 'info');
    chargerDonneesGlobales();
  });
}

// ----------------------------------------------------------------------------
// DÉMARRAGE
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  majIndicateurSupabase();
  initOnglets();
  initEvenements();
  basculerEcran();
});
