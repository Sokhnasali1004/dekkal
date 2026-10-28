# Dëkkal — Marketplace de vêtements de seconde main

Le site est à la racine du projet (index.html, catalogue.html, etc.) —
tout ce qui touche au serveur/API est regroupé dans le dossier `server/`.

```
dekkal/
├── index.html
├── catalogue.html
├── produit.html
├── panier.html
├── compte.html
├── admin.html                 (Panneau d'administration Supabase / Métriques & Modération)
├── css/style.css              (design "boutique élégante" — fond sombre, accent doré)
├── js/                        (api.js, auth.js, cart.js, main.js, catalogue.js, produit.js, panier.js, compte.js, supabase.js, admin.js)
├── supabase/
│   └── schema.sql             (Schéma PostgreSQL, politiques RLS, triggers & seed)
├── README_SUPABASE.md         (Guide d'installation Supabase)
├── img/
└── server/                    (API Node.js + Express + MongoDB, JWT)
    ├── config/db.js
    ├── controllers/           (auth, produits, commandes, admin)
    ├── middleware/auth.js     (vérification du token JWT et rôle admin)
    ├── models/                (User, Product, Order)
    ├── routes/                (authRoutes, productRoutes, orderRoutes, adminRoutes)
    ├── seed/seed.js
    ├── server.js
    ├── package.json
    └── .env.example
```

## Lancer le serveur (API)

```bash
cd server
npm install
cp .env.example .env      # renseigne MONGO_URI (local ou MongoDB Atlas) et JWT_SECRET
npm run seed               # insère 6 produits de démonstration + un compte vendeur
npm run dev                 # démarre l'API sur http://localhost:5000
```

Compte administrateur de démo :
- email : `admin.demo@dekkal.sn`
- mot de passe : `admin123`

Compte vendeur de démo :
- email : `vendeur.demo@dekkal.sn`
- mot de passe : `motdepasse123`

## Lancer le site

Le site est 100% statique (aucun build requis). Ouvre `index.html` avec
l'extension **Live Server** de VS Code (clic droit → "Open with Live
Server"), ou lance `npx serve .` depuis la racine du projet — pour que les
modules JavaScript (`type="module"`) et les appels `fetch` fonctionnent
correctement. Le site appelle l'API sur `http://localhost:5000/api`
(modifiable dans `js/api.js`, variable `API_BASE`).

## Fonctionnalités

- Accueil avec catégories et présentation
- Catalogue filtrable (catégorie, taille, état, prix max, recherche, tri) — filtres en temps réel via `URLSearchParams`
- Fiche produit dynamique (`produit.html?id=...`)
- Panier persistant en `localStorage`, synchronisé via un évènement personnalisé (`panier:maj`)
- Compte : inscription / connexion (JWT), profil, mes annonces (vendeur), mes commandes (acheteur)
- Commande : création d'une commande côté API, qui marque automatiquement les articles comme vendus

## Prochaines étapes possibles

- Upload d'images réel (actuellement le champ `images` accepte des URLs)
- Messagerie acheteur/vendeur
- Pagination du catalogue
- Formulaire de publication d'annonce directement depuis le site (pour l'instant, ça passe par l'API)
