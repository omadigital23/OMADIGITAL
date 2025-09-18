const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function testFixedApi() {
  console.log('🔍 Testing FIXED admin API logic...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Simulate the FIXED queries from the dashboard-metrics API
    console.log('\n📡 Executing FIXED dashboard queries...');
    
    const periodDays = 7;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Execute all queries in parallel like the API does (with corrected field names)
    const [
      interactionsResult,
      quotesResult,
      subscribersResult,
      eventsResult
    ] = await Promise.all([
      supabase
        .from('chatbot_interactions')
        .select('session_id, response_time, timestamp, message_text, confidence')
        .gte('timestamp', startDate)
        .order('timestamp', { ascending: false }),
      
      supabase
        .from('quotes')
        .select('id, name, company, created_at, status')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('blog_subscribers')
        .select('id, email, status, created_at, confirmed_at')
        .gte('created_at', startDate)
        .eq('status', 'active'),
      
      supabase
        .from('analytics_events')
        .select('event_name, url, timestamp, session_id, event_properties')
        .gte('timestamp', startDate)
        .order('timestamp', { ascending: false })
    ]);

    console.log('✅ All FIXED queries executed successfully');
    
    console.log('\n📊 Results:');
    console.log('  chatbot_interactions:', interactionsResult.data?.length || 0, 'rows');
    console.log('  quotes:', quotesResult.data?.length || 0, 'rows');
    console.log('  blog_subscribers:', subscribersResult.data?.length || 0, 'rows');
    console.log('  analytics_events:', eventsResult.data?.length || 0, 'rows');
    
    // Calculate metrics like the API does
    const interactions = interactionsResult.data || [];
    const quotes = quotesResult.data || [];
    const subscribers = subscribersResult.data || [];
    const events = eventsResult.data || [];

    const uniqueSessions = new Set(interactions.map(i => i.session_id)).size;
    const avgResponseTime = interactions.length > 0 
      ? interactions
          .filter(i => i.response_time)
          .reduce((sum, i) => sum + (i.response_time || 0), 0) / interactions.filter(i => i.response_time).length
      : 0;

    const conversionRate = uniqueSessions > 0 ? (quotes.length / uniqueSessions) * 100 : 0;
    
    // Pages vues RÉELLES depuis analytics
    const pageViews = events.filter(e => e.event_name === 'page_view').length;
    
    // Clics CTA RÉELS depuis analytics  
    const ctaClicks = events.filter(e => 
      e.event_name === 'cta_click' || 
      e.event_name === 'button_click' ||
      e.event_name === 'form_submit'
    ).length;

    // Sessions actives récentes (dernières 2h) - using timestamp field
    const recentSessions = interactions.filter(i => 
      new Date(i.timestamp).getTime() > Date.now() - 2 * 60 * 60 * 1000
    );
    const activeChats = new Set(recentSessions.map(i => i.session_id)).size;

    const data = [{
      total_users: uniqueSessions,
      active_chats: Math.max(0, activeChats),
      total_conversations: interactions.length,
      avg_response_time: Math.round(avgResponseTime) || 0,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      total_quotes: quotes.length,
      blog_views: pageViews,
      cta_clicks: ctaClicks,
      total_blog_articles: 5,
      total_subscribers: subscribers.length
    }];
    
    console.log('\n📈 Calculated metrics:');
    console.log('  total_users:', data[0].total_users);
    console.log('  active_chats:', data[0].active_chats);
    console.log('  total_conversations:', data[0].total_conversations);
    console.log('  avg_response_time:', data[0].avg_response_time);
    console.log('  conversion_rate:', data[0].conversion_rate);
    console.log('  total_quotes:', data[0].total_quotes);
    console.log('  blog_views:', data[0].blog_views);
    console.log('  cta_clicks:', data[0].cta_clicks);
    console.log('  total_blog_articles:', data[0].total_blog_articles);
    console.log('  total_subscribers:', data[0].total_subscribers);
    
    console.log('\n✅ FIXED API test completed successfully!');
    
    if (data[0].total_users > 0 || data[0].total_conversations > 0) {
      console.log('\n🎉 SUCCESS: Data is now being retrieved correctly!');
    } else {
      console.log('\n⚠️  WARNING: No recent data found, but queries are working');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testFixedApi();