
import React from 'react';
import { GoogleIcon } from './icons';

interface AuthScreenProps {
  onAuth: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Workspace Orchestrator</h1>
        <p className="text-gray-600 mb-8">
          Your entire Google Workspace, unified in a single chat interface.
        </p>
        <button
          onClick={onAuth}
          className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          Sign in with Google
        </button>
        <p className="text-xs text-gray-500 mt-6">
          By signing in, you agree to grant this application access to your Google Workspace data.
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
