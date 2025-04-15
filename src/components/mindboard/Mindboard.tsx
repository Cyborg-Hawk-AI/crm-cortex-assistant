
import React from 'react';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Helper functions that handle the return values properly
  const handleCreateBoard = async (params: { title: string }) => {
    await createMindboard(params);
  };

  const handleCreateSection = async (params: { mindboardId: string, title: string }) => {
    await createSection(params);
  };

  const handleCreatePage = async (params: { sectionId: string, title: string }) => {
    await createPage(params);
  };

  const handleRenameMindboard = async (id: string, title: string) => {
    await updateMindboard({ id, title });
  };

  const handleRenameSection = async (id: string, title: string) => {
    await updateSection({ id, title });
  };

  const handleRenamePage = async (id: string, title: string) => {
    await updatePage({ id, title });
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
