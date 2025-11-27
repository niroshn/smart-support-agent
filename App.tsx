import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { sendMessageToAgent } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ShieldCheck, PhoneCall, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'moneyhero_chat_history_v1';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'assistant',
  content: "Hi! I'm your MoneyHero assistant. I can help you find the best credit cards, check loan eligibility, or compare fees. How can I help you today?",
  timestamp: new Date(),
};

export default function App() {
  // 1. Initialize state from LocalStorage or Default
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore Date objects from strings
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Persist to LocalStorage whenever messages change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation history?")) {
      setMessages([INITIAL_MESSAGE]);
      setIsEscalated(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSendMessage = async (content: string) => {
    // 1. Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Optimistic update
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // 2. Prepare placeholder assistant message
      const botMsgId = (Date.now() + 1).toString();
      const initialBotMsg: Message = {
        id: botMsgId,
        role: 'assistant',
        content: '', // Empty initially
        timestamp: new Date(),
        isEscalation: false
      };

      setMessages(prev => [...prev, initialBotMsg]);

      // 3. Call Service (Streaming)
      const { stream, isEscalation } = await sendMessageToAgent(updatedHistory, content);

      if (isEscalation) {
        setIsEscalated(true);
      }

      let accumulatedText = "";

      // 4. Consume the stream
      for await (const chunk of stream) {
        accumulatedText += chunk;
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          // Ensure we are updating the correct bot message
          if (last.id === botMsgId) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: accumulatedText, isEscalation: isEscalation }
            ];
          }
          return prev;
        });
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error. Please try again.", 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">MoneyHero Support</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-slate-500 font-medium">AI Agent Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEscalated && (
            <div className="hidden md:flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-200 animate-in fade-in slide-in-from-top-2">
              <PhoneCall size={14} />
              <span>Human Agent Notified</span>
            </div>
          )}
          
          <button 
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex w-full mb-6 justify-start">
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <ShieldCheck size={18} />
                 </div>
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Escalation Notice (Mobile/Bottom) */}
      {isEscalated && (
        <div className="bg-amber-50 border-t border-amber-100 p-3 text-center">
            <p className="text-sm text-amber-800 flex items-center justify-center gap-2">
                <PhoneCall size={16} />
                <span className="font-medium">Live Chat initiated. A human agent will join shortly.</span>
            </p>
        </div>
      )}

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} disabled={isEscalated} />
    </div>
  );
}