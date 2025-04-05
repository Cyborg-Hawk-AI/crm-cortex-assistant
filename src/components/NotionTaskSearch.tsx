
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockTasks } from '@/utils/mockData';

interface NotionTaskSearchProps {
  onSelectTask: (taskId: string) => void;
}

export const NotionTaskSearch: React.FC<NotionTaskSearchProps> = ({ onSelectTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const filteredTasks = mockTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder="Search Notion tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="pr-8"
        />
        <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      </div>
      
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-10 max-h-40 overflow-y-auto">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  onSelectTask(task.id);
                  setIsSearching(false);
                }}
              >
                {task.title}
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">No tasks found</div>
          )}
        </div>
      )}
    </div>
  );
};
