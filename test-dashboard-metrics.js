const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

async function testDashboardMetrics() {
  console.log('🔍 Testing dashboard metrics calculation...\n');
  
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    return false;
  }
  
  console.log('✅ Environment variables found');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Simulate the dashboard metrics calculation
    console.log('\n🧪 Test: Simulating dashboard metrics calculation...');
    
    const periodDays = 7;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Execute the same queries as the dashboard API
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

    const interactions = interactionsResult.data || [];
    const quotes = quotesResult.data || [];
    const subscribers = subscribersResult.data || [];
    const events = eventsResult.data || [];

    // Calculate metrics exactly as the API does
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

    // Sessions actives récentes (dernières 2h)
    const recentSessions = interactions.filter(i => 
      new Date(i.timestamp).getTime() > Date.now() - 2 * 60 * 60 * 1000
    );
    const activeChats = new Set(recentSessions.map(i => i.session_id)).size;

    const data = [{
      total_users: uniqueSessions,
      active_chats: Math.max(0, activeChats), // Sessions réellement actives
      total_conversations: interactions.length,
      avg_response_time: Math.round(avgResponseTime) || 0,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      total_quotes: quotes.length,
      blog_views: pageViews, // Pages vues RÉELLES
      cta_clicks: ctaClicks, // Clics RÉELS
      total_blog_articles: 5, // TODO: Récupérer de blog_posts
      total_subscribers: subscribers.length
    }];
    
    console.log('✅ Dashboard metrics calculation successful!');
    console.log('📊 Calculated metrics:');
    console.log(JSON.stringify(data[0], null, 2));
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during dashboard metrics calculation:', error.message);
    return false;
  }
}

// Run the test
testDashboardMetrics().then(success => {
  if (!success) {
    process.exit(1);
  }
});