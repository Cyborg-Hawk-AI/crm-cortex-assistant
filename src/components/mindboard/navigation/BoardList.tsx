
import React from 'react';
import { ChevronRight, ChevronDown, Book, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mindboard } from '@/utils/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BoardListProps {
  boards: Mindboard[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  expandedBoards: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onDeleteBoard?: (id: string) => void;
}

export function BoardList({
  boards,
  activeBoardId,
  onSelectBoard,
  expandedBoards,
  onToggleExpand,
  onDeleteBoard
}: BoardListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const isExpanded = expandedBoards[board.id];
          
          return (
            <div key={board.id} className="select-none group">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 justify-start gap-2 transition-colors",
                    isActive && "bg-accent text-accent-foreground shadow-[0_0_8px_rgba(0,247,239,0.3)]",
                    !isActive && "hover:bg-accent/50"
                  )}
                  onClick={() => {
                    onSelectBoard(board.id);
                  }}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(board.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </Button>
                  <Book className="h-4 w-4 shrink-0" />
                  <span className="truncate">{board.title}</span>
                </Button>

                {onDeleteBoard && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-neon-red transition-colors" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Mindboard</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{board.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteBoard(board.id)}
                          className="bg-neon-red hover:bg-neon-red/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
