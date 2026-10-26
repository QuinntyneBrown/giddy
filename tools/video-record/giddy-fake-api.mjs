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
    if (path === '/api/parties' && request.method() === 'GET') {
      if (state.partiesDelayMs) await new Promise((resolve) => setTimeout(resolve, state.partiesDelayMs));
      return state.partiesFailure
        ? route.fulfill({
            status: 500,
            json: { status: 500, title: 'Something went wrong on our side.', referenceCode: state.partiesFailure },
          })
        : route.fulfill({ json: state.parties });
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
