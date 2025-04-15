
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, MoreVertical, Book } from 'lucide-react';
import { Mindboard } from '@/utils/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RenameDialog } from './RenameDialog';

interface MindboardSidebarProps {
  mindboards: Mindboard[];
  activeMindboardId: string | null;
  setActiveMindboardId: (id: string) => void;
  onCreateMindboard: (params: { title: string }) => void;
  onRenameMindboard: (id: string, title: string) => void;
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
  const [renamingBoard, setRenamingBoard] = useState<{ id: string, title: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[MindboardSidebar] Component mounted');
    return () => console.log('[MindboardSidebar] Component unmounted');
  }, []);

  useEffect(() => {
    console.log('[MindboardSidebar] isCreating state changed:', isCreating);
  }, [isCreating]);

  const handleCreateClick = () => {
    console.log('[MindboardSidebar] Create button clicked, setting isCreating to true');
    setIsCreating(true);
  };

  const handleCreateDialogClose = () => {
    console.log('[MindboardSidebar] Create dialog close called, setting isCreating to false');
    setIsCreating(false);
  };

  const handleCreateMindboard = (title: string) => {
    console.log(`[MindboardSidebar] Creating new mindboard with title: "${title}"`);
    onCreateMindboard({ title });
    setIsCreating(false);
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
        <h2 className="text-lg font-semibold text-[#F1F5F9] bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-aqua">Mindboards</h2>
        <Button 
          onClick={handleCreateClick}
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-neon-blue hover:text-neon-aqua hover:bg-[#3A4D62]/50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {mindboards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <BookOpen className="h-12 w-12 text-[#3A4D62] mb-2" />
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
                  <DropdownMenuContent align="end" className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]">
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[MindboardSidebar] Opening rename dialog for mindboard:', mindboard.id);
                        setRenamingBoard({ id: mindboard.id, title: mindboard.title });
                      }}
                    >
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer text-neon-red"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[MindboardSidebar] Deleting mindboard:', mindboard.id);
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

      {renamingBoard && (
        <RenameDialog
          isOpen={!!renamingBoard}
          onClose={() => {
            console.log('[MindboardSidebar] Closing rename dialog');
            setRenamingBoard(null);
          }}
          onRename={(newTitle) => {
            console.log(`[MindboardSidebar] Renaming mindboard ${renamingBoard.id} to: "${newTitle}"`);
            onRenameMindboard(renamingBoard.id, newTitle);
            setRenamingBoard(null);
          }}
          currentTitle={renamingBoard.title}
        />
      )}

      <RenameDialog
        isOpen={isCreating}
        onClose={handleCreateDialogClose}
        onRename={handleCreateMindboard}
        currentTitle=""
        entityType="new mindboard"
      />
    </div>
  );
}
