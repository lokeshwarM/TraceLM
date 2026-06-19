package com.tracelm.backend.provider;

public interface TranscriptionProvider {
    /**
     * Transcribes the given audio data into text.
     *
     * @param audioData the audio file bytes
     * @param mimeType the MIME type of the audio (e.g., "audio/webm", "audio/ogg")
     * @param model the STT model to use, or null for default
     * @return the transcribed text
     */
    String transcribeAudio(byte[] audioData, String mimeType, String model);
}
