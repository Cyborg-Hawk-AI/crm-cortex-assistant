
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
import { useSidebar } from '@/components/ui/sidebar';

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
  // Get sidebar state from sidebar context if available
  const sidebarContext = useSidebar();
  const isSidebarExtension = sidebarContext?.state === "collapsed";

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [expandedBoards, setExpandedBoards] = useState<Record<string, boolean>>({});
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isNarrow = useMediaQuery('(max-width: 1024px)') || isSidebarExtension;
  const { toast } = useToast();
  
  // Toggle specific board expansion/collapse
  const toggleBoard = (id: string) => {
    setExpandedBoards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Create functions
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

  // Delete functions
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

  // Determine sidebar widths based on screen size and state
  const leftSidebarWidth = isNarrow ? '14rem' : '16rem'; 
  const rightSidebarWidth = isNarrow ? '14rem' : '16rem';
  const collapsedWidth = isNarrow ? '2.5rem' : '3rem';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Boards & Notes */}
      <motion.div
        initial={false}
        animate={{ 
          width: leftSidebarOpen ? leftSidebarWidth : collapsedWidth,
          x: 0
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "border-r border-border bg-background/95 backdrop-blur h-full relative",
          "supports-[backdrop-filter]:bg-background/60"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-2">
            {leftSidebarOpen && (
              <h2 className={cn(
                "text-lg font-semibold text-gradient-primary",
                isNarrow && "text-base"
              )}>
                Boards
              </h2>
            )}
            
            <div className="flex items-center ml-auto">
              {leftSidebarOpen && (
                <Button variant="ghost" size="icon" onClick={handleCreateBoard} className="h-7 w-7 text-neon-blue hover:text-neon-aqua">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                className="h-7 w-7 ml-0.5"
              >
                {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {leftSidebarOpen ? (
            <BoardList
              boards={mindboards}
              activeBoardId={activeMindboardId}
              onSelectBoard={setActiveMindboardId}
              expandedBoards={expandedBoards}
              onToggleExpand={toggleBoard}
              onDeleteBoard={onDeleteMindboard}
              onRenameBoard={onRenameMindboard}
              isNarrow={isNarrow}
            />
          ) : (
            <div className="flex flex-col items-center pt-2">
              {mindboards.map((board) => (
                <Button
                  key={board.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "mb-1 h-8 w-8 rounded-md",
                    activeMindboardId === board.id && "bg-accent shadow-[0_0_8px_rgba(0,247,239,0.3)]"
                  )}
                  title={board.title}
                  onClick={() => setActiveMindboardId(board.id)}
                >
                  {board.title.charAt(0).toUpperCase()}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                size="icon"
                className="mt-2 h-8 w-8 text-neon-blue"
                onClick={handleCreateBoard}
                title="Create new board"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className={cn(
          "flex items-center border-b px-2 h-12 flex-shrink-0",
          isNarrow && "px-1"
        )}>
          {/* Section tabs area */}
          <div className="ml-1 flex-1 overflow-hidden">
            <SectionTabs
              sections={sections}
              activeSection={activeSectionId}
              onSelectSection={setActiveSectionId}
              onDeleteSection={handleDeleteSection}
              onRenameSection={onRenameSection}
              isNarrow={isNarrow}
            />
          </div>
          
          <div className="flex items-center">
            {activeMindboardId && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCreateSection}
                className="h-7 w-7 mr-1"
                title="Create new section"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="h-7 w-7"
              title={rightSidebarOpen ? "Hide notes list" : "Show notes list"}
            >
              {rightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Notes List */}
          <motion.div
            initial={false}
            animate={{ 
              width: rightSidebarOpen && activeSectionId ? rightSidebarWidth : '0rem',
              x: 0,
              opacity: rightSidebarOpen ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "border-r border-border bg-card h-full overflow-y-auto",
              !rightSidebarOpen && "overflow-hidden"
            )}
          >
            {activeSectionId && (
              <NoteList
                notes={pages}
                activeNoteId={activePageId}
                onSelectNote={setActivePageId}
                onCreateNote={handleCreatePage}
                onDeleteNote={onDeletePage}
                onRenameNote={onRenamePage}
                isNarrow={isNarrow}
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
                <p className="text-sm">Select a note to start editing</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
