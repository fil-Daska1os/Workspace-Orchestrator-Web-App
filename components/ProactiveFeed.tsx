import React from 'react';
import { WorkspaceItem } from '../types';
import FeedItem from './FeedItem';

interface ProactiveFeedProps {
  items: WorkspaceItem[];
  isLoading: boolean;
  onSelectItem: (prompt: string) => void;
}

const ProactiveFeed: React.FC<ProactiveFeedProps> = ({ items, isLoading, onSelectItem }) => {
    
  const handleSelect = (context: string, title: string) => {
    onSelectItem(`Tell me more about "${title}". Context: ${context}`);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Feed</h2>
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                    <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <FeedItem key={item.id} item={item} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProactiveFeed;