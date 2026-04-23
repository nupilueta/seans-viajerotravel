import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const STATUS_STYLES = {
  'Completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Not Started': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'Waiting for Client': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Submitted': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Cancelled': 'bg-red-500/15 text-red-400 border-red-500/30',
};

const PRIORITY_STYLES = {
  'High': 'bg-red-500/15 text-red-400',
  'Medium': 'bg-amber-500/15 text-amber-400',
  'Low': 'bg-green-500/15 text-green-400',
};

const STATUSES = ['Not Started', 'In Progress', 'Waiting for Client', 'Submitted', 'Completed', 'Cancelled'];

function safeDate(d) {
  if (!d) return '';
  try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; }
}

export default function TravelTaskTable({ tasks, isLoading, onEdit, onDelete, onStatusChange, isAdmin }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">No tasks found</div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Task ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Service</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Assigned To</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Priority</th>
              {isAdmin && <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Payment</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{task.task_id || '—'}</td>
                <td className="px-4 py-3">
                  <div className="max-w-[140px]">
                    <p className="font-medium text-xs truncate">{task.client_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{task.client_id}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">{task.service_type || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs max-w-[200px] line-clamp-2 leading-relaxed">{task.description}</p>
                </td>
                <td className="px-4 py-3 text-xs">{task.assigned_to || '—'}</td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">{safeDate(task.due_date)}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`text-[10px] px-2 py-1 rounded-full border font-medium cursor-pointer hover:opacity-80 ${STATUS_STYLES[task.status] || ''}`}>
                        {task.status}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {STATUSES.map(s => (
                        <DropdownMenuItem key={s} onClick={() => onStatusChange(task, s)}>
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority] || ''}`}>
                    {task.priority}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-xs">
                    {task.payment_status && (
                      <span className="bg-muted px-2 py-0.5 rounded-full text-[10px]">{task.payment_status}</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(task)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    {isAdmin && onDelete && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(task.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {tasks.map(task => (
          <div key={task.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{task.description}</p>
                <p className="text-xs text-muted-foreground">{task.client_name}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
                  {STATUSES.map(s => (
                    <DropdownMenuItem key={s} onClick={() => onStatusChange(task, s)}>
                      Mark: {s}
                    </DropdownMenuItem>
                  ))}
                  {isAdmin && onDelete && (
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>Delete</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[task.status] || ''}`}>{task.status}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority] || ''}`}>{task.priority}</span>
              {task.service_type && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{task.service_type}</span>}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{task.assigned_to || 'Unassigned'}</span>
              <span>{safeDate(task.due_date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}