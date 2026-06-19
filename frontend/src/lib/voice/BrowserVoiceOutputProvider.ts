import { VoiceOutputProvider } from './VoiceOutputProvider';

export class BrowserVoiceOutputProvider implements VoiceOutputProvider {
    private synth: SpeechSynthesis | null = null;
    
    constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
        } else {
            console.warn("BrowserVoiceOutputProvider: SpeechSynthesis API is not available in this browser.");
        }
    }

    public speak(text: string): void {
        if (!this.synth) return;
        
        // Ensure any ongoing speech is stopped before starting a new one
        this.stop();
        
        // The SpeechSynthesis API sometimes struggles with very long text chunks.
        // We can just pass the text to the utterance, but removing markdown symbols improves pronunciation.
        const cleanText = text.replace(/[*#_`]/g, '').trim();
        
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Use a good default voice if available
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
            // Try to find a high-quality Google or Microsoft voice, otherwise fallback to default
            const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Microsoft")) || voices[0];
            utterance.voice = preferredVoice;
        }

        // Slight speed increase for more conversational feel
        utterance.rate = 1.05;

        utterance.onerror = (event) => {
            console.error("BrowserVoiceOutputProvider: SpeechSynthesis error:", event);
        };

        this.synth.speak(utterance);
        console.log("[VOICE] Browser native TTS playback started");
    }

    public stop(): void {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
            console.log("[VOICE] Browser native TTS playback stopped");
        }
    }
}
