import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeButton } from '@/components/HomeButton';
import { MindboardSidebar } from './MindboardSidebar';
import { SectionTabs } from './SectionTabs';
import { PageList } from './PageList';
import { BlockEditor } from './BlockEditor';
import { useMindboard } from '@/hooks/useMindboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, Plus, MoreVertical, Pin, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Mindboard as MindboardType,
  MindSection, 
  MindPage, 
  MindBlock 
} from '@/utils/types';
import { useQueryClient } from '@tanstack/react-query';
import { 
  createMindboard, 
  createMindSection, 
  createMindPage, 
  createMindBlock,
  updateMindBlock,
  deleteMindBlock,
  getMindboards
} from '@/api/mindboard';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreateMindboardParams {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CreateSectionParams {
  mindboardId: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CreatePageParams {
  sectionId: string;
  title: string;
  description?: string;
  parentPageId?: string;
  isPinned?: boolean;
}

interface CreateBlockParams {
  pageId: string;
  contentType: MindBlock['content_type'];
  content: any;
  position?: number;
  properties?: Record<string, any>;
}

interface UpdateMindboardParams {
  id: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface UpdateSectionParams {
  id: string;
  mindboardId: string;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface UpdatePageParams {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  parentPageId?: string;
  isPinned?: boolean;
}

interface UpdateBlockParams {
  id: string;
  content: any;
  properties?: Record<string, any>;
}

export function Mindboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<{ id: string, type: string, title: string }>({ id: '', type: '', title: '' });
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
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
    createMindboard,
    createSection,
    createPage,
    createBlock,
    updateMindboard,
    updateSection,
    updatePage,
    updateBlock,
    deleteMindboard,
    deleteSection,
    deletePage,
    deleteBlock,
    isLoading
  } = useMindboard();
  
  // Get active items
  const activeMindboard = mindboards.find(board => board.id === activeMindboardId);
  const activeSection = sections.find(section => section.id === activeSectionId);
  const activePage = pages.find(page => page.id === activePageId);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const togglePages = () => {
    setPagesOpen(!pagesOpen);
  };
  
  const handleCreateMindboard = async () => {
    try {
      await createMindboard({
        title: "New Mindboard",
        description: "A new mindboard",
        color: '#3B82F6'
      } as CreateMindboardParams);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create mindboard",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateSection = async () => {
    if (!activeMindboardId) return;
    
    try {
      await createSection({
        mindboardId: activeMindboardId,
        title: "New Section",
        description: "A new section for your mindboard",
        color: '#10B981'
      } as CreateSectionParams);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive"
      });
    }
  };
  
  const handleCreatePage = async (page?: Partial<MindPage>) => {
    if (!activeSectionId) return;
    
    try {
      const newPage = await createPage({
        sectionId: activeSectionId,
        title: page?.title || 'New Page',
        description: page?.description,
        parentPageId: page?.parent_id,
        isPinned: page?.is_pinned
      } as CreatePageParams);
      
      // Update the active page to the newly created page
      setActivePageId(newPage.id);
      
      // Invalidate the pages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['pages', activeSectionId] });
      
      toast({
        title: "Success",
        description: "Page created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdatePage = async (pageId: string, updates: Partial<MindPage>) => {
    try {
      await updatePage({
        id: pageId,
        sectionId: activeSectionId!,
        title: updates.title || '',
        description: updates.description,
        parentPageId: updates.parent_id,
        isPinned: updates.is_pinned
      } as UpdatePageParams);
      
      // Invalidate the pages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['pages', activeSectionId] });
      
      toast({
        title: "Success",
        description: "Page updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive"
      });
    }
  };
  
  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      
      // If the deleted page was active, clear the active page
      if (activePageId === pageId) {
        setActivePageId(null);
      }
      
      // Invalidate the pages query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['pages', activeSectionId] });
      
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive"
      });
    }
  };
  
  // Handle create subpage
  const handleCreateSubpage = (parentId: string) => {
    if (!activeSectionId) return;
    
    const parentPage = pages.find(page => page.id === parentId);
    if (!parentPage) return;
    
    setCurrentEntity({ id: parentId, type: 'subpage', title: parentPage.title });
    setNewTitle(`Subpage of ${parentPage.title}`);
    setNewDescription('');
    setCreateDialogOpen(true);
  };
  
  // Handle rename mindboard/section/page
  const handleRename = async (id: string, type: 'mindboard' | 'section' | 'page', newTitle: string) => {
    try {
      switch (type) {
        case 'mindboard':
          await updateMindboard({
            id,
            title: newTitle
          } as UpdateMindboardParams);
          break;
        case 'section':
          await updateSection({
            id,
            mindboardId: activeMindboardId!,
            title: newTitle
          } as UpdateSectionParams);
          break;
        case 'page':
          await updatePage({
            id,
            sectionId: activeSectionId!,
            title: newTitle
          } as UpdatePageParams);
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to rename ${type}`,
        variant: "destructive"
      });
    }
  };
  
  // Submit create dialog
  const handleSubmitCreate = async () => {
    if (!newTitle.trim()) return;
    
    try {
      switch (currentEntity.type) {
        case 'mindboard':
          const newMindboard = await createMindboard({
            title: newTitle,
            description: newDescription
          } as CreateMindboardParams);
          setActiveMindboardId(newMindboard.id);
          
          // Automatically create a default section
          const defaultSection = await createSection({
            mindboardId: newMindboard.id,
            title: 'General',
            description: 'Default section'
          } as CreateSectionParams);
          setActiveSectionId(defaultSection.id);
          break;
          
        case 'section':
          if (!activeMindboardId) return;
          const newSection = await createSection({
            mindboardId: activeMindboardId,
            title: newTitle,
            description: newDescription
          } as CreateSectionParams);
          setActiveSectionId(newSection.id);
          break;
          
        case 'page':
          if (!activeSectionId) return;
          const newPage = await createPage({
            sectionId: activeSectionId,
            title: newTitle,
            description: newDescription
          } as CreatePageParams);
          setActivePageId(newPage.id);
          
          // Automatically create a welcome block
          await createBlock({
            pageId: newPage.id,
            contentType: 'text',
            content: { text: 'Welcome to your new page! Start adding content here.' }
          } as CreateBlockParams);
          break;
          
        case 'subpage':
          if (!activeSectionId) return;
          const newSubpage = await createPage({
            sectionId: activeSectionId,
            title: newTitle,
            description: newDescription,
            parentPageId: currentEntity.id
          } as CreatePageParams);
          setActivePageId(newSubpage.id);
          break;
          
        default:
          return;
      }
      
      setCreateDialogOpen(false);
      setNewTitle('');
      setNewDescription('');
      
      toast({
        title: `${currentEntity.type} created`,
        description: `${newTitle} has been created successfully`,
      });
      
    } catch (error) {
      console.error('Error creating entity:', error);
      toast({
        title: "Error",
        description: "Failed to create " + currentEntity.type,
        variant: "destructive"
      });
    }
  };
  
  // Submit rename dialog
  const handleSubmitRename = async () => {
    if (!newTitle.trim()) return;
    
    try {
      switch (currentEntity.type) {
        case 'mindboard':
          await createMindboard({
            id: currentEntity.id,
            title: newTitle,
            description: newDescription
          } as UpdateMindboardParams);
          break;
          
        case 'section':
          await createSection({
            id: currentEntity.id,
            title: newTitle,
            description: newDescription
          } as UpdateSectionParams);
          break;
          
        case 'page':
          await createPage({
            id: currentEntity.id,
            title: newTitle,
            description: newDescription
          } as UpdatePageParams);
          break;
          
        default:
          return;
      }
      
      setRenameDialogOpen(false);
      setNewTitle('');
      setNewDescription('');
      
    } catch (error) {
      console.error('Error renaming entity:', error);
      toast({
        title: "Error",
        description: "Failed to rename " + currentEntity.type,
        variant: "destructive"
      });
    }
  };
  
  // Handle delete entity
  const handleDelete = async (id: string, type: 'mindboard' | 'section' | 'page') => {
    try {
      switch (type) {
        case 'mindboard':
          await deleteMindboard(id);
          setActiveMindboardId(null);
          break;
        case 'section':
          await deleteSection(id);
          setActiveSectionId(null);
          break;
        case 'page':
          await deletePage(id);
          setActivePageId(null);
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle toggle pin page
  const handleTogglePin = async (id: string, type: 'mindboard' | 'section' | 'page', isPinned: boolean) => {
    try {
      switch (type) {
        case 'mindboard':
          await updateMindboard({
            id,
            title: activeMindboard?.title || '',
            isPinned
          } as UpdateMindboardParams);
          break;
        case 'section':
          await updateSection({
            id,
            mindboardId: activeMindboardId!,
            title: activeSection?.title || '',
            isPinned
          } as UpdateSectionParams);
          break;
        case 'page':
          await updatePage({
            id,
            sectionId: activeSectionId!,
            title: activePage?.title || '',
            isPinned
          } as UpdatePageParams);
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isPinned ? 'pin' : 'unpin'} ${type}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle block operations
  const handleCreateBlock = async (
    type: MindBlock['content_type'],
    content: any,
    position?: number,
    parentId?: string
  ) => {
    if (!activePageId) return;
    const newBlock = await createBlock({
      pageId: activePageId,
      contentType: type,
      content,
      position,
      properties: parentId ? { parent_block_id: parentId } : undefined
    });
    return newBlock.id;
  };
  
  const handleUpdateBlock = async (
    id: string,
    content: any,
    properties?: Record<string, any>
  ) => {
    await updateBlock({
      id,
      content,
      properties
    });
  };
  
  const handleDeleteBlock = async (id: string) => {
    try {
      await deleteBlock(id);
      
      toast({
        title: "Block deleted",
        description: "Block has been deleted successfully",
      });
      
      // Refresh blocks
      queryClient.invalidateQueries({ queryKey: ['blocks', activePageId] });
      
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: "Error",
        description: "Failed to delete block",
        variant: "destructive"
      });
    }
  };
  
  const handlePageSelect = (pageId: string) => {
    setActivePageId(pageId);
  };
  
  return (
    <div className="flex h-full bg-background">
      {/* Mindboard Sidebar */}
      <div className={cn(
        "w-64 border-r bg-background h-full transition-all duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Mindboards</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCreateMindboard}
                title="Create new mindboard"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <MindboardSidebar
              mindboards={mindboards}
              activeMindboardId={activeMindboardId}
              setActiveMindboardId={setActiveMindboardId}
              onCreateMindboard={handleCreateMindboard}
              onRenameMindboard={(id) => handleRename(id, 'mindboard', 'New Title')}
              onDeleteMindboard={(id) => handleDelete(id, 'mindboard')}
              isLoading={isLoading}
            />
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col h-full transition-all duration-300",
        sidebarOpen ? "ml-0" : "ml-0"
      )}>
        {/* MindSection Tabs */}
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", sidebarOpen && "rotate-180")} />
              </Button>
              <h2 className="text-lg font-semibold">MindSections</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateSection}
              title="Create new mindsection"
              disabled={!activeMindboardId}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
          <SectionTabs
            notebookId={activeMindboardId}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            onCreateSection={handleCreateSection}
          />
        </div>

        {/* MindPage List and MindBlock Editor */}
        <div className="flex flex-1 h-full">
          {/* MindPage List */}
          <div className={cn(
            "border-r h-full transition-all duration-300",
            pagesOpen ? "w-64" : "w-0 overflow-hidden"
          )}>
            <div className={cn(
              "h-full w-64",
              pagesOpen ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold">MindPages</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCreatePage()}
                  title="Create new mindpage"
                  disabled={!activeSectionId}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <PageList
                sectionId={activeSectionId || ''}
                activePage={activePageId}
                onPageSelect={setActivePageId}
                onCreatePage={handleCreatePage}
                onDeletePage={handleDeletePage}
                onUpdatePage={handleUpdatePage}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-full flex flex-col">
            <div className="border-b p-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePages}
                className="h-8 w-8"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", pagesOpen && "rotate-180")} />
              </Button>
              {activePage ? (
                <h2 className="text-lg font-semibold">{activePage.title}</h2>
              ) : (
                <h2 className="text-lg font-semibold text-muted-foreground">Select a page</h2>
              )}
            </div>

            {/* MindBlock Editor */}
            <div className="flex-1">
              {activePageId && (
                <BlockEditor
                  pageId={activePageId}
                  blocks={blocks || []}
                  onCreateBlock={handleCreateBlock}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onMoveBlock={undefined}
                  onDuplicateBlock={undefined}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

