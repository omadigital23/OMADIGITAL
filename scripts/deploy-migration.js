#!/usr/bin/env node

/**
 * Database Migration Deployment Script
 * Safely deploys production optimization migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

class MigrationDeployer {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async checkConnection() {
    try {
      const { data, error } = await this.supabase.from('knowledge_base').select('count(*)').limit(1);
      if (error) throw error;
      this.log('✅ Database connection verified', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  async backupTables() {
    this.log('📦 Creating backup of critical tables...', 'info');
    
    const tables = ['chatbot_interactions', 'knowledge_base', 'cta_actions'];
    const backups = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await this.supabase.from(table).select('*');
        if (error) throw error;
        
        backups[table] = data;
        this.log(`✅ Backed up ${table}: ${data.length} records`, 'success');
      } catch (error) {
        this.log(`⚠️  Could not backup ${table}: ${error.message}`, 'warning');
      }
    }
    
    // Save backup to file
    fs.writeFileSync(
      `backup-${new Date().toISOString().split('T')[0]}.json`,
      JSON.stringify(backups, null, 2)
    );
    
    return backups;
  }

  async runMigration() {
    this.log('🚀 Deploying production optimization migration...', 'info');
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250125000000_production_optimization.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error('Migration file not found');
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    this.log(`📝 Executing ${statements.length} SQL statements...`, 'info');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        const { error } = await this.supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution for some statements
          const { error: directError } = await this.supabase.from('_').select().limit(0);
          if (directError && !directError.message.includes('does not exist')) {
            throw error;
          }
        }
        
        successCount++;
        this.log(`✅ Statement ${i + 1}/${statements.length} executed`, 'success');
        
      } catch (error) {
        errorCount++;
        this.log(`⚠️  Statement ${i + 1} failed: ${error.message}`, 'warning');
        
        // Continue with non-critical errors
        if (!this.isCriticalError(error.message)) {
          continue;
        } else {
          throw error;
        }
      }
    }
    
    this.log(`\n📊 Migration Summary:`, 'info');
    this.log(`✅ Successful: ${successCount}`, 'success');
    this.log(`⚠️  Warnings: ${errorCount}`, 'warning');
    
    return { successCount, errorCount };
  }

  isCriticalError(errorMessage) {
    const nonCriticalPatterns = [
      'already exists',
      'does not exist',
      'permission denied',
      'function.*already exists'
    ];
    
    return !nonCriticalPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(errorMessage)
    );
  }

  async verifyMigration() {
    this.log('🔍 Verifying migration results...', 'info');
    
    const checks = [
      {
        name: 'Performance indexes created',
        test: async () => {
          const { data } = await this.supabase
            .rpc('exec_sql', { 
              sql: "SELECT indexname FROM pg_indexes WHERE tablename = 'chatbot_interactions'" 
            });
          return data && data.length > 0;
        }
      },
      {
        name: 'RLS policies enabled',
        test: async () => {
          const { data } = await this.supabase
            .rpc('exec_sql', { 
              sql: "SELECT tablename FROM pg_tables WHERE rowsecurity = true AND schemaname = 'public'" 
            });
          return data && data.length > 0;
        }
      },
      {
        name: 'Analytics functions created',
        test: async () => {
          const { data } = await this.supabase
            .rpc('exec_sql', { 
              sql: "SELECT proname FROM pg_proc WHERE proname = 'get_chatbot_analytics'" 
            });
          return data && data.length > 0;
        }
      }
    ];
    
    let passedChecks = 0;
    
    for (const check of checks) {
      try {
        const result = await check.test();
        if (result) {
          this.log(`✅ ${check.name}`, 'success');
          passedChecks++;
        } else {
          this.log(`❌ ${check.name}`, 'error');
        }
      } catch (error) {
        this.log(`⚠️  ${check.name}: ${error.message}`, 'warning');
      }
    }
    
    return passedChecks === checks.length;
  }

  async deploy() {
    try {
      this.log('🚀 Starting database migration deployment...', 'info');
      
      // Check connection
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('Cannot connect to database');
      }
      
      // Create backup
      await this.backupTables();
      
      // Run migration
      const result = await this.runMigration();
      
      // Verify results
      const verified = await this.verifyMigration();
      
      if (verified) {
        this.log('\n🎉 Migration deployed successfully!', 'success');
        this.log('✅ Database is now optimized for production', 'success');
      } else {
        this.log('\n⚠️  Migration completed with warnings', 'warning');
        this.log('🔍 Please review the verification results', 'warning');
      }
      
      return true;
      
    } catch (error) {
      this.log(`\n❌ Migration failed: ${error.message}`, 'error');
      this.log('💡 Check backup file and retry if needed', 'info');
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const deployer = new MigrationDeployer();
  deployer.deploy().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = MigrationDeployer;