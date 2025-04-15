
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { BoardList } from './navigation/BoardList';
import { SectionTabs } from './navigation/SectionTabs';
import { NoteList } from './navigation/NoteList';
import { BlockEditor } from './BlockEditor';
import { MindBlock } from '@/utils/types';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider
} from '@/components/ui/sidebar';

interface MindboardLayoutProps {
  mindboards: any[];
  sections: any[];
  pages: any[];
  blocks: any[];
  activeMindboardId: string | null;
  activeSectionId: string | null;
  activePageId: string | null;
  setActiveMindboardId: (id: string) => void;
  setActiveSectionId: (id: string) => void;
  setActivePageId: (id: string) => void;
  onCreateBoard: (data: { title: string }) => void;
  onCreateSection: (data: { mindboardId: string; title: string }) => void;
  onCreatePage: (data: { sectionId: string; title: string }) => void;
  onCreateBlock: (type: string, content: any, position?: number, parentId?: string) => Promise<MindBlock>;
  onUpdateBlock: (id: string, content: any, properties?: Record<string, any>) => Promise<MindBlock>;
  onDeleteBlock: (id: string) => Promise<void>;
}

export function MindboardLayout({
  mindboards,
  sections,
  pages,
  blocks,
  activeMindboardId,
  activeSectionId,
  activePageId,
  setActiveMindboardId,
  setActiveSectionId,
  setActivePageId,
  onCreateBoard,
  onCreateSection,
  onCreatePage,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
}: MindboardLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  // Add state for expanded boards
  const [expandedBoards, setExpandedBoards] = useState<Record<string, boolean>>({});

  // Function to toggle board expansion
  const handleToggleExpand = (boardId: string) => {
    setExpandedBoards(prev => ({
      ...prev,
      [boardId]: !prev[boardId]
    }));
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-full w-full overflow-hidden">
        {/* Left Sidebar - Boards */}
        <Sidebar side="left" variant="sidebar" className="border-r border-border bg-background/95 backdrop-blur">
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold text-gradient-primary">Boards</h2>
              <Button variant="ghost" size="icon" onClick={() => onCreateBoard({ title: "New Board" })}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <BoardList
              boards={mindboards}
              activeBoardId={activeMindboardId}
              onSelectBoard={setActiveMindboardId}
              expandedBoards={expandedBoards}
              onToggleExpand={handleToggleExpand}
            />
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center border-b px-4 h-14">
            <SidebarTrigger className="mr-2" />
            
            <div className="ml-4 flex-1">
              <SectionTabs
                sections={sections}
                activeSection={activeSectionId}
                onSelectSection={setActiveSectionId}
              />
            </div>
            
            {activeSectionId && (
              <Button variant="ghost" size="icon" onClick={() => onCreatePage({ sectionId: activeSectionId, title: "New Note" })}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Notes List - Collapsible on mobile and tablet */}
            <Sidebar 
              side="right" 
              variant="floating" 
              collapsible={isMobile ? "offcanvas" : "icon"}
              className={cn(
                "w-64 border-r border-border bg-card",
                isMobile && "absolute right-0 top-0 bottom-0 z-50"
              )}
            >
              {activeSectionId && (
                <NoteList
                  notes={pages}
                  activeNoteId={activePageId}
                  onSelectNote={setActivePageId}
                />
              )}
            </Sidebar>

            {/* Block Editor */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-background/95 to-background/90">
              {activePageId ? (
                <BlockEditor
                  pageId={activePageId}
                  blocks={blocks}
                  onCreateBlock={onCreateBlock}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Select a note to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
