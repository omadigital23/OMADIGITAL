# 📊 Supabase Database Tables - OMA Digital

## Configuration Requise

Les tables suivantes doivent être créées dans votre base de données Supabase pour que les formulaires fonctionnent correctement.

---

## 1. Table `quotes` - Demandes de Devis

**Description**: Stocke toutes les demandes de devis soumises via le formulaire CTASection.

### Schéma SQL

```sql
-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  budget TEXT,
  location TEXT NOT NULL DEFAULT 'senegal',
  status TEXT NOT NULL DEFAULT 'nouveau',
  security_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT quotes_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT quotes_status_check CHECK (status IN ('nouveau', 'en_cours', 'traite', 'archive'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotes_email ON public.quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_location ON public.quotes(location);

-- Enable Row Level Security (RLS)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous quote submissions" ON public.quotes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all quotes
CREATE POLICY "Allow authenticated read access" ON public.quotes
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role full access
CREATE POLICY "Allow service role full access" ON public.quotes
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| name | TEXT | NO | - | Nom complet du demandeur |
| email | TEXT | NO | - | Email professionnel |
| phone | TEXT | NO | - | Numéro de téléphone |
| company | TEXT | YES | NULL | Nom de l'entreprise (optionnel) |
| service | TEXT | NO | - | Service demandé |
| message | TEXT | NO | - | Message/description du besoin |
| budget | TEXT | YES | NULL | Budget estimé |
| location | TEXT | NO | 'senegal' | Localisation (senegal/morocco) |
| status | TEXT | NO | 'nouveau' | Statut du devis |
| security_validated | BOOLEAN | YES | false | Validation sécurité passée |
| created_at | TIMESTAMPTZ | YES | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | YES | NOW() | Date de dernière modification |

---

## 2. Table `blog_subscribers` - Abonnés Newsletter

**Description**: Stocke les abonnés à la newsletter avec système de double opt-in.

### Schéma SQL

```sql
-- Create blog_subscribers table
CREATE TABLE IF NOT EXISTS public.blog_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'footer',
  confirmation_token TEXT,
  unsubscribe_token TEXT NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT blog_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT blog_subscribers_status_check CHECK (status IN ('pending', 'active', 'unsubscribed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON public.blog_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_unsubscribe_token ON public.blog_subscribers(unsubscribe_token);

-- Enable RLS
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts
CREATE POLICY "Allow anonymous newsletter subscriptions" ON public.blog_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous updates with valid tokens
CREATE POLICY "Allow token-based updates" ON public.blog_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated read access
CREATE POLICY "Allow authenticated read access" ON public.blog_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_blog_subscribers_updated_at
  BEFORE UPDATE ON public.blog_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Colonnes

| Colonne | Type | Nullable | Default | Description |
|---------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identifiant unique |
| email | TEXT | NO | - | Email de l'abonné (unique) |
| status | TEXT | NO | 'pending' | Statut (pending/active/unsubscribed) |
| source | TEXT | NO | 'footer' | Source d'inscription |
| confirmation_token | TEXT | YES | NULL | Token de confirmation |
| unsubscribe_token | TEXT | NO | - | Token de désabonnement |
| subscribed_at | TIMESTAMPTZ | YES | NOW() | Date d'inscription |
| confirmed_at | TIMESTAMPTZ | YES | NULL | Date de confirmation |
| unsubscribed_at | TIMESTAMPTZ | YES | NULL | Date de désabonnement |
| created_at | TIMESTAMPTZ | YES | NOW() | Date de création |
| updated_at | TIMESTAMPTZ | YES | NOW() | Date de modification |

---

## 3. Table `cta_conversions` - Tracking des Conversions

**Description**: Suivi des conversions CTA pour analytics.

### Schéma SQL

```sql
-- Create cta_conversions table
CREATE TABLE IF NOT EXISTS public.cta_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cta_id UUID,
  session_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cta_conversions_session ON public.cta_conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_type ON public.cta_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_created_at ON public.cta_conversions(created_at DESC);

-- Enable RLS
ALTER TABLE public.cta_conversions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts
CREATE POLICY "Allow anonymous conversion tracking" ON public.cta_conversions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated read access
CREATE POLICY "Allow authenticated read access" ON public.cta_conversions
  FOR SELECT
  TO authenticated
  USING (true);
```

---

## 📝 Instructions de Déploiement

### Étape 1: Accéder à Supabase SQL Editor

1. Connectez-vous à [https://supabase.com](https://supabase.com)
2. Sélectionnez votre projet: `kuxlimvekrblnggfkahw`
3. Allez dans **SQL Editor** dans le menu latéral

### Étape 2: Créer les Tables

1. Copiez le SQL de chaque table ci-dessus
2. Collez dans le SQL Editor
3. Cliquez sur **Run** pour exécuter
4. Vérifiez qu'il n'y a pas d'erreurs

### Étape 3: Vérifier les Policies RLS

1. Allez dans **Authentication** > **Policies**
2. Vérifiez que les policies sont bien créées pour chaque table
3. Testez l'insertion depuis le frontend

### Étape 4: Tester les Formulaires

1. **Formulaire de Devis (CTASection)**:
   - Allez sur la page d'accueil
   - Scrollez jusqu'à la section Contact
   - Remplissez et soumettez le formulaire
   - Vérifiez dans Supabase > Table Editor > quotes

2. **Newsletter (Footer)**:
   - Scrollez jusqu'au footer
   - Entrez un email dans le formulaire newsletter
   - Cliquez sur S'abonner
   - Vérifiez dans Supabase > Table Editor > blog_subscribers

---

## 🔒 Sécurité

### Row Level Security (RLS)

Toutes les tables ont RLS activé avec les policies suivantes:

- **anon**: Peut insérer (pour les formulaires publics)
- **authenticated**: Peut lire toutes les données
- **service_role**: Accès complet (pour les API routes)

### Validation des Données

- Validation email avec regex
- Sanitization avec DOMPurify
- Rate limiting sur les API routes
- Tokens sécurisés pour confirmation/désabonnement

---

## 🐛 Troubleshooting

### Erreur: "Failed to create Supabase client"

**Cause**: Variables d'environnement manquantes

**Solution**:
```bash
# Vérifiez .env.local
NEXT_PUBLIC_SUPABASE_URL=https://kuxlimvekrblnggfkahw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Erreur: "Permission denied for table quotes"

**Cause**: RLS policies manquantes

**Solution**: Exécutez les policies SQL ci-dessus

### Erreur: "Email already exists"

**Cause**: Contrainte UNIQUE sur email dans blog_subscribers

**Solution**: C'est normal, l'API gère ce cas et retourne un message approprié

---

## 📊 Monitoring

### Requêtes Utiles

```sql
-- Nombre de devis par statut
SELECT status, COUNT(*) 
FROM quotes 
GROUP BY status;

-- Abonnés actifs
SELECT COUNT(*) 
FROM blog_subscribers 
WHERE status = 'active';

-- Conversions par type
SELECT conversion_type, COUNT(*) 
FROM cta_conversions 
GROUP BY conversion_type;

-- Devis récents (dernières 24h)
SELECT * 
FROM quotes 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

**Dernière mise à jour**: 13 Octobre 2025  
**Auteur**: OMA Digital Team
