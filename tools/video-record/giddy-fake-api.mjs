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

/**
 * Installs the fake on the recording page. Returns its state: change `parties`, set
 * `partiesDelayMs`, or set `partiesFailure` to a reference code to answer GET /api/parties with 500.
 */
export async function installFakeApi(page) {
  const state = { session: { ...amara }, parties: [{ ...dinoParty }], partiesDelayMs: 0, partiesFailure: null };
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
    return route.fulfill({ status: 599, json: { title: `Unrouted ${request.method()} ${path}` } });
  });
  return state;
}
