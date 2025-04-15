
import React, { useEffect } from 'react';
import { useMindboard } from '@/hooks/useMindboard';
import { MindboardLayout } from './MindboardLayout';

export function Mindboard() {
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
    updateBlock,
    deleteBlock,
    deleteMindboard,
    deleteSection,
    deletePage,
    updateMindboard,
    updateSection,
    updatePage,
    isLoading
  } = useMindboard();

  // Add debug logs for component state
  useEffect(() => {
    console.log('[Mindboard] Component mounted with:', {
      mindboardCount: mindboards.length,
      activeMindboardId,
      activeSectionId,
      activePageId
    });
  }, [mindboards.length, activeMindboardId, activeSectionId, activePageId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Helper functions that handle the return values properly
  const handleCreateBoard = async (params: { title: string }) => {
    console.log('[Mindboard] handleCreateBoard called with:', params);
    try {
      const result = await createMindboard(params);
      console.log('[Mindboard] Mindboard created successfully:', result);
    } catch (error) {
      console.error('[Mindboard] Error creating mindboard:', error);
    }
  };

  const handleCreateSection = async (params: { mindboardId: string, title: string }) => {
    console.log('[Mindboard] handleCreateSection called with:', params);
    try {
      const result = await createSection(params);
      console.log('[Mindboard] Section created successfully:', result);
    } catch (error) {
      console.error('[Mindboard] Error creating section:', error);
    }
  };

  const handleCreatePage = async (params: { sectionId: string, title: string }) => {
    console.log('[Mindboard] handleCreatePage called with:', params);
    try {
      const result = await createPage(params);
      console.log('[Mindboard] Page created successfully:', result);
    } catch (error) {
      console.error('[Mindboard] Error creating page:', error);
    }
  };

  const handleRenameMindboard = async (id: string, title: string) => {
    console.log(`[Mindboard] handleRenameMindboard called with id: ${id}, title: ${title}`);
    try {
      const result = await updateMindboard({ id, title });
      console.log('[Mindboard] Mindboard renamed successfully:', result);
    } catch (error) {
      console.error('[Mindboard] Error renaming mindboard:', error);
    }
  };

  const handleRenameSection = async (id: string, title: string) => {
    console.log(`[Mindboard] handleRenameSection called with id: ${id}, title: ${title}`);
    try {
      const result = await updateSection({ id, title });
      console.log('[Mindboard] Section renamed successfully:', result);
    } catch (error) {
      console.error('[Mindboard] Error renaming section:', error);
    }
  };

  const handleRenamePage = async (id: string, title: string) => {
    console.log(`[Mindboard] handleRenamePage called with id: ${id}, title: ${title}`);
    try {
      const result = await updatePage({ id, title });
      console.log('[Mindboard] Page renamed successfully:', result);
    } catch (error) {
      console.error('[Mindboard] Error renaming page:', error);
    }
  };

  return (
    <MindboardLayout
      mindboards={mindboards}
      sections={sections}
      pages={pages}
      blocks={blocks}
      activeMindboardId={activeMindboardId}
      activeSectionId={activeSectionId}
      activePageId={activePageId}
      setActiveMindboardId={setActiveMindboardId}
      setActiveSectionId={setActiveSectionId}
      setActivePageId={setActivePageId}
      onCreateBoard={handleCreateBoard}
      onCreateSection={handleCreateSection}
      onCreatePage={handleCreatePage}
      onCreateBlock={(type, content, position, parentId) => createBlock({ 
        pageId: activePageId || '', 
        contentType: type, 
        content: content,
        position: position,
        properties: parentId ? { parent_block_id: parentId } : undefined
      })}
      onUpdateBlock={(id, content, properties) => updateBlock({ id, content, ...properties })}
      onDeleteBlock={(id) => deleteBlock(id)}
      onDeleteMindboard={(id) => deleteMindboard(id)}
      onDeleteSection={(id) => deleteSection(id)}
      onDeletePage={(id) => deletePage(id)}
      onRenameMindboard={handleRenameMindboard}
      onRenameSection={handleRenameSection}
      onRenamePage={handleRenamePage}
    />
  );
}
