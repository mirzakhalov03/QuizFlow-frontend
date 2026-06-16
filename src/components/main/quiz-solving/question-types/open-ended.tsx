import { useCallback } from "react";
import { Mic } from "lucide-react";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const MAX_CHARS = 1000;

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function OpenEnded({
  value,
  onChange,
}: Props) {
  const handleTranscript = useCallback(
    (transcript: string) => {
      const nextValue = `${value} ${transcript}`
        .trim()
        .slice(0, MAX_CHARS);

      onChange(nextValue);
    },
    [value, onChange],
  );

  const {
    isSupported,
    isRecording,
    toggle,
  } = useSpeechRecognition(handleTranscript);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) =>
            onChange(e.target.value.slice(0, MAX_CHARS))
          }
          placeholder="Type your answer here..."
          rows={4}
          maxLength={MAX_CHARS}
          className="border-border focus:border-primary focus:ring-primary/20 w-full resize-none rounded-lg border bg-transparent p-3 pr-12 text-sm transition-colors outline-none focus:ring-2"
        />

        {isSupported && (
          <button
            type="button"
            onClick={toggle}
            aria-label={
              isRecording
                ? "Stop voice input"
                : "Start voice input"
            }
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <Mic
              className={`h-5 w-5 ${
                isRecording
                  ? "animate-pulse text-red-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        )}
      </div>

      <p className="text-muted-foreground text-right text-xs">
        {value.length}/{MAX_CHARS}
      </p>
    </div>
  );
}