import { ultraIntelligentRAG } from './ultra-intelligent-rag';

async function testGoogleAI() {
  try {
    console.log('Testing Google AI integration...');
    
    // Test with a simple question in French
    const result1 = await ultraIntelligentRAG.processMessage(
      "Quels sont vos services d'automatisation ?",
      "test-session-1",
      "text"
    );
    
    console.log('French test result:', result1);
    
    // Test with a simple question in English
    const result2 = await ultraIntelligentRAG.processMessage(
      "What are your automation services?",
      "test-session-2",
      "text"
    );
    
    console.log('English test result:', result2);
    
    console.log('Google AI integration test completed.');
  } catch (error) {
    console.error('Error testing Google AI integration:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testGoogleAI();
}

export { testGoogleAI };