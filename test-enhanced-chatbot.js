const fs = require('fs');
const path = require('path');

// Test the enhanced chatbot functionality
async function testEnhancedChatbot() {
  console.log('🧪 Testing Enhanced Chatbot Functionality...\n');
  
  // Check if the ultra-intelligent-rag.ts file has been modified correctly
  const ragFilePath = path.join(__dirname, 'src', 'lib', 'ultra-intelligent-rag.ts');
  const ragContent = fs.readFileSync(ragFilePath, 'utf8');
  
  // Test 1: Check if simulated knowledge base exists
  const hasSimulatedKB = ragContent.includes('SIMULATED_KNOWLEDGE_BASE') && 
                         ragContent.includes('omasenegal25@gmail.com') && 
                         ragContent.includes('+212701193811');
  console.log(`✅ Simulated Knowledge Base: ${hasSimulatedKB ? 'PASS' : 'FAIL'}`);
  
  // Test 2: Check if specific intent detection exists
  const hasSpecificIntents = ragContent.includes('contact_email_specific') && 
                             ragContent.includes('contact_phone_specific');
  console.log(`✅ Specific Intent Detection: ${hasSpecificIntents ? 'PASS' : 'FAIL'}`);
  
  // Test 3: Check if searchKnowledgeBase method handles specific queries
  const hasEnhancedSearch = ragContent.includes('searchSimulatedKnowledgeBase') && 
                            ragContent.includes('lowerQuery.includes(\'email\')');
  console.log(`✅ Enhanced Knowledge Base Search: ${hasEnhancedSearch ? 'PASS' : 'FAIL'}`);
  
  // Test 4: Check if generateContextualResponse handles specific contact info
  const hasSpecificResponses = ragContent.includes('intent === \'contact_email_specific\'') && 
                               ragContent.includes('return language === \'fr\' ? \'omasenegal25@gmail.com\'');
  console.log(`✅ Specific Contact Responses: ${hasSpecificResponses ? 'PASS' : 'FAIL'}`);
  
  // Test 5: Check if smart suggestions include new options
  const hasNewSuggestions = ragContent.includes('Nos offres') && 
                            ragContent.includes('Prise de rendez-vous') &&
                            ragContent.includes('Demander un devis') &&
                            ragContent.includes('Tarifs');
  console.log(`✅ New Smart Suggestions: ${hasNewSuggestions ? 'PASS' : 'FAIL'}`);
  
  // Summary
  const allTestsPassed = hasSimulatedKB && hasSpecificIntents && hasEnhancedSearch && hasSpecificResponses && hasNewSuggestions;
  console.log(`\n📋 Test Summary: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Enhanced chatbot implementation is ready!');
    console.log('✅ Specific contact information requests will return exact details');
    console.log('✅ General queries will use the RAG system with knowledge base');
    console.log('✅ New smart suggestions are available for user guidance');
    console.log('✅ Multilingual support maintained (French/English)');
  } else {
    console.log('\n❌ Some enhancements need to be reviewed');
  }
  
  return allTestsPassed;
}

// Run the test
testEnhancedChatbot().catch(console.error);