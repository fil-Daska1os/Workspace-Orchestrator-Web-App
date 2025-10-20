import React, { useState } from 'react';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800">Workspace Orchestrator</h1>
      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-4 focus:outline-none">
          <img
            className="w-9 h-9 rounded-full"
            src="https://picsum.photos/100"
            alt="User Avatar"
          />
        </button>
        {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <button
                    onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                    Logout
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;