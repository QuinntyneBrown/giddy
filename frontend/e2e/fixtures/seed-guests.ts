/** Zuri's guest list as the API returns it, after the invitations went out. */
export interface SeedGuest {
  id: string;
  childName: string;
  parentName: string;
  rsvp: 'notSent' | 'waiting' | 'coming' | 'cantCome';
  allergies: string | null;
  parentStaying: boolean | null;
  note: string | null;
  email: string | null;
  mobile: string | null;
  emailBounced: boolean;
  lastRemindedAt: string | null;
  /** The private link's token, for the fake RSVP pages. */
  token: string;
}

type Row = [string, string, SeedGuest['rsvp'], string | null, string | null];

const rows: Row[] = [
  ['Maya Chen', 'Lily Chen', 'coming', 'Dairy-free', '416-555-0177'],
  ['Arjun Patel', 'Priya Patel', 'coming', 'Peanut (EpiPen with parent)', '416-555-0123'],
  ['Leo Rossi', 'Marco Rossi', 'coming', null, '647-555-0101'],
  ['Sofia Haddad', 'Rania Haddad', 'coming', null, '416-555-0145'],
  ['Ethan Kim', 'Grace Kim', 'cantCome', null, '647-555-0166'],
  ['Noah Tremblay', 'Julie Tremblay', 'coming', null, '416-555-0110'],
  ['Aisha Mohamed', 'Hodan Mohamed', 'waiting', null, null],
  ['Liam O’Brien', 'Siobhan O’Brien', 'coming', null, '416-555-0158'],
  ['Hana Sato', 'Kenji Sato', 'coming', 'Gluten-free (celiac)', '647-555-0132'],
  ['Mateo García', 'Lucía García', 'waiting', null, '416-555-0184'],
  ['Olivia Nguyen', 'Thu Nguyen', 'coming', null, '416-555-0119'],
  ['Benjamin Cohen', 'Rachel Cohen', 'coming', null, '647-555-0171'],
  ['Amelia Singh', 'Harpreet Singh', 'cantCome', null, '416-555-0137'],
  ['Lucas Martin', 'Chloé Martin', 'coming', null, '416-555-0192'],
  ['Ava Wilson', 'Jordan Wilson', 'waiting', null, null],
  ['Zara Ali', 'Fatima Ali', 'coming', null, '647-555-0148'],
];

export const seedGuests: SeedGuest[] = rows.map(
  ([childName, parentName, rsvp, allergies, mobile], i) => ({
    id: `e1000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    childName,
    parentName,
    rsvp,
    allergies,
    parentStaying: rsvp === 'coming' ? true : null,
    note: null,
    // Ava's family left no email or mobile number.
    email:
      childName === 'Ava Wilson' ? null : `${parentName.split(' ')[0].toLowerCase()}@example.com`,
    mobile,
    emailBounced: false,
    lastRemindedAt: null,
    token: `${childName
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-z]/g, '')}-token`,
  }),
);
