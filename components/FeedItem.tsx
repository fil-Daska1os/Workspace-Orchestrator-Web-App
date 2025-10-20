
import React from 'react';
import { WorkspaceItem, WorkspaceItemType } from '../types';
import { MailIcon, CalendarIcon, FileTextIcon } from './icons';

interface FeedItemProps {
  item: WorkspaceItem;
  onSelect: (context: string, title: string) => void;
}

const itemTypeDetails = {
  [WorkspaceItemType.EMAIL]: {
    icon: MailIcon,
    color: "text-red-500",
  },
  [WorkspaceItemType.EVENT]: {
    icon: CalendarIcon,
    color: "text-blue-500",
  },
  [WorkspaceItemType.DOCUMENT]: {
    icon: FileTextIcon,
    color: "text-green-500",
  },
};

const FeedItem: React.FC<FeedItemProps> = ({ item, onSelect }) => {
  const details = itemTypeDetails[item.type];
  const Icon = details.icon;

  return (
    <button
      onClick={() => onSelect(item.context, item.title)}
      className="w-full text-left p-3 flex items-start space-x-3 hover:bg-gray-100 rounded-lg transition-colors duration-150"
    >
      <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${details.color}`} />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
        <p className="text-xs text-gray-500 truncate">{item.snippet}</p>
        <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
      </div>
    </button>
  );
};

export default FeedItem;
