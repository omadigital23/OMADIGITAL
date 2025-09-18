// Script to get detailed table schema information
const { Client } = require('pg');

// Database connection configuration using the Supabase credentials
const dbConfig = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.pcedyohixahtfogfdlig',
  password: 'k6cxAGN7Lh4Y19YR',
  ssl: {
    rejectUnauthorized: false
  }
};

async function getTableSchema() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database successfully');
    
    // Get table structure for blog_subscribers
    console.log('\n🔍 Getting blog_subscribers table structure...');
    const tableQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'blog_subscribers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(tableQuery);
    console.log('📋 blog_subscribers table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `(default: ${row.column_default})` : ''}`);
    });
    
    // Get table structure for chatbot_interactions
    console.log('\n🔍 Getting chatbot_interactions table structure...');
    const chatTableQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'chatbot_interactions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const chatResult = await client.query(chatTableQuery);
    console.log('📋 chatbot_interactions table columns:');
    chatResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `(default: ${row.column_default})` : ''}`);
    });
    
    // Get table structure for quotes
    console.log('\n🔍 Getting quotes table structure...');
    const quotesTableQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'quotes' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const quotesResult = await client.query(quotesTableQuery);
    console.log('📋 quotes table columns:');
    quotesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `(default: ${row.column_default})` : ''}`);
    });
    
    // Get table structure for user_roles
    console.log('\n🔍 Getting user_roles table structure...');
    const userRolesTableQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'user_roles' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const userRolesResult = await client.query(userRolesTableQuery);
    console.log('📋 user_roles table columns:');
    userRolesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `(default: ${row.column_default})` : ''}`);
    });
    
    console.log('\n🎉 Schema information retrieved successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

// Run the schema check
getTableSchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Database schema check completed successfully!');
    } else {
      console.log('\n❌ Database schema check failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });