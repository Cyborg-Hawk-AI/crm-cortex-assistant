
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { BoardList } from './navigation/BoardList';
import { SectionTabs } from './navigation/SectionTabs';
import { NoteList } from './navigation/NoteList';
import { BlockEditor } from './BlockEditor';
import { MindBlock } from '@/utils/types';

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
  onCreateBoard: () => void;
  onCreateSection: () => void;
  onCreatePage: () => void;
  onCreateBlock: (type: string, content: any, position?: number, parentId?: string) => Promise<string>;
  onUpdateBlock: (id: string, content: any, properties?: Record<string, any>) => Promise<void>;
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedBoards, setExpandedBoards] = useState<Record<string, boolean>>({});
  const isMobile = useMediaQuery('(max-width: 768px)');

  const toggleBoard = (id: string) => {
    setExpandedBoards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Boards & Notes */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? '16rem' : '0rem' }}
        className="border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-gradient-primary">Boards</h2>
            <Button variant="ghost" size="icon" onClick={onCreateBoard}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <BoardList
            boards={mindboards}
            activeBoardId={activeMindboardId}
            onSelectBoard={setActiveMindboardId}
            expandedBoards={expandedBoards}
            onToggleExpand={toggleBoard}
          />
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center border-b px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="ml-4 flex-1">
            <SectionTabs
              sections={sections}
              activeSection={activeSectionId}
              onSelectSection={setActiveSectionId}
            />
          </div>
          
          {activeSectionId && (
            <Button variant="ghost" size="icon" onClick={onCreatePage}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Notes List */}
          <motion.div
            initial={false}
            animate={{ width: !isMobile && activeSectionId ? '16rem' : '0rem' }}
            className="border-r border-border bg-card"
          >
            {activeSectionId && (
              <NoteList
                notes={pages}
                activeNoteId={activePageId}
                onSelectNote={setActivePageId}
              />
            )}
          </motion.div>

          {/* Block Editor */}
          <div className="flex-1 overflow-auto">
            {activePageId ? (
              <BlockEditor
                pageId={activePageId}
                blocks={blocks}
                onCreateBlock={(type, content, position, parentId) => 
                  onCreateBlock(type, content, position, parentId)
                }
                onUpdateBlock={(id, content, properties) => 
                  onUpdateBlock(id, content, properties)
                }
                onDeleteBlock={(id) => 
                  onDeleteBlock(id)
                }
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
