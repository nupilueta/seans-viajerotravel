import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';

export default function ExportClientsDialog({ open, onOpenChange, clients }) {
  const [sortBy, setSortBy] = useState('code'); // 'code' or 'last_name'

  const handleExport = () => {
    const sorted = [...clients].sort((a, b) => {
      if (sortBy === 'last_name') {
        return (a.last_name || '').localeCompare(b.last_name || '');
      }
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true });
    });

    const rows = sorted.map(c => ({
      'CL No.': c.code || '',
      'Title': c.title || '',
      'First Name': c.first_name || '',
      'Middle Name': c.middle_name || '',
      'Last Name': c.last_name || '',
      'Full Name': c.full_name || '',
      'Sex': c.sex || '',
      'Birthday': c.birthday || '',
      'Mobile': c.mobile || '',
      'Email': c.email || '',
      'Address': c.address || '',
      'City': c.city || '',
      'Country': c.country || '',
      'Company': c.company || '',
      'Department': c.department || '',
      'Position': c.position || '',
      'Travel Type': c.travel_type || '',
      'Lead Source': c.lead_source || '',
      'Preferred Destination': c.preferred_destination || '',
      'Tags': c.tags || '',
      'Notes': c.notes || '',
      'Passport No.': c.passport_number || '',
      'Passport Expiry': c.passport_expiration || '',
      'US Visa': c.us_visa || '',
      'US Visa Expiry': c.us_visa_expiration || '',
      'Mabuhay Miles': c.mabuhay_miles || '',
      'Emirates ID': c.emirates_id || '',
      'Last Contact Date': c.last_contact_date || '',
      'Next Follow-up Date': c.next_followup_date || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');

    // Auto column widths
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length, ...rows.map(r => String(r[key] || '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    const sortLabel = sortBy === 'code' ? 'by_CL_no' : 'by_last_name';
    XLSX.writeFile(wb, `clients_${sortLabel}.xlsx`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Export Clients to Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block">Sort Order</Label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'code' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setSortBy('code')}
              >
                By CL No.
              </Button>
              <Button
                variant={sortBy === 'last_name' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setSortBy('last_name')}
              >
                By Last Name
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">All {clients.length} clients will be exported.</p>
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