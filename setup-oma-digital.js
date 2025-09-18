/**
 * Script de migration et setup complet pour OMA Digital
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class OMASetupManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async runCompleteSetup() {
    console.log('🚀 Démarrage du setup complet OMA Digital...\n');

    try {
      // 1. Vérifier la connexion
      await this.verifyConnection();
      
      // 2. Appliquer les migrations
      await this.applyMigrations();
      
      // 3. Insérer les données initiales
      await this.insertInitialData();
      
      // 4. Configurer les CTAs par défaut
      await this.setupDefaultCTAs();
      
      // 5. Vérifier l'intégrité
      await this.verifyIntegrity();
      
      console.log('✅ Setup complet terminé avec succès!\n');
      
    } catch (error) {
      console.error('❌ Erreur lors du setup:', error);
      process.exit(1);
    }
  }

  async verifyConnection() {
    console.log('🔍 Vérification de la connexion Supabase...');
    
    const { data, error } = await this.supabase
      .from('knowledge_base')
      .select('count(*)')
      .limit(1);

    if (error) {
      throw new Error(`Connexion échouée: ${error.message}`);
    }

    console.log('✅ Connexion Supabase OK\n');
  }

  async applyMigrations() {
    console.log('📦 Application des migrations...');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`  - Applying ${file}...`);
      
      const sqlContent = fs.readFileSync(
        path.join(migrationsDir, file), 
        'utf8'
      );

      try {
        const { error } = await this.supabase.rpc('exec_sql', {
          sql: sqlContent
        });

        if (error) {
          console.warn(`    ⚠️ Warning in ${file}: ${error.message}`);
        } else {
          console.log(`    ✅ ${file} applied successfully`);
        }
      } catch (err) {
        console.warn(`    ⚠️ Could not apply ${file}: ${err.message}`);
      }
    }

    console.log('✅ Migrations terminées\n');
  }

  async insertInitialData() {
    console.log('📝 Insertion des données initiales...');

    // Knowledge Base OMA Digital
    const knowledgeBaseData = [
      {
        title: 'Services OMA Digital',
        content: 'OMA Digital propose des solutions complètes pour PME : automatisation WhatsApp (50k CFA/mois), sites web ultra-rapides (150k+ CFA), applications mobiles iOS/Android, assistants IA personnalisés (75k+ CFA/mois), et branding authentique (200k+ CFA).',
        category: 'services',
        language: 'fr',
        keywords: ['services', 'automatisation', 'whatsapp', 'site web', 'application mobile', 'ia', 'branding'],
        is_active: true
      },
      {
        title: 'OMA Digital Services',
        content: 'OMA Digital offers complete solutions for SMEs: WhatsApp automation (50k CFA/month), ultra-fast websites (150k+ CFA), iOS/Android mobile applications, personalized AI assistants (75k+ CFA/month), and authentic branding (200k+ CFA).',
        category: 'services',
        language: 'en',
        keywords: ['services', 'automation', 'whatsapp', 'website', 'mobile app', 'ai', 'branding'],
        is_active: true
      },
      {
        title: 'Contact OMA Digital',
        content: 'Contactez OMA Digital au +212 701 193 811 ou par email à omasenegal25@gmail.com. Nous sommes basés à Dakar, Sénégal et servons toute l\'Afrique de l\'Ouest.',
        category: 'contact',
        language: 'fr',
        keywords: ['contact', 'téléphone', 'email', 'dakar', 'sénégal'],
        is_active: true
      },
      {
        title: 'Contact OMA Digital',
        content: 'Contact OMA Digital at +212 701 193 811 or by email at omasenegal25@gmail.com. We are based in Dakar, Senegal and serve all of West Africa.',
        category: 'contact',
        language: 'en',
        keywords: ['contact', 'phone', 'email', 'dakar', 'senegal'],
        is_active: true
      }
    ];

    try {
      const { error } = await this.supabase
        .from('knowledge_base')
        .upsert(knowledgeBaseData);

      if (error) throw error;
      console.log('✅ Knowledge base initialisée\n');
    } catch (error) {
      console.warn(`⚠️ Warning knowledge base: ${error.message}\n`);
    }
  }

  async setupDefaultCTAs() {
    console.log('🎯 Configuration des CTAs par défaut...');

    const defaultCTAs = [
      {
        type: 'whatsapp',
        action: 'Contacter sur WhatsApp',
        priority: 'high',
        data: {
          phone: '+212701193811',
          message: 'Bonjour ! Je souhaite en savoir plus sur vos services OMA Digital.'
        },
        conditions: {
          keywords: ['contact', 'whatsapp', 'téléphone', 'appeler'],
          language: 'both'
        },
        is_active: true
      },
      {
        type: 'demo',
        action: 'Demander une démo',
        priority: 'high',
        data: {
          service: 'Démo automatisation WhatsApp',
          url: '#contact'
        },
        conditions: {
          keywords: ['démo', 'demo', 'essai', 'test', 'voir'],
          language: 'both'
        },
        is_active: true
      },
      {
        type: 'quote',
        action: 'Obtenir un devis',
        priority: 'medium',
        data: {
          service: 'Devis personnalisé OMA Digital',
          url: '#contact'
        },
        conditions: {
          keywords: ['prix', 'tarif', 'coût', 'devis', 'quote', 'combien'],
          language: 'both'
        },
        is_active: true
      },
      {
        type: 'appointment',
        action: 'Prendre rendez-vous',
        priority: 'medium',
        data: {
          service: 'Consultation gratuite',
          url: '#contact'
        },
        conditions: {
          keywords: ['rdv', 'rendez-vous', 'appointment', 'consultation', 'rencontrer'],
          language: 'both'
        },
        is_active: true
      },
      {
        type: 'email',
        action: 'Envoyer un email',
        priority: 'low',
        data: {
          email: 'omasenegal25@gmail.com',
          subject: 'Demande d\'information OMA Digital'
        },
        conditions: {
          keywords: ['email', 'mail', 'courrier', 'écrire'],
          language: 'both'
        },
        is_active: true
      }
    ];

    try {
      const { error } = await this.supabase
        .from('cta_actions')
        .upsert(defaultCTAs);

      if (error) throw error;
      console.log('✅ CTAs par défaut configurés\n');
    } catch (error) {
      console.warn(`⚠️ Warning CTAs: ${error.message}\n`);
    }
  }

  async verifyIntegrity() {
    console.log('🔍 Vérification de l\'intégrité...');

    const checks = [
      { table: 'knowledge_base', expected: 4 },
      { table: 'cta_actions', expected: 5 },
      { table: 'conversations', expected: 0 },
      { table: 'messages', expected: 0 }
    ];

    for (const check of checks) {
      try {
        const { count, error } = await this.supabase
          .from(check.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.warn(`  ⚠️ ${check.table}: ${error.message}`);
        } else {
          const status = count >= check.expected ? '✅' : '⚠️';
          console.log(`  ${status} ${check.table}: ${count} enregistrements`);
        }
      } catch (err) {
        console.warn(`  ❌ ${check.table}: Erreur de vérification`);
      }
    }

    console.log('✅ Vérification terminée\n');
  }

  async generateHealthReport() {
    console.log('📊 Génération du rapport de santé...');

    const report = {
      timestamp: new Date().toISOString(),
      database: 'connected',
      tables: {},
      ctas: {},
      recommendations: []
    };

    // Vérifier les tables
    const tables = ['knowledge_base', 'cta_actions', 'conversations', 'messages', 'chatbot_interactions'];
    
    for (const table of tables) {
      try {
        const { count, error } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        report.tables[table] = {
          status: error ? 'error' : 'ok',
          count: count || 0,
          error: error?.message
        };
      } catch (err) {
        report.tables[table] = {
          status: 'error',
          count: 0,
          error: err.message
        };
      }
    }

    // Vérifier les CTAs
    try {
      const { data: ctas, error } = await this.supabase
        .from('cta_actions')
        .select('*')
        .eq('is_active', true);

      if (!error && ctas) {
        report.ctas = {
          total: ctas.length,
          by_type: ctas.reduce((acc, cta) => {
            acc[cta.type] = (acc[cta.type] || 0) + 1;
            return acc;
          }, {}),
          by_priority: ctas.reduce((acc, cta) => {
            acc[cta.priority] = (acc[cta.priority] || 0) + 1;
            return acc;
          }, {})
        };
      }
    } catch (err) {
      report.ctas = { error: err.message };
    }

    // Recommandations
    if (report.tables.knowledge_base?.count < 4) {
      report.recommendations.push('Ajouter plus de contenu à la knowledge base');
    }
    if (report.ctas.total < 3) {
      report.recommendations.push('Configurer plus de CTAs pour améliorer les conversions');
    }

    console.log('📋 Rapport de santé:');
    console.log(JSON.stringify(report, null, 2));

    return report;
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const setup = new OMASetupManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      setup.runCompleteSetup();
      break;
    case 'health':
      setup.generateHealthReport();
      break;
    case 'migrate':
      setup.applyMigrations();
      break;
    default:
      console.log('Usage: node setup-oma-digital.js [setup|health|migrate]');
      break;
  }
}

module.exports = OMASetupManager;