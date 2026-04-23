import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DEFAULTS = {
  code: '', title: '', first_name: '', middle_name: '', last_name: '', full_name: '',
  sex: '', birthday: '', mobile: '', email: '', address: '', city: '', country: '',
  company: '', department: '', position: '',
  passport_number: '', passport_expiration: '',
  travel_type: '', preferred_destination: '', lead_source: '',
  preferred_contact: '', tags: '', notes: '',
  last_contact_date: '', next_followup_date: '', owner_staff: '', consent: '',
};

const TRAVEL_TYPES = ['Solo', 'Couple', 'Family', 'Group', 'Corporate'];
const LEAD_SOURCES = ['Referral', 'Walk-in', 'Facebook', 'Sister/Brother'];
const TITLES = ['Mr', 'Ms', 'Mrs', 'Miss', 'Dr', 'Atty', 'Dir', 'Comm.', 'Col', 'ED', 'DEDO'];

export default function ClientFormDialog({ open, onOpenChange, client, onSave }) {
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    if (open) setForm(client ? { ...DEFAULTS, ...client } : DEFAULTS);
  }, [open, client]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const fullName = form.full_name || [form.title, form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ');
    onSave({ ...form, full_name: fullName });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
            <TabsTrigger value="travel" className="flex-1">Travel</TabsTrigger>
            <TabsTrigger value="contact" className="flex-1">Contact</TabsTrigger>
            <TabsTrigger value="work" className="flex-1">Work</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Client Code</Label>
                <Input value={form.code} onChange={e => set('code', e.target.value)} placeholder="CL-0001" />
              </div>
              <div>
                <Label>Title</Label>
                <Select value={form.title || ''} onValueChange={v => set('title', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>First Name *</Label>
                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input value={form.middle_name} onChange={e => set('middle_name', e.target.value)} />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sex</Label>
                <Select value={form.sex || ''} onValueChange={v => set('sex', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Birthday</Label>
                <Input type="date" value={form.birthday || ''} onChange={e => set('birthday', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Passport Number</Label>
                <Input value={form.passport_number} onChange={e => set('passport_number', e.target.value)} />
              </div>
              <div>
                <Label>Passport Expiration</Label>
                <Input value={form.passport_expiration} onChange={e => set('passport_expiration', e.target.value)} placeholder="e.g. 2027-10-19" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="travel" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Travel Type</Label>
                <Select value={form.travel_type || ''} onValueChange={v => set('travel_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{TRAVEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Preferred Destination</Label>
                <Input value={form.preferred_destination} onChange={e => set('preferred_destination', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Lead Source</Label>
                <Select value={form.lead_source || ''} onValueChange={v => set('lead_source', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{LEAD_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags</Label>
                <Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. Frequent Traveller" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Last Contact Date</Label>
                <Input type="date" value={form.last_contact_date || ''} onChange={e => set('last_contact_date', e.target.value)} />
              </div>
              <div>
                <Label>Next Follow-up Date</Label>
                <Input type="date" value={form.next_followup_date || ''} onChange={e => set('next_followup_date', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="h-20" />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-3 mt-4">
            <div>
              <Label>Mobile / WhatsApp</Label>
              <Input value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={form.address} onChange={e => set('address', e.target.value)} className="h-16" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Input value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={e => set('country', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Preferred Contact</Label>
              <Input value={form.preferred_contact} onChange={e => set('preferred_contact', e.target.value)} placeholder="e.g. Messenger, Viber" />
            </div>
          </TabsContent>

          <TabsContent value="work" className="space-y-3 mt-4">
            <div>
              <Label>Company</Label>
              <Input value={form.company} onChange={e => set('company', e.target.value)} />
            </div>
            <div>
              <Label>Division / Department</Label>
              <Input value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
            <div>
              <Label>Position</Label>
              <Input value={form.position} onChange={e => set('position', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Owner / Staff</Label>
                <Input value={form.owner_staff} onChange={e => set('owner_staff', e.target.value)} />
              </div>
              <div>
                <Label>Consent (Y/N)</Label>
                <Select value={form.consent || ''} onValueChange={v => set('consent', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y">Yes</SelectItem>
                    <SelectItem value="N">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.first_name || !form.last_name}>Save Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}