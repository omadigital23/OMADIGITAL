'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import {
  getChatContactActions,
  getDefaultChatSuggestions,
  type ChatLocale,
  type ChatSuggestion,
} from '@/lib/chatbot';
import { generateId } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type VoiceState = 'idle' | 'recording' | 'transcribing';
const RECORDING_TIMESLICE_MS = 1000;
const VOICE_SILENCE_THRESHOLD = 0.02;
const VOICE_SILENCE_STOP_MS = 1400;
const VOICE_MIN_RECORDING_MS = 900;
const VOICE_NO_SPEECH_TIMEOUT_MS = 9000;
const VOICE_MAX_RECORDING_MS = 45000;

function getSupportedRecordingMimeType() {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return undefined;
  }

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'video/mp4',
  ];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

function getAudioUploadExtension(mimeType: string) {
  const normalizedMimeType = mimeType.toLowerCase();

  if (normalizedMimeType.includes('mp4') || normalizedMimeType.includes('m4a')) {
    return 'mp4';
  }

  if (normalizedMimeType.includes('ogg')) {
    return 'ogg';
  }

  if (normalizedMimeType.includes('mpeg') || normalizedMimeType.includes('mp3')) {
    return 'mp3';
  }

  if (normalizedMimeType.includes('wav')) {
    return 'wav';
  }

  return 'webm';
}

function getBlobPartMimeType(part: BlobPart | undefined) {
  return part instanceof Blob ? part.type : '';
}

function getAudioContextConstructor() {
  return window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function isMicrophoneAllowedByDocumentPolicy() {
  const featurePolicy = (
    document as Document & {
      featurePolicy?: {
        allowsFeature?: (feature: string) => boolean;
      };
    }
  ).featurePolicy;

  if (!featurePolicy || typeof featurePolicy.allowsFeature !== 'function') {
    return true;
  }

  return featurePolicy.allowsFeature('microphone');
}

function formatVoiceDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function isChatSuggestion(value: unknown): value is ChatSuggestion {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { label?: unknown }).label === 'string' &&
    ((value as { kind?: unknown }).kind === 'prompt' ||
      (value as { kind?: unknown }).kind === 'link') &&
    typeof (value as { value?: unknown }).value === 'string'
  );
}

function getChatLocale(locale: string): ChatLocale {
  return locale === 'en' ? 'en' : 'fr';
}

export default function ChatWidget() {
  const locale = useLocale();
  const chatLocale = getChatLocale(locale);
  const t = useTranslations('chat');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const voiceMonitorFrameRef = useRef<number | null>(null);
  const voiceStartedRef = useRef(false);
  const silenceStartedAtRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading, voiceState, suggestions]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVoiceSupported(
        window.isSecureContext &&
        typeof MediaRecorder !== 'undefined' &&
          !!navigator.mediaDevices?.getUserMedia &&
          isMicrophoneAllowedByDocumentPolicy()
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (open && voiceState === 'idle') {
      inputRef.current?.focus();
    }
  }, [open, voiceState]);

  const contactActions = getChatContactActions(chatLocale);
  const defaultSuggestions = getDefaultChatSuggestions(chatLocale);
  const displayedSuggestions = suggestions ?? defaultSuggestions;

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: 'assistant', content },
    ]);
  };

  const openChat = () => {
    if (messages.length === 0) {
      setMessages([{ id: generateId(), role: 'assistant', content: t('greeting') }]);
      setSuggestions(null);
    }

    setOpen(true);
  };

  const applySuggestionPayload = (payload: unknown) => {
    if (!Array.isArray(payload)) {
      setSuggestions(null);
      return;
    }

    const nextSuggestions = payload.filter(isChatSuggestion).slice(0, 4);
    setSuggestions(nextSuggestions.length > 0 ? nextSuggestions : null);
  };

  const handleSuggestionSelect = async (suggestion: ChatSuggestion) => {
    if (suggestion.kind === 'link') {
      window.open(suggestion.value, '_blank', 'noopener,noreferrer');
      return;
    }

    await sendMessage(suggestion.value);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: generateId(), role: 'user', content: msg };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: chatLocale,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data.message !== 'string') {
        throw new Error('Chat request failed');
      }

      addAssistantMessage(data.message);
      applySuggestionPayload(data.suggestions);
    } catch {
      addAssistantMessage(t('connectionError'));
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    const mimeType = audioBlob.type || 'audio/webm';
    const fileExtension = getAudioUploadExtension(mimeType);
    const audioFile = new File([audioBlob], `voice-message.${fileExtension}`, {
      type: mimeType,
    });
    const formData = new FormData();

    formData.append('file', audioFile);

    const res = await fetch('/api/chat/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || typeof data.text !== 'string') {
      throw new Error('Transcription failed');
    }

    return data.text.trim();
  };

  const stopRecordingTimer = () => {
    if (recordingIntervalRef.current !== null) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setRecordingSeconds(0);
  };

  const startRecordingTimer = () => {
    setRecordingSeconds(0);

    recordingIntervalRef.current = window.setInterval(() => {
      setRecordingSeconds((current) => current + 1);
    }, 1000);
  };

  const stopVoiceActivityMonitor = () => {
    if (voiceMonitorFrameRef.current !== null) {
      window.cancelAnimationFrame(voiceMonitorFrameRef.current);
      voiceMonitorFrameRef.current = null;
    }

    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    voiceStartedRef.current = false;
    silenceStartedAtRef.current = null;
    recordingStartedAtRef.current = null;
  };

  const cleanupRecording = () => {
    stopVoiceActivityMonitor();
    stopRecordingTimer();
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        // Some mobile browsers throw if no data is ready yet.
      }
      mediaRecorderRef.current.stop();
    }
  };

  const startVoiceActivityMonitor = (stream: MediaStream) => {
    const AudioContextCtor = getAudioContextConstructor();
    if (!AudioContextCtor) {
      return;
    }

    try {
      const audioContext = new AudioContextCtor();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 1024;
      const samples = new Uint8Array(analyser.fftSize);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      recordingStartedAtRef.current = null;
      void audioContext.resume().catch(() => undefined);

      const monitor: FrameRequestCallback = (now) => {
        const recorder = mediaRecorderRef.current;

        if (!recorder || recorder.state !== 'recording') {
          return;
        }

        const startedAt = recordingStartedAtRef.current ?? now;
        recordingStartedAtRef.current = startedAt;
        analyser.getByteTimeDomainData(samples);

        let sum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }

        const volume = Math.sqrt(sum / samples.length);
        const elapsed = now - startedAt;
        const hasVoice = volume > VOICE_SILENCE_THRESHOLD;

        if (hasVoice) {
          voiceStartedRef.current = true;
          silenceStartedAtRef.current = null;
        } else if (voiceStartedRef.current) {
          silenceStartedAtRef.current ??= now;
        }

        const silenceMs = silenceStartedAtRef.current ? now - silenceStartedAtRef.current : 0;
        const shouldStopAfterSpeech =
          voiceStartedRef.current &&
          elapsed >= VOICE_MIN_RECORDING_MS &&
          silenceMs >= VOICE_SILENCE_STOP_MS;
        const shouldStopWithoutSpeech =
          !voiceStartedRef.current && elapsed >= VOICE_NO_SPEECH_TIMEOUT_MS;
        const shouldStopAtMaxDuration = elapsed >= VOICE_MAX_RECORDING_MS;

        if (shouldStopAfterSpeech || shouldStopWithoutSpeech || shouldStopAtMaxDuration) {
          stopVoiceRecording();
          return;
        }

        voiceMonitorFrameRef.current = window.requestAnimationFrame(monitor);
      };

      voiceMonitorFrameRef.current = window.requestAnimationFrame(monitor);
    } catch {
      stopVoiceActivityMonitor();
    }
  };

  const startVoiceRecording = async () => {
    if (!voiceSupported || loading || voiceState !== 'idle') {
      return;
    }

    if (!isMicrophoneAllowedByDocumentPolicy()) {
      addAssistantMessage(t('voiceNotSupportedError'));
      return;
    }

    // Revérifier MediaRecorder au moment de l'appel (iOS < 14.3 peut ne pas l'avoir)
    if (typeof MediaRecorder === 'undefined') {
      addAssistantMessage(t('voiceNotSupportedError'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const mimeType = getSupportedRecordingMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        cleanupRecording();
        setVoiceState('idle');
        addAssistantMessage(t('voiceTranscriptionError'));
      };

      mediaRecorder.onstop = async () => {
        const recordingMimeType =
          mediaRecorder.mimeType ||
          getBlobPartMimeType(audioChunksRef.current[0]) ||
          'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recordingMimeType,
        });

        cleanupRecording();

        if (audioBlob.size === 0) {
          setVoiceState('idle');
          addAssistantMessage(t('voiceEmptyError'));
          return;
        }

        setVoiceState('transcribing');

        try {
          const text = await transcribeAudio(audioBlob);

          if (!text) {
            throw new Error('Empty transcription');
          }

          await sendMessage(text);
        } catch {
          addAssistantMessage(t('voiceTranscriptionError'));
        } finally {
          setVoiceState('idle');
        }
      };

      mediaRecorder.start(RECORDING_TIMESLICE_MS);
      startVoiceActivityMonitor(stream);
      startRecordingTimer();
      setVoiceState('recording');
    } catch (err: unknown) {
      cleanupRecording();
      setVoiceState('idle');
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        addAssistantMessage(t('voiceNotFoundError'));
      } else if (name === 'NotSupportedError' || name === 'SecurityError') {
        addAssistantMessage(t('voiceNotSupportedError'));
      } else {
        // NotAllowedError, PermissionDeniedError, et autres
        addAssistantMessage(t('voicePermissionError'));
      }
    }
  };

  const isBusy = loading || voiceState === 'transcribing';
  const showVoiceHint = voiceSupported && messages.length <= 1 && voiceState === 'idle';
  const showVoiceStatus = voiceSupported || voiceState !== 'idle';
  const voiceStatusText =
    voiceState === 'recording'
      ? t('voiceRecordingStatus', { duration: formatVoiceDuration(recordingSeconds) })
      : voiceState === 'transcribing'
        ? t('voiceTranscribingStatus')
        : t('voiceReady');

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ delay: 2, type: 'spring' }}
            onClick={openChat}
            className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-bg shadow-glow-lg transition-transform hover:scale-110"
            aria-label={t('title')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex h-[560px] max-h-[calc(100vh-4rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border-subtle bg-bg-secondary shadow-float"
          >
            <div className="gradient-bg px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading text-base font-semibold text-white">{t('title')}</h3>
                  <p className="text-xs text-white/75">{t('subtitle')}</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/12 px-2.5 py-1 text-[11px] text-white/85">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    <span>AI + Voice</span>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-white/70 hover:text-white"
                  aria-label={chatLocale === 'en' ? 'Close chat' : 'Fermer le chat'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'gradient-bg rounded-br-md text-white'
                        : 'rounded-bl-md border border-border-subtle bg-bg-card text-text-primary whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {(loading || voiceState === 'transcribing') && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-border-subtle bg-bg-card px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {showVoiceHint && (
                <p className="text-xs text-text-muted">{t('voiceHint')}</p>
              )}

              {!isBusy && displayedSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {displayedSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.kind}:${suggestion.label}:${suggestion.value}`}
                      onClick={() => {
                        void handleSuggestionSelect(suggestion);
                      }}
                      disabled={voiceState === 'recording'}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                        suggestion.kind === 'link'
                          ? 'border-accent-cyan/30 bg-accent-cyan/10 text-text-primary hover:border-accent-cyan/50'
                          : 'border-border-subtle text-text-secondary hover:border-accent-violet/30 hover:text-accent-violet'
                      }`}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border-subtle px-4 py-3">
              {showVoiceStatus && (
                <div
                  className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs transition-colors ${
                    voiceState === 'recording'
                      ? 'border-accent-coral/40 bg-accent-coral/10 text-text-primary'
                      : voiceState === 'transcribing'
                        ? 'border-accent-blue/30 bg-accent-blue/10 text-text-primary'
                        : 'border-border-subtle bg-bg-card text-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        voiceState === 'recording'
                          ? 'animate-pulse bg-accent-coral'
                          : voiceState === 'transcribing'
                            ? 'animate-pulse bg-accent-blue'
                            : 'bg-accent-cyan'
                      }`}
                    />
                    <span>{voiceStatusText}</span>
                  </div>

                  {voiceState === 'recording' ? (
                    <div className="flex items-end gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1 animate-bounce rounded-full bg-accent-coral"
                          style={{
                            height: delay === 150 ? '18px' : '12px',
                            animationDelay: `${delay}ms`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-muted">
                      {voiceState === 'transcribing' ? t('voicePleaseWait') : t('voiceTapToSpeak')}
                    </span>
                  )}
                </div>
              )}

              <div className="mb-3 flex flex-wrap gap-2">
                {contactActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      void handleSuggestionSelect(action);
                    }}
                    className="rounded-full border border-border-subtle bg-bg-card px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent-cyan/40 hover:text-text-primary"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    voiceState === 'recording'
                      ? t('voiceRecording')
                      : voiceState === 'transcribing'
                        ? t('voiceTranscribing')
                        : t('placeholder')
                  }
                  disabled={voiceState === 'recording'}
                  className="flex-1 rounded-xl border border-border-subtle bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent-violet focus:outline-none disabled:opacity-70"
                />

                {voiceSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceState === 'recording') {
                        stopVoiceRecording();
                      } else {
                        void startVoiceRecording();
                      }
                    }}
                    disabled={voiceState === 'transcribing' || loading}
                    aria-label={voiceState === 'recording' ? t('voiceStop') : t('voiceStart')}
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-40 ${
                      voiceState === 'recording'
                        ? 'bg-accent-coral shadow-glow'
                        : 'border border-border-subtle bg-bg-card hover:border-accent-violet'
                    }`}
                  >
                    {voiceState === 'recording' && (
                      <span className="absolute inset-0 animate-pulse rounded-xl border border-accent-coral/60" />
                    )}
                    {voiceState === 'recording' ? (
                      <span className="h-3 w-3 rounded-sm bg-white" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                        <path d="M12 18v4" />
                        <path d="M8 22h8" />
                      </svg>
                    )}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!input.trim() || isBusy || voiceState === 'recording'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-bg text-white transition-all hover:shadow-glow disabled:opacity-40"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
