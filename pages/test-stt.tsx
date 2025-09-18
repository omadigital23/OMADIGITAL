/**
 * Test page for STT functionality
 */

import { useState, useRef } from 'react';

export default function TestSTTPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      setStatus('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        setStatus('Processing audio...');
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setStatus(`Audio recorded. Size: ${audioBlob.size} bytes. Sending to server...`);
          
          // Send to our test API endpoint
          const response = await fetch('/api/test-stt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          const result = await response.json();
          
          if (result.success) {
            setStatus('STT processing completed successfully');
            setTranscript('Test completed - check server logs for details');
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          console.error('STT Error:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setStatus('Error occurred during STT processing');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Recording... Speak now!');
      
    } catch (err) {
      console.error('Microphone Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">STT Test Page</h1>
        
        <div className="mb-6">
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg mb-4">
            <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-center text-gray-600">
              {isRecording ? 'Recording... Speak now!' : isProcessing ? 'Processing...' : 'Ready to record'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Recording
            </button>
            
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop Recording
            </button>
          </div>
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
        
        {transcript && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            <h3 className="font-medium mb-1">Transcript:</h3>
            <p>{transcript}</p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Instructions</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Click "Start Recording" to begin</li>
            <li>Speak into your microphone</li>
            <li>Click "Stop Recording" when finished</li>
            <li>Check the console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}