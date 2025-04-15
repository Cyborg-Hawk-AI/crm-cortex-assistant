
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MindSection } from '@/utils/types';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SectionTabsProps {
  sections: MindSection[];
  activeSection: string | null;
  onSelectSection: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onRenameSection?: (id: string, newTitle: string) => void;
}

export function SectionTabs({ 
  sections, 
  activeSection, 
  onSelectSection,
  onDeleteSection,
  onRenameSection 
}: SectionTabsProps) {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleRenameStart = (section: MindSection) => {
    setEditingSectionId(section.id);
    setEditingTitle(section.title);
  };

  const handleRenameConfirm = () => {
    if (editingSectionId && editingTitle.trim() && onRenameSection) {
      onRenameSection(editingSectionId, editingTitle.trim());
      setEditingSectionId(null);
      setEditingTitle("");
    }
  };

  const handleRenameCancel = () => {
    setEditingSectionId(null);
    setEditingTitle("");
  };

  return (
    <Tabs value={activeSection || undefined} className="w-full" onValueChange={onSelectSection}>
      <TabsList className="h-auto justify-start bg-background/50 p-0 gap-1">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="group relative"
          >
            {editingSectionId === section.id ? (
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
              <>
                <TabsTrigger
                  value={section.id}
                  className={cn(
                    "relative h-9 rounded-none border-b-2 border-transparent px-4 pr-8",
                    "data-[state=active]:border-primary data-[state=active]:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
                  )}
                >
                  <div
                    className="h-2 w-2 rounded-full mr-2"
                    style={{ backgroundColor: section.color || '#4f46e5' }}
                  />
                  {section.title}
                </TabsTrigger>

                {onRenameSection && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRenameStart(section)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-neon-red focus:text-neon-red"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{section.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteSection && onDeleteSection(section.id)}
                              className="bg-neon-red hover:bg-neon-red/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </motion.div>
        ))}
      </TabsList>
    </Tabs>
  );
}
