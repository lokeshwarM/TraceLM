import React from 'react';

interface ChatInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  isLoading: boolean;
  handleSubmit: (e?: React.FormEvent) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  selectedModels: string[];
  setSelectedModels: (val: string[]) => void;
  compareMode: boolean;
  setCompareMode: (val: boolean) => void;
  onCancel?: () => void;
}

export function ChatInput({ 
  prompt, setPrompt, isLoading, handleSubmit, 
  selectedModel, setSelectedModel,
  selectedModels, setSelectedModels,
  compareMode, setCompareMode,
  onCancel
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="shrink-0 relative group w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {compareMode ? (
            <div className="flex items-center gap-2 bg-[#161921] border border-gray-800/60 rounded-lg p-1">
              {[
                { id: 'gemini-3.1-flash-lite', label: 'Flash Lite' },
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
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    selectedModels.includes(model.id)
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-500 hover:text-gray-300 border border-transparent hover:bg-gray-800/50'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          ) : (
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
              className="bg-[#161921] border border-gray-800/60 text-gray-400 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 hover:bg-[#1a1d27] transition-colors cursor-pointer appearance-none pr-8 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em' }}
            >
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
              <option value="gemma-4-26b">Gemma 4 26B</option>
            </select>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            compareMode 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' 
              : 'bg-[#161921] text-gray-500 border border-gray-800/60 hover:text-gray-300'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Compare
        </button>
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
          type="button"
          onClick={isLoading ? onCancel : handleSubmit}
          disabled={!isLoading && !prompt.trim()}
          className={`absolute right-3 bottom-3 p-2 rounded-xl transition-colors ${isLoading ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 disabled:cursor-not-allowed'}`}
          aria-label={isLoading ? "Stop generation" : "Send message"}
        >
          {isLoading ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <rect x="5" y="5" width="10" height="10" rx="2" />
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
