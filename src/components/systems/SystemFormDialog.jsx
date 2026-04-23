import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaults = {
  name: '', type: 'server', status: 'healthy', uptime_percent: 99.9,
  cpu_usage: 0, memory_usage: 0, response_time_ms: 0, url: '', region: '',
};

export default function SystemFormDialog({ open, onOpenChange, system, onSave }) {
  const [form, setForm] = useState(system || defaults);

  React.useEffect(() => {
    if (open) setForm(system || defaults);
  }, [open, system]);

  const handleSave = () => {
    onSave({
      ...form,
      uptime_percent: Number(form.uptime_percent),
      cpu_usage: Number(form.cpu_usage),
      memory_usage: Number(form.memory_usage),
      response_time_ms: Number(form.response_time_ms),
      last_checked: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{system ? 'Edit System' : 'Add System'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="System name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['server', 'database', 'api', 'service', 'network', 'storage'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['healthy', 'warning', 'critical', 'offline', 'maintenance'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Region</Label>
              <Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="us-east-1" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label>Uptime %</Label>
              <Input type="number" step="0.1" value={form.uptime_percent} onChange={e => setForm({ ...form, uptime_percent: e.target.value })} />
            </div>
            <div>
              <Label>CPU %</Label>
              <Input type="number" value={form.cpu_usage} onChange={e => setForm({ ...form, cpu_usage: e.target.value })} />
            </div>
            <div>
              <Label>Memory %</Label>
              <Input type="number" value={form.memory_usage} onChange={e => setForm({ ...form, memory_usage: e.target.value })} />
            </div>
            <div>
              <Label>Resp (ms)</Label>
              <Input type="number" value={form.response_time_ms} onChange={e => setForm({ ...form, response_time_ms: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}