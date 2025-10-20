import React, { useState } from 'react';
import { GoogleIcon } from './icons';

interface AuthScreenProps {
  onAuth: () => void;
  authError?: boolean;
  onResetClientId: () => void;
}

interface AuthErrorHelpProps {
  onResetClientId: () => void;
}

const AuthErrorHelp: React.FC<AuthErrorHelpProps> = ({ onResetClientId }) => {
    const [copied, setCopied] = useState(false);
    const origin = window.location.origin;

    const handleCopy = () => {
        navigator.clipboard.writeText(origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left text-sm">
            <h3 className="font-bold text-red-800 mb-2">Authentication Failed: Troubleshooting Checklist</h3>
            <p className="text-red-700 mb-4">
                The <code className="bg-red-100 px-1 rounded">invalid_request</code> error means there's a misconfiguration. Let's fix it by checking each item below.
            </p>

            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-red-800 mb-2">✅ 1. Is the Client ID correct?</h4>
                    <p className="text-red-700 mb-2">Please double-check that you entered the correct "OAuth 2.0 Client ID".</p>
                    <ul className="list-disc list-inside pl-4 space-y-1 text-red-600 text-xs">
                        <li>Make sure there are no typos or extra spaces copied.</li>
                        <li>Ensure you are using the <span className="font-bold">OAuth Client ID</span>, not an API Key.</li>
                    </ul>
                    <button onClick={onResetClientId} className="mt-3 w-full px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Re-enter Client ID
                    </button>
                </div>

                <div>
                    <h4 className="font-semibold text-red-800 mb-2">✅ 2. Are the Authorized JavaScript Origins correct?</h4>
                    <p className="text-red-700 mb-2">In your <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-red-900">Google Cloud Credentials</a>, check the "Authorized JavaScript origins" section. It <span className="font-bold">must contain these exact two</span> URLs:</p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li><code className="bg-red-100 p-1 rounded text-red-900 text-xs break-all">https://accounts.google.com</code></li>
                        <li>
                            <code className="bg-red-100 p-1 rounded text-red-900 text-xs break-all">{origin}</code>
                             <button onClick={handleCopy} className="ml-2 px-2 py-0.5 text-xs font-medium text-red-800 bg-red-200 rounded-md hover:bg-red-300">
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-red-800 mb-2">✅ 3. Are the Authorized Redirect URIs correct?</h4>
                    <p className="text-red-700 mb-2">This is the most common source of the error. In the "Authorized redirect URIs" section, you <span className="font-bold">must add both</span> of these URLs to be safe:</p>
                     <ul className="list-disc list-inside pl-4 space-y-1">
                        <li><code className="bg-red-100 p-1 rounded text-red-900 text-xs break-all">{origin}</code></li>
                        <li><code className="bg-red-100 p-1 rounded text-red-900 text-xs break-all">{origin}/</code> (with a trailing slash)</li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-semibold text-red-800 mb-2">✅ 4. Did you save and wait?</h4>
                    <p className="text-red-700">After making changes in the Google Cloud Console, click <span className="font-bold">Save</span>. It can take 5-10 minutes for the changes to apply. Please wait a few minutes before trying to sign in again.</p>
                </div>
            </div>
        </div>
    );
};


const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth, authError, onResetClientId }) => {
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
        {authError && <AuthErrorHelp onResetClientId={onResetClientId} />}
      </div>
    </div>
  );
};

export default AuthScreen;