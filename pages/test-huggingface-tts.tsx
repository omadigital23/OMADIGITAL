import React, { useState, useEffect } from 'react';
import { huggingFaceTTS } from '../src/lib/huggingface-tts';

export default function TestHuggingFaceTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [text, setText] = useState('Bonjour, je suis le chatbot OMA. Comment puis-je vous aider aujourd\'hui?');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Check if Hugging Face API is configured
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/huggingface-config');
        const data = await response.json();
        setIsConfigured(data.configured);
      } catch (err) {
        console.error('Error checking Hugging Face config:', err);
        setIsConfigured(false);
      }
    };
    
    checkConfig();
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    
    setIsSpeaking(true);
    setStatus('Génération de l\'audio en cours...');
    setError('');
    setDebugInfo(null);
    
    try {
      // Test the API endpoint directly first
      const apiResponse = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          language: language
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`API Error: ${errorData.error || 'Unknown error'} (Status: ${apiResponse.status})`);
      }
      
      const apiData = await apiResponse.json();
      setDebugInfo({
        apiSuccess: apiData.success,
        model: apiData.model,
        audioLength: apiData.audio ? apiData.audio.length : 0
      });
      
      // Now try to play the audio
      const success = await huggingFaceTTS.speakText(text, language);
      if (success) {
        setStatus('Audio joué avec succès!');
      } else {
        setError('Erreur lors de la génération de l\'audio. Veuillez vérifier la console pour plus de détails.');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setError(`Erreur: ${(error as Error).message || 'Une erreur inconnue est survenue'}`);
      setStatus('');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Hugging Face TTS</h1>
          
          {isConfigured === false && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Configuration requise</h2>
              <p className="text-red-700 mb-3">
                La clé API Hugging Face n'est pas configurée. Pour utiliser cette fonctionnalité, vous devez :
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-red-700">
                <li>Obtenir une clé API gratuite sur <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">Hugging Face</a></li>
                <li>Ajouter <code className="bg-red-100 px-1 rounded">HUGGINGFACE_API_KEY=votre_clé_api</code> dans votre fichier .env.local</li>
                <li>Redémarrer le serveur de développement</li>
              </ol>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte à lire
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Entrez le texte à lire..."
                disabled={isConfigured === false}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                disabled={isConfigured === false}
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSpeak}
                disabled={isSpeaking || isConfigured === false}
                className={`px-6 py-3 rounded-md font-medium text-white ${
                  isSpeaking || isConfigured === false
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {isSpeaking ? 'Lecture en cours...' : 'Lire le texte'}
              </button>
              
              {isSpeaking && (
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-1 animate-bounce"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
            
            {status && (
              <div className="p-4 rounded-md bg-green-50 text-green-700">
                <p className="font-medium">{status}</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 rounded-md bg-red-50 text-red-700">
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-2">
                  Cela peut être dû à :
                </p>
                <ul className="list-disc pl-5 mt-1 text-sm">
                  <li>Une clé API Hugging Face invalide ou manquante</li>
                  <li>Des problèmes de permissions avec le modèle TTS</li>
                  <li>Des limitations de quota sur votre compte Hugging Face</li>
                  <li>Des problèmes de connexion réseau</li>
                </ul>
                <p className="text-sm mt-2">
                  Veuillez vérifier votre fichier .env.local et assurez-vous que votre clé API Hugging Face est correcte.
                </p>
              </div>
            )}
            
            {debugInfo && (
              <div className="p-4 rounded-md bg-blue-50 text-blue-700">
                <p className="font-medium">Debug Information:</p>
                <p>API Success: {debugInfo.apiSuccess ? 'Yes' : 'No'}</p>
                <p>Model: {debugInfo.model}</p>
                <p>Audio Length: {debugInfo.audioLength}</p>
              </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h2>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>Cette page teste la fonctionnalité TTS avec Hugging Face</li>
                <li>Le chatbot répondra avec la voix sur tous les navigateurs</li>
                <li>Entrez du texte et sélectionnez la langue, puis cliquez sur "Lire le texte"</li>
                <li>Le service fonctionne même si le TTS natif du navigateur n'est pas disponible</li>
                <li className="mt-2 font-semibold">Pour configurer votre clé API Hugging Face :</li>
                <li>Ajoutez <code className="bg-gray-100 px-1 rounded">HUGGINGFACE_API_KEY=votre_clé_api</code> dans votre fichier .env.local</li>
                <li>Redémarrez le serveur de développement après avoir ajouté la clé</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Problèmes connus et solutions</h3>
              <ul className="list-disc pl-5 space-y-1 text-yellow-700 text-sm">
                <li><strong>Erreur 403 Forbidden :</strong> Votre clé API n'a pas accès au modèle. Utilisez une clé valide avec accès aux modèles TTS.</li>
                <li><strong>Erreur 401 Unauthorized :</strong> Clé API invalide ou manquante. Vérifiez votre fichier .env.local.</li>
                <li><strong>Pas de son :</strong> Vérifiez le volume de votre appareil et les autorisations du navigateur.</li>
                <li><strong>Quota exceeded :</strong> Vous avez dépassé votre quota gratuit. Veuillez passer à un plan payant sur Hugging Face.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}