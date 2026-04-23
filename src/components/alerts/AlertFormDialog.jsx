import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaults = { title: '', message: '', severity: 'info', source: '', is_resolved: false };

export default function AlertFormDialog({ open, onOpenChange, alert, onSave }) {
  const [form, setForm] = useState(alert || defaults);

  React.useEffect(() => {
    if (open) setForm(alert || defaults);
  }, [open, alert]);

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{alert ? 'Edit Alert' : 'New Alert'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Alert title" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Details..." className="h-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={v => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['info', 'warning', 'error', 'critical'].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source</Label>
              <Input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="System name" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}