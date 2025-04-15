
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
      onCreateBoard={createMindboard}
      onCreateSection={createSection}
      onCreatePage={createPage}
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
      onRenameMindboard={(id, title) => updateMindboard({ id, title })}
      onRenameSection={(id, title) => updateSection({ id, title })}
      onRenamePage={(id, title) => updatePage({ id, title })}
    />
  );
}
