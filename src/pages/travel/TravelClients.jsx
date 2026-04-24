import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, Pencil, Trash2, User, Phone, Mail, Building2 } from 'lucide-react';
import ClientFormDialog from '@/components/travel/ClientFormDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';

export default function TravelClients() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const qc = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['travel-clients'],
    queryFn: () => base44.entities.TravelClient.list('code', 500),
  });

  const createMut = useMutation({
    mutationFn: data => base44.entities.TravelClient.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-clients'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TravelClient.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-clients'] }),
  });
  const deleteMut = useMutation({
    mutationFn: id => base44.entities.TravelClient.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-clients'] }),
  });

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q)
    );
  });

  const handleSave = (form) => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: form });
    } else {
      createMut.mutate(form);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">{clients.length} total clients</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, code, email, company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => (
            <Card key={client.id} className="p-4 group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{client.full_name || `${client.first_name} ${client.last_name}`}</p>
                    <p className="text-xs text-muted-foreground">{client.code}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(client); setDialogOpen(true); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setDeleteTarget(client.id); setDeleteConfirmOpen(true); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                {client.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 shrink-0" />
                    <span className="truncate">{client.mobile}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{client.company}{client.department ? ` · ${client.department}` : ''}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {client.travel_type && <Badge variant="outline" className="text-[10px] h-5">{client.travel_type}</Badge>}
                {client.tags && <Badge variant="secondary" className="text-[10px] h-5">{client.tags}</Badge>}
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No clients found
            </div>
          )}
        </div>
      )}

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editing}
        onSave={handleSave}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
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