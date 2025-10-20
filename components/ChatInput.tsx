
import React, { useState } from 'react';
import { MicIcon, SendIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isListening: boolean;
  onToggleListen: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isListening, onToggleListen }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-2">
        <button
          onClick={onToggleListen}
          className={`p-2 rounded-full transition-colors ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <MicIcon className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="flex-1 bg-transparent focus:outline-none text-gray-800 placeholder-gray-500"
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          disabled={!inputValue.trim()}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
