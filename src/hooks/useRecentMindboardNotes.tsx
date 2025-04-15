
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface RecentNote {
  id: string;
  title: string;
  snippet: string;
  updatedAt: string;
  boardName: string;
  sectionName: string;
}

export function useRecentMindboardNotes(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-mindboard-notes'],
    queryFn: async (): Promise<RecentNote[]> => {
      console.log('Fetching recent mindboard notes...');
      
      const { data: pages, error: pagesError } = await supabase
        .from('mind_pages')
        .select(`
          id,
          title,
          updated_at,
          mind_sections!inner (
            id,
            title,
            mindboards!inner (
              id,
              title
            )
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (pagesError) {
        console.error('Error fetching mind pages:', pagesError);
        throw pagesError;
      }

      console.log('Fetched pages:', pages);

      // Fetch first block for each page to get the snippet
      const notesWithSnippets = await Promise.all(
        pages.map(async (page) => {
          const { data: blocks, error: blocksError } = await supabase
            .from('mind_blocks')
            .select('content, content_type')
            .eq('page_id', page.id)
            .order('position', { ascending: true })
            .limit(1)
            .single();

          if (blocksError) {
            console.warn('Error fetching block for page:', page.id, blocksError);
            return {
              id: page.id,
              title: page.title,
              snippet: '',
              updatedAt: page.updated_at,
              boardName: page.mind_sections.mindboards.title,
              sectionName: page.mind_sections.title,
            };
          }

          let snippet = '';
          if (blocks) {
            if (blocks.content_type === 'text' && blocks.content?.text) {
              snippet = blocks.content.text;
            } else if (blocks.content_type === 'heading' && blocks.content?.text) {
              snippet = blocks.content.text;
            }
            // Truncate snippet to 100 characters
            snippet = snippet.length > 100 ? `${snippet.substring(0, 100)}...` : snippet;
          }

          return {
            id: page.id,
            title: page.title,
            snippet,
            updatedAt: page.updated_at,
            boardName: page.mind_sections.mindboards.title,
            sectionName: page.mind_sections.title,
          };
        })
      );

      console.log('Processed notes with snippets:', notesWithSnippets);
      return notesWithSnippets;
    },
  });
}
