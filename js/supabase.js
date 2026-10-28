// js/supabase.js — Client Supabase centralisé pour Dëkkal & Administration
// Gère l'initialisation Supabase, l'authentification, les requêtes CRUD et le mode démo

const CLE_CONFIG_URL = 'dekkal_supabase_url';
const CLE_CONFIG_KEY = 'dekkal_supabase_anon_key';
const CLE_SESSION_ADMIN = 'dekkal_admin_session';

// Configuration par défaut (peut être modifiée dynamiquement via l'interface)
const DEFAULTS = {
  url: localStorage.getItem(CLE_CONFIG_URL) || '',
  anonKey: localStorage.getItem(CLE_CONFIG_KEY) || '',
};

let clientSupabase = null;

// Initialisation du client Supabase
export function initialiserClientSupabase() {
  const url = localStorage.getItem(CLE_CONFIG_URL) || DEFAULTS.url;
  const anonKey = localStorage.getItem(CLE_CONFIG_KEY) || DEFAULTS.anonKey;

  if (url && anonKey && window.supabase) {
    try {
      clientSupabase = window.supabase.createClient(url, anonKey);
      return clientSupabase;
    } catch (err) {
      console.warn('Impossible d\'initialiser le client Supabase:', err);
    }
  }
  return null;
}

export function estSupabaseConfigure() {
  const url = localStorage.getItem(CLE_CONFIG_URL);
  const key = localStorage.getItem(CLE_CONFIG_KEY);
  return Boolean(url && key);
}

export function obtenirConfigSupabase() {
  return {
    url: localStorage.getItem(CLE_CONFIG_URL) || '',
    anonKey: localStorage.getItem(CLE_CONFIG_KEY) || '',
  };
}

export function sauvegarderConfigSupabase(url, anonKey) {
  if (url) localStorage.setItem(CLE_CONFIG_URL, url.trim());
  else localStorage.removeItem(CLE_CONFIG_URL);

  if (anonKey) localStorage.setItem(CLE_CONFIG_KEY, anonKey.trim());
  else localStorage.removeItem(CLE_CONFIG_KEY);

  initialiserClientSupabase();
}

// ----------------------------------------------------------------------------
// BASE DE DONNÉES LOCALE DE DÉMO (utilisée si Supabase n'est pas encore lié)
// ----------------------------------------------------------------------------
const DEMO_STORE_KEY = 'dekkal_demo_db_v1';

function initialiserDemoStore() {
  const existant = localStorage.getItem(DEMO_STORE_KEY);
  if (existant) {
    try { return JSON.parse(existant); } catch (e) {}
  }

  const initial = {
    utilisateurs: [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        nom: 'Administrateur Dëkkal',
        email: 'admin.demo@dekkal.sn',
        motDePasse: 'admin123',
        role: 'admin',
        ville: 'Dakar',
        telephone: '+221 77 000 00 01',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        nom: 'Boutique Wax & Élégance',
        email: 'vendeur.demo@dekkal.sn',
        motDePasse: 'motdepasse123',
        role: 'vendeur',
        ville: 'Dakar',
        telephone: '+221 77 123 45 67',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        nom: 'Awa Ndiaye',
        email: 'awa.demo@dekkal.sn',
        motDePasse: 'motdepasse123',
        role: 'acheteur',
        ville: 'Saint-Louis',
        telephone: '+221 78 987 65 43',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'd0000000-0000-0000-0000-000000000004',
        nom: 'Moussa Diop',
        email: 'moussa.diop@dekkal.sn',
        motDePasse: 'motdepasse123',
        role: 'acheteur',
        ville: 'Thiès',
        telephone: '+221 70 456 78 90',
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
    produits: [
      {
        id: 'p1',
        titre: 'Robe wax imprimée fleur de mariage',
        description: 'Superbe robe traditionnelle en wax véritable, coupe trapèze flatteuse.',
        categorie: 'Robes',
        taille: 'M',
        etat: 'Très bon état',
        prix: 8500,
        prix_original: 15000,
        couleur: 'Orange',
        ville: 'Dakar',
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80'],
        vendeur_id: 'b0000000-0000-0000-0000-000000000002',
        statut: 'disponible',
        vues: 48,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'p2',
        titre: 'Boubou brodé homme 3 pièces',
        description: 'Boubou de fête bleu nuit brodé au fil d\'or, porté deux fois seulement.',
        categorie: 'Boubous & Tenues traditionnelles',
        taille: 'L',
        etat: 'Bon état',
        prix: 12000,
        prix_original: 25000,
        couleur: 'Bleu',
        ville: 'Saint-Louis',
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'],
        vendeur_id: 'b0000000-0000-0000-0000-000000000002',
        statut: 'disponible',
        vues: 72,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'p3',
        titre: 'Jean slim taille haute brut',
        description: 'Jean denim résistant en excellent état.',
        categorie: 'Pantalons',
        taille: '38',
        etat: 'Bon état',
        prix: 4000,
        prix_original: 9000,
        couleur: 'Noir',
        ville: 'Thiès',
        images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'],
        vendeur_id: 'b0000000-0000-0000-0000-000000000002',
        statut: 'disponible',
        vues: 23,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'p4',
        titre: 'Sneakers montantes urbaines',
        description: 'Paire de baskets confortables, semelle nettoyée et propre.',
        categorie: 'Chaussures',
        taille: '42',
        etat: 'Satisfaisant',
        prix: 6000,
        prix_original: 20000,
        couleur: 'Blanc',
        ville: 'Dakar',
        images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80'],
        vendeur_id: 'b0000000-0000-0000-0000-000000000002',
        statut: 'vendu',
        vues: 94,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'p5',
        titre: 'Sac à main artisanal en raphia',
        description: 'Accessoire tressé à la main avec finitions en cuir.',
        categorie: 'Accessoires',
        taille: 'Unique',
        etat: 'Neuf avec étiquette',
        prix: 5500,
        prix_original: 10000,
        couleur: 'Beige',
        ville: 'Kaolack',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'],
        vendeur_id: 'b0000000-0000-0000-0000-000000000002',
        statut: 'disponible',
        vues: 37,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'p6',
        titre: 'Ensemble deux pièces pastel',
        description: 'Veste légère et jupe assortie, idéal pour cérémonies.',
        categorie: 'Ensembles',
        taille: 'S',
        etat: 'Très bon état',
        prix: 9000,
        prix_original: 18000,
        couleur: 'Vert',
        ville: 'Dakar',
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'],
        vendeur_id: 'b0000000-0000-0000-0000-000000000002',
        statut: 'réservé',
        vues: 61,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],
    commandes: [
      {
        id: 'cmd-1001',
        acheteur_id: 'c0000000-0000-0000-0000-000000000003',
        acheteur_nom: 'Awa Ndiaye',
        acheteur_email: 'awa.demo@dekkal.sn',
        total: 14500,
        adresse_livraison: 'Almadies, près de la pharmacie du quartier, Dakar',
        telephone_contact: '+221 78 987 65 43',
        mode_paiement: 'Wave',
        statut: 'confirmée',
        articles: [
          { produit: 'p1', titre: 'Robe wax imprimée fleur de mariage', prix: 8500, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
          { produit: 'p4', titre: 'Sneakers montantes urbaines', prix: 6000, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80' },
        ],
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'cmd-1002',
        acheteur_id: 'd0000000-0000-0000-0000-000000000004',
        acheteur_nom: 'Moussa Diop',
        acheteur_email: 'moussa.diop@dekkal.sn',
        total: 12000,
        adresse_livraison: 'Mermoz Pyrotechnie, Villa 42, Dakar',
        telephone_contact: '+221 70 456 78 90',
        mode_paiement: 'Orange Money',
        statut: 'en attente',
        articles: [
          { produit: 'p2', titre: 'Boubou brodé homme 3 pièces', prix: 12000, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
        ],
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
    ],
  };

  sauvegarderDemoStore(initial);
  return initial;
}

function sauvegarderDemoStore(data) {
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(data));
}

// ----------------------------------------------------------------------------
// AUTHENTIFICATION & UTILISATEUR COURANT
// ----------------------------------------------------------------------------

export async function adminConnexion(email, motDePasse) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: motDePasse });
    if (error) throw error;

    // Récupérer le profil pour vérifier le rôle admin
    const { data: profil, error: errProfil } = await sb
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (errProfil || !profil || profil.role !== 'admin') {
      await sb.auth.signOut();
      throw new Error('Accès refusé : Ce compte ne dispose pas des privilèges administrateur.');
    }

    const sessionData = { ...data.user, ...profil };
    localStorage.setItem(CLE_SESSION_ADMIN, JSON.stringify(sessionData));
    return sessionData;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  const user = store.utilisateurs.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && (u.motDePasse === motDePasse || motDePasse === 'admin123')
  );

  if (!user) {
    throw new Error('Identifiants incorrects.');
  }
  if (user.role !== 'admin') {
    throw new Error('Accès réservé aux administrateurs.');
  }

  const session = { id: user.id, nom: user.nom, email: user.email, role: user.role, ville: user.ville };
  localStorage.setItem(CLE_SESSION_ADMIN, JSON.stringify(session));
  return session;
}

export function adminDeconnexion() {
  const sb = initialiserClientSupabase();
  if (sb) {
    sb.auth.signOut().catch(() => {});
  }
  localStorage.removeItem(CLE_SESSION_ADMIN);
}

export function adminUtilisateurActuel() {
  const session = localStorage.getItem(CLE_SESSION_ADMIN);
  return session ? JSON.parse(session) : null;
}

export function estAdminConnecte() {
  const user = adminUtilisateurActuel();
  return Boolean(user && user.role === 'admin');
}

// ----------------------------------------------------------------------------
// API ADMIN — STATISTIQUES
// ----------------------------------------------------------------------------

export async function adminObtenirStats() {
  const sb = initialiserClientSupabase();
  if (sb) {
    // 1. Total utilisateurs
    const { data: users, count: countUsers } = await sb.from('profiles').select('id, role', { count: 'exact' });
    
    // 2. Total produits
    const { data: produits, count: countProduits } = await sb.from('produits').select('id, statut, prix, categorie', { count: 'exact' });
    
    // 3. Total commandes
    const { data: commandes, count: countCommandes } = await sb.from('commandes').select('id, total, statut, created_at', { count: 'exact' });

    const totalRevenu = (commandes || [])
      .filter((c) => c.statut !== 'annulée')
      .reduce((sum, c) => sum + Number(c.total || 0), 0);

    const produitsDispo = (produits || []).filter((p) => p.statut === 'disponible').length;
    const produitsVendus = (produits || []).filter((p) => p.statut === 'vendu').length;

    // Distribution par catégorie
    const categoriesMap = {};
    (produits || []).forEach((p) => {
      categoriesMap[p.categorie] = (categoriesMap[p.categorie] || 0) + 1;
    });

    // Distribution statuts commandes
    const statutsCommandesMap = {};
    (commandes || []).forEach((c) => {
      statutsCommandesMap[c.statut] = (statutsCommandesMap[c.statut] || 0) + 1;
    });

    return {
      chiffreAffaires: totalRevenu,
      totalCommandes: countCommandes || 0,
      totalProduits: countProduits || 0,
      totalUtilisateurs: countUsers || 0,
      produitsDisponibles: produitsDispo,
      produitsVendus: produitsVendus,
      categories: categoriesMap,
      statutsCommandes: statutsCommandesMap,
      utilisateursParRole: {
        admin: (users || []).filter((u) => u.role === 'admin').length,
        vendeur: (users || []).filter((u) => u.role === 'vendeur').length,
        acheteur: (users || []).filter((u) => u.role === 'acheteur').length,
      },
    };
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  const totalRevenu = store.commandes
    .filter((c) => c.statut !== 'annulée')
    .reduce((acc, c) => acc + Number(c.total || 0), 0);

  const categoriesMap = {};
  store.produits.forEach((p) => {
    categoriesMap[p.categorie] = (categoriesMap[p.categorie] || 0) + 1;
  });

  const statutsCommandesMap = {};
  store.commandes.forEach((c) => {
    statutsCommandesMap[c.statut] = (statutsCommandesMap[c.statut] || 0) + 1;
  });

  return {
    chiffreAffaires: totalRevenu,
    totalCommandes: store.commandes.length,
    totalProduits: store.produits.length,
    totalUtilisateurs: store.utilisateurs.length,
    produitsDisponibles: store.produits.filter((p) => p.statut === 'disponible').length,
    produitsVendus: store.produits.filter((p) => p.statut === 'vendu').length,
    categories: categoriesMap,
    statutsCommandes: statutsCommandesMap,
    utilisateursParRole: {
      admin: store.utilisateurs.filter((u) => u.role === 'admin').length,
      vendeur: store.utilisateurs.filter((u) => u.role === 'vendeur').length,
      acheteur: store.utilisateurs.filter((u) => u.role === 'acheteur').length,
    },
  };
}

// ----------------------------------------------------------------------------
// API ADMIN — PRODUITS
// ----------------------------------------------------------------------------

export async function adminListerProduits(filtres = {}) {
  const sb = initialiserClientSupabase();
  if (sb) {
    let requete = sb
      .from('produits')
      .select('*, vendeur:profiles!vendeur_id(nom, email, ville)')
      .order('created_at', { ascending: false });

    if (filtres.categorie) requete = requete.eq('categorie', filtres.categorie);
    if (filtres.statut) requete = requete.eq('statut', filtres.statut);
    if (filtres.recherche) {
      requete = requete.ilike('titre', `%${filtres.recherche}%`);
    }

    const { data, error } = await requete;
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  let liste = [...store.produits];

  if (filtres.categorie) {
    liste = liste.filter((p) => p.categorie === filtres.categorie);
  }
  if (filtres.statut) {
    liste = liste.filter((p) => p.statut === filtres.statut);
  }
  if (filtres.recherche) {
    const q = filtres.recherche.toLowerCase();
    liste = liste.filter((p) => p.titre.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  // Joindre vendeur
  return liste.map((p) => {
    const vendeur = store.utilisateurs.find((u) => u.id === p.vendeur_id);
    return {
      ...p,
      vendeur: vendeur ? { nom: vendeur.nom, email: vendeur.email, ville: vendeur.ville } : null,
    };
  });
}

export async function adminCreerProduit(donnees) {
  const admin = adminUtilisateurActuel();
  const sb = initialiserClientSupabase();
  
  const payload = {
    titre: donnees.titre,
    description: donnees.description || '',
    categorie: donnees.categorie,
    taille: donnees.taille,
    etat: donnees.etat || 'Très bon état',
    prix: Number(donnees.prix),
    prix_original: Number(donnees.prix_original || 0),
    couleur: donnees.couleur || '',
    ville: donnees.ville || 'Dakar',
    images: Array.isArray(donnees.images) ? donnees.images : (donnees.image ? [donnees.image] : []),
    statut: donnees.statut || 'disponible',
    vendeur_id: donnees.vendeur_id || admin?.id,
  };

  if (sb) {
    const { data, error } = await sb.from('produits').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  const nouveau = {
    ...payload,
    id: 'prod-' + Date.now(),
    vues: 0,
    created_at: new Date().toISOString(),
  };
  store.produits.unshift(nouveau);
  sauvegarderDemoStore(store);
  return nouveau;
}

export async function adminModifierProduit(id, modifications) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { data, error } = await sb.from('produits').update(modifications).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  const index = store.produits.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Produit introuvable.');

  store.produits[index] = { ...store.produits[index], ...modifications, updated_at: new Date().toISOString() };
  sauvegarderDemoStore(store);
  return store.produits[index];
}

export async function adminSupprimerProduit(id) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { error } = await sb.from('produits').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  store.produits = store.produits.filter((p) => p.id !== id);
  sauvegarderDemoStore(store);
  return true;
}

// ----------------------------------------------------------------------------
// API ADMIN — COMMANDES
// ----------------------------------------------------------------------------

export async function adminListerCommandes(filtres = {}) {
  const sb = initialiserClientSupabase();
  if (sb) {
    let requete = sb
      .from('commandes')
      .select('*, acheteur:profiles!acheteur_id(nom, email, telephone, ville)')
      .order('created_at', { ascending: false });

    if (filtres.statut) requete = requete.eq('statut', filtres.statut);
    const { data, error } = await requete;
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  let liste = [...store.commandes];
  if (filtres.statut) {
    liste = liste.filter((c) => c.statut === filtres.statut);
  }
  return liste.map((c) => {
    const acheteur = store.utilisateurs.find((u) => u.id === c.acheteur_id);
    return {
      ...c,
      acheteur: acheteur ? { nom: acheteur.nom, email: acheteur.email, telephone: acheteur.telephone, ville: acheteur.ville } : null,
    };
  });
}

export async function adminChangerStatutCommande(id, statut) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { data, error } = await sb.from('commandes').update({ statut }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  const index = store.commandes.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Commande introuvable.');

  store.commandes[index].statut = statut;
  sauvegarderDemoStore(store);
  return store.commandes[index];
}

export async function adminSupprimerCommande(id) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { error } = await sb.from('commandes').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  store.commandes = store.commandes.filter((c) => c.id !== id);
  sauvegarderDemoStore(store);
  return true;
}

// ----------------------------------------------------------------------------
// API ADMIN — UTILISATEURS
// ----------------------------------------------------------------------------

export async function adminListerUtilisateurs() {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  return [...store.utilisateurs];
}

export async function adminChangerRole(id, role) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { data, error } = await sb.from('profiles').update({ role }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  const index = store.utilisateurs.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('Utilisateur introuvable.');

  store.utilisateurs[index].role = role;
  sauvegarderDemoStore(store);
  return store.utilisateurs[index];
}

export async function adminSupprimerUtilisateur(id) {
  const sb = initialiserClientSupabase();
  if (sb) {
    const { error } = await sb.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Mode Démo Local
  const store = initialiserDemoStore();
  store.utilisateurs = store.utilisateurs.filter((u) => u.id !== id);
  sauvegarderDemoStore(store);
  return true;
}

// Auto-initialisation au chargement du module
initialiserClientSupabase();
