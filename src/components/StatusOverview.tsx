
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { criticalAlerts, mockTickets, upcomingMeetings } from "@/utils/mockData";
import { motion } from "framer-motion";
import { isToday } from "date-fns";

export function StatusOverview() {
  // Calculate counts
  const todayMeetingsCount = upcomingMeetings.filter(meeting => {
    const today = new Date();
    const meetingDate = new Date(meeting.date);
    return isToday(meetingDate);
  }).length;
  
  // Calculate missions without mindboard notes
  const missionsWithoutNotes = mockTickets.filter(ticket => 
    !ticket.comments || ticket.comments.length === 0
  ).length;
  
  // Calculate time since last mission update (in hours)
  const lastUpdateTimes = mockTickets.map(ticket => new Date(ticket.updated).getTime());
  const mostRecentUpdate = Math.max(...lastUpdateTimes);
  const hoursSinceUpdate = Math.floor((Date.now() - mostRecentUpdate) / (1000 * 60 * 60));
  
  // Daily action score (sample value)
  const dailyActionScore = 82;

  const statuses = [
    {
      name: "Today's SyncUps",
      value: todayMeetingsCount,
      icon: <Clock className="h-6 w-6 text-neon-blue glow-text" />,
      bgColor: "bg-gradient-to-r from-blue-900/60 to-blue-800/80",
      textColor: "text-white",
      borderColor: "border-neon-blue",
      glowColor: "shadow-[0_0_15px_rgba(14,165,233,0.4)]"
    },
    {
      name: "Missions w/o Notes",
      value: missionsWithoutNotes,
      icon: <AlertTriangle className="h-6 w-6 text-orange-400 glow-text" />,
      bgColor: "bg-gradient-to-r from-orange-900/60 to-orange-700/80",
      textColor: "text-white",
      borderColor: "border-orange-400",
      glowColor: "shadow-[0_0_15px_rgba(249,115,22,0.4)]"
    },
    {
      name: "Hours Since Update",
      value: hoursSinceUpdate,
      icon: <AlertCircle className="h-6 w-6 text-neon-purple glow-text" />,
      bgColor: "bg-gradient-to-r from-purple-900/60 to-purple-800/80",
      textColor: "text-white",
      borderColor: "border-neon-purple",
      glowColor: "shadow-[0_0_15px_rgba(168,85,247,0.4)]"
    },
    {
      name: "Daily Action Score",
      value: dailyActionScore,
      icon: <CheckCircle className="h-6 w-6 text-neon-green glow-text" />,
      bgColor: "bg-gradient-to-r from-green-900/60 to-green-800/80",
      textColor: "text-white", 
      borderColor: "border-neon-green",
      glowColor: "shadow-[0_0_15px_rgba(16,185,129,0.4)]"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {statuses.map((status, index) => (
        <motion.div
          key={status.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.03 }}
        >
          <Card className={`${status.bgColor} border-2 ${status.borderColor} ${status.glowColor} hover:${status.glowColor.replace('0.4', '0.7')} transition-all duration-300`}>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-black/40 p-3 rounded-full shadow-inner border border-white/20">
                {status.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">{status.name}</p>
                <p className={`text-2xl font-bold ${status.textColor} glow-text`}>{status.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
