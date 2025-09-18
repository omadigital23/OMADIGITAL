import React, { useEffect, useState } from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function ChatbotTest() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('ChatbotTest: Component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Chatbot Visibility Test</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Area</h2>
        <p>This page tests if the chatbot is visible.</p>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-medium">Debug Information:</p>
          <p>isClient: {isClient ? 'true' : 'false'}</p>
          <p>Time: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
      
      {isClient && (
        <div className="fixed bottom-20 right-4 bg-blue-100 p-2 rounded text-blue-800 z-40">
          Client-side rendering confirmed
        </div>
      )}
      
      {/* Render the chatbot */}
      <SmartChatbotNext />
      
      <div className="mt-8 bg-green-50 p-4 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold mb-2 text-green-800">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-green-700">
          <li>Open browser developer tools (F12)</li>
          <li>Check the console for debug messages</li>
          <li>Look for the floating chat button in the bottom right corner</li>
          <li>If you don't see it, check if there are any CSS issues</li>
        </ol>
      </div>
    </div>
  );
}