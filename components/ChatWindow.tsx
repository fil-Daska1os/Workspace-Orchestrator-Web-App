
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ChatMessageComponent from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onPlayTTS: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onPlayTTS }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex flex-col">
        {messages.map((msg, index) => (
          <ChatMessageComponent key={index} message={msg} onPlayTTS={onPlayTTS} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 self-start px-4 py-3 rounded-2xl shadow">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
