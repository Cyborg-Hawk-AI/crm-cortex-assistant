
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
      <Card className="border border-[#C1EDEA] bg-gradient-to-br from-white to-[#F5F7FA]/70 shadow-lg hover:shadow-xl transition-all duration-300 shadow-[0_0_20px_rgba(136,217,206,0.2)]">
        <CardHeader className="pb-2 border-b border-[#C1EDEA]/50">
          <CardTitle className="text-xl text-[#264E46] flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-[#88D9CE] glow-text" />
              Recent Notes
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-[#264E46] hover:text-[#88D9CE] hover:bg-[#F5F7FA]/50"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">New Note</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {isLoading ? (
            <div className="text-center py-6 text-[#A8A29E]">
              <p>Loading recent notes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-[#A8A29E]">
              <p>Error loading notes. Please try again.</p>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-6 text-[#A8A29E]">
              <p>No recent notes found</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 text-[#88D9CE]"
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
                  <div className="p-3 rounded-lg border border-[#C1EDEA] bg-white hover:bg-[#F5F7FA] hover:shadow-[0_0_10px_rgba(136,217,206,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-[#404040]">{note.title}</h4>
                        <div className="mt-1 text-xs text-[#A8A29E] line-clamp-2">
                          {note.snippet || 'No content'}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-[#A8A29E]">
                          <Clock className="h-3 w-3 mr-1 text-[#88D9CE]" />
                          <span>{formatTime(note.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-[#F5F7FA] text-[#264E46] border-[#C1EDEA]"
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
        <CardFooter className="pt-1 pb-2 border-t border-[#C1EDEA]/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#264E46] hover:text-[#88D9CE] w-full justify-center text-xs"
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
