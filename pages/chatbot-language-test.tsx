import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function ChatbotLanguageTest() {
  const { t } = useTranslation();
  const [testResults, setTestResults] = useState<any>(null);
  const [testInput, setTestInput] = useState('');
  const [loading, setLoading] = useState(false);

  const testLanguageDetection = async () => {
    if (!testInput.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/test-chatbot-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testInput })
      });
      
      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ error: 'Test failed', message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chatbot Language Detection Test
          </h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Test if the chatbot correctly detects the input language and responds in the same language.
          </p>
          
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Language Detection Test
            </h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter text to test language detection..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={testLanguageDetection}
                disabled={loading || !testInput.trim()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 hover:bg-orange-600 transition-colors"
              >
                {loading ? 'Testing...' : 'Test Language Detection'}
              </button>
            </div>
            
            {testResults && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h3 className="font-medium mb-2">Test Results:</h3>
                <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Real Chatbot Test
            </h2>
            <p className="text-gray-700 mb-4">
              Try sending messages in English and French to verify the chatbot responds in the correct language:
            </p>
            <div className="bg-white rounded-lg p-4 min-h-[400px]">
              <SmartChatbotNext />
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Test Instructions:</h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Send a message in English (e.g., "Hello, how can you help me?")</li>
                <li>Send a message in French (e.g., "Bonjour, comment pouvez-vous m'aider ?")</li>
                <li>Verify that the chatbot responds in the same language as your input</li>
                <li>The chatbot should only respond in English or French, never in Arabic or Spanish</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common'])),
    },
  };
};