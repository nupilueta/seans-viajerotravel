import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import SystemCard from '../components/systems/SystemCard';
import SystemFormDialog from '../components/systems/SystemFormDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Systems() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: systems = [], isLoading } = useQuery({
    queryKey: ['systems'],
    queryFn: () => base44.entities.MonitoredSystem.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MonitoredSystem.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['systems'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MonitoredSystem.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['systems'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MonitoredSystem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['systems'] }),
  });

  const handleSave = (systemData) => {
    if (editingSystem) {
      updateMutation.mutate({ id: editingSystem.id, data: systemData });
    } else {
      createMutation.mutate(systemData);
    }
    setEditingSystem(null);
  };

  const handleEdit = (system) => {
    setEditingSystem(system);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingSystem(null);
    setDialogOpen(true);
  };

  const filtered = systems.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Systems</h1>
          <p className="text-sm text-muted-foreground mt-1">{systems.length} monitored systems</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add System
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search systems..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['healthy', 'warning', 'critical', 'offline', 'maintenance'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(system => (
            <SystemCard
              key={system.id}
              system={system}
              onEdit={handleEdit}
              onDelete={(s) => deleteMutation.mutate(s.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No systems found</p>
        </div>
      )}

      <SystemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        system={editingSystem}
        onSave={handleSave}
      />
    </div>
  );
}