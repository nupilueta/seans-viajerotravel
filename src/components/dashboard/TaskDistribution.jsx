import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
  failed: '#ef4444',
  paused: '#64748b',
};

export default function TaskDistribution({ tasks }) {
  const counts = {};
  tasks.forEach(t => {
    counts[t.status] = (counts[t.status] || 0) + 1;
  });
  const data = Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">Task Distribution</h3>
      {data.length > 0 ? (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={STATUS_COLORS[entry.name.replace(/ /g, '_')] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {data.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[d.name.replace(/ /g, '_')] || '#94a3b8' }}
                />
                <span className="capitalize text-muted-foreground">{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">
          No tasks yet
        </div>
      )}
    </Card>
  );
}