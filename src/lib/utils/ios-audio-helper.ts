/**
 * iOS Audio Helper - Optimisations spécifiques pour Safari iOS
 * 
 * @description Gère les particularités d'iOS pour l'enregistrement audio
 * @platform iOS Safari, Chrome iOS
 */

export interface AudioRecordingOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  sampleRate?: number;
}

/**
 * Détecte si l'appareil est iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Détecte si le navigateur est Safari
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /safari/.test(userAgent) && !/chrome/.test(userAgent);
}

/**
 * Obtient le meilleur format audio supporté pour l'appareil
 */
export function getBestAudioFormat(): AudioRecordingOptions {
  const isIOSDevice = isIOS();
  const isSafariBrowser = isSafari();
  
  // iOS Safari a des limitations spécifiques
  if (isIOSDevice || isSafariBrowser) {
    // iOS Safari ne supporte que certains formats
    const formats = [
      'audio/mp4',
      'audio/aac',
      'audio/wav',
      'audio/webm;codecs=opus',
      'audio/webm'
    ];
    
    for (const format of formats) {
      if (MediaRecorder.isTypeSupported(format)) {
        console.log('✅ iOS: Format audio supporté:', format);
        return {
          mimeType: format,
          audioBitsPerSecond: 128000,
          sampleRate: 48000
        };
      }
    }
    
    // Fallback: pas de mimeType spécifié (utilise le défaut du navigateur)
    console.warn('⚠️ iOS: Aucun format audio préféré supporté, utilisation du format par défaut');
    return {
      sampleRate: 48000
    };
  }
  
  // Pour les autres navigateurs, utiliser webm/opus
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000,
      sampleRate: 48000
    };
  }
  
  // Fallback universel
  return {
    sampleRate: 48000
  };
}

/**
 * Demande les permissions microphone avec gestion iOS
 */
export async function requestMicrophonePermission(): Promise<MediaStream> {
  try {
    // Sur iOS, il faut demander les permissions dans un contexte utilisateur
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1
      }
    };
    
    console.log('🎤 Demande d\'accès au microphone...');
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('✅ Accès microphone accordé');
    
    return stream;
  } catch (error: any) {
    console.error('❌ Erreur accès microphone:', error);
    
    // Messages d'erreur spécifiques
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Permission microphone refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('Aucun microphone détecté sur cet appareil.');
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error('Microphone déjà utilisé par une autre application.');
    } else if (error.name === 'OverconstrainedError') {
      // Réessayer avec des contraintes moins strictes
      console.warn('⚠️ Contraintes audio trop strictes, réessai avec contraintes simplifiées...');
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (retryError) {
        throw new Error('Impossible d\'accéder au microphone avec les paramètres disponibles.');
      }
    } else {
      throw new Error(`Erreur microphone: ${error.message || 'Erreur inconnue'}`);
    }
  }
}

/**
 * Convertit un Blob audio en format compatible avec l'API
 */
export async function convertAudioBlobForAPI(blob: Blob): Promise<string> {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convertir en base64
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    return btoa(binary);
  } catch (error) {
    console.error('❌ Erreur conversion audio:', error);
    throw new Error('Impossible de convertir l\'audio pour l\'envoi');
  }
}

/**
 * Vérifie si MediaRecorder est supporté
 */
export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

/**
 * Obtient des informations de debug sur les capacités audio
 */
export async function getAudioCapabilities(): Promise<{
  isIOS: boolean;
  isSafari: boolean;
  mediaRecorderSupported: boolean;
  supportedFormats: string[];
  recommendedFormat: AudioRecordingOptions;
}> {
  const formats = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/webm;codecs=vp8',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
    'audio/mpeg'
  ];
  
  const supportedFormats = formats.filter(format => 
    MediaRecorder.isTypeSupported(format)
  );
  
  return {
    isIOS: isIOS(),
    isSafari: isSafari(),
    mediaRecorderSupported: isMediaRecorderSupported(),
    supportedFormats,
    recommendedFormat: getBestAudioFormat()
  };
}
