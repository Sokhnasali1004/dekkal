// main.js — logique partagée par toutes les pages (nav, badge panier)
import { estConnecte, utilisateurConnecte, deconnecter } from './auth.js';
import { panier } from './cart.js';

function majBadgePanier() {
  document.querySelectorAll('[data-badge-panier]').forEach((el) => {
    el.textContent = panier.nombre();
  });
}

function majZoneCompte() {
  const zone = document.querySelector('[data-zone-compte]');
  if (!zone) return;

  const adminSession = localStorage.getItem('dekkal_admin_session');
  let adminUser = null;
  if (adminSession) {
    try { adminUser = JSON.parse(adminSession); } catch(e) {}
  }

  if (estConnecte() || adminUser) {
    const user = utilisateurConnecte() || adminUser;
    const estAdmin = user?.role === 'admin' || Boolean(adminUser);

    zone.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-dekkal-outline dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
          ${user.nom.split(' ')[0]} ${estAdmin ? '<span class="badge-role admin py-0 px-1" style="font-size:0.6rem;">Admin</span>' : ''}
        </button>
        <ul class="dropdown-menu dropdown-menu-end" style="background:var(--obsidienne-2); border:1px solid var(--ligne);">
          ${estAdmin ? '<li><a class="dropdown-item" href="admin.html" style="color:var(--laiton);">👑 Administration</a></li><li><hr class="dropdown-divider" style="border-color:var(--ligne);"></li>' : ''}
          <li><a class="dropdown-item text-light" href="compte.html">Mon compte</a></li>
          <li><button class="dropdown-item text-light" id="btn-deconnexion">Se déconnecter</button></li>
        </ul>
      </div>`;
    document.getElementById('btn-deconnexion')?.addEventListener('click', deconnecter);
  } else {
    zone.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="compte.html" class="btn btn-dekkal-outline">Se connecter</a>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  majBadgePanier();
  majZoneCompte();
});
document.addEventListener('panier:maj', majBadgePanier);
