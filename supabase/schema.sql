-- ============================================================================
-- DËKKAL — Schéma de base de données PostgreSQL pour Supabase
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase (SQL Editor)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS UTILISATEURS (reliée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  ville TEXT DEFAULT 'Dakar',
  telephone TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('acheteur', 'vendeur', 'admin')) DEFAULT 'acheteur',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE DES PRODUITS (Articles de mode de seconde main)
CREATE TABLE IF NOT EXISTS public.produits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  description TEXT DEFAULT '',
  categorie TEXT NOT NULL CHECK (
    categorie IN (
      'Robes',
      'Hauts',
      'Pantalons',
      'Ensembles',
      'Chaussures',
      'Accessoires',
      'Boubous & Tenues traditionnelles'
    )
  ),
  taille TEXT NOT NULL,
  etat TEXT NOT NULL CHECK (
    etat IN ('Neuf avec étiquette', 'Très bon état', 'Bon état', 'Satisfaisant')
  ) DEFAULT 'Très bon état',
  prix NUMERIC(10, 2) NOT NULL CHECK (prix >= 0),
  prix_original NUMERIC(10, 2) DEFAULT 0,
  couleur TEXT DEFAULT '',
  ville TEXT DEFAULT 'Dakar',
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  vendeur_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  statut TEXT NOT NULL CHECK (statut IN ('disponible', 'réservé', 'vendu')) DEFAULT 'disponible',
  vues INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acheteur_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  adresse_livraison TEXT NOT NULL,
  telephone_contact TEXT NOT NULL,
  mode_paiement TEXT NOT NULL CHECK (
    mode_paiement IN ('Wave', 'Orange Money', 'Paiement à la livraison', 'Carte bancaire')
  ) DEFAULT 'Paiement à la livraison',
  statut TEXT NOT NULL CHECK (
    statut IN ('en attente', 'confirmée', 'expédiée', 'livrée', 'annulée')
  ) DEFAULT 'en attente',
  articles JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FONCTIONS & TRIGGERS

-- Trigger pour la mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_produits_updated_at ON public.produits;
CREATE TRIGGER set_produits_updated_at
  BEFORE UPDATE ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_commandes_updated_at ON public.commandes;
CREATE TRIGGER set_commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger automatique pour créer un profil dans public.profiles lors de l'inscription via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, email, role, ville, telephone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'acheteur'),
    COALESCE(NEW.raw_user_meta_data->>'ville', 'Dakar'),
    COALESCE(NEW.raw_user_meta_data->>'telephone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction utilitaire pour vérifier si l'utilisateur actuel est administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

-- Politiques pour PROFILES
CREATE POLICY "Les profils sont lisibles par tous les utilisateurs authentifiés"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Un utilisateur peut modifier son propre profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Les administrateurs ont tous les droits sur les profils"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Politiques pour PRODUITS
CREATE POLICY "Tout le monde peut voir les produits disponibles"
  ON public.produits FOR SELECT
  USING (statut = 'disponible' OR public.is_admin() OR auth.uid() = vendeur_id);

CREATE POLICY "Les vendeurs authentifiés peuvent créer des produits"
  ON public.produits FOR INSERT
  WITH CHECK (auth.uid() = vendeur_id OR public.is_admin());

CREATE POLICY "Les vendeurs peuvent modifier leurs propres produits"
  ON public.produits FOR UPDATE
  USING (auth.uid() = vendeur_id OR public.is_admin());

CREATE POLICY "Les vendeurs et admins peuvent supprimer des produits"
  ON public.produits FOR DELETE
  USING (auth.uid() = vendeur_id OR public.is_admin());

-- Politiques pour COMMANDES
CREATE POLICY "Les acheteurs voient leurs commandes et les admins voient tout"
  ON public.commandes FOR SELECT
  USING (auth.uid() = acheteur_id OR public.is_admin());

CREATE POLICY "Les acheteurs authentifiés peuvent créer une commande"
  ON public.commandes FOR INSERT
  WITH CHECK (auth.uid() = acheteur_id OR public.is_admin());

CREATE POLICY "Seuls les admins peuvent modifier les commandes"
  ON public.commandes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Seuls les admins peuvent supprimer les commandes"
  ON public.commandes FOR DELETE
  USING (public.is_admin());

-- 7. DONNÉES DE DÉMONSTRATION (SEED)
DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_vendeur_id UUID := 'b0000000-0000-0000-0000-000000000002'::uuid;
  v_acheteur_id UUID := 'c0000000-0000-0000-0000-000000000003'::uuid;
  v_prod1 UUID := uuid_generate_v4();
  v_prod2 UUID := uuid_generate_v4();
BEGIN
  -- Insertion de profils exemples
  INSERT INTO public.profiles (id, nom, email, ville, telephone, role)
  VALUES 
    (v_admin_id, 'Administrateur Dëkkal', 'admin.demo@dekkal.sn', 'Dakar', '+221 77 000 00 01', 'admin'),
    (v_vendeur_id, 'Boutique Wax & Élégance', 'vendeur.demo@dekkal.sn', 'Dakar', '+221 77 123 45 67', 'vendeur'),
    (v_acheteur_id, 'Awa Ndiaye', 'awa.demo@dekkal.sn', 'Saint-Louis', '+221 78 987 65 43', 'acheteur')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- Insertion de produits de démo
  INSERT INTO public.produits (id, titre, description, categorie, taille, etat, prix, prix_original, couleur, ville, images, vendeur_id, statut, vues)
  VALUES
    (v_prod1, 'Robe wax imprimée fleur de mariage', 'Superbe robe traditionnelle en wax véritable, coupe trapèze flatteuse.', 'Robes', 'M', 'Très bon état', 8500, 15000, 'Orange', 'Dakar', ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80'], v_vendeur_id, 'disponible', 42),
    (v_prod2, 'Boubou brodé homme 3 pièces', 'Boubou de fête bleu nuit brodé au fil d''or, porté deux fois seulement.', 'Boubous & Tenues traditionnelles', 'L', 'Bon état', 12000, 25000, 'Bleu', 'Saint-Louis', ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'], v_vendeur_id, 'disponible', 68),
    (uuid_generate_v4(), 'Jean slim taille haute brut', 'Jean denim résistant en excellent état.', 'Pantalons', '38', 'Bon état', 4000, 9000, 'Noir', 'Thiès', ARRAY['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80'], v_vendeur_id, 'disponible', 19),
    (uuid_generate_v4(), 'Sneakers montantes urbaines', 'Paire de baskets confortables, semelle nettoyée et propre.', 'Chaussures', '42', 'Satisfaisant', 6000, 20000, 'Blanc', 'Dakar', ARRAY['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80'], v_vendeur_id, 'vendu', 85),
    (uuid_generate_v4(), 'Sac à main artisanal en raphia', 'Accessoire tressé à la main avec finitions en cuir.', 'Accessoires', 'Unique', 'Neuf avec étiquette', 5500, 10000, 'Beige', 'Kaolack', ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'], v_vendeur_id, 'disponible', 33),
    (uuid_generate_v4(), 'Ensemble deux pièces pastel', 'Veste légère et jupe assortie, idéal pour cérémonies.', 'Ensembles', 'S', 'Très bon état', 9000, 18000, 'Vert', 'Dakar', ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'], v_vendeur_id, 'réservé', 54)
  ON CONFLICT (id) DO NOTHING;

  -- Insertion d'une commande exemple
  INSERT INTO public.commandes (id, acheteur_id, total, adresse_livraison, telephone_contact, mode_paiement, statut, articles)
  VALUES (
    uuid_generate_v4(),
    v_acheteur_id,
    14500,
    'Almadies, près de la pharmacie du quartier, Dakar',
    '+221 78 987 65 43',
    'Wave',
    'confirmée',
    jsonb_build_array(
      jsonb_build_object('produit', v_prod1, 'titre', 'Robe wax imprimée fleur de mariage', 'prix', 8500),
      jsonb_build_object('produit', v_prod2, 'titre', 'Sneakers montantes urbaines', 'prix', 6000)
    )
  )
  ON CONFLICT (id) DO NOTHING;
END $$;
