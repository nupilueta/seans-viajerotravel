import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Column indices based on the Excel headers (0-indexed):
// 0: CODE, 1: Created Date, 2: Title, 3: First Name, 4: Middle Name, 5: Last Name, 6: Fullname,
// 7: Sex, 8: Birthday, 9: Discount ID Number, 10: Link of ID, 11: Expiration of Discount ID,
// 12: Mobile/WhatsApp, 13: Email, 14: Address, 15: Passport Number, 16: Passport Expiration,
// 17: Passport Link, 18: US VISA, 19: US VISA Expiration, 20: TEC No., 21: TEC Link,
// 22: Mabuhay Miles, 23: Emirates ID, 24: Etihad, 25: Korean Air Skypass,
// 26: Singapore Airlines ANA, 27: Cathay Pacific Asia Miles, 28: Facebook Link,
// 29: City, 30: Country, 31: Preferred Destination, 32: Travel Type, 33: Lead Source,
// 34: Preferred Contact, 35: Company, 36: Division/Department, 37: Notes,
// 38: Last Contact Date, 39: Next Follow-up Date, 40: Owner/Staff, 41: Position,
// 42: No of Flights, 43: Tags, 44: Consent

function cleanDate(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (!s || s === '0') return '';
  // If it's already a date string like "2026-01-02 00:00:00", extract the date part
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  return s;
}

function clean(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function mapSex(val) {
  const s = clean(val).toLowerCase();
  if (s === 'male') return 'Male';
  if (s === 'female') return 'Female';
  return '';
}

function mapTravelType(val) {
  const s = clean(val);
  const allowed = ['Solo', 'Couple', 'Family', 'Group', 'Corporate'];
  for (const t of allowed) {
    if (s.toLowerCase().includes(t.toLowerCase())) return t;
  }
  return '';
}

function mapLeadSource(val) {
  const s = clean(val);
  const allowed = ['Referral', 'Walk-in', 'Facebook', 'Sister/Brother'];
  for (const t of allowed) {
    if (s.toLowerCase().includes(t.toLowerCase())) return t;
  }
  return '';
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const rows = body.rows; // array of arrays

  if (!rows || !Array.isArray(rows)) {
    return Response.json({ error: 'No rows provided' }, { status: 400 });
  }

  const records = [];
  for (const row of rows) {
    const code = clean(row[0]);
    const firstName = clean(row[3]);
    const lastName = clean(row[5]);
    // Skip rows with no code AND no name
    if (!code && !firstName && !lastName) continue;

    records.push({
      code,
      title: clean(row[2]),
      first_name: firstName,
      middle_name: clean(row[4]),
      last_name: lastName,
      full_name: clean(row[6]),
      sex: mapSex(row[7]),
      birthday: cleanDate(row[8]),
      discount_id_number: clean(row[9]),
      discount_id_link: clean(row[10]),
      discount_id_expiration: cleanDate(row[11]),
      mobile: clean(row[12]),
      email: clean(row[13]),
      address: clean(row[14]),
      passport_number: clean(row[15]),
      passport_expiration: clean(row[16]),
      passport_link: clean(row[17]),
      us_visa: clean(row[18]),
      us_visa_expiration: clean(row[19]),
      tec_number: clean(row[20]),
      tec_link: clean(row[21]),
      mabuhay_miles: clean(row[22]),
      emirates_id: clean(row[23]),
      etihad: clean(row[24]),
      korean_air_skypass: clean(row[25]),
      singapore_ana_mileage: clean(row[26]),
      cathay_pacific_asia_miles: clean(row[27]),
      facebook_link: clean(row[28]),
      city: clean(row[29]),
      country: clean(row[30]),
      preferred_destination: clean(row[31]),
      travel_type: mapTravelType(row[32]),
      lead_source: mapLeadSource(row[33]),
      preferred_contact: clean(row[34]),
      company: clean(row[35]),
      department: clean(row[36]),
      notes: clean(row[37]),
      last_contact_date: cleanDate(row[38]),
      next_followup_date: cleanDate(row[39]),
      owner_staff: clean(row[40]),
      position: clean(row[41]),
      no_of_flights: clean(row[42]),
      tags: clean(row[43]),
      consent: clean(row[44]),
    });
  }

  // Bulk create in batches of 50
  let created = 0;
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    await base44.asServiceRole.entities.TravelClient.bulkCreate(batch);
    created += batch.length;
  }

  return Response.json({ success: true, created });
});