import React from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function SimpleChatbotTest() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Simple Chatbot Test</h1>
        <p className="mb-4">This page tests if the chatbot is visible.</p>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Test Content</h2>
          <p>This is a simple page to test if the chatbot renders correctly.</p>
        </div>
      </div>
      
      {/* Render the chatbot */}
      <SmartChatbotNext />
    </div>
  );
}