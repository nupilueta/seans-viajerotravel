import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Users, ClipboardList, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = {
  'Completed': '#10b981',
  'In Progress': '#3b82f6',
  'Not Started': '#94a3b8',
  'Waiting for Client': '#f59e0b',
  'Submitted': '#8b5cf6',
  'Cancelled': '#ef4444',
};

export default function TravelDashboard() {
  const { data: clients = [] } = useQuery({ queryKey: ['travel-clients'], queryFn: () => base44.entities.TravelClient.list() });
  const { data: tasks = [] } = useQuery({ queryKey: ['travel-tasks'], queryFn: () => base44.entities.TravelTask.list() });

  const totalClients = clients.length;
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const overdue = tasks.filter(t => t.overdue_flag === 'Overdue').length;

  // Status distribution
  const statusCounts = {};
  tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Staff workload
  const staffLoad = {};
  tasks.filter(t => t.status !== 'Completed').forEach(t => {
    const names = (t.assigned_to || '').split(',').map(n => n.trim()).filter(Boolean);
    names.forEach(n => { staffLoad[n] = (staffLoad[n] || 0) + 1; });
  });
  const barData = Object.entries(staffLoad).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Service type breakdown
  const serviceCounts = {};
  tasks.forEach(t => { serviceCounts[t.service_type || 'Other'] = (serviceCounts[t.service_type || 'Other'] || 0) + 1; });
  const serviceData = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recent tasks
  const recentTasks = [...tasks].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  const metrics = [
    { label: 'Total Clients', value: totalClients, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Tasks', value: totalTasks, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Completion Rate', value: totalTasks ? `${Math.round((completed / totalTasks) * 100)}%` : '0%', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of all clients and tasks</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff Workload */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Active Tasks by Staff</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data</div>}
        </Card>

        {/* Task Status Pie */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Task Status</h3>
          {pieData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] || '#94a3b8' }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data</div>}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top Service Types</h3>
          <div className="space-y-2">
            {serviceData.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{name}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${(count / tasks.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Tasks</h3>
            <Link to="/travel/tasks" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {recentTasks.map(t => (
              <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.description}</p>
                  <p className="text-muted-foreground">{t.client_name} · {t.assigned_to}</p>
                </div>
                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: (STATUS_COLORS[t.status] || '#94a3b8') + '30', color: STATUS_COLORS[t.status] || '#94a3b8' }}>
                  {t.status}
                </span>
              </div>
            ))}
            {recentTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}