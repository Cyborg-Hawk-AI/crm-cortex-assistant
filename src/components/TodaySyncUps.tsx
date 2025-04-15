
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Users, ArrowRight, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';
import { MeetingCreateModal } from '@/components/modals/MeetingCreateModal';
import { Meeting } from '@/utils/types';
import { useMeetings } from '@/hooks/useMeetings';

export function TodaySyncUps() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { meetings, createMeeting, isLoading } = useMeetings();

  // Filter meetings to only show today's
  const todaysMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.created_at || meeting.date);
    return isToday(meetingDate);
  });

  const handleCreateMeeting = (meetingData: Partial<Meeting>) => {
    createMeeting(meetingData);
  };

  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'h:mm a');
  };

  return (
    <>
      <Card className="border border-neon-blue/70 bg-gradient-to-br from-blue-900/50 to-blue-800/70 shadow-lg hover:shadow-xl transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
        <CardHeader className="pb-2 border-b border-blue-500/50">
          <CardTitle className="text-xl text-white flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-neon-blue glow-text" />
              Today's SyncUps
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-neon-blue hover:text-neon-blue/80 hover:bg-[#3A4D62]/50"
              onClick={() => setShowCreateModal(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Schedule</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {isLoading ? (
            <div className="text-center py-6 text-[#CBD5E1]">
              <p>Loading SyncUps...</p>
            </div>
          ) : todaysMeetings.length === 0 ? (
            <div className="text-center py-6 text-[#CBD5E1]">
              <p>No SyncUps scheduled for today</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 text-neon-blue"
                onClick={() => setShowCreateModal(true)}
              >
                Schedule a SyncUp
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="p-3 rounded-lg border border-[#3A4D62] bg-[#1C2A3A]/70 hover:bg-[#1C2A3A] hover:shadow-[0_0_10px_rgba(14,165,233,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-[#F1F5F9]">{meeting.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-[#CBD5E1]">
                          <Clock className="h-3 w-3 mr-1 text-neon-blue" />
                          <span>
                            {formatTime(meeting.created_at || meeting.date)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-[#CBD5E1]">
                          <Users className="h-3 w-3 mr-1 text-neon-blue" />
                          <span>{meeting.client_name}</span>
                        </div>
                        
                        {meeting.meeting_link && (
                          <div className="flex items-center mt-2 space-x-2">
                            <a
                              href={meeting.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neon-blue underline flex items-center text-xs"
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Join SyncUp
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs border-neon-purple/30 hover:border-neon-purple/50"
                              onClick={() => console.log('View summary clicked for:', meeting.id)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View Summary
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {meeting.attendees && (
                        <Badge variant="outline" className="text-xs bg-neon-blue/10 text-neon-blue border-neon-blue/20">
                          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    {meeting.agenda && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-neon-blue mb-1">Agenda</h4>
                        <p className="text-xs text-[#CBD5E1] whitespace-pre-line line-clamp-2">
                          {meeting.agenda}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-1 pb-2 border-t border-blue-500/50">
          <Button variant="ghost" size="sm" className="text-neon-blue hover:text-neon-blue/80 w-full justify-center text-xs">
            View All SyncUps <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      <MeetingCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateMeeting}
      />
    </>
  );
}
