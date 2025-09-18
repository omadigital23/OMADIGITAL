import React from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function ChatbotVisibilityTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Chatbot Visibility Test</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold mb-2">Test Instructions</h2>
        <p className="mb-2">This page is designed to test if the chatbot bubble is visible.</p>
        <p className="mb-2">Look for the floating orange chat button in the bottom right corner of your screen.</p>
        <div className="bg-yellow-100 p-3 rounded mt-2">
          <p className="font-medium">If you don't see the chat button:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Open browser developer tools (F12)</li>
            <li>Check the console for any error messages</li>
            <li>Check if there are any CSS issues</li>
          </ul>
        </div>
      </div>
      
      {/* Force render a visible indicator to confirm the page is working */}
      <div className="fixed top-4 left-4 bg-green-500 text-white p-2 rounded z-40">
        Page loaded successfully
      </div>
      
      {/* Render the chatbot */}
      <SmartChatbotNext />
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Debug Information</h2>
        <p>The chatbot component should render a floating button in the bottom right corner.</p>
        <p className="mt-2">If you see this message but not the chat button, there may be:</p>
        <ul className="list-disc list-inside mt-1">
          <li>CSS positioning issues</li>
          <li>JavaScript errors preventing rendering</li>
          <li>z-index conflicts with other elements</li>
        </ul>
      </div>
    </div>
  );
}