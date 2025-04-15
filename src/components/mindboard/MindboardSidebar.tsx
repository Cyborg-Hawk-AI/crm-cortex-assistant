
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Plus, MoreVertical } from 'lucide-react';
import { Mindboard } from '@/utils/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MindboardSidebarProps {
  mindboards: Mindboard[];
  activeMindboardId: string | null;
  setActiveMindboardId: (id: string) => void;
  onCreateMindboard: () => void;
  onRenameMindboard: (id: string) => void;
  onDeleteMindboard: (id: string) => void;
  isLoading: boolean;
}

export function MindboardSidebar({ 
  mindboards, 
  activeMindboardId, 
  setActiveMindboardId,
  onCreateMindboard,
  onRenameMindboard,
  onDeleteMindboard,
  isLoading
}: MindboardSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleCreateBoard = async () => {
    if (newBoardTitle.trim()) {
      await onCreateMindboard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateBoard();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewBoardTitle('');
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center p-2">
            <Skeleton className="h-5 w-5 mr-2 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-[#3A4D62]">
        <h2 className="text-lg font-semibold text-[#F1F5F9] bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-aqua">
          Mindboards
        </h2>
        <Button 
          onClick={() => setIsCreating(true)}
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-neon-blue hover:text-neon-aqua hover:bg-[#3A4D62]/50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isCreating && (
            <div className="flex items-center gap-2 p-2 bg-[#3A4D62]/30 rounded-md mb-2">
              <Input
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Board name..."
                className="h-7 bg-transparent"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleCreateBoard}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            </div>
          )}

          {mindboards.length === 0 && !isCreating ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Book className="h-12 w-12 text-[#3A4D62] mb-2" />
              <p className="text-sm text-[#CBD5E1]">No mindboards yet</p>
              <p className="text-xs text-[#64748B] mt-1">Create your first mindboard to get started</p>
            </div>
          ) : (
            mindboards.map((mindboard) => (
              <motion.div
                key={mindboard.id}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center p-2 rounded-md mb-1 cursor-pointer text-sm ${
                  activeMindboardId === mindboard.id 
                    ? 'bg-[#3A4D62]/70 shadow-[0_0_8px_rgba(0,247,239,0.3)]' 
                    : 'hover:bg-[#3A4D62]/40'
                }`}
                onClick={() => setActiveMindboardId(mindboard.id)}
              >
                <Book className={`h-4 w-4 mr-2 ${
                  activeMindboardId === mindboard.id ? 'text-neon-aqua' : 'text-[#CBD5E1]'
                }`} />
                
                <span className={`flex-1 truncate ${
                  activeMindboardId === mindboard.id ? 'text-[#F1F5F9]' : 'text-[#CBD5E1]'
                }`}>
                  {mindboard.title}
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRenameMindboard(mindboard.id);
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-neon-red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMindboard(mindboard.id);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
