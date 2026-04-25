import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function ExportTasksDialog({ open, onOpenChange, tasks }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleExport = () => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = tasks.filter(t => {
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

    const fileName = `tasks_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.xlsx`;
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={d => d && setEndDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
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