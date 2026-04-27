import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import TravelTaskFormDialog from '@/components/travel/TravelTaskFormDialog';
import TravelTaskTable from '@/components/travel/TravelTaskTable';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import ExportTasksDialog from '@/components/travel/ExportTasksDialog';

const STATUSES = ['All', 'Not Started', 'In Progress', 'Waiting for Client', 'Submitted', 'Completed', 'Cancelled'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const SERVICE_TYPES = ['All', 'Visa Processing', 'Airline Ticket', 'Tour Package', 'Hotel Booking', 'Travel Insurance', 'Receipt', 'Credit Card Payment', 'Customer Booking', 'Customer Inquiries', 'Partner Coordination', 'Flight Reservation', 'Other'];

export default function TravelTasks() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [sortField, setSortField] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
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
    onSuccess: (created, variables) => {
      qc.invalidateQueries({ queryKey: ['travel-tasks'] });
      logActivity('created', { ...variables, id: created?.id });
    },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TravelTask.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-tasks'] }),
  });
  const deleteMut = useMutation({
    mutationFn: id => base44.entities.TravelTask.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-tasks'] }),
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedAndFiltered = tasks
    .filter(t => {

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
    })
    .sort((a, b) => {
      if (sortField === 'task_id') {
        const aNum = parseInt((a.task_id || '').replace('T-', ''), 10) || 0;
        const bNum = parseInt((b.task_id || '').replace('T-', ''), 10) || 0;
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }
      if (sortField === 'client_name') {
        const getSurname = name => (name || '').trim().split(' ').pop().toLowerCase();
        const aVal = getSurname(a.client_name);
        const bVal = getSurname(b.client_name);
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
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

    if (action === 'updated' && oldTask) {
      const PAYMENT_FIELDS = ['payment_status', 'quoted_amount', 'paid_amount', 'balance'];
      const TRACKED_FIELDS = [
        'status', 'description', 'assigned_to', 'due_date', 'start_date',
        'priority', 'service_type', 'client_name', 'notes', 'progress',
        ...PAYMENT_FIELDS,
      ];

      let anyLogged = false;
      for (const field of TRACKED_FIELDS) {
        const oldVal = String(oldTask[field] ?? '');
        const newVal = String(form[field] ?? '');
        if (oldVal !== newVal) {
          const isPayment = PAYMENT_FIELDS.includes(field);
          base44.entities.TaskActivity.create({
            ...baseLog,
            action: field === 'status' ? 'status_changed' : isPayment ? 'payment_changed' : 'updated',
            field_changed: field,
            old_value: oldVal || '—',
            new_value: newVal || '—',
          });
          anyLogged = true;
        }
      }
      // If nothing changed, still log a generic update
      if (!anyLogged) {
        base44.entities.TaskActivity.create(baseLog);
      }
    } else {
      base44.entities.TaskActivity.create(baseLog);
    }
  };

  const handleSave = (form) => {
    const { id, ...payload } = form;
    if (editing) {
      logActivity('updated', form, editing);
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-muted-foreground text-sm">{sortedAndFiltered.length} of {tasks.length} tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
            <Download className="w-4 h-4" /> Export Excel
          </Button>
          <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
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

      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground text-xs">Sort by:</span>
        {[
          { label: 'Task ID', field: 'task_id' },
          { label: 'Client', field: 'client_name' },
          { label: 'Start Date', field: 'start_date' },
          { label: 'Due Date', field: 'due_date' },
        ].map(({ label, field }) => (
          <Button
            key={field}
            variant={sortField === field ? 'default' : 'outline'}
            size="sm"
            className="gap-1 h-7 text-xs"
            onClick={() => toggleSort(field)}
          >
            {label}
            {sortField === field
              ? sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
              : <ArrowUpDown className="w-3 h-3 opacity-40" />}
          </Button>
        ))}
      </div>

      <TravelTaskTable
        tasks={sortedAndFiltered}
        isLoading={isLoading}
        onEdit={(task) => { setEditing(task); setDialogOpen(true); }}
        onDelete={(id) => { setDeleteTarget(id); setDeleteConfirmOpen(true); }}
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
        tasks={tasks}
        onSave={handleSave}
        isAdmin={true}
      />

      <ExportTasksDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        tasks={tasks}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={() => {
          deleteMut.mutate(deleteTarget);
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        isLoading={deleteMut.isPending}
      />
    </div>
  );
}