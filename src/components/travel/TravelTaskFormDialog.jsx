import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';

const DEFAULTS = {
  task_id: '', client_id: '', client_name: '', client_contact: '',
  service_type: '', description: '', assigned_to: '',
  start_date: '', due_date: '', status: 'Not Started', priority: 'High',
  payment_status: '', quoted_amount: '', paid_amount: '', balance: '', notes: '', progress: 0,
};

// Fallback defaults in case settings haven't loaded
const DEFAULT_STAFF = ['JUN', 'NORBY', 'GEMMA', 'KAITO', 'ALDRIN', 'NICHOLE', 'RED', 'RHONA', 'RONIE', 'LENY'];
const DEFAULT_STATUSES = ['Not Started', 'In Progress', 'Waiting for Client', 'Submitted', 'Completed', 'Cancelled'];
const DEFAULT_PRIORITIES = ['High', 'Medium', 'Low'];
const DEFAULT_SERVICE_TYPES = ['Visa Processing', 'Airline Ticket', 'Tour Package', 'Hotel Booking', 'Travel Insurance', 'Receipt', 'Credit Card Payment', 'Other'];
const DEFAULT_PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid', 'With Balance', 'Accounts Receivable', 'Not Applicable'];

export default function TravelTaskFormDialog({ open, onOpenChange, task, clients = [], tasks = [], onSave, isAdmin }) {
  const [form, setForm] = useState(DEFAULTS);
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const { data: allSettings = [] } = useQuery({
    queryKey: ['taskSettings'],
    queryFn: () => base44.entities.TaskSettings.list('sort_order', 200),
  });

  const getOptions = (type, fallback) => {
    const items = allSettings.filter(s => s.setting_type === type && s.is_active).map(s => s.value);
    return items.length > 0 ? items : fallback;
  };

  const STAFF = getOptions('staff', DEFAULT_STAFF);
  const STATUSES = getOptions('status', DEFAULT_STATUSES);
  const PRIORITIES = getOptions('priority', DEFAULT_PRIORITIES);
  const SERVICE_TYPES = getOptions('service_type', DEFAULT_SERVICE_TYPES);
  const PAYMENT_STATUSES = getOptions('payment_status', DEFAULT_PAYMENT_STATUSES);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        ...DEFAULTS,
        ...task,
        id: task.id, // always preserve the real database ID
        quoted_amount: task.quoted_amount ?? '',
        paid_amount: task.paid_amount ?? '',
        balance: task.balance ?? '',
      });
      setClientSearch(task.client_name || '');
    } else {
      setClientSearch('');
      setForm({ ...DEFAULTS });
      // Auto-generate next task ID - fetch all tasks to find the true max
      base44.entities.TravelTask.list('task_id', 2000).then(allTasks => {
        const nums = allTasks
          .map(t => t.task_id)
          .filter(c => /^T-\d+$/.test(c))
          .map(c => parseInt(c.replace('T-', ''), 10));
        const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
        const nextId = `T-${String(nextNum).padStart(4, '0')}`;
        setForm(f => ({ ...f, task_id: nextId }));
      });
    }
  }, [open, task?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleClientSelect = (client) => {
    setForm(f => ({
      ...f,
      client_id: client.code || client.id,
      client_name: client.full_name || `${client.first_name} ${client.last_name}`,
    }));
    setClientSearch(client.full_name || `${client.first_name} ${client.last_name}`);
    setShowClientDropdown(false);
  };

  const filteredClients = clientSearch.length > 0
    ? clients.filter(c => {
        const q = clientSearch.toLowerCase();
        return (c.full_name || '').toLowerCase().includes(q) ||
               (c.code || '').toLowerCase().includes(q) ||
               (c.first_name || '').toLowerCase().includes(q) ||
               (c.last_name || '').toLowerCase().includes(q);
      }).slice(0, 10)
    : [];

  // Duplicate detection: same client_id AND same description (trimmed, case-insensitive)
  const duplicateTask = form.client_id && form.description
    ? tasks.find(t =>
        t.id !== task?.id &&
        t.client_id === form.client_id &&
        (t.description || '').trim().toLowerCase() === (form.description || '').trim().toLowerCase()
      )
    : null;

  const handleSave = () => {
    const { id, created_date, updated_date, created_by, entity_name, app_id, ...formData } = form;
    const payload = {
      ...formData,
      quoted_amount: formData.quoted_amount !== '' && formData.quoted_amount != null ? Number(formData.quoted_amount) : undefined,
      paid_amount: formData.paid_amount !== '' && formData.paid_amount != null ? Number(formData.paid_amount) : undefined,
      balance: formData.balance !== '' && formData.balance != null ? Number(formData.balance) : undefined,
      progress: Number(formData.progress) || 0,
    };
    if (task) {
      payload.id = id;
    }
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Task ID */}
          <div>
            <Label>Task ID</Label>
            <Input value={form.task_id} onChange={e => set('task_id', e.target.value)} placeholder="T-0001" />
          </div>

          {/* Client search */}
          <div>
            <Label>Client</Label>
            <div className="relative">
              <Input
                value={clientSearch}
                onChange={e => { setClientSearch(e.target.value); setShowClientDropdown(true); set('client_id', ''); set('client_name', e.target.value); }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Search by name or code..."
              />
              {showClientDropdown && filteredClients.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredClients.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex gap-2"
                      onMouseDown={() => handleClientSelect(c)}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                      <span>{c.full_name || `${c.first_name} ${c.last_name}`}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.client_id && <p className="text-xs text-muted-foreground mt-1">ID: {form.client_id}</p>}
          </div>

          {/* Duplicate warning */}
          {duplicateTask && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-600 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Possible duplicate: <strong>{duplicateTask.task_id}</strong> has the same client and description.</span>
            </div>
          )}

          {/* Service & Description */}
          <div>
            <Label>Service Type</Label>
            <Select value={form.service_type} onValueChange={v => set('service_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Task Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the task..." className="h-24" />
          </div>

          {/* Assignment */}
          <div>
            <Label>Assigned To</Label>
            <Select value={form.assigned_to} onValueChange={v => set('assigned_to', v)}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {STAFF.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {form.start_date ? format(parseISO(form.start_date), 'MMM d, yyyy') : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.start_date ? parseISO(form.start_date) : undefined}
                    onSelect={d => set('start_date', d ? format(d, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {form.due_date ? format(parseISO(form.due_date), 'MMM d, yyyy') : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.due_date ? parseISO(form.due_date) : undefined}
                    onSelect={d => set('due_date', d ? format(d, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status, Priority, Progress */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Progress ({form.progress}%)</Label>
              <Input type="number" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)} />
            </div>
          </div>

          {/* Payment (admin only) */}
          {isAdmin && (
            <>
              <div>
                <Label>Payment Status</Label>
                <Select value={form.payment_status || ''} onValueChange={v => set('payment_status', v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{PAYMENT_STATUSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Quoted Amount</Label>
                  <Input type="number" value={form.quoted_amount} onChange={e => set('quoted_amount', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Paid Amount</Label>
                  <Input type="number" value={form.paid_amount} onChange={e => set('paid_amount', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Balance</Label>
                  <Input type="number" value={form.balance} onChange={e => set('balance', e.target.value)} placeholder="0.00" />
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." className="h-20" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.description}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}