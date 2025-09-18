/**
 * Test page for TTS functionality
 */

import { useState } from 'react';
import { googleTTS } from '../src/lib/google-tts';

export default function TestTTSPage() {
  const [text, setText] = useState('Bonjour, ceci est un test de synthèse vocale.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleSpeak = async () => {
    try {
      setIsSpeaking(true);
      setError(null);
      setStatus('Synthesizing speech...');
      
      const success = await googleTTS.speakText(text, 'fr');
      
      if (success) {
        setStatus('Speech synthesis completed successfully');
      } else {
        setStatus('Using native TTS fallback');
      }
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Error occurred during speech synthesis');
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setStatus('Speech synthesis stopped');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">TTS Test Page</h1>
        
        <div className="mb-6">
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Text to speak
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            rows={4}
            disabled={isSpeaking}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpeaking ? 'Speaking...' : 'Speak Text'}
          </button>
          
          <button
            onClick={handleStop}
            disabled={!isSpeaking}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
        
        {status && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
            {status}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Instructions</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Enter text in the textarea above</li>
            <li>Click "Speak Text" to hear the synthesized speech</li>
            <li>Click "Stop" to interrupt speech synthesis</li>
            <li>Check the console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}