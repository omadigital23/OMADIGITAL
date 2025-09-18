// Script to directly check the blog_subscribers table schema using pg
const { Client } = require('pg');

// Database connection configuration
// We'll need to extract this from the Supabase connection URL
const dbConfig = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.pcedyohixahtfogfdlig',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkSchema() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database successfully');
    
    // Check table structure
    console.log('\n🔍 Checking blog_subscribers table structure...');
    const tableQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'blog_subscribers'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(tableQuery);
    console.log('📋 Table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `(default: ${row.column_default})` : ''}`);
    });
    
    // Check if required columns exist
    const requiredColumns = ['confirmation_token', 'unsubscribe_token', 'confirmed_at'];
    const existingColumns = result.rows.map(row => row.column_name);
    
    console.log('\n📋 Checking required columns:');
    requiredColumns.forEach(column => {
      if (existingColumns.includes(column)) {
        console.log(`  ✅ ${column} exists`);
      } else {
        console.log(`  ❌ ${column} is missing`);
      }
    });
    
    // Try to insert a test record
    console.log('\n📋 Testing insert operation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const insertQuery = `
      INSERT INTO blog_subscribers (
        email, status, source, confirmation_token, unsubscribe_token, 
        subscribed_at, confirmed_at
      ) VALUES (
        $1, $2, $3, $4, $5, NOW(), NULL
      ) RETURNING id;
    `;
    
    const insertResult = await client.query(insertQuery, [
      testEmail,
      'pending',
      'test',
      'test-confirmation-token',
      'test-unsubscribe-token'
    ]);
    
    const insertedId = insertResult.rows[0].id;
    console.log(`  ✅ Successfully inserted test record with ID: ${insertedId}`);
    
    // Clean up: delete the test record
    console.log('\n🧹 Cleaning up test record...');
    await client.query('DELETE FROM blog_subscribers WHERE id = $1', [insertedId]);
    console.log('  ✅ Test record deleted successfully');
    
    console.log('\n🎉 Schema check completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

// Run the check
checkSchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Direct database schema check completed successfully!');
    } else {
      console.log('\n❌ Direct database schema check failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });