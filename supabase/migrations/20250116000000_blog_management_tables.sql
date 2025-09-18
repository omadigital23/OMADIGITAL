-- Blog management tables for OMA Digital

-- Blog articles table
CREATE TABLE IF NOT EXISTS blog_articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Intelligence Artificielle',
    tags TEXT[] DEFAULT '{}',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Débutant' CHECK (difficulty IN ('Débutant', 'Intermédiaire', 'Avancé')),
    estimated_roi VARCHAR(20) DEFAULT '100%',
    image_url VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    read_time INTEGER DEFAULT 5, -- in minutes
    publish_date TIMESTAMPTZ,
    author_id VARCHAR(255) NOT NULL,
    seo_title VARCHAR(500),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog article statistics table
CREATE TABLE IF NOT EXISTS blog_article_stats (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    read_completions INTEGER DEFAULT 0,
    avg_read_time INTEGER DEFAULT 0, -- in seconds
    bounce_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id)
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES blog_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(500),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog categories table for better organization
CREATE TABLE IF NOT EXISTS blog_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#F97316', -- Orange color
    icon VARCHAR(50),
    article_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog article views tracking for analytics
CREATE TABLE IF NOT EXISTS blog_article_views (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255), -- Session or user ID
    ip_address INET,
    user_agent TEXT,
    referer VARCHAR(1000),
    read_time INTEGER DEFAULT 0, -- seconds spent reading
    scroll_depth INTEGER DEFAULT 0, -- percentage
    device_type VARCHAR(20), -- mobile, tablet, desktop
    country VARCHAR(2), -- ISO country code
    city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog newsletters/subscribers table
CREATE TABLE IF NOT EXISTS blog_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    source VARCHAR(100), -- newsletter_popup, footer, article_cta
    interests TEXT[], -- categories they're interested in
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(255),
    unsubscribe_token VARCHAR(255) UNIQUE,
    last_email_sent TIMESTAMPTZ,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- Blog SEO tracking
CREATE TABLE IF NOT EXISTS blog_seo_data (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    search_impressions INTEGER DEFAULT 0,
    search_clicks INTEGER DEFAULT 0,
    avg_search_position DECIMAL(5,2) DEFAULT 0.0,
    top_keywords TEXT[],
    social_shares JSONB DEFAULT '{}', -- {twitter: 10, facebook: 5, linkedin: 3}
    backlinks_count INTEGER DEFAULT 0,
    domain_authority INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON blog_articles(featured);
CREATE INDEX IF NOT EXISTS idx_blog_articles_trending ON blog_articles(trending);
CREATE INDEX IF NOT EXISTS idx_blog_articles_publish_date ON blog_articles(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_created_at ON blog_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_tags ON blog_articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_blog_comments_article_id ON blog_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_blog_article_views_article_id ON blog_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_views_created_at ON blog_article_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_article_views_visitor_id ON blog_article_views(visitor_id);

CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON blog_subscribers(status);

-- Full-text search index for articles
CREATE INDEX IF NOT EXISTS idx_blog_articles_search ON blog_articles USING GIN(
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
);

-- Functions for maintaining statistics
CREATE OR REPLACE FUNCTION update_blog_article_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update article count in categories
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_categories 
        SET article_count = article_count + 1 
        WHERE name = NEW.category;
        
        -- Update tag counts
        IF NEW.tags IS NOT NULL THEN
            INSERT INTO blog_tags (name, slug, article_count)
            SELECT tag, lower(regexp_replace(tag, '[^a-zA-Z0-9]+', '-', 'g')), 1
            FROM unnest(NEW.tags) AS tag
            ON CONFLICT (name) DO UPDATE SET article_count = blog_tags.article_count + 1;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Update category counts if category changed
        IF OLD.category != NEW.category THEN
            UPDATE blog_categories 
            SET article_count = article_count - 1 
            WHERE name = OLD.category;
            
            UPDATE blog_categories 
            SET article_count = article_count + 1 
            WHERE name = NEW.category;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE blog_categories 
        SET article_count = article_count - 1 
        WHERE name = OLD.category;
        
        -- Update tag counts
        IF OLD.tags IS NOT NULL THEN
            UPDATE blog_tags 
            SET article_count = article_count - 1
            WHERE name = ANY(OLD.tags);
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update article statistics from views
CREATE OR REPLACE FUNCTION update_article_view_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the article stats
    INSERT INTO blog_article_stats (article_id, views, avg_read_time)
    VALUES (NEW.article_id, 1, COALESCE(NEW.read_time, 0))
    ON CONFLICT (article_id) 
    DO UPDATE SET 
        views = blog_article_stats.views + 1,
        avg_read_time = (blog_article_stats.avg_read_time * blog_article_stats.views + COALESCE(NEW.read_time, 0)) / (blog_article_stats.views + 1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for search with relevance scoring
CREATE OR REPLACE FUNCTION search_blog_articles(
    search_query TEXT,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    title VARCHAR(500),
    excerpt TEXT,
    category VARCHAR(100),
    slug VARCHAR(500),
    image_url VARCHAR(1000),
    publish_date TIMESTAMPTZ,
    read_time INTEGER,
    tags TEXT[],
    featured BOOLEAN,
    trending BOOLEAN,
    views INTEGER,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.category,
        a.slug,
        a.image_url,
        a.publish_date,
        a.read_time,
        a.tags,
        a.featured,
        a.trending,
        COALESCE(s.views, 0) as views,
        ts_rank(
            to_tsvector('french', a.title || ' ' || a.excerpt || ' ' || a.content),
            plainto_tsquery('french', search_query)
        ) as relevance
    FROM blog_articles a
    LEFT JOIN blog_article_stats s ON a.id = s.article_id
    WHERE 
        a.status = 'published'
        AND (category_filter IS NULL OR a.category = category_filter)
        AND to_tsvector('french', a.title || ' ' || a.excerpt || ' ' || a.content) @@ plainto_tsquery('french', search_query)
    ORDER BY relevance DESC, a.publish_date DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER blog_article_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON blog_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_article_stats();

CREATE TRIGGER blog_view_stats_trigger
    AFTER INSERT ON blog_article_views
    FOR EACH ROW
    EXECUTE FUNCTION update_article_view_stats();

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) VALUES
('Intelligence Artificielle', 'intelligence-artificielle', 'Articles sur l''IA, chatbots et automatisation intelligente', '#F97316', '🤖', 1),
('Développement Web', 'developpement-web', 'Sites web, applications et technologies modernes', '#3B82F6', '💻', 2),
('Automatisation', 'automatisation', 'Processus automatisés et optimisation business', '#10B981', '⚡', 3),
('Stratégie Digitale', 'strategie-digitale', 'Transformation numérique et stratégie d''entreprise', '#8B5CF6', '📈', 4),
('Analytics', 'analytics', 'Données, mesures et insights business', '#EF4444', '📊', 5),
('Cybersécurité', 'cybersecurite', 'Sécurité informatique et protection des données', '#6B7280', '🔒', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert sample articles for testing
INSERT INTO blog_articles (
    title, excerpt, content, slug, category, tags, difficulty, estimated_roi, 
    image_url, status, featured, trending, read_time, publish_date, author_id
) VALUES
(
    'L''IA Conversationnelle : L''Avenir du Service Client au Sénégal',
    'Découvrez comment les chatbots IA transforment l''expérience client pour les PME sénégalaises et augmentent les ventes de 40% en moyenne.',
    E'# Introduction\n\nLes PME sénégalaises adoptent massivement l''intelligence artificielle conversationnelle pour révolutionner leur service client.\n\n## Avantages clés\n\n- **Disponibilité 24/7** : Vos clients peuvent obtenir de l''aide à tout moment\n- **Réduction des coûts** : Jusqu''à 60% d''économies sur le support client\n- **Amélioration de l''expérience** : Réponses instantanées et personnalisées\n\n## Cas d''usage au Sénégal\n\n### 1. E-commerce\nLes boutiques en ligne utilisent des chatbots pour:\n- Recommander des produits\n- Gérer les commandes\n- Traiter les retours\n\n### 2. Services bancaires\nLes banques sénégalaises implémentent l''IA pour:\n- Vérifier les soldes\n- Effectuer des virements\n- Détecter les fraudes\n\n## ROI attendu\n\nSelon nos études, les PME qui implémentent un chatbot IA voient:\n- **+40%** d''augmentation des ventes\n- **-60%** de réduction des coûts de support\n- **+85%** de satisfaction client\n\n## Conclusion\n\nL''IA conversationnelle n''est plus l''avenir, c''est le présent. Les PME sénégalaises qui tardent à adopter cette technologie risquent de prendre du retard sur leurs concurrents.',
    'ia-conversationnelle-avenir-service-client-senegal',
    'Intelligence Artificielle',
    ARRAY['IA', 'Chatbot', 'PME', 'Sénégal', 'Service Client'],
    'Débutant',
    '300%',
    '/images/auto_all.webp',
    'published',
    true,
    true,
    5,
    NOW() - INTERVAL '2 days',
    'admin'
),
(
    'Sites Web Ultra-Rapides : Guide Complet pour PME Dakaroises',
    'Les secrets pour créer un site web qui se charge en moins de 1.5 secondes et améliore votre positionnement sur Google.',
    E'# Guide Complet des Sites Web Rapides\n\nLa vitesse de chargement est cruciale pour le succès en ligne de votre PME dakaroise.\n\n## Pourquoi la vitesse compte\n\n- **53%** des utilisateurs abandonnent un site qui met plus de 3 secondes à charger\n- **1 seconde** de délai = **7%** de perte de conversions\n- Google favorise les sites rapides dans ses résultats\n\n## Techniques d''optimisation\n\n### 1. Optimisation des images\n- Utiliser le format WebP\n- Compression sans perte\n- Lazy loading\n\n### 2. Minification du code\n- CSS et JavaScript compressés\n- Suppression des espaces et commentaires\n- Bundling intelligent\n\n### 3. CDN (Content Delivery Network)\n- Serveurs près de vos utilisateurs sénégalais\n- Cache global\n- Réduction de la latence\n\n## Outils de mesure\n\n1. **Google PageSpeed Insights**\n2. **GTmetrix**\n3. **Lighthouse**\n4. **WebPageTest**\n\n## Résultats attendus\n\nAvec nos optimisations, nos clients obtiennent:\n- **Temps de chargement < 1.5s**\n- **Score Google > 95/100**\n- **+25% de taux de conversion**\n\n## Conclusion\n\nUn site rapide n''est plus un luxe, c''est une nécessité. Contactez-nous pour optimiser votre site.',
    'sites-web-ultra-rapides-guide-complet-pme-dakaroises',
    'Développement Web',
    ARRAY['Performance', 'SEO', 'Site Web', 'Dakar', 'Optimisation'],
    'Intermédiaire',
    '200%',
    '/images/wbapp.webp',
    'published',
    false,
    false,
    7,
    NOW() - INTERVAL '5 days',
    'admin'
),
(
    'Automatisation WhatsApp Business : ROI de 300% en 6 Mois',
    'Étude de cas complète : comment une boulangerie de Liberté a automatisé ses commandes WhatsApp et triplé son chiffre d''affaires.',
    E'# Cas d''Étude : Boulangerie Moderne de Liberté\n\n## Le Défi\n\nLa boulangerie recevait 200+ messages WhatsApp par jour pour les commandes. Le propriétaire passait 6h/jour à répondre manuellement.\n\n## La Solution\n\nNous avons implémenté un système d''automatisation WhatsApp Business avec:\n\n### Fonctionnalités clés\n- **Menu interactif** avec photos des produits\n- **Prise de commande automatisée**\n- **Calcul automatique des prix**\n- **Confirmation de livraison**\n- **Système de paiement intégré**\n\n### Flux automatisé\n1. Client envoie "Bonjour"\n2. Bot présente le menu du jour\n3. Client sélectionne ses produits\n4. Système calcule le total\n5. Confirmation automatique\n6. Notification au boulanger\n\n## Résultats après 6 mois\n\n### Métriques financières\n- **Chiffre d''affaires : +300%**\n- **Commandes quotidiennes : 200 → 600**\n- **Temps de traitement : 6h → 1h**\n- **Erreurs de commande : -95%**\n\n### Impact opérationnel\n- **Personnel libéré** pour la production\n- **Service 24/7** automatique\n- **Satisfaction client : 98%**\n- **Temps de réponse : < 30 secondes**\n\n## Coût vs Bénéfices\n\n- **Investissement initial :** 500,000 FCFA\n- **Économies mensuelles :** 300,000 FCFA\n- **ROI atteint en :** 2 mois\n- **Bénéfices annuels :** 3,600,000 FCFA\n\n## Témoignage\n\n*"Avant, je passais mes journées au téléphone. Maintenant, je peux me concentrer sur la qualité de mes produits. Mes ventes ont triplé !"* - Amadou Diop, Propriétaire\n\n## Conclusion\n\nL''automatisation WhatsApp transforme les PME sénégalaises. Votre entreprise pourrait être la prochaine success story.',
    'automatisation-whatsapp-business-roi-300-pour-cent-6-mois',
    'Automatisation',
    ARRAY['WhatsApp', 'Automatisation', 'PME', 'ROI', 'Étude de cas'],
    'Débutant',
    '300%',
    '/images/whatsapp.webm',
    'published',
    false,
    true,
    6,
    NOW() - INTERVAL '1 week',
    'admin'
)
ON CONFLICT (slug) DO NOTHING;

-- Initialize stats for sample articles
INSERT INTO blog_article_stats (article_id, views, likes, comments, shares)
SELECT id, 
    CASE 
        WHEN featured THEN 1247
        WHEN trending THEN 892
        ELSE 456
    END as views,
    CASE 
        WHEN featured THEN 89
        WHEN trending THEN 67
        ELSE 34
    END as likes,
    CASE 
        WHEN featured THEN 23
        WHEN trending THEN 18
        ELSE 8
    END as comments,
    CASE 
        WHEN featured THEN 15
        WHEN trending THEN 12
        ELSE 5
    END as shares
FROM blog_articles
ON CONFLICT (article_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_seo_data ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin full access to blog_articles" ON blog_articles FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_article_stats" ON blog_article_stats FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_comments" ON blog_comments FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_categories" ON blog_categories FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_tags" ON blog_tags FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_article_views" ON blog_article_views FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_subscribers" ON blog_subscribers FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_seo_data" ON blog_seo_data FOR ALL USING (true);

-- Public read access for published articles
CREATE POLICY "Public read access to published articles" ON blog_articles 
FOR SELECT USING (status = 'published');

CREATE POLICY "Public read access to article stats" ON blog_article_stats 
FOR SELECT USING (true);

CREATE POLICY "Public read access to approved comments" ON blog_comments 
FOR SELECT USING (status = 'approved');

CREATE POLICY "Public read access to categories" ON blog_categories 
FOR SELECT USING (active = true);

CREATE POLICY "Public read access to tags" ON blog_tags 
FOR SELECT USING (true);

COMMENT ON TABLE blog_articles IS 'Main blog articles storage with full content and metadata';
COMMENT ON TABLE blog_article_stats IS 'Article performance statistics and analytics';
COMMENT ON TABLE blog_comments IS 'User comments and discussions on articles';
COMMENT ON TABLE blog_categories IS 'Blog categories for content organization';
COMMENT ON TABLE blog_tags IS 'Tags for article tagging and search';
COMMENT ON TABLE blog_article_views IS 'Detailed view tracking for analytics';
COMMENT ON TABLE blog_subscribers IS 'Newsletter subscribers and preferences';
COMMENT ON TABLE blog_seo_data IS 'SEO performance tracking and metrics';