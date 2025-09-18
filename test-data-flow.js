async function testDataFlow() {
  try {
    console.log('Testing Admin Dashboard Data Flow...');
    
    // Test 1: Check if the dashboard API returns the correct data structure
    console.log('\n1. Testing dashboard metrics API...');
    const dashboardResponse = await fetch('http://localhost:3000/api/admin/dashboard-metrics');
    const dashboardData = await dashboardResponse.json();
    
    console.log('Dashboard API Status:', dashboardResponse.status);
    console.log('Dashboard Data Keys:', Object.keys(dashboardData));
    
    // Check for required properties
    const requiredProperties = [
      'total_users',
      'active_chats',
      'total_conversations',
      'avg_response_time',
      'conversion_rate',
      'total_quotes',
      'blog_views',
      'cta_clicks',
      'total_blog_articles',
      'total_subscribers'
    ];
    
    console.log('\nProperty Validation:');
    requiredProperties.forEach(prop => {
      const exists = dashboardData.hasOwnProperty(prop);
      const value = dashboardData[prop];
      console.log(`  ${prop}: ${exists ? '✓' : '✗'} (${value})`);
    });
    
    // Test 2: Check if the newsletter subscription works
    console.log('\n2. Testing newsletter subscription...');
    const newsletterResponse = await fetch('http://localhost:3000/api/subscribe-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        source: 'test'
      })
    });
    
    const newsletterData = await newsletterResponse.json();
    console.log('Newsletter API Status:', newsletterResponse.status);
    console.log('Newsletter Response:', newsletterData);
    
    // Test 3: Check if the CTA form works
    console.log('\n3. Testing CTA form submission...');
    const ctaResponse = await fetch('http://localhost:3000/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        company: 'Test Company',
        service: 'Automatisation WhatsApp',
        message: 'Test message',
        budget: '500.000 - 1.000.000 CFA',
        location: 'senegal'
      })
    });
    
    const ctaData = await ctaResponse.json();
    console.log('CTA API Status:', ctaResponse.status);
    console.log('CTA Response:', ctaData);
    
    console.log('\n✅ Data flow tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDataFlow();