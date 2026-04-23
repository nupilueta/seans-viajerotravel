import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Bell, CheckCircle2, Trash2 } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import AlertFormDialog from '../components/alerts/AlertFormDialog';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [showResolved, setShowResolved] = useState(false);

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Alert.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Alert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const handleResolve = (alert) => {
    updateMutation.mutate({
      id: alert.id,
      data: { ...alert, is_resolved: true, resolved_at: new Date().toISOString() },
    });
  };

  const filtered = alerts.filter(a => {
    const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchResolved = showResolved || !a.is_resolved;
    return matchSeverity && matchResolved;
  });

  const activeCount = alerts.filter(a => !a.is_resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeCount} active alerts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Alert
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {['info', 'warning', 'error', 'critical'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showResolved ? "default" : "outline"}
          size="sm"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? 'Showing all' : 'Show resolved'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(alert => (
            <Card
              key={alert.id}
              className={cn(
                "p-4 transition-all duration-200",
                alert.is_resolved && "opacity-60"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg mt-0.5",
                  alert.severity === 'critical' ? 'bg-red-500/10' :
                  alert.severity === 'error' ? 'bg-red-500/10' :
                  alert.severity === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                )}>
                  <Bell className={cn(
                    "w-4 h-4",
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'error' ? 'text-red-500' :
                    alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate">{alert.title}</h3>
                    <StatusBadge status={alert.severity} />
                    {alert.is_resolved && <StatusBadge status="completed" className="!text-[10px]" />}
                  </div>
                  {alert.message && <p className="text-xs text-muted-foreground mb-1">{alert.message}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {alert.source && <span>{alert.source}</span>}
                    <span>{format(new Date(alert.created_date), 'MMM d, HH:mm')}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!alert.is_resolved && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500" onClick={() => handleResolve(alert)}>
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(alert.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No alerts found</p>
        </div>
      )}

      <AlertFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(data) => createMutation.mutate(data)}
      />
    </div>
  );
}