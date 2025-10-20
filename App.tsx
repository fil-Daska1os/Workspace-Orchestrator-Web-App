
import React, { useState, useEffect, useRef } from 'react';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ProactiveFeed from './components/ProactiveFeed';
import ConfirmationModal from './components/ConfirmationModal';
import { ChatMessage, MessageAuthor, ConfirmationPayload, WorkspaceItem } from './types';
import { orchestrateWorkspace } from './services/geminiService';
import { getFeedData, sendEmail, createCalendarEvent, createGoogleDoc } from './services/googleApiService';

// ==================================================================
// IMPORTANT: REPLACE WITH YOUR GOOGLE CLOUD CLIENT ID
// You can get one from the Google Cloud Console:
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";
// ==================================================================


// Fix: Add types for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}


// Speech Recognition and Synthesis setup
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null;
if (SpeechRecognitionAPI) {
  recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      author: MessageAuthor.ASSISTANT,
      content: "Hello! Please sign in to connect your Google Workspace.",
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(false);
  const [confirmationPayload, setConfirmationPayload] = useState<ConfirmationPayload | null>(null);
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const isListeningRef = useRef(isListening);

  const [feedItems, setFeedItems] = useState<WorkspaceItem[]>([]);
  
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID_HERE')) {
        setChatHistory(prev => [
            ...prev, 
            { author: MessageAuthor.SYSTEM, content: "Configuration needed: Please replace the placeholder Google Client ID in App.tsx for authentication to work." }
        ]);
        return;
    }

    if ((window as any).google) {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            setAccessToken(tokenResponse.access_token);
            setChatHistory([{ author: MessageAuthor.ASSISTANT, content: "Successfully connected! How can I help you with your Google Workspace today?" }]);
          } else {
            setChatHistory(prev => [...prev, { author: MessageAuthor.SYSTEM, content: "Authentication failed. Please try again." }]);
          }
        },
      });
      setTokenClient(client);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      const fetchFeed = async () => {
        setIsFeedLoading(true);
        try {
          const items = await getFeedData(accessToken);
          setFeedItems(items);
        } catch (error) {
          console.error("Failed to fetch feed data:", error);
           setChatHistory(prev => [...prev, { author: MessageAuthor.SYSTEM, content: "Could not load activity feed. Your session might have expired. Please sign in again." }]);
           handleLogout();
        } finally {
            setIsFeedLoading(false);
        }
      };
      fetchFeed();
    }
  }, [accessToken]);
  
  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => handleSendMessage(event.results[0][0].transcript);
    recognition.onend = () => { if (isListeningRef.current) setIsListening(false); };
    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
    };
    return () => { if (recognition) recognition.stop(); };
  }, []);

  const handleAuth = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  };

  const handleSendMessage = async (message: string) => {
    const newUserMessage: ChatMessage = { author: MessageAuthor.USER, content: message };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      const response = await orchestrateWorkspace(updatedHistory);
      if (response.functionCalls && response.functionCalls.length > 0) {
        const toolCall = response.functionCalls[0];
        const payload: ConfirmationPayload = {
          toolName: toolCall.name as ConfirmationPayload['toolName'],
          toolArgs: toolCall.args
        };
        setConfirmationPayload(payload);
        setChatHistory(prev => [...prev, {
            author: MessageAuthor.ASSISTANT,
            content: "I can do that. Please review the details before I proceed.",
            payload,
        }]);
      } else {
          const assistantMessage: ChatMessage = {
            author: MessageAuthor.ASSISTANT,
            content: response.text || "I'm sorry, I couldn't process that.",
          };
          setChatHistory(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
       setChatHistory(prev => [...prev, { author: MessageAuthor.ASSISTANT, content: "There was an error communicating with the AI. Please check your Gemini API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmationPayload || !accessToken) return;
    setIsLoading(true);
    setConfirmationPayload(null);
    let systemMessageContent = '';
    try {
        switch (confirmationPayload.toolName) {
            case 'send_email':
                await sendEmail(confirmationPayload.toolArgs, accessToken);
                systemMessageContent = 'Email sent successfully.';
                break;
            case 'create_calendar_event':
                await createCalendarEvent(confirmationPayload.toolArgs, accessToken);
                systemMessageContent = 'Calendar event created successfully.';
                break;
            case 'create_google_doc':
                await createGoogleDoc(confirmationPayload.toolArgs, accessToken);
                systemMessageContent = 'Google Doc created successfully.';
                break;
        }
    } catch (error) {
        console.error(`Failed to execute ${confirmationPayload.toolName}`, error);
        systemMessageContent = `Error: Could not execute the action. Your session may have expired. Please try signing in again.`;
        handleLogout();
    }
    
    setChatHistory(prev => [...prev, { author: MessageAuthor.SYSTEM, content: systemMessageContent }]);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setChatHistory(prev => [...prev, { author: MessageAuthor.SYSTEM, content: `Action cancelled.` }]);
    setConfirmationPayload(null);
  };
  
  const handleToggleListen = () => {
      if (!recognition) return alert('Speech recognition is not supported in this browser.');
      if (isListening) {
          recognition.stop();
          setIsListening(false);
      } else {
          recognition.start();
          setIsListening(true);
      }
  };
  
  const handlePlayTTS = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
      } else {
          alert('Text-to-speech is not supported in this browser.');
      }
  };
  
  const handleFeedItemSelect = (prompt: string) => handleSendMessage(prompt);

  const handleLogout = () => {
      if (accessToken && (window as any).google) {
        (window as any).google.accounts.oauth2.revoke(accessToken, () => {});
      }
      setAccessToken(null);
      setFeedItems([]);
      setChatHistory([{ author: MessageAuthor.ASSISTANT, content: "You have been logged out. Please sign in to connect your Google Workspace." }]);
  };

  const isAuthenticated = !!accessToken;
  
  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col font-sans">
      <Header onLogout={handleLogout} />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-50">
          <ChatWindow messages={chatHistory} isLoading={isLoading} onPlayTTS={handlePlayTTS} />
          <ChatInput onSendMessage={handleSendMessage} isListening={isListening} onToggleListen={handleToggleListen} />
        </div>
        <ProactiveFeed items={feedItems} isLoading={isFeedLoading} onSelectItem={handleFeedItemSelect} />
      </main>
      {confirmationPayload && (
        <ConfirmationModal payload={confirmationPayload} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default App;
