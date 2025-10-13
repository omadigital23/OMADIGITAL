#!/usr/bin/env node

// Database Performance Review Script
const fs = require('fs');
const path = require('path');

// Performance review function
async function reviewDatabasePerformance() {
  console.log('Starting database performance review...');
  
  try {
    // Check for common performance issues
    console.log('Checking for common performance issues...');
    
    // 1. Check if indexes exist on frequently queried columns
    const indexCheck = `
-- Check if indexes exist on frequently queried columns
-- Newsletter subscribers email
SELECT tablename, indexname FROM pg_indexes WHERE tablename = 'newsletter_subscribers' AND indexdef LIKE '%email%';

-- Chatbot conversations user_id
SELECT tablename, indexname FROM pg_indexes WHERE tablename = 'chatbot_conversations' AND indexdef LIKE '%user_id%';

-- Chatbot messages conversation_id
SELECT tablename, indexname FROM pg_indexes WHERE tablename = 'chatbot_messages' AND indexdef LIKE '%conversation_id%';
`;
    
    console.log('Recommended index checks:');
    console.log(indexCheck);
    
    // 2. Check for table sizes
    const tableSizeCheck = `
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
`;
    
    console.log('\nRecommended table size check:');
    console.log(tableSizeCheck);
    
    // 3. Check for slow queries (if query logging is enabled)
    const slowQueryCheck = `
-- Check for slow queries (requires pg_stat_statements extension)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
`;
    
    console.log('\nRecommended slow query check:');
    console.log(slowQueryCheck);
    
    // 4. Check connection pool usage
    console.log('\nCheck connection pool settings:');
    console.log('- Review Supabase connection pool configuration');
    console.log('- Monitor active connections');
    console.log('- Check for connection leaks');
    
    // 5. Check for missing foreign key constraints
    const fkConstraintCheck = `
-- Check for missing foreign key constraints
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM 
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
`;
    
    console.log('\nRecommended foreign key constraint check:');
    console.log(fkConstraintCheck);
    
    // Recommendations
    console.log('\n=== PERFORMANCE RECOMMENDATIONS ===');
    console.log('1. Ensure indexes exist on frequently queried columns');
    console.log('2. Monitor table growth and consider partitioning for large tables');
    console.log('3. Enable query logging to identify slow queries');
    console.log('4. Review connection pool settings');
    console.log('5. Add foreign key constraints to maintain data integrity');
    console.log('6. Consider read replicas for read-heavy workloads');
    console.log('7. Implement caching for expensive queries');
    
    console.log('\nDatabase performance review completed.');
    return true;
  } catch (error) {
    console.error('Database performance review failed:', error.message);
    return false;
  }
}

// Run the review
reviewDatabasePerformance().then(success => {
  if (!success) {
    process.exit(1);
  }
});

/**
 * Database Performance Review Script
 * 
 * This script analyzes database query performance and provides optimization recommendations.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL'],
  process.env['SUPABASE_SERVICE_ROLE_KEY']
);

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 1000, // 1 second
  VERY_SLOW_QUERY: 5000 // 5 seconds
};

// Tables to analyze
const TABLES_TO_ANALYZE = [
  'blog_subscribers',
  'quotes',
  'chatbot_interactions',
  'analytics_events',
  'conversations',
  'messages'
];

async function analyzeTablePerformance(tableName) {
  console.log(`\n🔍 Analyzing table: ${tableName}`);
  
  try {
    // Check table size
    const { count: rowCount, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(`❌ Error getting row count: ${countError.message}`);
      return;
    }
    
    console.log(`📊 Row count: ${rowCount?.toLocaleString()}`);
    
    // Check for existing indexes
    const { data: indexes, error: indexError } = await supabase
      .rpc('get_indexes_for_table', { table_name: tableName });
    
    if (indexError) {
      console.log(`⚠️  Could not retrieve index information: ${indexError.message}`);
    } else {
      console.log(`📋 Indexes: ${indexes?.length || 0}`);
      if (indexes && indexes.length > 0) {
        indexes.forEach(index => {
          console.log(`   • ${index.indexname}`);
        });
      }
    }
    
    // Perform sample queries to measure performance
    await performSampleQueries(tableName, rowCount);
    
  } catch (error) {
    console.log(`❌ Error analyzing table ${tableName}: ${error.message}`);
  }
}

async function performSampleQueries(tableName, rowCount) {
  console.log(`⚡ Performing sample queries...`);
  
  // Query 1: Simple count query
  const countStartTime = Date.now();
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  const countTime = Date.now() - countStartTime;
  console.log(`   Count query: ${countTime}ms`);
  
  if (countTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
    console.log(`   ⚠️  Count query is slow (${countTime}ms > ${PERFORMANCE_THRESHOLDS.SLOW_QUERY}ms)`);
  }
  
  // Query 2: Recent records query (if table has timestamp)
  const recentStartTime = Date.now();
  const { data: recentData, error: recentError } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  const recentTime = Date.now() - recentStartTime;
  console.log(`   Recent records query: ${recentTime}ms`);
  
  if (recentTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
    console.log(`   ⚠️  Recent records query is slow (${recentTime}ms > ${PERFORMANCE_THRESHOLDS.SLOW_QUERY}ms)`);
  }
  
  // Query 3: Filtered query (if table has status column)
  const filterStartTime = Date.now();
  const { data: filteredData, error: filterError } = await supabase
    .from(tableName)
    .select('*')
    .eq('status', 'active')
    .limit(10);
  
  const filterTime = Date.now() - filterStartTime;
  console.log(`   Filtered query: ${filterTime}ms`);
  
  if (filterTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
    console.log(`   ⚠️  Filtered query is slow (${filterTime}ms > ${PERFORMANCE_THRESHOLDS.SLOW_QUERY}ms)`);
  }
  
  // Recommendations based on performance
  if (countTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY || 
      recentTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY || 
      filterTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
    
    console.log(`\n💡 Optimization Recommendations for ${tableName}:`);
    
    if (rowCount > 10000) {
      console.log(`   • Consider partitioning the table if it continues to grow`);
    }
    
    if (countTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
      console.log(`   • Add indexes on frequently queried columns`);
    }
    
    if (recentTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
      console.log(`   • Ensure created_at column is indexed`);
    }
    
    if (filterTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
      console.log(`   • Add index on status column`);
    }
    
    console.log(`   • Review query execution plans using EXPLAIN`);
  }
}

async function checkMissingIndexes() {
  console.log(`\n🔍 Checking for missing indexes...`);
  
  // Common patterns that should be indexed
  const indexRecommendations = [
    { table: 'blog_subscribers', column: 'email', reason: 'Frequently used for lookups' },
    { table: 'blog_subscribers', column: 'status', reason: 'Frequently filtered' },
    { table: 'quotes', column: 'status', reason: 'Frequently filtered' },
    { table: 'quotes', column: 'created_at', reason: 'Time-based queries' },
    { table: 'chatbot_interactions', column: 'session_id', reason: 'Session-based queries' },
    { table: 'chatbot_interactions', column: 'timestamp', reason: 'Time-based queries' },
    { table: 'analytics_events', column: 'event_name', reason: 'Frequently filtered' },
    { table: 'analytics_events', column: 'timestamp', reason: 'Time-based queries' },
    { table: 'conversations', column: 'session_id', reason: 'Session-based queries' },
    { table: 'messages', column: 'conversation_id', reason: 'Join operations' }
  ];
  
  for (const recommendation of indexRecommendations) {
    // Check if index exists
    const { data: indexes, error } = await supabase
      .rpc('get_indexes_for_table', { table_name: recommendation.table });
    
    if (!error && indexes) {
      const indexExists = indexes.some(index => 
        index.indexdef.includes(recommendation.column)
      );
      
      if (!indexExists) {
        console.log(`   ⚠️  Missing index: ${recommendation.table}.${recommendation.column}`);
        console.log(`      Reason: ${recommendation.reason}`);
        console.log(`      Recommendation: CREATE INDEX idx_${recommendation.table}_${recommendation.column} ON ${recommendation.table}(${recommendation.column});`);
      }
    }
  }
}

async function analyzeQueryPatterns() {
  console.log(`\n🔍 Analyzing query patterns...`);
  
  // Check for queries that might benefit from composite indexes
  console.log(`   Checking common query combinations...`);
  
  // Example: blog_subscribers queries by status and created_at
  console.log(`   • blog_subscribers: status + created_at queries`);
  console.log(`     Recommendation: CREATE INDEX idx_blog_subscribers_status_created ON blog_subscribers(status, created_at);`);
  
  // Example: quotes queries by status and created_at
  console.log(`   • quotes: status + created_at queries`);
  console.log(`     Recommendation: CREATE INDEX idx_quotes_status_created ON quotes(status, created_at);`);
  
  // Example: chatbot_interactions queries by session_id and timestamp
  console.log(`   • chatbot_interactions: session_id + timestamp queries`);
  console.log(`     Recommendation: CREATE INDEX idx_chatbot_interactions_session_timestamp ON chatbot_interactions(session_id, timestamp);`);
}

async function runPerformanceReview() {
  console.log('🚀 Starting Database Performance Review...');
  console.log('==========================================');
  
  try {
    // Test database connectivity
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('count()', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');
    
    // Analyze each table
    for (const table of TABLES_TO_ANALYZE) {
      await analyzeTablePerformance(table);
    }
    
    // Check for missing indexes
    await checkMissingIndexes();
    
    // Analyze query patterns
    await analyzeQueryPatterns();
    
    console.log('\n✅ Performance review completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review the recommendations above');
    console.log('   2. Implement suggested indexes');
    console.log('   3. Monitor query performance after changes');
    console.log('   4. Schedule regular performance reviews');
    
  } catch (error) {
    console.log(`❌ Performance review failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if script is executed directly
if (require.main === module) {
  runPerformanceReview();
}

module.exports = {
  analyzeTablePerformance,
  checkMissingIndexes,
  analyzeQueryPatterns,
  runPerformanceReview
};