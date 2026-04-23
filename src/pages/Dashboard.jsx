import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ListTodo, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';
import MetricCard from '../components/shared/MetricCard';
import SystemOverviewChart from '../components/dashboard/SystemOverviewChart';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import TaskDistribution from '../components/dashboard/TaskDistribution';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const { data: systems = [], isLoading: loadingSystems } = useQuery({
    queryKey: ['systems'],
    queryFn: () => base44.entities.MonitoredSystem.list('-created_date', 100),
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
  });

  const isLoading = loadingTasks || loadingSystems || loadingAlerts;

  const activeTasks = tasks.filter(t => t.status === 'in_progress').length;
  const healthySystems = systems.filter(s => s.status === 'healthy').length;
  const activeAlerts = alerts.filter(a => !a.is_resolved).length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor your infrastructure at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Tasks"
          value={activeTasks}
          subtitle={`${tasks.length} total`}
          icon={ListTodo}
        />
        <MetricCard
          title="Systems Healthy"
          value={`${healthySystems}/${systems.length}`}
          subtitle="Monitored systems"
          icon={Server}
        />
        <MetricCard
          title="Active Alerts"
          value={activeAlerts}
          subtitle={activeAlerts > 0 ? 'Needs attention' : 'All clear'}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Completed"
          value={completedTasks}
          subtitle="Tasks done"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemOverviewChart systems={systems} />
        <TaskDistribution tasks={tasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAlerts alerts={alerts} />
      </div>
    </div>
  );
}