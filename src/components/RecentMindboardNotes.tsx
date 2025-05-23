import { motion } from 'framer-motion';
import { BookOpen, Clock, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { NotebookCreateModal } from './modals/NotebookCreateModal';
import { useRecentMindboardNotes } from '@/hooks/useRecentMindboardNotes';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RecentMindboardNotes() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  
  const {
    data: recentNotes = [],
    isLoading,
    error
  } = useRecentMindboardNotes(5);

  const formatTime = (date: Date | string) => {
    return format(date instanceof Date ? date : new Date(date), 'MMM d, h:mm a');
  };

  const handleCreateNotebook = (title: string) => {
    console.log("Creating new notebook:", title);
    setShowCreateModal(false);
  };

  const handleViewMindboard = () => {
    navigate('/mindboard');
  };

  return (
    <>
      <Card className="border border-neon-purple/70 bg-gradient-to-br from-purple-900/50 to-purple-800/70 shadow-lg hover:shadow-xl transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <CardHeader className="pb-2 border-b border-purple-500/50">
          <CardTitle className="text-xl text-white flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-neon-purple glow-text" />
              Recent Notes
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-neon-purple hover:text-neon-purple/80 hover:bg-[#3A4D62]/50"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">New Note</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {isLoading ? (
            <div className="text-center py-6 text-[#CBD5E1]">
              <p>Loading recent notes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-[#CBD5E1]">
              <p>Error loading notes. Please try again.</p>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-6 text-[#CBD5E1]">
              <p>No recent notes found</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 text-neon-purple"
                onClick={() => setShowCreateModal(true)}
              >
                Create a note
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="p-3 rounded-lg border border-[#3A4D62] bg-[#1C2A3A]/70 hover:bg-[#1C2A3A] hover:shadow-[0_0_10px_rgba(168,85,247,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-[#F1F5F9]">{note.title}</h4>
                        <div className="mt-1 text-xs text-[#CBD5E1] line-clamp-2">
                          {note.snippet || 'No content'}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-[#CBD5E1]">
                          <Clock className="h-3 w-3 mr-1 text-neon-purple" />
                          <span>{formatTime(note.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-neon-purple/10 text-neon-purple border-neon-purple/20"
                        title={`${note.boardName} → ${note.sectionName}`}
                      >
                        {note.sectionName}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-1 pb-2 border-t border-purple-500/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-neon-purple hover:text-neon-purple/80 w-full justify-center text-xs"
            onClick={handleViewMindboard}
          >
            Open Mindboard <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      <NotebookCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateNotebook}
      />
    </>
  );
}
