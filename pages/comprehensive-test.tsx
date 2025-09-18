import React, { useState } from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbotNext';

export default function ComprehensiveTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('Quels sont vos services d\'automatisation ?');
  const [expectedLanguage, setExpectedLanguage] = useState('fr');

  const runComprehensiveTest = async () => {
    setIsTesting(true);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/comprehensive-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          language: expectedLanguage
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResults(data);
      } else {
        setTestResults({ error: 'API error: ' + response.statusText });
      }
    } catch (error) {
      setTestResults({ error: 'Network error: ' + (error as Error).message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Comprehensive Chatbot Test</h1>
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Message
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter test message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Language
            </label>
            <select
              value={expectedLanguage}
              onChange={(e) => setExpectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="fr">French</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <button
          onClick={runComprehensiveTest}
          disabled={isTesting}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isTesting ? 'Testing...' : 'Run Comprehensive Test'}
        </button>
      </div>
      
      {testResults && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {testResults.error ? (
            <div className="text-red-500">
              <h3 className="font-medium">Error:</h3>
              <p>{testResults.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Language Detection</h3>
                <p>Detected: {testResults.tests.languageDetection.detected}</p>
                <p>Expected: {testResults.tests.languageDetection.expected}</p>
                <p className={testResults.tests.languageDetection.correct ? 'text-green-500' : 'text-red-500'}>
                  Correct: {testResults.tests.languageDetection.correct ? 'Yes' : 'No'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Intent Detection</h3>
                <p>Intent: {testResults.tests.intentDetection.intent}</p>
                <p>Confidence: {testResults.tests.intentDetection.confidence.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Knowledge Base Search</h3>
                <p>Results: {testResults.tests.knowledgeBaseSearch.results}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Google AI Integration</h3>
                <p className={testResults.tests.googleAIIntegration.success ? 'text-green-500' : 'text-red-500'}>
                  Success: {testResults.tests.googleAIIntegration.success ? 'Yes' : 'No'}
                </p>
                <p>Response Length: {testResults.tests.googleAIIntegration.responseLength} characters</p>
              </div>
              
              <div>
                <h3 className="font-medium">Full Processing</h3>
                <p className={testResults.tests.fullProcessing.success ? 'text-green-500' : 'text-red-500'}>
                  Success: {testResults.tests.fullProcessing.success ? 'Yes' : 'No'}
                </p>
                <p>Response Length: {testResults.tests.fullProcessing.responseLength} characters</p>
                <p>Language: {testResults.tests.fullProcessing.language}</p>
                <p>Source: {testResults.tests.fullProcessing.source}</p>
                <p>Confidence: {testResults.tests.fullProcessing.confidence.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Final Response</h3>
                <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  {testResults.finalResponse.response}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Embedded Chatbot</h2>
        <div className="h-96">
          <SmartChatbotNext />
        </div>
      </div>
    </div>
  );
}