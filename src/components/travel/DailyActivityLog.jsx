import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { User, ArrowRight } from 'lucide-react';

const ACTION_STYLES = {
  created: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  updated: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  status_changed: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  payment_changed: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
};

export default function DailyActivityLog() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [staffFilter, setStaffFilter] = useState('All');

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['taskActivity', selectedDate],
    queryFn: () => base44.entities.TaskActivity.filter({ activity_date: selectedDate }, '-created_date', 200),
  });

  // All unique staff names for filter
  const allStaff = ['All', ...Array.from(new Set(activities.map(a => a.staff_name).filter(Boolean))).sort()];

  // Filtered activities
  const filtered = staffFilter === 'All' ? activities : activities.filter(a => a.staff_name === staffFilter);

  // Summary per staff
  const staffSummary = activities.reduce((acc, a) => {
    if (!acc[a.staff_name]) acc[a.staff_name] = { created: 0, updated: 0, status_changed: 0, payment_changed: 0, total: 0 };
    acc[a.staff_name][a.action] = (acc[a.staff_name][a.action] || 0) + 1;
    acc[a.staff_name].total += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Date picker + staff filter */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-foreground">Date</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-44"
        />
        <label className="text-sm font-medium text-foreground ml-2">Staff</label>
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {allStaff.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} activities</span>
      </div>

      {/* Staff summary cards */}
      {Object.keys(staffSummary).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Staff Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(staffSummary).sort((a, b) => b[1].total - a[1].total).map(([staff, counts]) => (
              <Card key={staff} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{staff}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{counts.total}</div>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {counts.created > 0 && <div>{counts.created} created</div>}
                    {counts.updated > 0 && <div>{counts.updated} updated</div>}
                    {counts.status_changed > 0 && <div>{counts.status_changed} status changed</div>}
                    {counts.payment_changed > 0 && <div>{counts.payment_changed} payment changed</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Activity log */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Activity Log</h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No activity recorded for this date
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Staff</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Task</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {a.created_date ? format(new Date(a.created_date), 'h:mm a') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-xs">{a.staff_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${ACTION_STYLES[a.action] || ''}`}>
                        {a.action?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{a.task_code || '—'}</td>
                    <td className="px-4 py-3 text-xs">{a.client_name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {a.field_changed && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-foreground">{a.field_changed}:</span>
                          {a.old_value && <><span>{a.old_value}</span><ArrowRight className="w-3 h-3" /></>}
                          <span>{a.new_value}</span>
                        </span>
                      )}
                      {!a.field_changed && a.description && <span className="line-clamp-1">{a.description}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}