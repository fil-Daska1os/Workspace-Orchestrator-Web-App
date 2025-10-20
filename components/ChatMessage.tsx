
import React from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { Volume2Icon } from './icons';

interface ChatMessageProps {
  message: ChatMessage;
  onPlayTTS: (text: string) => void;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onPlayTTS }) => {
  const isUser = message.author === MessageAuthor.USER;
  const isAssistant = message.author === MessageAuthor.ASSISTANT;
  const isSystem = message.author === MessageAuthor.SYSTEM;

  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white self-end'
    : isAssistant
    ? 'bg-gray-200 text-gray-800 self-start'
    : 'bg-yellow-100 text-yellow-800 self-center text-sm italic';

  const wrapperClasses = isUser ? 'justify-end' : 'justify-start';

  if (isSystem) {
      return (
          <div className="my-2 text-center">
              <span className={`px-3 py-1 rounded-full ${bubbleClasses}`}>{message.content}</span>
          </div>
      )
  }

  return (
    <div className={`flex ${wrapperClasses} my-2`}>
      <div className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-2xl shadow ${bubbleClasses}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {isAssistant && (
            <button onClick={() => onPlayTTS(message.content)} className="mt-2 text-gray-500 hover:text-gray-800">
                <Volume2Icon className="w-4 h-4" />
            </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;
