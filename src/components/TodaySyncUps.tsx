
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Users, ArrowRight, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isToday } from 'date-fns';
import { MeetingCreateModal } from '@/components/modals/MeetingCreateModal';
import { JoinSyncUpModal } from '@/components/modals/JoinSyncUpModal';
import { Meeting } from '@/utils/types';
import { useMeetings } from '@/hooks/useMeetings';

export function TodaySyncUps() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { meetings, createMeeting, isLoading } = useMeetings();

  // Filter meetings to only show today's
  const todaysMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    return isToday(meetingDate);
  });

  console.log('Today\'s meetings:', todaysMeetings);

  const handleCreateMeeting = (meetingData: Partial<Meeting>) => {
    createMeeting(meetingData);
  };

  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'h:mm a');
  };

  return (
    <>
      <Card className="border border-[#C1EDEA] bg-gradient-to-br from-white to-[#F5F7FA]/70 shadow-lg hover:shadow-xl transition-all duration-300 shadow-[0_0_20px_rgba(136,217,206,0.2)]">
        <CardHeader className="pb-2 border-b border-[#C1EDEA]/50">
          <CardTitle className="text-xl text-[#264E46] flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-6 w-6 text-[#88D9CE] glow-text" />
              Today's SyncUps
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-[#264E46] hover:text-[#88D9CE] hover:bg-[#F5F7FA]/50"
                onClick={() => setShowJoinModal(true)}
              >
                <Video className="h-4 w-4 mr-1" />
                <span className="text-xs">Join</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-[#264E46] hover:text-[#88D9CE] hover:bg-[#F5F7FA]/50"
                onClick={() => setShowCreateModal(true)}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">Schedule</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {isLoading ? (
            <div className="text-center py-6 text-[#A8A29E]">
              <p>Loading SyncUps...</p>
            </div>
          ) : todaysMeetings.length === 0 ? (
            <div className="text-center py-6 text-[#A8A29E]">
              <p>No SyncUps scheduled for today</p>
              <div className="flex justify-center mt-2 space-x-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-[#88D9CE]"
                  onClick={() => setShowJoinModal(true)}
                >
                  Join a SyncUp
                </Button>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-[#88D9CE]"
                  onClick={() => setShowCreateModal(true)}
                >
                  Schedule a SyncUp
                </Button>
              </div>
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
                  <div className="p-3 rounded-lg border border-[#C1EDEA] bg-white hover:bg-[#F5F7FA] hover:shadow-[0_0_10px_rgba(136,217,206,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-[#404040]">{meeting.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-[#A8A29E]">
                          <Clock className="h-3 w-3 mr-1 text-[#88D9CE]" />
                          <span>
                            {formatTime(meeting.date)}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-[#A8A29E]">
                          <Users className="h-3 w-3 mr-1 text-[#88D9CE]" />
                          <span>{meeting.client_name}</span>
                        </div>
                        
                        {meeting.meeting_link && (
                          <div className="flex items-center mt-2 space-x-2">
                            <a
                              href={meeting.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#88D9CE] underline flex items-center text-xs"
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Join SyncUp
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs border-[#C1EDEA] hover:border-[#88D9CE] text-[#264E46]"
                              onClick={() => console.log('View summary clicked for:', meeting.id)}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View Summary
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {meeting.attendees && (
                        <Badge variant="outline" className="text-xs bg-[#F5F7FA] text-[#264E46] border-[#C1EDEA]">
                          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    {meeting.agenda && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-[#264E46] mb-1">Agenda</h4>
                        <p className="text-xs text-[#A8A29E] whitespace-pre-line line-clamp-2">
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
        <CardFooter className="pt-1 pb-2 border-t border-[#C1EDEA]/50">
          <Button variant="ghost" size="sm" className="text-[#264E46] hover:text-[#88D9CE] w-full justify-center text-xs">
            View All SyncUps <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      <MeetingCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateMeeting}
      />
      
      <JoinSyncUpModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
      />
    </>
  );
}
