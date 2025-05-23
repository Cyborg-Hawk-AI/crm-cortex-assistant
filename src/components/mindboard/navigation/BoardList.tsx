import React from 'react';
import { ChevronRight, ChevronDown, Book, Trash2, MoreVertical, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mindboard } from '@/utils/types';
import { Input } from '@/components/ui/input';
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
  onRenameBoard?: (id: string, newTitle: string) => void;
}

export function BoardList({
  boards,
  activeBoardId,
  onSelectBoard,
  expandedBoards,
  onToggleExpand,
  onDeleteBoard,
  onRenameBoard
}: BoardListProps) {
  const [editingBoardId, setEditingBoardId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState("");

  const handleRenameStart = (board: Mindboard) => {
    setEditingBoardId(board.id);
    setEditingTitle(board.title);
  };

  const handleRenameConfirm = () => {
    if (editingBoardId && editingTitle.trim() && onRenameBoard) {
      onRenameBoard(editingBoardId, editingTitle.trim());
      setEditingBoardId(null);
      setEditingTitle("");
    }
  };

  const handleRenameCancel = () => {
    setEditingBoardId(null);
    setEditingTitle("");
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const isExpanded = expandedBoards[board.id];
          
          return (
            <div key={board.id} className="select-none group">
              {editingBoardId === board.id ? (
                <div className="flex items-center gap-1 p-1 bg-background/80 border rounded-md m-1">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameConfirm();
                      } else if (e.key === 'Escape') {
                        handleRenameCancel();
                      }
                    }}
                    autoFocus
                    className="h-7 min-w-[100px] bg-transparent"
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRenameConfirm}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRenameCancel}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ) : (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="right">
                        <DropdownMenuItem onClick={() => handleRenameStart(board)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="text-neon-red focus:text-neon-red"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Book className="h-4 w-4 shrink-0" />
                    <span className="truncate">{board.title}</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
