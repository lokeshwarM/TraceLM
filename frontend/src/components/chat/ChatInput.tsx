import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '@/lib/api';
import { SubmitOptions } from './ChatView';

interface ChatInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  isLoading: boolean;
  handleSubmit: (e?: React.FormEvent, options?: SubmitOptions) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  selectedModels: string[];
  setSelectedModels: (val: string[]) => void;
  compareMode: boolean;
  setPromptCompareMode: (val: boolean) => void;
  onCancel?: () => void;
}

export function ChatInput({ 
  prompt, setPrompt, isLoading, handleSubmit, 
  selectedModel, setSelectedModel,
  selectedModels, setSelectedModels,
  compareMode, setPromptCompareMode,
  onCancel
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isVoiceAssistantMode, setIsVoiceAssistantMode] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const savedMode = localStorage.getItem('tracelm_voice_assistant_mode');
    if (savedMode !== null) {
      setIsVoiceAssistantMode(savedMode === 'true');
    }
  }, []);

  const toggleVoiceMode = () => {
    const newMode = !isVoiceAssistantMode;
    setIsVoiceAssistantMode(newMode);
    localStorage.setItem('tracelm_voice_assistant_mode', String(newMode));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isRecording && !isProcessingAudio) {
        handleSubmit();
      }
    }
  };

  const toggleRecording = async () => {
    if (isLoading || isProcessingAudio) return;

    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setIsProcessingAudio(true);
          try {
            const res = await transcribeAudio(audioBlob);
            if (res.text && res.text.trim().length > 0) {
              const transcribedText = res.text.trim();
              const fullText = prompt ? prompt + " " + transcribedText : transcribedText;
              
              if (isVoiceAssistantMode) {
                setPrompt(fullText);
                handleSubmit(undefined, { overridePrompt: fullText, isRetry: false, voiceOutputEnabled: true });
              } else {
                setPrompt(fullText);
              }
            }
          } catch (e) {
            console.error("Audio transcription failed:", e);
          } finally {
            setIsProcessingAudio(false);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Error accessing microphone:", e);
      }
    }
  };

  return (
    <div className="shrink-0 relative group w-full flex flex-col gap-2.5 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {compareMode ? (
            <div className="flex items-center gap-1.5 bg-sidebar border border-sidebar-border rounded-xl p-1 shadow-sm">
              {[
                { id: 'gemini-3.1-flash-lite', label: 'Gemini Flash' },
                { id: 'gemma-4-26b', label: 'Gemma 26B' }
              ].map(model => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    if (selectedModels.includes(model.id)) {
                      setSelectedModels(selectedModels.filter(m => m !== model.id));
                    } else {
                      setSelectedModels([...selectedModels, model.id]);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                    selectedModels.includes(model.id)
                      ? 'bg-primary-glow text-primary border-primary/25 shadow-sm'
                      : 'text-muted-text hover:text-foreground border-transparent hover:bg-card-hover'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading || isRecording || isProcessingAudio}
                className="bg-card border border-card-border text-muted-text hover:text-foreground text-xs font-bold rounded-xl pl-3 pr-8 py-2.5 outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary transition-all cursor-pointer appearance-none relative shadow-sm"
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
                  backgroundPosition: 'right 0.6rem center', 
                  backgroundRepeat: 'no-repeat', 
                  backgroundSize: '0.9em' 
                }}
              >
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                <option value="gemma-4-26b">Gemma 4 26B</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleVoiceMode}
            disabled={isRecording || isProcessingAudio || isLoading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              isVoiceAssistantMode 
                ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30 shadow-sm' 
                : 'bg-card text-muted-text border-card-border hover:text-foreground hover:bg-card-hover'
            } ${isRecording || isProcessingAudio || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isVoiceAssistantMode ? "Voice Assistant Mode: Auto-send transcription" : "Dictation Mode: Type text"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isVoiceAssistantMode ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              )}
            </svg>
            <span>{isVoiceAssistantMode ? "Voice Assistant" : "Dictation Mode"}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setPromptCompareMode(!compareMode)}
            disabled={isRecording || isProcessingAudio || isLoading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
              compareMode 
                ? 'bg-primary-glow text-primary border-primary/30 shadow-sm' 
                : 'bg-card text-muted-text border-card-border hover:text-foreground hover:bg-card-hover'
            } ${isRecording || isProcessingAudio || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Compare</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Microphone active. Say something..." : isProcessingAudio ? "Transcribing speech into prompt..." : "Send observer prompt..."}
          className={`w-full bg-input-bg border text-foreground rounded-2xl pl-5 pr-24 py-4.5 focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary resize-none h-[62px] max-h-[200px] min-h-[62px] overflow-y-auto transition-all shadow-sm text-sm ${
            isRecording 
              ? 'border-accent-red/50 focus:ring-accent-red/20 bg-accent-red/5 text-accent-red placeholder-accent-red/60 animate-pulse' 
              : isProcessingAudio
              ? 'border-accent-blue/50 focus:ring-accent-blue/20 bg-accent-blue/5 text-accent-blue placeholder-accent-blue/60 animate-pulse'
              : 'border-input-border'
          }`}
          rows={1}
          disabled={isLoading || isRecording || isProcessingAudio}
        />
        <div className="absolute right-2 bottom-2.5 flex items-center gap-1.5">
          {/* Recording toggle mic */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isLoading || isProcessingAudio}
            className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${
              isRecording 
                ? 'bg-accent-red/20 text-accent-red hover:bg-accent-red/30 animate-pulse ring-2 ring-accent-red/25' 
                : isProcessingAudio
                ? 'bg-card text-accent-blue cursor-wait border border-card-border'
                : 'bg-transparent text-muted-text hover:text-foreground hover:bg-card-hover'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isRecording ? "Stop voice capture" : "Record voice prompt"}
          >
            {isProcessingAudio ? (
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                 <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                 <line x1="12" y1="19" x2="12" y2="22" />
               </svg>
            )}
          </button>
          
          {/* Submit button */}
          <button
            type="button"
            onClick={(e) => {
              if (isLoading) {
                if (onCancel) onCancel();
              } else {
                handleSubmit(e as any);
              }
            }}
            disabled={(!isLoading && !prompt.trim()) || isRecording || isProcessingAudio}
            className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${
              isLoading 
                ? 'bg-accent-red/20 text-accent-red hover:bg-accent-red/35 border border-accent-red/30' 
                : 'bg-primary text-background hover:bg-primary-hover shadow-[0_2px_8px_var(--primary-glow)] hover:shadow-[0_4px_12px_var(--primary-glow)] disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed'
            }`}
            aria-label={isLoading ? "Stop generating" : "Send message"}
          >
            {isLoading ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                <rect x="5" y="5" width="10" height="10" rx="2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
