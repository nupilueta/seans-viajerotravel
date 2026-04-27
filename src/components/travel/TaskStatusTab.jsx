import React from 'react';
import { Card } from '@/components/ui/card';

function StatRow({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold">{value}</span>
        {sub && <span className="text-xs text-muted-foreground ml-2">{sub}</span>}
      </div>
    </div>
  );
}

function Section({ title, letter, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">{letter}</span>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div>{children}</div>
    </Card>
  );
}

export default function TaskStatusTab({ tasks }) {
  const byService = (types) => tasks.filter(t => types.includes(t.service_type));
  const count = (arr, status) => arr.filter(t => t.status === status).length;
  const countNot = (arr, ...statuses) => arr.filter(t => !statuses.includes(t.status)).length;

  // a. Customer Bookings
  const flights = byService(['Flight Reservation', 'Airline Ticket']);
  const hotels = byService(['Hotel Booking']);
  const tours = byService(['Tour Package']);
  const bookings = byService(['Customer Booking']);

  // b. Customer Inquiries
  const inquiries = byService(['Customer Inquiries']);
  const inquiriesResponded = inquiries.filter(t => ['Completed', 'Submitted'].includes(t.status)).length;
  const inquiriesPending = inquiries.filter(t => ['Not Started', 'In Progress', 'Waiting for Client'].includes(t.status)).length;

  // c. Partner Coordination
  const partner = byService(['Partner Coordination']);
  const airlineConf = byService(['Airline Ticket', 'Flight Reservation']).filter(t => t.status === 'Completed').length;
  const hotelConf = byService(['Hotel Booking']).filter(t => t.status === 'Completed').length;
  const issuesResolved = partner.filter(t => t.status === 'Completed').length;

  // d. Documentation
  const visas = byService(['Visa Processing']);
  const insurance = byService(['Travel Insurance']);

  // e. All services summary
  const allStatuses = ['Not Started', 'In Progress', 'Waiting for Client', 'Submitted', 'Completed', 'Cancelled'];
  const statusCounts = allStatuses.map(s => ({ status: s, count: tasks.filter(t => t.status === s).length })).filter(s => s.count > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* a. Customer Bookings */}
        <Section title="Customer Bookings" letter="a">
          <StatRow label="Flight reservations" value={count(flights, 'Completed') + ' completed'} sub={`${countNot(flights, 'Completed', 'Cancelled')} pending`} />
          <StatRow label="Hotel bookings" value={count(hotels, 'Completed') + ' completed'} sub={`${countNot(hotels, 'Completed', 'Cancelled')} pending`} />
          <StatRow label="Tour packages" value={count(tours, 'Completed') + ' completed'} sub={`${count(tours, 'Cancelled')} cancelled`} />
          {bookings.length > 0 && <StatRow label="Customer bookings" value={count(bookings, 'Completed') + ' completed'} sub={`${countNot(bookings, 'Completed', 'Cancelled')} pending`} />}
        </Section>

        {/* b. Customer Inquiries */}
        <Section title="Customer Inquiries" letter="b">
          <StatRow label="Total inquiries received" value={inquiries.length} />
          <StatRow label="Responded / resolved" value={inquiriesResponded} />
          <StatRow label="Pending responses" value={inquiriesPending} />
        </Section>

        {/* c. Partner Coordination */}
        <Section title="Partner Coordination" letter="c">
          <StatRow label="Airline confirmations processed" value={airlineConf} />
          <StatRow label="Hotel confirmations processed" value={hotelConf} />
          <StatRow label="Issues resolved (partner)" value={issuesResolved} />
          <StatRow label="Total partner tasks" value={partner.length} />
        </Section>

        {/* d. Documentation */}
        <Section title="Documentation" letter="d">
          <StatRow label="Visa processing — total" value={visas.length} sub={`${count(visas, 'Completed')} completed`} />
          <StatRow label="Travel insurance — total" value={insurance.length} sub={`${count(insurance, 'Completed')} issued`} />
          <StatRow label="Receipts & payments" value={byService(['Receipt', 'Credit Card Payment']).length} />
        </Section>
      </div>

      {/* Overall status summary */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-4">Overall Task Status Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statusCounts.map(({ status, count }) => (
            <div key={status} className="bg-muted/40 rounded-lg px-4 py-3 flex flex-col">
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}