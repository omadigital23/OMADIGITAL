async function testDashboardAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/dashboard-metrics');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if the required fields exist
    const requiredFields = [
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
    
    console.log('\nField Validation:');
    requiredFields.forEach(field => {
      const exists = data.hasOwnProperty(field);
      const value = data[field];
      console.log(`${field}: ${exists ? '✓' : '✗'} (${value})`);
    });
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDashboardAPI();