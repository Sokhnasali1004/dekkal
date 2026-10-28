// catalogue.js — liste des produits avec filtres dynamiques (avancé : URLSearchParams, debounce)
import { api } from './api.js';
import { panier } from './cart.js';

const grille = document.getElementById('grille-produits');
const formeFiltres = document.getElementById('forme-filtres');
const compteur = document.getElementById('compteur-resultats');

function debounce(fn, delai = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delai);
  };
}

function carteProduit(p) {
  const image = p.images?.[0];
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <a href="produit.html?id=${p._id}" class="carte-etiquette d-block h-100 text-decoration-none">
        <div class="zone-image">
          ${image ? `<img src="${image}" alt="${p.titre}" class="w-100 h-100 object-fit-cover">` : p.categorie}
          <span class="tampon-etat">${p.etat}</span>
        </div>
        <div class="corps">
          <div class="meta">${p.categorie} · Taille ${p.taille}</div>
          <div class="titre">${p.titre}</div>
          <div class="mt-1">
            <span class="prix">${p.prix.toLocaleString('fr-FR')} FCFA</span>
            ${p.prixOriginal ? `<span class="prix-original">${p.prixOriginal.toLocaleString('fr-FR')} FCFA</span>` : ''}
          </div>
        </div>
      </a>
    </div>`;
}

async function chargerProduits() {
  grille.innerHTML = `<p class="text-center py-5 w-100">Chargement des articles…</p>`;
  const params = new URLSearchParams(new FormData(formeFiltres));
  // on retire les champs vides pour ne pas polluer la requête
  [...params.keys()].forEach((cle) => { if (!params.get(cle)) params.delete(cle); });

  try {
    const produits = await api.get(`/produits?${params.toString()}`);
    compteur.textContent = `${produits.length} article${produits.length > 1 ? 's' : ''} trouvé${produits.length > 1 ? 's' : ''}`;
    grille.innerHTML = produits.length
      ? produits.map(carteProduit).join('')
      : `<p class="text-center py-5 w-100">Aucun article ne correspond à ces filtres.</p>`;
  } catch (err) {
    grille.innerHTML = `<p class="text-center py-5 w-100 text-danger">Impossible de charger les articles : ${err.message}</p>`;
  }
}

document.querySelectorAll('.chip-categorie').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip-categorie').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    formeFiltres.querySelector('[name="categorie"]').value = chip.dataset.categorie || '';
    chargerProduits();
  });
});

formeFiltres.addEventListener('input', debounce(chargerProduits));
formeFiltres.addEventListener('submit', (e) => e.preventDefault());

chargerProduits();
