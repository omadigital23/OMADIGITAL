-- ============================================================
-- 1. ACTIVATION DES EXTENSIONS NÉCESSAIRES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. CRÉATION DES TABLES
-- ============================================================

-- Table des Contacts & Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    phone TEXT NOT NULL,
    business_type TEXT,
    message TEXT,
    service TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Réservations (Bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    service TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour la Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ACTIVATION DE LA SÉCURITÉ AU NIVEAU DES LIGNES (RLS)
-- ============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. POLITIQUES DE SÉCURITÉ (POLICIES)
-- ============================================================
-- Règle d'or : On n'autorise aucune lecture ou écriture avec la clé "anon" (publique).
-- Tout passe par le serveur (Next.js avec service_role_key) ou par un admin authentifié.

-- Suppression des anciennes règles potentiellement permissives
DROP POLICY IF EXISTS "Allow public lead inserts" ON public.leads;
DROP POLICY IF EXISTS "Allow public newsletter inserts" ON public.newsletter;
DROP POLICY IF EXISTS "Allow public booking inserts" ON public.bookings;

-- Politiques pour les LEADS
-- Seuls les utilisateurs authentifiés (les administrateurs) peuvent lire, modifier ou supprimer.
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les RÉSERVATIONS
CREATE POLICY "Admins can view bookings" ON public.bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour la NEWSLETTER
CREATE POLICY "Admins can view newsletter" ON public.newsletter FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update newsletter" ON public.newsletter FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete newsletter" ON public.newsletter FOR DELETE USING (auth.role() = 'authenticated');


-- ============================================================
-- 5. TRIGGERS & FONCTIONS DE COMMODITÉ (BONNES PRATIQUES)
-- ============================================================

-- Fonction pour mettre à jour automatiquement le champ "updated_at"
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application du trigger sur la table leads
DROP TRIGGER IF EXISTS update_leads_modtime ON public.leads;
CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Application du trigger sur la table bookings
DROP TRIGGER IF EXISTS update_bookings_modtime ON public.bookings;
CREATE TRIGGER update_bookings_modtime
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ============================================================
-- 6. INDEXATION (POUR LES PERFORMANCES)
-- ============================================================
-- Accélère les recherches fréquentes dans le tableau de bord admin
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter(email);
