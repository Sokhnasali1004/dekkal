# Guide d'intégration Supabase — Espace Administrateur Dëkkal

Ce guide vous explique comment lier votre projet **Supabase** à l'espace administrateur de **Dëkkal** en quelques clics.

---

## 1. Créer votre projet sur Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et connectez-vous (ou créez un compte gratuit).
2. Cliquez sur **"New project"**.
3. Choisissez un nom de projet (ex: `dekkal-marketplace`), un mot de passe pour la base de données et sélectionnez la région la plus proche.
4. Patientez quelques secondes pendant l'initialisation de votre base PostgreSQL.

---

## 2. Exécuter le script de base de données (Schéma & RLS)

1. Dans votre tableau de bord Supabase, cliquez sur **"SQL Editor"** dans le menu latéral gauche.
2. Cliquez sur **"New query"**.
3. Ouvrez le fichier local [`supabase/schema.sql`](supabase/schema.sql), copiez l'intégralité de son contenu et collez-le dans l'éditeur SQL de Supabase.
4. Cliquez sur **"Run"** (ou Ctrl+Enter) en bas à droite.
5. 🎉 Toutes les tables (`profiles`, `produits`, `commandes`), les règles de sécurité Row Level Security (RLS), les triggers et les données de test sont automatiquement créées !

---

## 3. Récupérer vos clés API Supabase

1. Dans Supabase, allez dans **Project Settings** (icône d'engrenage en bas à gauche) → **API**.
2. Notez deux informations :
   - **Project URL** : ex: `https://votre-projet.supabase.co`
   - **Project API keys (anon / public)** : ex: `eyJhbGciOi...`

---

## 4. Connecter l'espace Administrateur

1. Ouvrez `admin.html` dans votre navigateur (avec Live Server ou votre serveur local).
2. Cliquez sur le bouton **"Supabase"** en haut à gauche.
3. Renseignez votre **Supabase URL** et votre **Supabase Anon Key**, puis cliquez sur **"Enregistrer la configuration"**.
4. Le voyant passe au **vert ("Supabase lié")**.

---

## 5. Comptes de démonstration préconfigurés

### Compte Administrateur :
- **Email :** `admin.demo@dekkal.sn`
- **Mot de passe :** `admin123`
- *(Vous pouvez aussi créer un utilisateur dans Supabase Auth et lui assigner le rôle `admin` dans la table `profiles`)*.

### Compte Vendeur :
- **Email :** `vendeur.demo@dekkal.sn`
- **Mot de passe :** `motdepasse123`

---

## 6. Fonctionnalités de l'espace Administrateur

- 📊 **Tableau de bord :** Chiffre d'affaires global en direct (FCFA), total de commandes, catalogue actif, utilisateurs inscrits et répartition par catégorie.
- 👗 **Gestion des Produits :** Recherche en direct, filtres par statut (`disponible`, `réservé`, `vendu`), modération, ajout et modification rapide via fenêtre modale.
- 📦 **Gestion des Commandes :** Détails complets du client et des articles, sélecteur de statut interactif (`en attente`, `confirmée`, `expédiée`, `livrée`, `annulée`) avec persistance instantanée.
- 👥 **Gestion des Membres :** Liste des inscrits, modification instantanée des rôles (`acheteur`, `vendeur`, `admin`), suppression.
