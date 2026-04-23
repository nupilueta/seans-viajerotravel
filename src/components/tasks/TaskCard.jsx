import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import ProgressRing from '../shared/ProgressRing';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const priorityDot = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function TaskCard({ task, onEdit, onDelete }) {
  return (
    <Card className="p-4 group hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <ProgressRing value={task.progress || 0} size={44} strokeWidth={3} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn('w-2 h-2 rounded-full', priorityDot[task.priority])} />
            <h3 className="text-sm font-semibold truncate">{task.title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={task.status} />
            <span className="text-[11px] text-muted-foreground capitalize">{task.category}</span>
            {task.assignee && (
              <span className="text-[11px] text-muted-foreground">• {task.assignee}</span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(task)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}