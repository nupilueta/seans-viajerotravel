import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Globe, Cpu, HardDrive, Clock } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { cn } from '@/lib/utils';

const typeIcons = {
  server: Cpu,
  database: HardDrive,
  api: Globe,
  service: Globe,
  network: Globe,
  storage: HardDrive,
};

export default function SystemCard({ system, onEdit, onDelete }) {
  const TypeIcon = typeIcons[system.type] || Globe;

  const getUsageColor = (val) => {
    if (val >= 90) return 'text-red-500';
    if (val >= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <Card className="p-5 group hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <TypeIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{system.name}</h3>
            <p className="text-[11px] text-muted-foreground capitalize">{system.type} {system.region && `• ${system.region}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={system.status} />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(system)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(system)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-[10px] text-muted-foreground mb-0.5">Uptime</p>
          <p className="text-sm font-semibold">{system.uptime_percent?.toFixed(1) ?? '—'}%</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-[10px] text-muted-foreground mb-0.5">CPU</p>
          <p className={cn("text-sm font-semibold", getUsageColor(system.cpu_usage))}>{system.cpu_usage ?? '—'}%</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-[10px] text-muted-foreground mb-0.5">Memory</p>
          <p className={cn("text-sm font-semibold", getUsageColor(system.memory_usage))}>{system.memory_usage ?? '—'}%</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <p className="text-[10px] text-muted-foreground mb-0.5">Response</p>
          <p className="text-sm font-semibold">{system.response_time_ms ?? '—'}<span className="text-[10px] text-muted-foreground">ms</span></p>
        </div>
      </div>
    </Card>
  );
}