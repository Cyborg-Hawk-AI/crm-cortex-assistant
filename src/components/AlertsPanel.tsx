
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { criticalAlerts } from "@/utils/mockData";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function AlertsPanel() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-neon-red shadow-[0_0_8px_rgba(255,51,102,0.5)]';
      case 'high':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-neon-yellow shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      case 'medium':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400';
      case 'low':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-neon-blue';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-400';
    }
  };

  return (
    <Card className="border-2 border-neon-red/70 bg-gradient-to-br from-red-900/50 to-red-800/70 shadow-lg hover:shadow-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,51,102,0.2)]">
      <CardHeader className="pb-2 border-b border-red-500/50">
        <CardTitle className="text-xl text-white flex items-center">
          <AlertCircle className="mr-2 h-6 w-6 text-neon-red glow-text" />
          Critical Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 grid-pattern">
        {criticalAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, x: 3 }}
            className="p-3 rounded-lg border-2 border-red-500/70 bg-gradient-to-r from-red-900/50 to-red-800/70 shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-white">{alert.title}</h4>
                <p className="text-sm text-white/90 mt-1">{alert.description}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-white/80">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-neon-red hover:bg-red-950/80 hover:text-neon-red shadow-[0_0_10px_rgba(255,51,102,0.2)]">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-white/90">
              Client: <span className="text-white">{alert.clientName}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
