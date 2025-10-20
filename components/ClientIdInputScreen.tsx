import React, { useState } from 'react';

interface ClientIdInputScreenProps {
  onSetClientId: (clientId: string) => void;
}

const ClientIdInputScreen: React.FC<ClientIdInputScreenProps> = ({ onSetClientId }) => {
  const [clientId, setClientId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      onSetClientId(clientId.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">First-Time Setup</h1>
        <p className="text-gray-600 mb-6">
          To connect to your Google Workspace, this app needs a Google Cloud Client ID.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your Google Client ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            disabled={!clientId.trim()}
          >
            Save and Continue
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-6">
          This ID is stored only in your browser's local storage. You can find your Client ID in the{' '}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Cloud Console
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ClientIdInputScreen;
