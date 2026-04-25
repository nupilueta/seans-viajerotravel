import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';

export default function ExportTasksDialog({ open, onOpenChange, tasks }) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleExport = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = tasks.filter(t => {
      // Filter by due_date; fall back to created_date if no due_date
      const dateStr = t.due_date || t.created_date;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    });

    if (filtered.length === 0) {
      alert('No tasks found in the selected date range.');
      return;
    }

    const rows = filtered.map(t => ({
      'Task ID': t.task_id || '',
      'Client Name': t.client_name || '',
      'Client ID': t.client_id || '',
      'Service Type': t.service_type || '',
      'Description': t.description || '',
      'Assigned To': t.assigned_to || '',
      'Start Date': t.start_date || '',
      'Due Date': t.due_date || '',
      'Status': t.status || '',
      'Priority': t.priority || '',
      'Payment Status': t.payment_status || '',
      'Quoted Amount': t.quoted_amount ?? '',
      'Paid Amount': t.paid_amount ?? '',
      'Balance': t.balance ?? '',
      'Progress (%)': t.progress ?? '',
      'Notes': t.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    const fileName = `tasks_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Export Tasks to Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Tasks will be filtered by <strong>Due Date</strong> within the selected range.</p>
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}