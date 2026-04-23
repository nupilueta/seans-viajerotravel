import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  // Task statuses
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  paused: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  // System statuses
  healthy: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20',
  offline: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  maintenance: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  // Alert severities
  info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  error: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function StatusBadge({ status, className }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[11px] font-medium capitalize border px-2 py-0.5',
        statusStyles[status] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status?.replace(/_/g, ' ')}
    </Badge>
  );
}