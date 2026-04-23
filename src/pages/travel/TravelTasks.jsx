import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import TravelTaskFormDialog from '@/components/travel/TravelTaskFormDialog';
import TravelTaskTable from '@/components/travel/TravelTaskTable';

const STATUSES = ['All', 'Not Started', 'In Progress', 'Waiting for Client', 'Submitted', 'Completed', 'Cancelled'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const SERVICE_TYPES = ['All', 'Visa Processing', 'Airline Ticket', 'Tour Package', 'Hotel Booking', 'Travel Insurance', 'Receipt', 'Credit Card Payment', 'Other'];

export default function TravelTasks() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['travel-tasks'],
    queryFn: () => base44.entities.TravelTask.list('-created_date', 500),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['travel-clients'],
    queryFn: () => base44.entities.TravelClient.list(),
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.TravelTask.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-tasks'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TravelTask.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-tasks'] }),
  });
  const deleteMut = useMutation({
    mutationFn: id => base44.entities.TravelTask.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-tasks'] }),
  });

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.client_name || '').toLowerCase().includes(q) ||
      (t.assigned_to || '').toLowerCase().includes(q) ||
      (t.task_id || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchService = serviceFilter === 'All' || t.service_type === serviceFilter;
    return matchSearch && matchStatus && matchPriority && matchService;
  });

  const logActivity = (action, form, oldTask = null) => {
    const today = new Date().toISOString().split('T')[0];
    const staffNames = (form.assigned_to || '').split(',').map(s => s.trim()).filter(Boolean);
    const staff = staffNames[0] || 'Admin';

    const baseLog = {
      task_id: form.id || '',
      task_code: form.task_id || '',
      staff_name: staff,
      action,
      activity_date: today,
      client_name: form.client_name || '',
      description: form.description || '',
    };

    // Log status change specifically
    if (action === 'updated' && oldTask && oldTask.status !== form.status) {
      base44.entities.TaskActivity.create({
        ...baseLog,
        action: 'status_changed',
        field_changed: 'status',
        old_value: oldTask.status,
        new_value: form.status,
      });
    } else {
      base44.entities.TaskActivity.create(baseLog);
    }
  };

  const handleSave = (form) => {
    if (editing) {
      logActivity('updated', form, editing);
      updateMut.mutate({ id: editing.id, data: form });
    } else {
      createMut.mutate(form, {
        onSuccess: (created) => logActivity('created', { ...form, id: created?.id }),
      });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} of {tasks.length} tasks</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <TravelTaskTable
        tasks={filtered}
        isLoading={isLoading}
        onEdit={(task) => { setEditing(task); setDialogOpen(true); }}
        onDelete={(id) => deleteMut.mutate(id)}
        onStatusChange={(task, status) => {
          const today = new Date().toISOString().split('T')[0];
          const staff = (task.assigned_to || '').split(',')[0].trim() || 'Admin';
          base44.entities.TaskActivity.create({ task_id: task.id, task_code: task.task_id || '', staff_name: staff, action: 'status_changed', field_changed: 'status', old_value: task.status, new_value: status, activity_date: today, client_name: task.client_name || '', description: task.description || '' });
          updateMut.mutate({ id: task.id, data: { ...task, status } });
        }}
        isAdmin={true}
      />

      <TravelTaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        clients={clients}
        onSave={handleSave}
        isAdmin={true}
      />
    </div>
  );
}