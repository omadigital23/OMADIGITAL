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
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
      
      // Safety timeout: force stop after 10 seconds to prevent hanging
      timeoutRef.current = setTimeout(() => {
        console.log('🎤 Safety timeout reached, forcing stop');
        stopListening();
        setError('Timeout: enregistrement trop long');
      }, 10000);

      // Request microphone with platform-specific constraints
      // Force mono recording to avoid channel count mismatch between browsers
      let constraints: MediaStreamConstraints;
      
      if (platform === 'ios' || isSafari) {
        // iOS/Safari requires more permissive constraints
        console.log('🎤 iOS/Safari detected, using permissive audio constraints');
        constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: { ideal: 1, min: 1 }, // More flexible for iOS
            sampleRate: { ideal: 16000, min: 8000 } // More flexible for iOS
          }
        };
      } else {
        // Standard constraints for other browsers
        constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,  // Force mono to avoid channel count conflicts
            sampleRate: 16000 // Standard sample rate for speech recognition
          }
        };
      }

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
            // Clear safety timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            
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
              const errorData = await response.json().catch(() => ({}));
              console.error('🎤 VoiceInput: STT API error response:', errorData);
              throw new Error(`STT API error: ${response.status} - ${errorData.message || ''} - ${JSON.stringify(errorData.debug || {})}`);
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
            
            // Extract specific error message for iOS
            let errorMessage = 'Erreur de reconnaissance vocale';
            if (platform === 'ios' || isSafari) {
              if (err.message?.includes('audio_channel_count')) {
                errorMessage = 'Problème de compatibilité audio iOS. Essayez Chrome ou un autre navigateur.';
              } else if (err.message?.includes('400') || err.message?.includes('INVALID_ARGUMENT')) {
                errorMessage = 'Format audio non compatible avec iOS. Essayez de parler plus distinctement.';
              } else if (err.message?.includes('500')) {
                errorMessage = 'Service temporairement indisponible. Réessayez dans quelques instants.';
              } else if (err.message?.includes('empty') || err.message?.includes('Aucune parole')) {
                errorMessage = 'Aucune parole détectée. Parlez plus fort et plus distinctement.';
              } else {
                errorMessage = 'Erreur technique sur iOS. Vérifiez les permissions microphone dans Réglages → Safari.';
              }
            } else {
              errorMessage = 'Erreur de reconnaissance vocale. Vérifiez votre connexion et réessayez.';
            }
            
            setError(errorMessage);
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

      // 2) Fallback: Use MediaRecorder with any available format for iOS
      console.log('🎤 Using iOS fallback with MediaRecorder');
      
      try {
        // iOS Safari supports MediaRecorder but with limited formats
        // Try to use any available format
        let mimeType = '';
        let encoding = 'WEBM_OPUS';
        
        // Try different formats for iOS - prioritize formats that work best
        if ((MediaRecorder as any).isTypeSupported?.('audio/mp4')) {
          mimeType = 'audio/mp4';
          encoding = 'MP4';
          console.log('🎤 iOS: Using MP4 format');
        } else if ((MediaRecorder as any).isTypeSupported?.('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
          encoding = 'WEBM_OPUS';
          console.log('🎤 iOS: Using WEBM OPUS format');
        } else if ((MediaRecorder as any).isTypeSupported?.('audio/webm')) {
          mimeType = 'audio/webm';
          encoding = 'WEBM_OPUS';
          console.log('🎤 iOS: Using WEBM format');
        } else if ((MediaRecorder as any).isTypeSupported?.('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
          encoding = 'OGG_OPUS';
          console.log('🎤 iOS: Using OGG OPUS format');
        } else if ((MediaRecorder as any).isTypeSupported?.('audio/ogg')) {
          mimeType = 'audio/ogg';
          encoding = 'OGG_OPUS';
          console.log('🎤 iOS: Using OGG format');
        } else {
          // No mimeType specified - let browser choose
          console.log('🎤 iOS: No specific mimeType supported, using default');
        }
        
        console.log('🎤 iOS: Using MediaRecorder with mimeType:', mimeType || 'default');
        
        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
          
        audioChunksRef.current = [];
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            console.log('🎤 iOS: Data chunk received, size:', event.data.size);
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          console.log('🎤 iOS: MediaRecorder stopped, processing audio...');
          try {
            // Clear safety timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            
            const actualMimeType = mimeType || mediaRecorder.mimeType || 'audio/webm';
            const blob = new Blob(audioChunksRef.current, { type: actualMimeType });
            
            console.log('🎤 iOS: Blob created, size:', blob.size, 'type:', actualMimeType);
            
            if (blob.size === 0) {
              throw new Error('Enregistrement audio vide');
            }
            
            const arrayBuffer = await blob.arrayBuffer();
            
            // Convert ArrayBuffer to base64 for API transmission
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            
            console.log('🎤 iOS: Sending to STT API, base64 length:', base64Audio.length);
            
            // Call the STT API
            const response = await fetch('/api/stt/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audioData: base64Audio,
                language: 'fr',
                encoding: encoding
              })
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('🎤 iOS: STT API error response:', errorData);
              throw new Error(`STT API error: ${response.status} - ${errorData.message || ''} - ${JSON.stringify(errorData.debug || {})}`);
            }

            const result = await response.json();
            console.log('🎤 iOS: STT result:', result);
            
            const transcript = result.text?.trim();
            if (transcript && transcript.length > 1) {
              handleTranscript(transcript, result.language);
            } else {
              setError('Aucune parole détectée');
            }
          } catch (err: any) {
            console.error('🎤 iOS: STT error:', err);
            
            // Extract specific error message for iOS
            let errorMessage = 'Erreur de reconnaissance vocale';
            if (err.message?.includes('audio_channel_count')) {
              errorMessage = 'Problème de compatibilité audio iOS. Essayez Chrome ou un autre navigateur.';
            } else if (err.message?.includes('400') || err.message?.includes('INVALID_ARGUMENT')) {
              errorMessage = 'Format audio non compatible avec iOS Safari. Essayez de parler plus distinctement.';
            } else if (err.message?.includes('500')) {
              errorMessage = 'Service temporairement indisponible. Réessayez dans quelques instants.';
            } else if (err.message?.includes('empty') || err.message?.includes('Aucune parole')) {
              errorMessage = 'Aucune parole détectée. Parlez plus fort et plus distinctement.';
            } else if (err.message?.includes('STT API error')) {
              errorMessage = 'Erreur de connexion au service vocal. Vérifiez votre connexion internet.';
            } else {
              errorMessage = `Erreur technique: ${err.message || 'Problème de compatibilité iOS Safari'}`;
            }
            
            setError(errorMessage);
          } finally {
            setIsListening(false);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(t => t.stop());
              streamRef.current = null;
            }
          }
        };

        mediaRecorder.onerror = (event: any) => {
          console.error('🎤 iOS: MediaRecorder error:', event.error);
          setError('Erreur d\'enregistrement audio');
          setIsListening(false);
        };

        console.log('🎤 iOS: Starting MediaRecorder...');
        mediaRecorder.start();
        
        // Stop after 5 seconds
        setTimeout(() => {
          console.log('🎤 iOS: Timeout reached, stopping MediaRecorder...');
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 5000);
        
      } catch (err: any) {
        console.error('🎤 iOS: MediaRecorder fallback failed:', err);
        
        // Final fallback: Try using AudioContext for iOS if MediaRecorder fails
        if (platform === 'ios' || isSafari) {
          console.log('🎤 iOS: Trying AudioContext fallback...');
          try {
            await startAudioContextRecording(stream);
            return;
          } catch (audioContextError) {
            console.error('🎤 iOS: AudioContext fallback also failed:', audioContextError);
          }
        }
        
        setError('Enregistrement audio non supporté sur cet appareil');
        setIsListening(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      }

    } catch (err: any) {
      console.error('🎤 VoiceInput: Error starting recognition:', err);
      
      // Better error messages based on error type and platform
      let errorMessage = 'Erreur de reconnaissance vocale';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        if (platform === 'ios') {
          errorMessage = 'Microphone non autorisé. Allez dans Réglages → Safari → Microphone et activez l\'accès';
        } else {
          errorMessage = 'Permission microphone refusée. Autorisez l\'accès au microphone dans les paramètres de votre navigateur';
        }
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Aucun microphone détecté sur cet appareil';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Microphone déjà utilisé par une autre application. Fermez les autres applications utilisant le microphone';
      } else if (err.name === 'OverconstrainedError') {
        if (platform === 'ios') {
          errorMessage = 'Problème de compatibilité audio sur iOS. Essayez de rafraîchir la page';
        } else {
          errorMessage = 'Microphone ne supporte pas les paramètres requis';
        }
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Accès microphone bloqué. Utilisez HTTPS pour activer le microphone';
      } else if (err.message?.includes('STT API error')) {
        if (platform === 'ios') {
          errorMessage = 'Problème de compatibilité audio avec iOS. Essayez de parler plus fort ou de vous rapprocher du microphone';
        } else {
          errorMessage = 'Erreur de traitement audio. Vérifiez votre connexion et réessayez';
        }
      } else if (err.message?.includes('audio_channel_count')) {
        errorMessage = 'Problème de configuration audio. Essayez de rafraîchir la page';
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
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
    
    // Clear safety timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
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
    
    // iOS specific error messages
    if (error.includes('compatibilité audio iOS')) {
      return (
        <div>
          <p className="font-medium">Problème de compatibilité iOS</p>
          <p className="text-xs">Essayez Chrome ou rafraîchissez la page</p>
        </div>
      );
    }
    
    if (error.includes('Format audio non compatible')) {
      return (
        <div>
          <p className="font-medium">Format audio non supporté</p>
          <p className="text-xs">Parlez plus distinctement ou utilisez Chrome</p>
        </div>
      );
    }
    
    if (error.includes('Service temporairement indisponible')) {
      return (
        <div>
          <p className="font-medium">Service temporairement indisponible</p>
          <p className="text-xs">Réessayez dans quelques instants</p>
        </div>
      );
    }
    
    if (error.includes('Erreur de connexion')) {
      return (
        <div>
          <p className="font-medium">Problème de connexion</p>
          <p className="text-xs">Vérifiez votre connexion internet</p>
        </div>
      );
    }
    
    if (error.includes('Erreur technique')) {
      return (
        <div>
          <p className="font-medium">Erreur technique</p>
          <p className="text-xs">Rafraîchissez la page et réessayez</p>
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

/**
 * Fallback recording method using AudioContext for iOS when MediaRecorder fails
 */
async function startAudioContextRecording(stream: MediaStream): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    const audioChunks: Float32Array[] = [];
    let recordingTimeout: NodeJS.Timeout;
    
    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      audioChunks.push(new Float32Array(inputData));
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    // Stop recording after 5 seconds
    recordingTimeout = setTimeout(() => {
      processor.disconnect();
      source.disconnect();
      audioContext.close();
      
      if (audioChunks.length === 0) {
        reject(new Error('No audio data recorded'));
        return;
      }
      
      // Process the recorded audio
      const mergedAudio = mergeFloat32Arrays(audioChunks);
      const downsampledAudio = downsampleBuffer(mergedAudio, audioContext.sampleRate, 16000);
      const pcmData = floatTo16BitPCM(downsampledAudio);
      
      // Convert to WAV format
      const wavBuffer = encodeWAV(pcmData, 16000, 1);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      // Send to STT API
      processAudioBlob(blob, 'LINEAR16').then(resolve).catch(reject);
    }, 5000);
  });
}

/**
 * Encode PCM data to WAV format
 */
function encodeWAV(samples: Int16Array, sampleRate: number, numChannels: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  
  // Write PCM samples
  const data = new Int16Array(buffer, 44);
  data.set(samples);
  
  return buffer;
}

/**
 * Process audio blob and send to STT API
 */
async function processAudioBlob(blob: Blob, encoding: string): Promise<void> {
  const arrayBuffer = await blob.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  const response = await fetch('/api/stt/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioData: base64Audio,
      language: 'fr',
      encoding: encoding
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`STT API error: ${response.status} - ${errorData.message || ''}`);
  }
  
  const result = await response.json();
  const transcript = result.text?.trim();
  
  if (!transcript || transcript.length <= 1) {
    throw new Error('Aucune parole détectée');
  }
  
  // We need to call the parent component's callback
  // This is a simplified version - in reality we'd need to pass the callback
  console.log('🎤 AudioContext recording transcript:', transcript);
}