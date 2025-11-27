import React from 'react';
import { Message } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
              isBot 
                ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-none' 
                : 'bg-blue-600 text-white rounded-tr-none'
            }`}
          >
            {message.isEscalation ? (
               <div className="flex items-center gap-2 font-medium text-amber-600 bg-amber-50 p-2 rounded -mx-1 -my-1 mb-2">
                 <AlertCircle size={16} />
                 <span>Escalation Requested</span>
               </div>
            ) : null}
            
            <div className={`markdown-content ${isBot ? 'prose prose-sm max-w-none prose-blue' : ''}`}>
             {isBot ? (
                <ReactMarkdown>{message.content}</ReactMarkdown>
             ) : (
                message.content
             )}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </div>
  );
};
