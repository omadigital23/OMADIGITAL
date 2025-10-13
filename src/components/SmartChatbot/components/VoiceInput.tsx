/**
 * Composant d'interface vocale pour le chatbot
 */

import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string, language?: 'fr' | 'en') => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Create a wrapper function to handle the processing state
  const handleTranscript = React.useCallback((transcript: string, language?: 'fr' | 'en') => {
    console.log('🎤 VoiceInput: Handling transcript:', { transcript, language });
    console.log('🔄 VoiceInput: Calling onTranscript callback');
    setIsProcessing(true);
    onTranscript(transcript, language);
    console.log('✅ VoiceInput: onTranscript callback completed');
    // Reset processing state after a short delay
    setTimeout(() => setIsProcessing(false), 1000);
  }, [onTranscript]);

  const [isListening, setIsListening] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<BlobPart[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  // Detect platform
  const getPlatform = () => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    if (/macintosh|mac os x/.test(ua)) return 'macos';
    if (/windows/.test(ua)) return 'windows';
    return 'other';
  };

  const platform = getPlatform();
  const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const startListening = async () => {
    try {
      setError(null);
      setIsListening(true);

      console.log('🎤 Platform detected:', platform, '| Safari:', isSafari);

      // Request microphone with platform-specific constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // iOS/Safari specific
          ...(platform === 'ios' || isSafari ? {
            sampleRate: 16000,
            channelCount: 1
          } : {})
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      console.log('🎤 Microphone access granted');

      // 1) Try MediaRecorder with supported codecs (Chrome, Edge, Firefox, Android)

      const supportsWebmOpus = typeof MediaRecorder !== 'undefined' &&
        (MediaRecorder as any).isTypeSupported?.('audio/webm;codecs=opus');
      const supportsOggOpus = typeof MediaRecorder !== 'undefined' &&
        (MediaRecorder as any).isTypeSupported?.('audio/ogg;codecs=opus');
      const supportsWebm = typeof MediaRecorder !== 'undefined' &&
        (MediaRecorder as any).isTypeSupported?.('audio/webm');
      const supportsMp4 = typeof MediaRecorder !== 'undefined' &&
        (MediaRecorder as any).isTypeSupported?.('audio/mp4');

      console.log('🎤 Codec support:', {
        webmOpus: supportsWebmOpus,
        oggOpus: supportsOggOpus,
        webm: supportsWebm,
        mp4: supportsMp4
      });

      // Try MediaRecorder with best available codec
      if (supportsWebmOpus || supportsOggOpus || supportsWebm || supportsMp4) {
        let mimeType: string;
        let encoding: string;

        if (supportsWebmOpus) {
          mimeType = 'audio/webm;codecs=opus';
          encoding = 'WEBM_OPUS';
        } else if (supportsOggOpus) {
          mimeType = 'audio/ogg;codecs=opus';
          encoding = 'OGG_OPUS';
        } else if (supportsWebm) {
          mimeType = 'audio/webm';
          encoding = 'WEBM_OPUS';
        } else {
          mimeType = 'audio/mp4';
          encoding = 'MP4';
        }

        console.log('🎤 Using MediaRecorder with:', mimeType);

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunksRef.current = [];
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(audioChunksRef.current, { type: mimeType });
            const arrayBuffer = await blob.arrayBuffer();
            
            // Convert ArrayBuffer to base64 for API transmission
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            // Call the STT API
            const response = await fetch('/api/stt/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audioData: base64Audio,
                language: 'fr'
              })
            });

            if (!response.ok) {
              throw new Error(`STT API error: ${response.status}`);
            }

            const result = await response.json();
            const transcript = result.text?.trim();
            if (transcript && transcript.length > 1) {
              handleTranscript(transcript, result.language);
            } else {
              setError('Aucune parole détectée');
            }
          } catch (err: any) {
            console.error('🎤 VoiceInput: STT API error:', err);
            setError('Erreur de reconnaissance vocale');
          } finally {
            setIsListening(false);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
              streamRef.current = null;
            }
          }
        };

        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 5000);
        return;
      }

      // 2) Fallback: PCM LINEAR16 via WebAudio (Safari/iOS/older browsers)
      console.log('🎤 MediaRecorder not supported, using WebAudio fallback');
      
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('AudioContext non supporté sur ce navigateur');
      }
      
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;
      
      console.log('🎤 AudioContext created, sample rate:', audioContext.sampleRate);
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const pcmData: Float32Array[] = [];

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        const input = e.inputBuffer.getChannelData(0);
        pcmData.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Stop after 5s, assemble PCM, downsample to 16kHz, encode LINEAR16
      setTimeout(async () => {
        try {
          processor.disconnect();
          source.disconnect();
          stream.getTracks().forEach(t => t.stop());

          // Merge float32 chunks
          const recorded = mergeFloat32Arrays(pcmData);
          const fromRate = audioContext.sampleRate;
          const targetRate = 16000;
          const downsampled = downsampleBuffer(recorded, fromRate, targetRate);
          const linear16 = floatTo16BitPCM(downsampled);
          const arrayBuffer = linear16.buffer as ArrayBuffer;

          // Convert ArrayBuffer to base64 for API transmission
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          // Call the STT API
          const response = await fetch('/api/stt/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioData: base64Audio,
              language: 'fr',
              encoding: 'LINEAR16',
              sampleRateHertz: targetRate
            })
          });

          if (!response.ok) {
            throw new Error(`STT API error: ${response.status}`);
          }

          const result = await response.json();
          const transcript = result.text?.trim();
          if (transcript && transcript.length > 1) {
            handleTranscript(transcript, result.language);
          } else {
            setError('Aucune parole détectée');
          }
        } catch (err: any) {
          console.error('🎤 VoiceInput: PCM STT error:', err);
          setError('Erreur de reconnaissance vocale');
        } finally {
          setIsListening(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            try { 
              audioContextRef.current.close(); 
              audioContextRef.current = null;
            } catch {}
          }
        }
      }, 5000);

    } catch (err: any) {
      console.error('🎤 VoiceInput: Error starting recognition:', err);
      
      // Better error messages based on error type
      let errorMessage = 'Erreur de reconnaissance vocale';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permission microphone refusée';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Aucun microphone détecté';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone déjà utilisé par une autre application';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Microphone ne supporte pas les paramètres requis';
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Accès microphone bloqué (HTTPS requis)';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        try { 
          audioContextRef.current.close(); 
          audioContextRef.current = null;
        } catch {}
      }
    }
  };

  const stopListening = () => {
    console.log('🎤 Stopping recording...');
    
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
      }
    }
    
    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    // Close AudioContext
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
        audioContextRef.current = null;
      } catch (err) {
        console.error('Error closing AudioContext:', err);
      }
    }
    
    setIsListening(false);
  };

  const isSupported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed" title="STT non supporté sur ce navigateur">
        <MicOff className="w-5 h-5" />
      </div>
    );
  }

  const getButtonStyle = () => {
    if (isProcessing) return 'bg-blue-500 text-white animate-pulse';
    if (isListening) return 'bg-red-500 text-white animate-pulse';
    if (error) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  };

  const getIcon = () => {
    if (isProcessing) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (isListening) return <MicOff className="w-5 h-5" />;
    return <Mic className="w-5 h-5" />;
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    // Provide more detailed error messages with user guidance
    if (error.includes('Permission microphone refusée') || error.includes('Permission')) {
      return (
        <div>
          <p className="font-medium">Permission refusée</p>
          <p className="text-xs">
            {platform === 'ios' ? 'Paramètres → Safari → Microphone' : 
             platform === 'android' ? 'Paramètres → Applications → Autorisations' :
             'Autorisez le microphone dans les paramètres'}
          </p>
        </div>
      );
    }
    
    if (error.includes('Aucun microphone détecté')) {
      return (
        <div>
          <p className="font-medium">Microphone non détecté</p>
          <p className="text-xs">Vérifiez qu'un microphone est connecté</p>
        </div>
      );
    }
    
    if (error.includes('déjà utilisé')) {
      return (
        <div>
          <p className="font-medium">Microphone occupé</p>
          <p className="text-xs">Fermez les autres applications utilisant le microphone</p>
        </div>
      );
    }
    
    if (error.includes('HTTPS requis')) {
      return (
        <div>
          <p className="font-medium">Connexion non sécurisée</p>
          <p className="text-xs">Le microphone nécessite HTTPS</p>
        </div>
      );
    }
    
    if (error.includes('Aucune parole détectée')) {
      return (
        <div>
          <p className="font-medium">Aucune parole détectée</p>
          <p className="text-xs">Veuillez parler plus fort et réessayer</p>
        </div>
      );
    }
    
    return <span>{error}</span>;
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleToggleRecording}
        disabled={disabled || isProcessing}
        className={`p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyle()}`}
        title={isListening ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
      >
        {getIcon()}
      </button>
      
      {error && (
        <div className="mt-2 text-xs text-red-500 text-center max-w-48 bg-red-50 p-2 rounded-lg">
          {getErrorMessage()}
        </div>
      )}
      
      {isListening && (
        <div className="mt-2 text-xs text-orange-500 animate-pulse flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></div>
          <span>Écoute en cours...</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="mt-2 text-xs text-blue-500 animate-pulse flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
          <span>Envoi en cours...</span>
        </div>
      )}
    </div>
  );
}

function mergeFloat32Arrays(chunks: Float32Array[]): Float32Array {
  let totalLength = 0;
  for (const c of chunks) totalLength += c.length;
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

function downsampleBuffer(buffer: Float32Array, sampleRate: number, outSampleRate: number): Float32Array {
  if (outSampleRate === sampleRate) return buffer;
  const ratio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0, count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i] ?? 0;
      count++;
    }
    result[offsetResult] = accum / (count || 1);
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const output = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i] ?? 0));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}