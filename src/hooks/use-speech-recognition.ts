import { useEffect, useMemo, useRef, useState } from "react";

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [isRecording, setIsRecording] = useState(false);

  const SpeechRecognitionClass = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.SpeechRecognition ||
          window.webkitSpeechRecognition
        : undefined,
    [],
  );

  const isSupported = !!SpeechRecognitionClass;

  useEffect(() => {
    if (!SpeechRecognitionClass) {
      return;
    }

    const recognition = new SpeechRecognitionClass();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      onTranscript(transcript.trim());
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [SpeechRecognitionClass, onTranscript]);

  const toggle = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return {
    isSupported,
    isRecording,
    toggle,
  };
}