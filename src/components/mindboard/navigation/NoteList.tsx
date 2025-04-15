
import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MindPage } from '@/utils/types';

interface NoteListProps {
  notes: MindPage[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
}

export function NoteList({ notes, activeNoteId, onSelectNote }: NoteListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => onSelectNote(note.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                "hover:bg-accent/50 transition-colors",
                activeNoteId === note.id && "bg-accent text-accent-foreground shadow-[0_0_8px_rgba(0,247,239,0.3)]"
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{note.title}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
