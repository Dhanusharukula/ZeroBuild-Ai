
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: (ChatMessage & { sources?: {title: string, url: string}[] })[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-robot text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Design Console</h3>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span> Gemini 3 Pro Connected
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-slate-400 hover:text-slate-600 p-2"><i className="fas fa-cog"></i></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-slate-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-3">
              <i className="fas fa-pencil-ruler text-3xl"></i>
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-3 tracking-tight">What are we building?</h4>
            <p className="text-slate-500 max-w-sm text-sm leading-relaxed mb-8">
              Describe a plot, a room layout, or ask about building materials. I'm trained in global architectural standards.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {[
                "Minimalist studio loft layout",
                "Sustainable house materials",
                "Open concept kitchen ideas",
                "Small garden landscape plan"
              ].map(prompt => (
                <button 
                  key={prompt}
                  onClick={() => onSendMessage(prompt)}
                  className="text-left text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 p-4 rounded-xl border border-slate-200 transition-all font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {message.text}
              </div>
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sources & Grounding</p>
                  <div className="flex flex-wrap gap-2">
                    {message.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                      >
                        <i className="fas fa-external-link-alt text-[8px]"></i>
                        {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {message.layout && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-draw-polygon"></i> Visual Generated in Workspace
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Architect is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="E.g., Design a master suite with walk-in closet..."
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 text-sm font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-3 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            <i className="fas fa-arrow-up text-lg"></i>
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-tighter">
          Architectural AI Assistant &copy; 2024 • Powered by Gemini 3
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
