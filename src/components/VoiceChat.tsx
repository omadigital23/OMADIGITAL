"use client";
import { useRef, useState } from "react";

export default function VoiceChat() {
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }

  async function stopRecording() {
    return new Promise<void>((resolve) => {
      const mr = mediaRef.current;
      if (!mr) {
        resolve();
        return;
      }
      
      mr.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const fd = new FormData();
          fd.append("audio", blob, "voice.webm");
          
          // STT API call
          const sttRes = await fetch("/api/stt/vertex-ai", { 
            method: "POST", 
            body: fd 
          });
          const sttJson = await sttRes.json();
          setTranscript(sttJson.transcript || "");

          // Chat API call
          const chatRes = await fetch("/api/chat/vertex-ai", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
              query: sttJson.transcript, 
              contextDocs: [] 
            })
          });
          const chatJson = await chatRes.json();
          setAnswer(chatJson.answer || "");

          // TTS API call
          const ttsRes = await fetch("/api/tts/vertex-ai", { 
            method: "POST", 
            body: JSON.stringify({ text: chatJson.answer }),
            headers: { "Content-Type": "application/json" }
          });
          const ttsJson = await ttsRes.json();
          
          // Play audio
          const audioBytes = Uint8Array.from(atob(ttsJson.audioContent), c => c.charCodeAt(0));
          const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audio.play();
        } catch (error) {
          console.error("Error processing voice input:", error);
          alert("Error processing voice input. Please try again.");
        } finally {
          setIsRecording(false);
          resolve();
        }
      };
      mr.stop();
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Voice Chat</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button 
          onClick={startRecording}
          disabled={isRecording}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            isRecording 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg'
          }`}
        >
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        
        <button 
          onClick={stopRecording}
          disabled={!isRecording}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
            !isRecording 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg'
          }`}
        >
          Stop Recording
        </button>
      </div>

      {transcript && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Transcript:</h3>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {answer && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Answer:</h3>
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}