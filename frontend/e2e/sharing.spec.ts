import { dinoParty } from './fixtures/seed-data';
import { expect, test } from './fixtures/test';
import { PartyOverviewPage } from './pages/party-overview.page';
import { SharePlanDialog } from './pages/share-plan.dialog';
import { SharedPage } from './pages/shared.page';

test.describe('sharing a party plan', () => {
  test('lists who is planning and invites someone to follow along', async ({ page, fakeApi }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty.id);

    await overview.shareButton.click();
    const share = new SharePlanDialog(page);
    await expect(share.members.getByRole('listitem')).toHaveText([
      /Amara Okafor \(you\).*Owner/,
      /Kemi Okafor.*Can edit/,
    ]);
    await share.email.fill('grandma@example.com');
    await share.viewOnly.check();
    await share.send.click();

    await expect(share.status).toContainText('Invitation sent to grandma@example.com');
    await expect(share.dialog).toContainText('grandma@example.com · Invited to view');
    expect(fakeApi.sharingStore.invited).toEqual([
      { email: 'grandma@example.com', role: 'viewer' },
    ]);
  });

  test('says when the email is not valid and sends nothing', async ({ page, fakeApi }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty.id);

    await overview.shareButton.click();
    const share = new SharePlanDialog(page);
    await share.email.fill('grandma');
    await share.send.click();

    await expect(share.email).toHaveAccessibleDescription(
      /Enter an email address like name@example.com/,
    );
    expect(fakeApi.sharingStore.invited).toEqual([]);
  });

  test('removes a co-planner and shares a view-only link', async ({ page, fakeApi }) => {
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty.id);

    await overview.shareButton.click();
    const share = new SharePlanDialog(page);
    await share.remove('Kemi Okafor').click();
    await expect(share.members.getByRole('listitem')).toHaveCount(1);
    await share.copyLink.click();

    await expect(share.link).toHaveValue(/\/shared\/share-/);
    await expect(share.status).toContainText('Link copied');
    expect(fakeApi.sharingStore.shareLinks).toBe(1);
  });

  test('viewers can’t share', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties[0].role = 'viewer';
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty.id);

    await expect(overview.heading).toBeVisible();
    await expect(overview.shareButton).toHaveCount(0);
  });

  test('a removed planner sees that the plan is private', async ({ page, fakeApi }) => {
    fakeApi.respond('GET', '/api/parties/:partyId/overview', {
      status: 404,
      body: { status: 404, title: 'Not found' },
    });
    const overview = new PartyOverviewPage(page);
    await overview.openParty(dinoParty.id);

    await expect(
      page.getByRole('heading', { level: 1, name: 'This party plan is private' }),
    ).toBeVisible();
  });
});

test.describe('joining and the view-only link', () => {
  test('accepting an invitation opens the party', async ({ page }) => {
    const shared = new SharedPage(page);
    await shared.openJoin('good-invite');

    await expect(page).toHaveURL(new RegExp(`/parties/${dinoParty.id}$`));
  });

  test('an expired invitation says so', async ({ page }) => {
    const shared = new SharedPage(page);
    await shared.openJoin('old-invite');

    await expect(shared.heading).toHaveText('This invitation has expired');
  });

  test('anyone with the link sees a read-only summary without guests’ details', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.session = null;
    const shared = new SharedPage(page);
    await shared.openShared(`share-${dinoParty.id.slice(0, 8)}`);

    await expect(shared.heading).toHaveText('Zuri’s Dino Dig 7th');
    await expect(shared.summary).toContainText('Dino Den Play Café');
    await expect(shared.summary).toContainText('11 kids coming');
    await expect(shared.summary).not.toContainText('@example.com');
    await expect(page.getByRole('button')).not.toContainText(['Edit', 'Book']);
  });

  test('a link that no longer works says so', async ({ page, fakeApi }) => {
    fakeApi.session = null;
    const shared = new SharedPage(page);
    await shared.openShared('nope');

    await expect(shared.heading).toHaveText('This link doesn’t work any more');
  });

  for (const width of [360, 1280]) {
    test(`the share dialog and summary have no serious violations at ${width}px`, async ({
      page,
    }) => {
      const overview = new PartyOverviewPage(page);
      await overview.useWidth(width);
      await overview.openParty(dinoParty.id);
      await overview.shareButton.click();
      await expect(new SharePlanDialog(page).members).toBeVisible();
      expect(await overview.seriousAccessibilityViolations()).toEqual([]);
    });
  }
});
