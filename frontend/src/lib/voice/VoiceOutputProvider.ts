export interface VoiceOutputProvider {
    speak(text: string): void;
    stop(): void;
}

