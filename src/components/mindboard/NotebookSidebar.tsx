
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, MoreVertical, Book } from 'lucide-react';
import { Notebook } from '@/utils/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface NotebookSidebarProps {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  setActiveNotebookId: (id: string) => void;
  isLoading: boolean;
}

export function NotebookSidebar({ 
  notebooks, 
  activeNotebookId, 
  setActiveNotebookId,
  isLoading
}: NotebookSidebarProps) {
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
    <div className="p-2">
      {notebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center p-4">
          <BookOpen className="h-12 w-12 text-[#3A4D62] mb-2" />
          <p className="text-sm text-[#CBD5E1]">No notebooks yet</p>
          <p className="text-xs text-[#64748B] mt-1">Create your first notebook to get started</p>
        </div>
      ) : (
        notebooks.map((notebook) => (
          <motion.div
            key={notebook.id}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center p-2 rounded-md mb-1 cursor-pointer text-sm ${
              activeNotebookId === notebook.id 
                ? 'bg-[#3A4D62]/70 shadow-[0_0_8px_rgba(0,247,239,0.3)]' 
                : 'hover:bg-[#3A4D62]/40'
            }`}
            onClick={() => setActiveNotebookId(notebook.id)}
          >
            <Book className={`h-4 w-4 mr-2 ${
              activeNotebookId === notebook.id ? 'text-neon-aqua' : 'text-[#CBD5E1]'
            }`} />
            
            <span className={`flex-1 truncate ${
              activeNotebookId === notebook.id ? 'text-[#F1F5F9]' : 'text-[#CBD5E1]'
            }`}>
              {notebook.title}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]">
                <DropdownMenuItem className="text-xs cursor-pointer">Rename</DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer text-neon-red">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))
      )}
    </div>
  );
}
