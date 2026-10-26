import { expect, test } from './fixtures/test';
import { problem } from './fixtures/fake-api';
import { FakePlanner } from './fixtures/fake-planner';
import { AcceptPlanDialog } from './pages/accept-plan.dialog';
import { PlannerChatPage } from './pages/planner-chat.page';

test.describe('a new conversation', () => {
  test('greets the parent by name and offers starter prompts that send as their message', async ({
    page,
  }) => {
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await expect(chat.heading).toBeVisible();
    await expect(chat.lastGiddyMessage()).toContainText('Hi Amara! I’m Giddy.');
    await expect(chat.chipsIn(chat.lastGiddyMessage())).toHaveCount(4);

    await chat.chooseChip('Plan Zuri’s 7th on Sat 14 Nov');

    await expect(chat.parentMessage('Plan Zuri’s 7th on Sat 14 Nov')).toBeVisible();
  });

  test('shows the party at a glance beside the chat on wide screens', async ({ page }) => {
    const chat = new PlannerChatPage(page);
    await chat.useWidth(1280);
    await chat.openChat();

    await expect(chat.glanceValue('Who')).toHaveText('Zuri, turning 7');
    await expect(chat.glanceValue('When')).toHaveText('Sat 14 Nov 2026, afternoon');
    await expect(chat.glanceValue('Where')).toHaveText('Leslieville, within 8 km');
    await expect(chat.glanceValue('Guests')).toHaveText('About 15 kids');
    await expect(chat.glanceValue('Budget')).toHaveText('$800');
    await expect(chat.giddyKnows).toContainText('Zuri loves dinosaurs, digging and science');
    await expect(chat.manageMemories()).toHaveAttribute('href', '/settings');
  });

  test('offers Try again and the plan when the conversation cannot load', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.respond('GET', '/api/conversations/current', {
      status: 500,
      body: problem(500, 'Oops', { referenceCode: 'GDY-7Q2K' }),
    });
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await expect(chat.errorBlock).toContainText('Your plan is safe and unchanged');
    await expect(chat.errorBlock).toContainText('GDY-7Q2K');
    await expect(chat.openPlanInstead()).toBeVisible();

    fakeApi.respond('GET', '/api/conversations/current', () => ({ body: fakeApi.planner.view() }));
    await chat.tryAgain();
    await expect(chat.messageBox).toBeVisible();
  });
});

test.describe('sending a message', () => {
  test('sends on Enter, adds a line on Shift+Enter and keeps focus in the box', async ({
    page,
  }) => {
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await chat.type('First line');
    await chat.pressShiftEnter();
    await expect(chat.messageBox).toHaveValue('First line\n');
    await chat.messageBox.press('Enter');

    await expect(chat.parentMessage('First line')).toBeVisible();
    await expect(chat.messageBox).toHaveValue('');
    await expect(chat.messageBox).toBeFocused();
  });

  test('shows each step as Giddy works, ticks it, then proposes a priced plan', async ({
    page,
  }) => {
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await chat.send('Plan Zuri’s 7th, 15 kids, $800, Leslieville');

    await expect(chat.progressIndicator()).toBeVisible({ timeout: 2000 });
    await expect(chat.stopButton).toBeVisible();
    await expect(chat.doneSteps().first()).toHaveText(
      'Checked 38 venues within 8 km for Sat 14 Nov afternoon',
    );
    await expect(chat.planCard).toBeVisible();
    await expect(chat.doneSteps()).toHaveCount(3);
    await expect(chat.planTotal()).toHaveText('$778 of $800');
    await expect(chat.planRow('Venue')).toContainText('Dino Den Play Café');
    await expect(chat.planRow('Venue')).toContainText('$340');
    await expect(chat.planCard.getByRole('button', { name: 'Use this plan' })).toBeVisible();
    await expect(chat.planCard.getByRole('button', { name: 'Swap something' })).toBeVisible();
    await expect(chat.sendButton).toBeVisible();
    await expect(chat.log).not.toHaveAttribute('aria-busy', 'true');
  });

  test('Stop cancels Giddy, keeps finished steps and lets the parent send again', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.planner.script = [{ ...FakePlanner.planTurn(600), outcome: 'hang' }];
    const chat = new PlannerChatPage(page);
    await chat.openChat();
    await chat.send('Plan everything');
    await expect(chat.doneSteps().first()).toBeVisible();

    await chat.stop();

    await expect(chat.sendButton).toBeVisible({ timeout: 1000 });
    await expect(chat.doneSteps().first()).toHaveText(
      'Checked 38 venues within 8 km for Sat 14 Nov afternoon',
    );
    await chat.send('Just the venue please');
    await expect(chat.parentMessage('Just the venue please')).toBeVisible();
  });

  test('Esc stops Giddy while it works', async ({ page, fakeApi }) => {
    fakeApi.planner.script = [{ ...FakePlanner.planTurn(600), outcome: 'hang' }];
    const chat = new PlannerChatPage(page);
    await chat.openChat();
    await chat.send('Plan everything');
    await expect(chat.stopButton).toBeVisible();

    await chat.pressEscape();

    await expect(chat.sendButton).toBeVisible({ timeout: 1000 });
  });

  test('keeps an unsent message with Send again and Edit message', async ({ page, fakeApi }) => {
    fakeApi.respond('POST', '/api/conversations/:conversationId/messages', {
      status: 503,
      body: problem(503, 'Unavailable'),
    });
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await chat.send('Can we add a piñata?');

    await expect(chat.parentMessage('Can we add a piñata?')).toBeVisible();
    await expect(chat.notSentAlert()).toBeVisible();
    await chat.editMessage();
    await expect(chat.messageBox).toHaveValue('Can we add a piñata?');

    await chat.send('Can we add a piñata?');
    fakeApi.respond('POST', '/api/conversations/:conversationId/messages', (request, params) =>
      fakeApi.planner.acceptMessage(request, params),
    );
    await chat.sendAgain();
    await expect(chat.notSentAlert()).toHaveCount(0);
    await expect(chat.parentMessage('Can we add a piñata?')).toHaveCount(1);
  });

  test('says Giddy cannot answer right now when the model is unavailable', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.planner.script = [{ steps: [], outcome: 'fail', stepMs: 100 }];
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await chat.send('Plan Zuri’s party');

    await expect(chat.giddyFailure()).toBeVisible({ timeout: 10000 });
    await expect(chat.parentMessage('Plan Zuri’s party')).toBeVisible();
    await expect(chat.sendButton).toBeVisible();
  });

  test('offers up to four suggested replies that send with one tap', async ({ page, fakeApi }) => {
    fakeApi.planner.script = [
      {
        steps: [],
        outcome: 'reply',
        stepMs: 100,
        reply: {
          text: 'Want me to ask Pizza Nonna for one gluten-free pizza too?',
          suggestions: ['Yes, add a GF pizza', 'Keep the regular cake', 'Show other bakeries'],
        },
      },
    ];
    const chat = new PlannerChatPage(page);
    await chat.openChat();
    await chat.send('Can the cake be gluten-free?');

    await expect(chat.chipsIn(chat.lastGiddyMessage())).toHaveCount(3);
    await chat.chooseChip('Yes, add a GF pizza');

    await expect(chat.parentMessage('Yes, add a GF pizza')).toBeVisible();
  });

  test('says how far over budget a plan is', async ({ page, fakeApi }) => {
    const over = FakePlanner.planTurn(50);
    over.reply!.proposal = { ...over.reply!.proposal!, budget: 600, overBudgetBy: 178 };
    fakeApi.planner.script = [over];
    const chat = new PlannerChatPage(page);
    await chat.openChat();

    await chat.send('Plan it for $600');

    await expect(chat.planTotal()).toHaveText('$178 over $600');
  });

  test('Swap something puts the parent back in the message box', async ({ page, fakeApi }) => {
    fakeApi.planner.script = [FakePlanner.planTurn(50)];
    const chat = new PlannerChatPage(page);
    await chat.openChat();
    await chat.send('Plan it');

    await chat.swapSomething();

    await expect(chat.messageBox).toBeFocused();
    await expect(chat.messageBox).toHaveValue('Swap ');
  });
});

test.describe('using a plan', () => {
  test.beforeEach(async ({ page, fakeApi }) => {
    fakeApi.planner.script = [FakePlanner.planTurn(50)];
    const chat = new PlannerChatPage(page);
    await chat.openChat();
    await chat.send('Plan it');
    await expect(chat.planCard).toBeVisible();
  });

  test('lists every change and says nothing is booked or paid before saving', async ({
    page,
    fakeApi,
  }) => {
    const chat = new PlannerChatPage(page);
    const dialog = new AcceptPlanDialog(page);

    await chat.useThisPlan();

    await expect(dialog.dialog).toBeVisible();
    await expect(dialog.changes).toHaveText([
      'Sets the theme to Dino Dig',
      'Adds 5 bookings to do: Dino Den Play Café, Professor Fizz’s Volcano Lab, Sweet Rex Bakery, Pizza Nonna and Mini fossil dig kits',
      'Fills your budget with $778 of estimates',
      'Creates a 10-step checklist working back from Sat 14 Nov',
    ]);
    await expect(dialog.dialog).toContainText('Nothing is booked or paid yet.');
    expect(await dialog.focusIsInside()).toBe(true);

    await dialog.confirm();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(chat.lastGiddyMessage()).toContainText('Plan saved to Zuri’s Dino Dig 7th');
    expect(fakeApi.planner.appliedProposals).toEqual(['7c2e9d40-2222-4b3c-9d4e-000000000001']);
  });

  test('keeps everything unchanged and offers Try again when saving fails', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.planner.applyFailure = 500;
    const chat = new PlannerChatPage(page);
    const dialog = new AcceptPlanDialog(page);
    await chat.useThisPlan();

    await dialog.confirm();

    await expect(dialog.error).toContainText('That didn’t go through');
    await expect(dialog.error).toContainText('Nothing was booked or changed');
    expect(fakeApi.planner.appliedProposals).toEqual([]);
    await dialog.tryAgain();
    await expect(dialog.dialog).toHaveCount(0);
    expect(fakeApi.planner.appliedProposals).toHaveLength(1);
  });

  test('is a bottom sheet on phones and centred from 640px', async ({ page }) => {
    const chat = new PlannerChatPage(page);
    const dialog = new AcceptPlanDialog(page);
    await chat.useWidth(360);
    await chat.useThisPlan();
    await expect(dialog.dialog).toBeVisible();
    await expect.poll(() => dialog.placement()).toBe('bottom-sheet');

    await chat.useWidth(1000);
    await expect.poll(() => dialog.placement()).toBe('centred');
  });

  test('closes on Esc and returns focus to Use this plan', async ({ page }) => {
    const chat = new PlannerChatPage(page);
    const dialog = new AcceptPlanDialog(page);
    await chat.useThisPlan();

    await dialog.pressEscape();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(chat.planCard.getByRole('button', { name: 'Use this plan' })).toBeFocused();
  });
});

for (const width of [360, 1280]) {
  test(`chat, plan and dialog have no serious accessibility issues at ${width}px`, async ({
    page,
    fakeApi,
  }) => {
    fakeApi.planner.script = [FakePlanner.planTurn(50)];
    const chat = new PlannerChatPage(page);
    const dialog = new AcceptPlanDialog(page);
    await chat.useWidth(width);
    await chat.openChat();
    expect(await chat.seriousAccessibilityViolations()).toEqual([]);

    await chat.send('Plan it');
    await expect(chat.planCard).toBeVisible();
    expect(await chat.seriousAccessibilityViolations()).toEqual([]);
    expect(await chat.scrollsSideways()).toBe(false);

    await chat.useThisPlan();
    await expect(dialog.dialog).toBeVisible();
    expect(await chat.seriousAccessibilityViolations()).toEqual([]);
  });
}
