import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Settings2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DailyActivityLog from '@/components/travel/DailyActivityLog';

const CATEGORIES = [
  { key: 'staff', label: 'Staff Names' },
  { key: 'status', label: 'Task Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'payment_status', label: 'Payment Status' },
  { key: 'service_type', label: 'Service Types' },
];

const TABS = [
  { key: 'settings', label: 'Dropdown Settings', icon: Settings2 },
  { key: 'activity', label: 'Daily Activity', icon: Activity },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('settings');
  const [newValues, setNewValues] = useState({});

  const { data: settings = [] } = useQuery({
    queryKey: ['taskSettings'],
    queryFn: () => base44.entities.TaskSettings.list('sort_order', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskSettings.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taskSettings'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TaskSettings.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taskSettings'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.TaskSettings.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taskSettings'] }),
  });

  const handleAdd = (type) => {
    const val = (newValues[type] || '').trim();
    if (!val) return;
    const existing = settings.filter(s => s.setting_type === type);
    createMutation.mutate({
      setting_type: type,
      value: val,
      sort_order: existing.length + 1,
      is_active: true,
    });
    setNewValues(prev => ({ ...prev, [type]: '' }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage dropdown options and view staff activity</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Dropdown Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map(({ key, label }) => {
            const items = settings.filter(s => s.setting_type === key).sort((a, b) => a.sort_order - b.sort_order);
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span
                        className={`flex-1 text-sm px-2 py-1 rounded cursor-pointer select-none transition-opacity ${!item.is_active ? 'line-through text-muted-foreground opacity-50' : ''}`}
                        onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}
                        title="Click to toggle active/inactive"
                      >
                        {item.value}
                      </span>
                      {!item.is_active && <Badge variant="outline" className="text-[10px] shrink-0">Inactive</Badge>}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive shrink-0"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Input
                      className="h-8 text-sm"
                      placeholder={`Add ${label.toLowerCase()}...`}
                      value={newValues[key] || ''}
                      onChange={e => setNewValues(prev => ({ ...prev, [key]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAdd(key)}
                    />
                    <Button size="sm" className="h-8 px-2" onClick={() => handleAdd(key)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Daily Activity Tab */}
      {activeTab === 'activity' && <DailyActivityLog />}
    </div>
  );
}