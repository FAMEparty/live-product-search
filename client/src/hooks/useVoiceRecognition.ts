import { useState, useEffect, useCallback } from 'react';

interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export function useVoiceRecognition() {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setState(prev => ({ ...prev, transcript }));
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        setState(prev => ({ ...prev, error: event.error, isListening: false }));
      };

      recognitionInstance.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      setRecognition(recognitionInstance);
    } else {
      setState(prev => ({ ...prev, error: 'Browser does not support speech recognition.' }));
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !state.isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.error("Recognition already started", e);
      }
    }
  }, [recognition, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognition && state.isListening) {
      recognition.stop();
    }
  }, [recognition, state.isListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    hasSupport: !!recognition
  };
}
