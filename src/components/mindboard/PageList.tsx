
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { BlockRenderer } from './BlockRenderer';
import { getMindPages, getMindBlocks, updateMindPage } from '@/api/mindboard';
import { MindPage, MindBlock } from '@/utils/types';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageListProps {
  sectionId: string;
  activePage: string | null;
  onPageSelect: (pageId: string) => void;
  onCreatePage: (page: Partial<MindPage>) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<MindPage>) => void;
}

export const PageList: React.FC<PageListProps> = ({
  sectionId,
  activePage,
  onPageSelect,
  onCreatePage,
  onDeletePage,
  onUpdatePage,
}) => {
  const queryClient = useQueryClient();
  const { data: pages, isLoading: pagesLoading } = useQuery<MindPage[]>({
    queryKey: ['pages', sectionId],
    queryFn: () => getMindPages(sectionId),
    enabled: !!sectionId,
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery<MindBlock[]>({
    queryKey: ['blocks', activePage],
    queryFn: () => getMindBlocks(activePage!),
    enabled: !!activePage,
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ pageId, title }: { pageId: string; title: string }) => 
      updateMindPage({ id: pageId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', sectionId] });
    },
  });

  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const togglePage = (pageId: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  const handlePageClick = (pageId: string) => {
    onPageSelect(pageId);
  };

  const handleCreatePage = () => {
    if (newPageTitle.trim()) {
      console.log("Creating new page with title:", newPageTitle.trim());
      const newPage: Partial<MindPage> = {
        id: uuidv4(),
        section_id: sectionId,
        title: newPageTitle.trim(),
        position: pages?.length || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onCreatePage(newPage);
      setNewPageTitle('');
      setShowNewPageInput(false);
    }
  };

  const handleUpdatePage = (pageId: string) => {
    if (editingTitle.trim()) {
      onUpdatePage(pageId, { title: editingTitle.trim() });
      setEditingPageId(null);
      setEditingTitle('');
    }
  };

  const handleDeletePage = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      onDeletePage(pageId);
    }
  };

  if (pagesLoading) {
    return <div className="p-4">Loading pages...</div>;
  }

  const renderPage = (page: MindPage, level = 0) => {
    const isExpanded = expandedPages.has(page.id);
    const isActive = page.id === activePage;
    const isEditing = page.id === editingPageId;
    const hasChildren = pages?.some(p => p.parent_page_id === page.id) || false;

    return (
      <div key={page.id} className="space-y-1">
        <div 
          className={cn(
            "group flex items-center gap-2 p-2 rounded-lg hover:bg-accent/5",
            isActive && "bg-accent/10",
            "relative"
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePage(page.id);
                }}
                className="p-1 hover:bg-accent/10 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            {isEditing ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleUpdatePage(page.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdatePage(page.id);
                  } else if (e.key === 'Escape') {
                    setEditingPageId(null);
                    setEditingTitle('');
                  }
                }}
                className="flex-1 bg-transparent border-none outline-none px-2 py-1 rounded border border-input"
                autoFocus
              />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePageClick(page.id);
                }}
                className="flex-1 text-left"
              >
                {page.title}
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-purple-500/10 text-purple-500 hover:text-purple-600"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Link mission to page:', page.id);
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setEditingPageId(page.id);
                setEditingTitle(page.title);
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePage(page.id);
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-6">
            {pages
              ?.filter(p => p.parent_page_id === page.id)
              .map(childPage => renderPage(childPage, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Mind Pages</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setShowNewPageInput(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showNewPageInput && (
        <div className="flex items-center gap-2 p-2 border rounded-lg">
          <input
            type="text"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreatePage();
              } else if (e.key === 'Escape') {
                setShowNewPageInput(false);
                setNewPageTitle('');
              }
            }}
            placeholder="New page title..."
            className="flex-1 bg-transparent border-none outline-none px-2 py-1"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCreatePage}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 pr-2" orientation="vertical">
        <div className="space-y-1 min-h-[200px]">
          {pages
            ?.filter(page => !page.parent_page_id)
            .map(page => renderPage(page))}
        </div>
      </ScrollArea>

      {activePage && (
        <div className="flex-1 overflow-auto p-4 border-l">
          <h3 className="text-lg font-semibold mb-4">Blocks</h3>
          {blocksLoading ? (
            <div>Loading blocks...</div>
          ) : (
            <ScrollArea className="h-full" orientation="vertical">
              <div className="min-h-[300px]">
                {blocks?.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default PageList;
