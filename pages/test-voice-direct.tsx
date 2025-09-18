import React from 'react';
import { SmartChatbotNext } from '../src/components/SmartChatbot';

export default function TestVoiceDirect() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Test d'Envoi Direct Vocal
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Instructions</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Cliquez sur le bouton microphone du chatbot</li>
            <li>Parlez quand le bouton devient rouge</li>
            <li>Votre message sera envoyé directement sans apparaître dans le champ de texte</li>
            <li>Vous verrez un indicateur "Envoi en cours" pendant le traitement</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Chatbot</h2>
          <SmartChatbotNext />
        </div>
      </div>
    </div>
  );
}