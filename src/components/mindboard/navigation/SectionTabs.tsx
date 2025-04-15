
import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MindSection } from '@/utils/types';
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
}

export function SectionTabs({ 
  sections, 
  activeSection, 
  onSelectSection,
  onDeleteSection 
}: SectionTabsProps) {
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

            {onDeleteSection && (
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-neon-red focus:text-neon-red"
                      >
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
                          onClick={() => onDeleteSection(section.id)}
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
          </motion.div>
        ))}
      </TabsList>
    </Tabs>
  );
}
