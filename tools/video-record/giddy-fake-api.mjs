// A fake Giddy API for screen recordings, mirroring frontend/e2e/fixtures/fake-api.ts:
// the same seeded family and party, the same contracts, and 599 for anything unknown.
export const amara = {
  parentId: '6f1c2a52-8a51-4a5e-9d0e-2f8f0a1b3c01',
  name: 'Amara Okafor',
  email: 'amara.okafor@example.com',
};

export const dinoParty = {
  id: '3d9c1b7e-2f4a-4e8d-b6c5-a1f2e3d4c5b6',
  name: 'Zuri’s Dino Dig 7th',
  date: '2026-11-14',
  startsAt: '13:00',
  endsAt: '15:30',
  role: 'owner',
  daysToGo: 20,
};

export const dinoGlance = {
  partyId: dinoParty.id, name: dinoParty.name, childName: 'Zuri', turningAge: 7, who: 'Zuri, turning 7',
  date: '2026-11-14', timeOfDay: 'afternoon', area: 'Leslieville', radiusKm: 8, guests: 15, budget: 800,
};

export const remembered = [
  { id: 'm1', text: 'Zuri loves dinosaurs, digging and science' },
  { id: 'm2', text: 'Hana is gluten-free, Arjun has a peanut allergy' },
  { id: 'm3', text: 'You prefer venues with parking' },
];

export const dinoPlan = {
  id: 'p1', title: 'Zuri’s Dino Dig 7th', theme: { name: 'Dino Dig', detail: 'Fossil hunt, volcano science, dino eggs' },
  items: [
    { category: 'Venue', catalogueItemId: 'v1', name: 'Dino Den Play Café', detail: '1:00–3:30 pm · up to 20 kids · nut-free kitchen', price: 340, allergyNote: null },
    { category: 'Entertainer', catalogueItemId: 'e1', name: 'Professor Fizz’s Volcano Lab', detail: '45 min show', price: 195, allergyNote: null },
    { category: 'Cake', catalogueItemId: 'c1', name: 'Sweet Rex Bakery', detail: 'nut-free dino cake for 20', price: 85, allergyNote: null },
    { category: 'Food', catalogueItemId: 'f1', name: 'Pizza Nonna', detail: '6 large pizzas and juice boxes', price: 110, allergyNote: null },
    { category: 'Loot bags', catalogueItemId: 'l1', name: 'Mini fossil dig kits', detail: 'Mini fossil dig kits × 16', price: 48, allergyNote: null },
  ],
  total: 778, budget: 800, overBudgetBy: 0, applied: false,
};

/** Giddy's answer to the next message: steps, then a reply, a failure, or thinking until stopped. */
export function planTurn(stepMs = 1100) {
  return {
    steps: ['Checked 38 venues within 8 km for Sat 14 Nov afternoon', 'Compared 12 entertainers for dinosaurs', 'Found 4 bakeries with peanut-free cakes'],
    outcome: 'reply', stepMs,
    reply: { text: 'Here’s a plan that keeps you $22 under budget and everything is within 10 minutes of home.', proposal: structuredClone(dinoPlan), suggestions: [] },
  };
}

export const family = {
  postalCode: 'M4M 1H1', areaName: 'Leslieville',
  children: [
    { id: 'zuri', firstName: 'Zuri', birthday: '2019-11-14', nextBirthday: '2026-11-14', turningAge: 7 },
    { id: 'kofi', firstName: 'Kofi', birthday: '2023-02-03', nextBirthday: '2027-02-03', turningAge: 4 },
  ],
};

const summary = (o) => ({ role: 'owner', status: 'upcoming', readiness: 0, venueName: null, theme: null, locked: false, guests: null, budget: null, ...o });

export const seededParties = () => [
  summary({ ...dinoParty, status: 'upcoming', readiness: 27, venueName: 'Dino Den Play Café', theme: 'Dino Dig', guests: 16, budget: 800 }),
  summary({ id: 'kofi-draft', name: 'Kofi’s 4th: Choo-Choo Express', date: '2027-02-03', startsAt: '10:00', endsAt: '12:00', daysToGo: 101, status: 'draft', theme: 'Choo-Choo Express', guests: 12, budget: 500 }),
  summary({ id: 'zuri-sixth', name: 'Zuri’s 6th: Mermaid Splash', date: '2025-11-15', startsAt: '13:00', endsAt: '15:00', daysToGo: -344, status: 'past', readiness: 100, venueName: 'Splash & Giggle Pool', theme: 'Mermaid Splash', locked: true, guests: 14, budget: 720 }),
];

const bookingsFor = (party) => party.status === 'draft' ? [] : [
  { category: 'Venue', name: 'Dino Den Play Café', price: 340, status: 'confirmed' },
  { category: 'Entertainer', name: 'Professor Fizz’s Volcano Lab', price: 195, status: 'toBook' },
  { category: 'Cake', name: 'Sweet Rex Bakery', price: 85, status: 'toBook' },
  { category: 'Food', name: 'Pizza Nonna', price: 110, status: 'toBook' },
  { category: 'Loot bags', name: 'Mini fossil dig kits', price: 48, status: 'toBook' },
];

const overviewOf = (party) => {
  const planned = party.status !== 'draft';
  return {
    id: party.id, name: party.name, date: party.date, startsAt: party.startsAt, endsAt: party.endsAt, timeOfDay: 'afternoon',
    daysToGo: party.daysToGo, area: 'Leslieville', venueName: party.venueName, theme: party.theme, guests: party.guests,
    readiness: party.readiness, doneTasks: planned ? 3 : 0, totalTasks: planned ? 10 : 0,
    nextTasks: planned ? [
      { title: 'Book the entertainer', due: '2026-10-20', overdue: true },
      { title: 'Order the cake', due: '2026-10-31', overdue: false },
      { title: 'Share the allergy list with the venue', due: '2026-11-04', overdue: false },
    ] : [],
    nextStep: planned ? 'Book Professor Fizz’s Volcano Lab' : null, allergies: ['peanut'], budget: party.budget, planned: planned ? 778 : 0,
    rsvps: { coming: 0, waiting: 0, cantCome: 0 },
    members: [
      { parentId: amara.parentId, name: 'Amara Okafor', role: 'owner', isYou: true },
      { parentId: 'kemi', name: 'Kemi Okafor', role: 'coPlanner', isYou: false },
    ],
    role: party.role, canDelete: party.role === 'owner', locked: party.locked,
  };
};

const nudges = [
  { partyId: dinoParty.id, partyName: dinoParty.name, title: 'Book the entertainer', kind: 'overdue', context: 'It was due Tue 20 Oct.', actionLabel: 'Open the plan' },
  { partyId: dinoParty.id, partyName: dinoParty.name, title: 'Order the cake', kind: 'needsYou', context: 'Due Sat 31 Oct.', actionLabel: 'Open the plan' },
];

const ordinal = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th'}`;

let counter = 0;
const newId = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;
const giddy = (text, extra = {}) => ({ id: newId(), author: 'giddy', text, sentAt: new Date().toISOString(), steps: [], suggestions: [], proposal: null, ...extra });
const progressive = { Checked: 'Checking', Compared: 'Comparing', Found: 'Finding' };

function turnEvents(state, turn) {
  const elapsed = (turn.cancelledAt ?? Date.now()) - turn.startedAt;
  const events = [];
  const push = (type, stepId, text, messageId = null) => events.push({ sequence: events.length + 1, type, stepId, text, messageId });
  const done = [];
  turn.script.steps.forEach((step, i) => {
    if (elapsed >= i * turn.script.stepMs) push('step.started', `s${i}`, step.replace(/^(Checked|Compared|Found)/, (w) => progressive[w]) + '…');
    if (elapsed >= (i + 1) * turn.script.stepMs) { push('step.done', `s${i}`, step); done.push(step); }
  });
  const allDone = elapsed >= turn.script.steps.length * turn.script.stepMs;
  if (turn.cancelledAt) {
    if (!turn.finished) {
      turn.finished = true; turn.status = 'cancelled';
      if (done.length) state.messages.push(giddy('You stopped Giddy.', { steps: done.map((text) => ({ text, done: true })) }));
    }
    push('turn.cancelled', null, null);
  } else if (allDone && turn.script.outcome === 'fail') {
    turn.status = 'failed';
    push('turn.failed', null, 'Giddy can’t answer right now. Your message is saved; try again in a minute.');
  } else if (allDone && turn.script.outcome === 'reply') {
    if (!turn.finished) {
      turn.finished = true; turn.status = 'completed';
      state.messages.push(giddy(turn.script.reply.text, { id: `${turn.id}-reply`, steps: done.map((text) => ({ text, done: true })), suggestions: turn.script.reply.suggestions ?? [], proposal: turn.script.reply.proposal ?? null }));
    }
    push('reply.done', null, null, `${turn.id}-reply`);
  }
  return events;
}

/**
 * Installs the fake on the recording page. Returns its state: change `parties`, set
 * `partiesDelayMs`, or set `partiesFailure` to a reference code to answer GET /api/parties with 500.
 */
export async function installFakeApi(page) {
  const state = {
    session: { ...amara }, parties: [{ ...dinoParty }], partiesDelayMs: 0, partiesFailure: null,
    conversationId: 'c1', glance: { ...dinoGlance }, messages: [], memories: remembered.map((m) => ({ ...m })),
    turns: new Map(), script: [], sendFailures: 0, applyFailures: 0,
    allParties: seededParties(), createFailures: 0, homeDelayMs: 0,
  };
  const find = (id) => state.allParties.find((p) => p.id === id);
  const home = () => {
    const upcoming = state.allParties.filter((p) => !p.locked).sort((a, b) => a.date.localeCompare(b.date));
    const next = upcoming[0];
    return {
      partiesInProgress: upcoming.length, needsYou: nudges.length,
      nextParty: next ? { id: next.id, name: next.name, date: next.date, startsAt: next.startsAt, endsAt: next.endsAt, daysToGo: next.daysToGo, venueName: next.venueName, guests: next.guests, readiness: next.readiness, doneSteps: 4, totalSteps: 15, nextStep: next.venueName ? 'Book Professor Fizz’s Volcano Lab' : null } : null,
      rsvps: { coming: 0, waiting: 0, cantCome: 0 }, allergies: next ? 1 : 0,
      nextBirthday: { childId: 'kofi', firstName: 'Kofi', turningAge: 4, date: '2027-02-03', daysAway: 101 },
    };
  };
  const view = () => ({ id: state.conversationId, party: state.glance, messages: state.messages, memories: state.memories, runningTurnId: null });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/session') {
      return state.session
        ? route.fulfill({ json: state.session })
        : route.fulfill({ status: 401, json: { status: 401, title: 'Sign in to continue.' } });
    }
    if (path === '/api/antiforgery') {
      return route.fulfill({
        json: { token: 'fake-xsrf-token' },
        headers: { 'set-cookie': 'XSRF-TOKEN=fake-xsrf-token; Path=/; SameSite=Strict' },
      });
    }
    if (path === '/api/parties' && request.method() === 'GET') return route.fulfill({ json: state.allParties });
    if (path === '/api/home') {
      if (state.partiesDelayMs) await new Promise((resolve) => setTimeout(resolve, state.partiesDelayMs));
      return state.partiesFailure
        ? route.fulfill({ status: 500, json: { status: 500, title: 'Something went wrong on our side.', referenceCode: state.partiesFailure } })
        : route.fulfill({ json: home() });
    }
    if (path === '/api/home/nudges') return route.fulfill({ json: nudges });
    if (path === '/api/family') return route.fulfill({ json: family });
    if (path === '/api/budget-guide') {
      const guests = Number(new URL(request.url()).searchParams.get('guests'));
      return route.fulfill({ json: { guests, low: Math.floor((300 + 20 * guests) / 50) * 50, high: Math.round((500 + 38 * guests) / 100) * 100 } });
    }
    if (path === '/api/parties' && request.method() === 'POST') {
      if (state.createFailures > 0) { state.createFailures--; return route.fulfill({ status: 503, json: { status: 503, title: 'Unavailable' } }); }
      const body = request.postDataJSON();
      const child = family.children.find((c) => c.id === body.childId);
      const party = summary({ id: newId(), name: child ? `${child.firstName}’s ${ordinal(child.turningAge)} birthday` : `${body.childName}’s ${ordinal(body.turningAge)} birthday`, date: body.date, startsAt: '13:00', endsAt: '15:30', daysToGo: 20, status: 'draft', guests: body.guests, budget: body.budget });
      state.allParties.push(party);
      state.glance = { ...dinoGlance, partyId: party.id, name: party.name, guests: body.guests, budget: body.budget };
      return route.fulfill({ status: 201, json: party });
    }
    let partyMatch = path.match(/^\/api\/parties\/([^/]+)(\/(overview|bookings|conversations))?$/);
    if (partyMatch) {
      const party = find(partyMatch[1]);
      if (!party) return route.fulfill({ status: 404, json: { status: 404, title: 'Not found' } });
      if (request.method() === 'DELETE') { state.allParties = state.allParties.filter((p) => p !== party); return route.fulfill({ status: 204, body: '' }); }
      if (partyMatch[3] === 'overview') return route.fulfill({ json: overviewOf(party) });
      if (partyMatch[3] === 'bookings') return route.fulfill({ json: bookingsFor(party) });
      if (partyMatch[3] === 'conversations') { state.conversationId = newId(); state.messages = []; return route.fulfill({ json: view() }); }
      return route.fulfill({ json: party });
    }
    if (path === '/api/conversations/current') return route.fulfill({ json: view() });
    if (path === '/api/conversations' && request.method() === 'POST') {
      state.conversationId = newId(); state.messages = [];
      return route.fulfill({ json: view() });
    }
    let match = path.match(/^\/api\/conversations\/[^/]+\/messages$/);
    if (match) {
      if (state.sendFailures > 0) { state.sendFailures--; return route.fulfill({ status: 503, json: { status: 503, title: 'Unavailable' } }); }
      const text = request.postDataJSON().text.trim();
      const message = { id: newId(), author: 'parent', text, sentAt: new Date().toISOString(), steps: [], suggestions: [], proposal: null };
      state.messages.push(message);
      const turn = { id: newId(), script: state.script.shift() ?? planTurn(), startedAt: Date.now(), status: 'running' };
      state.turns.set(turn.id, turn);
      return route.fulfill({ status: 202, json: { messageId: message.id, turnId: turn.id } });
    }
    match = path.match(/^\/api\/conversations\/[^/]+\/turns\/([^/]+)(\/cancel)?$/);
    if (match) {
      const turn = state.turns.get(match[1]);
      if (match[2]) { if (turn.status === 'running') { turn.cancelledAt = Date.now(); turnEvents(state, turn); } return route.fulfill({ status: 202, json: null }); }
      const after = Number(new URL(request.url()).searchParams.get('after') ?? 0);
      const events = turnEvents(state, turn);
      return route.fulfill({ json: { turnId: turn.id, status: turn.status, events: events.filter((e) => e.sequence > after) } });
    }
    if (/^\/api\/parties\/[^/]+\/plan$/.test(path)) {
      if (state.applyFailures > 0) { state.applyFailures--; return route.fulfill({ status: 500, json: { status: 500, title: 'Oops', referenceCode: 'GDY-4PLN' } }); }
      state.messages.forEach((m) => { if (m.proposal) m.proposal.applied = true; });
      state.messages.push(giddy(`Plan saved to ${state.glance.name}`));
      return route.fulfill({ json: { partyId: dinoParty.id, partyName: dinoParty.name, theme: 'Dino Dig', bookingsToDo: 5, estimates: 778, checklistTasks: 10 } });
    }
    if (path === '/api/memories') return route.fulfill({ json: state.memories });
    match = path.match(/^\/api\/memories\/([^/]+)$/);
    if (match && request.method() === 'DELETE') {
      state.memories = state.memories.filter((m) => m.id !== match[1]);
      return route.fulfill({ status: 204, body: '' });
    }
    return route.fulfill({ status: 599, json: { title: `Unrouted ${request.method()} ${path}` } });
  });
  return state;
}
