import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SystemOverviewChart({ systems }) {
  const data = systems.slice(0, 8).map(s => ({
    name: s.name?.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
    cpu: s.cpu_usage || 0,
    memory: s.memory_usage || 0,
  }));

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">System Resource Usage</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="cpu" name="CPU %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="memory" name="Memory %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
          No system data available
        </div>
      )}
    </Card>
  );
}