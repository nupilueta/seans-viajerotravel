import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const DEFAULTS = {
  code: '', title: '', first_name: '', middle_name: '', last_name: '', full_name: '',
  sex: '', birthday: '', mobile: '', email: '', address: '', city: '', country: '',
  company: '', department: '', position: '',
  passport_number: '', passport_expiration: '', passport_link: '',
  discount_id_number: '', discount_id_link: '', discount_id_expiration: '',
  us_visa: '', us_visa_expiration: '',
  tec_number: '', tec_link: '',
  mabuhay_miles: '', emirates_id: '', etihad: '',
  korean_air_skypass: '', singapore_ana_mileage: '', cathay_pacific_asia_miles: '',
  facebook_link: '',
  travel_type: '', preferred_destination: '', lead_source: '',
  preferred_contact: '', tags: '', notes: '',
  last_contact_date: '', next_followup_date: '', owner_staff: '', consent: '',
  no_of_flights: '',
};

const TRAVEL_TYPES = ['Solo', 'Couple', 'Family', 'Group', 'Corporate'];
const LEAD_SOURCES = ['Referral', 'Walk-in', 'Facebook', 'Sister/Brother'];
const TITLES = ['Mr', 'Ms', 'Mrs', 'Miss', 'Dr', 'Atty', 'Dir', 'Comm.', 'Col', 'ED', 'DEDO', 'Chairman'];

export default function ClientFormDialog({ open, onOpenChange, client, onSave }) {
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    if (!open) return;
    if (client) {
      setForm({ ...DEFAULTS, ...client });
    } else {
      // Auto-generate next client code
      base44.entities.TravelClient.list('code', 500).then(clients => {
        const codes = clients
          .map(c => c.code)
          .filter(c => /^CL-\d+$/.test(c))
          .map(c => parseInt(c.replace('CL-', ''), 10));
        const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
        const nextCode = `CL-${String(nextNum).padStart(4, '0')}`;
        setForm({ ...DEFAULTS, code: nextCode });
      });
    }
  }, [open, client]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const fullName = [form.title, form.first_name, form.middle_name, form.last_name].filter(Boolean).join(' ');
    onSave({ ...form, full_name: fullName });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Edit Client' : 'New Client'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="travel">Travel</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="work">Work</TabsTrigger>
          </TabsList>

          {/* PERSONAL TAB */}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {form.birthday ? format(parseISO(form.birthday), 'MMM d, yyyy') : <span className="text-muted-foreground">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.birthday ? parseISO(form.birthday) : undefined}
                      onSelect={d => set('birthday', d ? format(d, 'yyyy-MM-dd') : '')}
                      captionLayout="dropdown"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
            <div>
              <Label>Passport Link</Label>
              <Input value={form.passport_link} onChange={e => set('passport_link', e.target.value)} placeholder="File name or URL" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Discount ID Number</Label>
                <Input value={form.discount_id_number} onChange={e => set('discount_id_number', e.target.value)} />
              </div>
              <div>
                <Label>Discount ID Expiration</Label>
                <Input value={form.discount_id_expiration} onChange={e => set('discount_id_expiration', e.target.value)} placeholder="e.g. 2027-01-01" />
              </div>
              <div>
                <Label>Discount ID Link</Label>
                <Input value={form.discount_id_link} onChange={e => set('discount_id_link', e.target.value)} placeholder="File name or URL" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>US Visa</Label>
                <Input value={form.us_visa} onChange={e => set('us_visa', e.target.value)} />
              </div>
              <div>
                <Label>US Visa Expiration</Label>
                <Input value={form.us_visa_expiration} onChange={e => set('us_visa_expiration', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>TEC No.</Label>
                <Input value={form.tec_number} onChange={e => set('tec_number', e.target.value)} />
              </div>
              <div>
                <Label>TEC Link</Label>
                <Input value={form.tec_link} onChange={e => set('tec_link', e.target.value)} />
              </div>
            </div>
          </TabsContent>

          {/* TRAVEL TAB */}
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
                <Label>No. of Flights (Per Way)</Label>
                <Input value={form.no_of_flights} onChange={e => set('no_of_flights', e.target.value)} />
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

          {/* LOYALTY TAB */}
          <TabsContent value="loyalty" className="space-y-3 mt-4">
            <div>
              <Label>Mabuhay Miles</Label>
              <Input value={form.mabuhay_miles} onChange={e => set('mabuhay_miles', e.target.value)} />
            </div>
            <div>
              <Label>Emirates ID</Label>
              <Input value={form.emirates_id} onChange={e => set('emirates_id', e.target.value)} />
            </div>
            <div>
              <Label>Etihad</Label>
              <Input value={form.etihad} onChange={e => set('etihad', e.target.value)} />
            </div>
            <div>
              <Label>Korean Air Skypass</Label>
              <Input value={form.korean_air_skypass} onChange={e => set('korean_air_skypass', e.target.value)} />
            </div>
            <div>
              <Label>Singapore Airlines / ANA Mileage Club (Star Alliance)</Label>
              <Input value={form.singapore_ana_mileage} onChange={e => set('singapore_ana_mileage', e.target.value)} />
            </div>
            <div>
              <Label>Cathay Pacific / Asia Miles No.</Label>
              <Input value={form.cathay_pacific_asia_miles} onChange={e => set('cathay_pacific_asia_miles', e.target.value)} />
            </div>
          </TabsContent>

          {/* CONTACT TAB */}
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
              <Select value={form.preferred_contact || ''} onValueChange={v => set('preferred_contact', v)}>
                <SelectTrigger><SelectValue placeholder="Select preferred contact" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Messenger">Messenger</SelectItem>
                  <SelectItem value="Text">Text</SelectItem>
                  <SelectItem value="Viber">Viber</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Facebook Link</Label>
              <Input value={form.facebook_link} onChange={e => set('facebook_link', e.target.value)} />
            </div>
          </TabsContent>

          {/* WORK TAB */}
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
            <div>
              <Label>Owner / Head / Staff</Label>
              <Input value={form.owner_staff} onChange={e => set('owner_staff', e.target.value)} />
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