import React from 'react';

interface ChatInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  isLoading: boolean;
  handleSubmit: (e?: React.FormEvent) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
}

export function ChatInput({ prompt, setPrompt, isLoading, handleSubmit, selectedModel, setSelectedModel }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="shrink-0 relative group w-full flex flex-col gap-2">
      <div className="flex justify-start">
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
          className="bg-[#161921] border border-gray-800/60 text-gray-400 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 hover:bg-[#1a1d27] transition-colors cursor-pointer appearance-none pr-8 relative"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
        >
          <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
          <option value="gemma-4-26b">Gemma 4 26B</option>
          <option value="gemma-4-31b">Gemma 4 31B</option>
        </select>
      </div>
      <form onSubmit={handleSubmit} className="w-full relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="w-full bg-[#161921] border border-gray-800/60 text-gray-200 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none h-[60px] max-h-[200px] min-h-[60px] overflow-y-auto transition-all shadow-lg text-sm"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
