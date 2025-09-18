import React from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function TestChatbotDebug() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Test Chatbot Debug</h1>
      <p className="mb-4">This page is for debugging the chatbot visibility issue.</p>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Chatbot Test Area</h2>
        <p>Below should be the chatbot bubble:</p>
        
        <div className="mt-4">
          <SmartChatbotNext />
        </div>
      </div>
      
      <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-2 text-yellow-800">Debugging Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>Check browser console for any JavaScript errors</li>
          <li>Verify that the chatbot component is being rendered (look for the floating button)</li>
          <li>Check if there are any CSS issues hiding the component</li>
          <li>Ensure all required dependencies are loaded</li>
        </ol>
      </div>
    </div>
  );
}