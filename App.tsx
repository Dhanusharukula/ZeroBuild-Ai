
import React, { useState, useCallback } from 'react';
import { ChatMessage, LayoutData } from './types';
import { sendMessageToGemini } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import LayoutViz from './components/LayoutViz';

const App: React.FC = () => {
  const [messages, setMessages] = useState<(ChatMessage & { sources?: {title: string, url: string}[] })[]>([]);
  const [currentLayout, setCurrentLayout] = useState<LayoutData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [projectName, setProjectName] = useState("Untitled Project");

  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    const history = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await sendMessageToGemini(text, history);

    const newModelMessage: ChatMessage & { sources?: {title: string, url: string}[] } = {
      role: 'model',
      text: response.message,
      layout: response.layout,
      sources: response.sources
    };

    setMessages((prev) => [...prev, newModelMessage]);
    
    if (response.layout) {
      setCurrentLayout(response.layout);
      if (response.layout.description) {
        setProjectName(response.layout.description);
      }
    }
    
    setIsLoading(false);
  }, [messages]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans selection:bg-blue-100">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out hidden lg:flex z-20`}>
        <div className="p-8 flex items-center gap-4 border-b border-slate-50">
          <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg rotate-3">
            <i className="fas fa-building text-white text-xl"></i>
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-black text-lg text-slate-900 leading-tight uppercase tracking-tighter">Architect</h1>
              <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Suite Pro</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-5 py-8 space-y-3 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => {
              setMessages([]);
              setCurrentLayout(null);
              setProjectName("New Project");
            }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-md group"
          >
            <i className="fas fa-plus group-hover:rotate-90 transition-transform"></i>
            {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-wide">New Draft</span>}
          </button>
          
          <div className="pt-8">
            <p className={`px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ${!isSidebarOpen && 'text-center'}`}>
              {isSidebarOpen ? 'Active Session' : 'Act'}
            </p>
            <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-100 ${!isSidebarOpen && 'flex justify-center'}`}>
               <i className={`fas fa-drafting-compass text-slate-400 ${isSidebarOpen ? 'mr-3' : ''}`}></i>
               {isSidebarOpen && <span className="text-xs font-bold text-slate-700 truncate inline-block w-40">{projectName}</span>}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
          >
            <i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'} text-lg`}></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-4 md:p-8 lg:p-10 gap-8">
        {/* Chat Section */}
        <div className="flex-1 h-full min-w-0 flex flex-col max-w-2xl">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </div>

        {/* Workspace/Viz Section */}
        <div className="hidden md:flex flex-1 h-full min-w-0">
          <LayoutViz layout={currentLayout} />
        </div>
      </main>

      {/* Floating Action for Mobile Visualization */}
      <button className="md:hidden fixed bottom-10 right-8 bg-slate-900 text-white w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center z-50 animate-bounce">
        <i className="fas fa-layer-group text-xl"></i>
      </button>
    </div>
  );
};

export default App;
