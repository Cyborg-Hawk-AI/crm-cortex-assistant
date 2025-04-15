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
import { useToast } from '@/components/ui/use-toast';

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
  onCreateBoard: (data: { title: string }) => Promise<any>;
  onCreateSection: (data: { mindboardId: string; title: string }) => Promise<any>;
  onCreatePage: (data: { sectionId: string; title: string }) => Promise<any>;
  onCreateBlock: (type: string, content: any, position?: number, parentId?: string) => Promise<MindBlock>;
  onUpdateBlock: (id: string, content: any, properties?: Record<string, any>) => Promise<MindBlock>;
  onDeleteBlock: (id: string) => Promise<void>;
  onDeleteMindboard: (id: string) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
  onDeletePage?: (id: string) => Promise<void>;
  onRenameMindboard?: (id: string, title: string) => Promise<void>;
  onRenameSection?: (id: string, title: string) => Promise<void>;
  onRenamePage?: (id: string, title: string) => Promise<void>;
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
  onDeleteMindboard,
  onDeleteSection,
  onDeletePage,
  onRenameMindboard,
  onRenameSection,
  onRenamePage
}: MindboardLayoutProps) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [expandedBoards, setExpandedBoards] = useState<Record<string, boolean>>({});
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { toast } = useToast();

  const toggleBoard = (id: string) => {
    setExpandedBoards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateBoard = async () => {
    try {
      const newBoard = await onCreateBoard({ title: "New Board" });
      if (newBoard && newBoard.id) {
        const newSection = await onCreateSection({ mindboardId: newBoard.id, title: "New Section" });
        if (newSection && newSection.id) {
          await onCreatePage({ sectionId: newSection.id, title: "New Page" });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
    }
  };

  const handleCreateSection = async () => {
    if (activeMindboardId) {
      try {
        const newSection = await onCreateSection({ mindboardId: activeMindboardId, title: "New Section" });
        if (newSection && newSection.id) {
          await onCreatePage({ sectionId: newSection.id, title: "New Page" });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create section",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreatePage = async (title: string) => {
    if (activeSectionId) {
      try {
        await onCreatePage({ sectionId: activeSectionId, title });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create page",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteMindboard = async (id: string) => {
    try {
      await onDeleteMindboard(id);
      toast({
        title: "Success",
        description: "Mindboard deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mindboard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await onDeleteSection(id);
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const handleDeletePage = async (id: string) => {
    if (onDeletePage) {
      try {
        await onDeletePage(id);
        toast({
          title: "Success",
          description: "Page deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete page",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Boards & Notes */}
      <motion.div
        initial={false}
        animate={{ 
          width: leftSidebarOpen ? (isMobile ? '100%' : '16rem') : '0rem',
          x: leftSidebarOpen ? 0 : '-100%'
        }}
        className={cn(
          "border-r border-border bg-background/95 backdrop-blur h-full",
          "supports-[backdrop-filter]:bg-background/60",
          isMobile && leftSidebarOpen ? "absolute inset-0 z-50" : "relative"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-gradient-primary">Boards</h2>
            <Button variant="ghost" size="icon" onClick={handleCreateBoard}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <BoardList
            boards={mindboards}
            activeBoardId={activeMindboardId}
            onSelectBoard={setActiveMindboardId}
            expandedBoards={expandedBoards}
            onToggleExpand={toggleBoard}
            onDeleteBoard={onDeleteMindboard}
            onRenameBoard={onRenameMindboard}
          />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center border-b px-4 h-14 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="mr-2"
          >
            {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          
          <div className="ml-4 flex-1">
            <SectionTabs
              sections={sections}
              activeSection={activeSectionId}
              onSelectSection={setActiveSectionId}
              onDeleteSection={handleDeleteSection}
              onRenameSection={onRenameSection}
            />
          </div>
          
          {activeMindboardId && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCreateSection}
              className="mr-2"
              title="Create new section"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="ml-2"
          >
            {rightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Notes List */}
          <motion.div
            initial={false}
            animate={{ 
              width: !isMobile && rightSidebarOpen && activeSectionId ? '16rem' : '0rem',
              x: rightSidebarOpen ? 0 : '100%'
            }}
            className="border-r border-border bg-card h-full overflow-y-auto"
          >
            {activeSectionId && (
              <NoteList
                notes={pages}
                activeNoteId={activePageId}
                onSelectNote={setActivePageId}
                onCreateNote={handleCreatePage}
                onDeleteNote={onDeletePage}
                onRenameNote={onRenamePage}
              />
            )}
          </motion.div>

          {/* Block Editor */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-background/95 to-background/90 h-full">
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
  );
}
