
import React from 'react';
import { ChevronRight, ChevronDown, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mindboard } from '@/utils/types';

interface BoardListProps {
  boards: Mindboard[];
  activeBoardId: string | null;
  onSelectBoard: (id: string) => void;
  expandedBoards: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
}

export function BoardList({
  boards,
  activeBoardId,
  onSelectBoard,
  expandedBoards,
  onToggleExpand
}: BoardListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const isExpanded = expandedBoards[board.id];
          
          return (
            <div key={board.id} className="select-none">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 transition-colors",
                  isActive && "bg-accent text-accent-foreground shadow-[0_0_8px_rgba(0,247,239,0.3)]",
                  !isActive && "hover:bg-accent/50"
                )}
                onClick={() => {
                  onSelectBoard(board.id);
                  onToggleExpand(board.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <Book className="h-4 w-4 shrink-0" />
                <span className="truncate">{board.title}</span>
              </Button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
