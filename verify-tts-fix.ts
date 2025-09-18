// Simple test to verify TTS rate configuration
interface SpeechUtterance {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

// Test function to simulate our TTS configuration
function testTTSConfiguration(language: string): SpeechUtterance {
  const utterance = {
    lang: '',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  } as SpeechUtterance;
  
  // Configure TTS based on language with ENHANCED settings
  switch (language) {
    case 'en':
    case 'en-US':
    case 'en-GB':
      utterance.lang = 'en-US';
      utterance.rate = 1.0;     // Natural speaking rate
      utterance.pitch = 1.1;    // Slightly higher pitch for friendliness
      utterance.volume = 0.8;   // Comfortable volume level
      break;
    case 'fr':
    case 'fr-FR':
    case 'fr-CA':
    default:
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;     // IMPROVED: Natural speaking rate for French (was 0.40)
      utterance.pitch = 1.1;    // Slightly higher pitch for friendliness
      utterance.volume = 0.85;  // Slightly higher volume for French
      break;
  }
  
  return utterance;
}

// Test cases
const testCases = [
  { language: 'en', expectedRate: 1.0 },
  { language: 'fr', expectedRate: 0.9 }
];

// Run tests
testCases.forEach(testCase => {
  const result = testTTSConfiguration(testCase.language);
  const passed = result.rate === testCase.expectedRate;
  
  console.log(`Testing ${testCase.language}:`);
  console.log(`  Expected rate: ${testCase.expectedRate}`);
  console.log(`  Actual rate: ${result.rate}`);
  console.log(`  Result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
});

console.log('🎉 TTS configuration test completed!');