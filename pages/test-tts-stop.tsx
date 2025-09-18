import React from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbotNext';

export default function TestTTSStop() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test TTS Stop Functionality
          </h1>
          <p className="text-gray-600">
            This page tests the ability to stop text-to-speech in the SmartChatbotNext component
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Open the chatbot by clicking the chat icon in the bottom right</li>
            <li>Send a voice message or type a message that will trigger a voice response</li>
            <li>When the bot responds with voice output, you should see a red stop button</li>
            <li>Click the red stop button to interrupt the text-to-speech playback</li>
            <li>Verify that the speech stops immediately</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Chatbot Component</h2>
          <p className="text-gray-600 mb-4">
            The chatbot below has been enhanced with the ability to stop text-to-speech playback.
            Look for the speaker icon in the input area - it will turn red and change to a mute icon
            when speech is playing, allowing you to stop it.
          </p>
          <div className="border-t border-gray-200 pt-4">
            <SmartChatbotNext />
          </div>
        </div>
      </div>
    </div>
  );
}