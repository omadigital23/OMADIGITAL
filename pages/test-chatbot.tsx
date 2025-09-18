import React, { useState } from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbotNext';

export default function TestChatbotPage() {
  const [messages, setMessages] = useState<Array<{text: string, sender: string}>>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Call the chat API
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          sessionId: 'test-session-' + Date.now(),
          inputMethod: 'text'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add bot response
        const botMessage = { text: data.response, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = { text: 'Error: ' + response.statusText, sender: 'bot' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { text: 'Error: ' + (error as Error).message, sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Test Chatbot</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Manual Test</h2>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Messages</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-2 rounded ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}
            >
              <strong>{msg.sender === 'user' ? 'You: ' : 'Bot: '}</strong>
              {msg.text}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Embedded Chatbot</h2>
        <div className="bg-white rounded-lg shadow-md p-4">
          <SmartChatbotNext />
        </div>
      </div>
    </div>
  );
}