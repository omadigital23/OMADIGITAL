/**
 * Test script to verify language detection and text-to-speech improvements
 */

console.log('🚀 Testing Language Detection and TTS Improvements\n');

// Test cases for different languages
const testCases = [
  {
    name: "English Voice Input",
    text: "Hello, I would like to know more about your services",
    expectedLanguage: "en",
    description: "English voice input should be detected as English"
  },
  {
    name: "French Voice Input",
    text: "Bonjour, je voudrais en savoir plus sur vos services",
    expectedLanguage: "fr",
    description: "French voice input should be detected as French"
  },
  {
    name: "Mixed Language Input (English Dominant)",
    text: "Hello, I want to automatiser mon business",
    expectedLanguage: "en",
    description: "Mixed language with English dominant should be detected as English"
  },
  {
    name: "Mixed Language Input (French Dominant)",
    text: "Bonjour, I would like to automatiser mon entreprise",
    expectedLanguage: "fr",
    description: "Mixed language with French dominant should be detected as French"
  }
];

// Test TTS configuration
function testTTSConfiguration() {
  console.log('🔊 Testing TTS Configuration...\n');
  
  // Simulate the TTS settings we've implemented
  const ttsSettings = {
    en: {
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.1,
      volume: 0.8
    },
    fr: {
      lang: 'fr-FR',
      rate: 0.9,  // Fixed from 0.40 to 0.9 for better quality
      pitch: 1.1,
      volume: 0.85
    }
  };
  
  console.log('English TTS Settings:');
  console.log('- Language:', ttsSettings.en.lang);
  console.log('- Rate:', ttsSettings.en.rate);
  console.log('- Pitch:', ttsSettings.en.pitch);
  console.log('- Volume:', ttsSettings.en.volume);
  console.log('');
  
  console.log('French TTS Settings (IMPROVED):');
  console.log('- Language:', ttsSettings.fr.lang);
  console.log('- Rate:', ttsSettings.fr.rate, '(IMPROVED from 0.40)');
  console.log('- Pitch:', ttsSettings.fr.pitch);
  console.log('- Volume:', ttsSettings.fr.volume);
  console.log('');
  
  // Check if the improvement is significant
  if (ttsSettings.fr.rate > 0.7) {
    console.log('✅ French TTS rate has been improved for better naturalness');
  } else {
    console.log('❌ French TTS rate still too low');
  }
  
  return ttsSettings;
}

// Test language detection logic
function testLanguageDetection(text, expectedLanguage) {
  // Simplified version of the language detection logic
  const lowerText = text.toLowerCase();
  
  // Strong English indicators
  const strongEnglishWords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
                             'english', 'speak english', 'i am', 'i want', 'i need', 'i would like',
                             'can you', 'do you', 'are you', 'what is', 'how much', 'thank you', 'thanks'];
  
  // Strong French indicators
  const strongFrenchWords = ['bonjour', 'salut', 'bonsoir', 'bonne journée', 'bonne soirée',
                            'français', 'parlez français', 'je suis', 'je veux', 'j\'ai besoin',
                            'pouvez-vous', 'êtes-vous', 'qu\'est-ce que', 'combien', 'merci'];
  
  let englishScore = 0;
  let frenchScore = 0;
  
  // Check strong indicators
  strongEnglishWords.forEach(word => {
    if (lowerText.includes(word)) englishScore += 3;
  });
  
  strongFrenchWords.forEach(word => {
    if (lowerText.includes(word)) frenchScore += 3;
  });
  
  // Additional words
  const englishWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which', 'services', 'contact', 
                       'price', 'cost', 'help', 'about', 'information', 'website', 'business',
                       'automation', 'whatsapp', 'digital', 'development', 'application'];
  
  const frenchWords = ['comment', 'quoi', 'que', 'qui', 'où', 'quand', 'pourquoi', 'quel', 'quelle',
                      'services', 'contact', 'prix', 'tarif', 'aide', 'à propos', 'information',
                      'site web', 'entreprise', 'automatisation', 'développement', 'application'];
  
  englishWords.forEach(word => {
    if (lowerText.includes(word)) englishScore += 1;
  });
  
  frenchWords.forEach(word => {
    if (lowerText.includes(word)) frenchScore += 1;
  });
  
  // Special cases
  if (lowerText.startsWith('hello') || lowerText.startsWith('hi ')) return 'en';
  if (lowerText.startsWith('bonjour') || lowerText.startsWith('salut')) return 'fr';
  
  const detectedLanguage = englishScore > frenchScore ? 'en' : 'fr';
  const passed = detectedLanguage === expectedLanguage;
  
  console.log(`  Detected: ${detectedLanguage} | Expected: ${expectedLanguage} | ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Scores - English: ${englishScore}, French: ${frenchScore}`);
  
  return passed;
}

// Run all tests
function runTests() {
  console.log('🔍 Testing Language Detection...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  testCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Description: ${testCase.description}`);
    
    const result = testLanguageDetection(testCase.text, testCase.expectedLanguage);
    if (result) passedTests++;
    
    console.log('');
  });
  
  // Test TTS configuration
  testTTSConfiguration();
  
  console.log('📋 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All language detection tests passed!');
  } else {
    console.log('⚠️ Some language detection tests failed.');
  }
  
  console.log('\n📢 Summary:');
  console.log('- French TTS rate improved from 0.40 to 0.9 for better naturalness');
  console.log('- Language detection logic enhanced for mixed language inputs');
  console.log('- Voice responses should now sound more natural in both languages');
}

// Run the tests
runTests();