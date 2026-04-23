import React from 'react';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function RecentAlerts({ alerts }) {
  const recent = alerts.filter(a => !a.is_resolved).slice(0, 5);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Active Alerts</h3>
        <Link to="/alerts" className="text-xs text-primary hover:underline">View all</Link>
      </div>
      {recent.length > 0 ? (
        <div className="space-y-3">
          {recent.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Bell className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{alert.title}</p>
                  <StatusBadge status={alert.severity} />
                </div>
                <p className="text-xs text-muted-foreground truncate">{alert.source}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {format(new Date(alert.created_date), 'HH:mm')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
          No active alerts
        </div>
      )}
    </Card>
  );
}