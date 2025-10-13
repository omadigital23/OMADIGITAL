/**
 * Test script for newsletter webhook automation
 * This script simulates a new subscriber being added and tests the webhook flow
 */

const testNewsletterWebhook = async () => {
  try {
    console.log('Testing newsletter webhook automation...');
    
    // Test data for a new subscriber
    const testSubscriber = {
      id: 'test-subscriber-' + Date.now(),
      email: 'test-subscriber@example.com',
      status: 'pending',
      source: 'test-script',
      created_at: new Date().toISOString(),
      metadata: {
        test: true,
        timestamp: Date.now()
      }
    };
    
    console.log('Test subscriber data:', testSubscriber);
    
    // Call the webhook automation endpoint
    const response = await fetch('http://localhost:3000/api/admin/newsletter-webhook-automation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriber: testSubscriber })
    });
    
    const result = await response.json();
    
    console.log('Webhook automation response:', result);
    
    if (result.success) {
      console.log('✅ Webhook automation test PASSED');
    } else {
      console.log('❌ Webhook automation test FAILED');
      console.log('Error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Error testing newsletter webhook:', error);
    return { success: false, error: error.message };
  }
};

// Run the test if this script is executed directly
if (require.main === module) {
  testNewsletterWebhook()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed with error:', error);
      process.exit(1);
    });
}

module.exports = { testNewsletterWebhook };