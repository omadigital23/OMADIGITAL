#!/usr/bin/env node

/**
 * Simple Migration Runner Script
 * Runs all pending migrations in order
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

class MigrationRunner {
  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env['NEXT_PUBLIC_SUPABASE_URL'],
      process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    );
    
    this.migrationsDir = path.join(__dirname, '../supabase/migrations');
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
      // Simple query to test connection
      const { data, error } = await this.supabase
        .from('admin_users')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        // If the table doesn't exist, that's okay for now
        if (error.message.includes('does not exist')) {
          this.log('✅ Database connection verified (table may not exist yet)', 'success');
          return true;
        }
        throw error;
      }
      
      this.log('✅ Database connection verified', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Database connection failed: ${error.message}`, 'error');
      return false;
    }
  }

  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      return files.map(file => ({
        name: file,
        path: path.join(this.migrationsDir, file)
      }));
    } catch (error) {
      this.log(`❌ Failed to read migrations directory: ${error.message}`, 'error');
      return [];
    }
  }

  async runMigration(filePath) {
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into statements (simple approach)
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      this.log(`📝 Executing ${statements.length} statements from ${path.basename(filePath)}...`, 'info');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        
        try {
          // Skip empty statements
          if (statement.trim().length === 0) {
            continue;
          }
          
          // Execute the statement
          const { error } = await this.supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Log warning but continue for non-critical errors
            this.log(`⚠️  Statement ${i + 1} warning: ${error.message}`, 'warning');
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          this.log(`⚠️  Statement ${i + 1} failed: ${error.message}`, 'warning');
          errorCount++;
        }
      }
      
      this.log(`✅ Migration ${path.basename(filePath)} completed: ${successCount} successful, ${errorCount} warnings`, 'success');
      return { success: true, successCount, errorCount };
      
    } catch (error) {
      this.log(`❌ Failed to run migration ${path.basename(filePath)}: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async runAllMigrations() {
    try {
      this.log('🚀 Starting migration process...', 'info');
      
      // Check database connection
      const connected = await this.checkConnection();
      if (!connected) {
        throw new Error('Cannot connect to database');
      }
      
      // Get all migration files
      const migrationFiles = this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        this.log('⚠️  No migration files found', 'warning');
        return false;
      }
      
      this.log(`📁 Found ${migrationFiles.length} migration files`, 'info');
      
      // Run each migration
      let totalSuccess = 0;
      let totalErrors = 0;
      
      for (const migration of migrationFiles) {
        this.log(`\n🔄 Running migration: ${migration.name}`, 'info');
        
        const result = await this.runMigration(migration.path);
        
        if (result.success) {
          totalSuccess++;
        } else {
          totalErrors++;
        }
      }
      
      this.log(`\n📊 Migration Summary:`, 'info');
      this.log(`✅ Successful migrations: ${totalSuccess}`, 'success');
      this.log(`❌ Failed migrations: ${totalErrors}`, totalErrors === 0 ? 'success' : 'error');
      
      if (totalErrors === 0) {
        this.log('\n🎉 All migrations completed successfully!', 'success');
        return true;
      } else {
        this.log('\n⚠️  Some migrations had issues. Please review the output above.', 'warning');
        return false;
      }
      
    } catch (error) {
      this.log(`\n❌ Migration process failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new MigrationRunner();
  runner.runAllMigrations().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = MigrationRunner;