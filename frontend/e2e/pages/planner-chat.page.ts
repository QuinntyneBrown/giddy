import { Locator, Page } from '@playwright/test';
import { AppShellPage } from './app-shell.page';

/** Ask Giddy: the conversation, its composer and the Party at a glance aside. */
export class PlannerChatPage extends AppShellPage {
  readonly heading: Locator;
  readonly log: Locator;
  readonly messageBox: Locator;
  readonly sendButton: Locator;
  readonly stopButton: Locator;
  readonly typing: Locator;
  readonly planCard: Locator;
  readonly partyAtAGlance: Locator;
  readonly giddyKnows: Locator;
  readonly errorBlock: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Ask Giddy' });
    this.log = page.getByRole('list', { name: 'Conversation with Giddy' });
    this.messageBox = page.getByRole('textbox', { name: 'Message Giddy' });
    this.sendButton = page.getByRole('button', { name: 'Send message' });
    this.stopButton = page.getByRole('button', { name: 'Stop Giddy' });
    this.typing = page.getByLabel('Giddy is thinking');
    this.planCard = this.log.getByRole('region', { name: /plan/i }).last();
    this.partyAtAGlance = page.getByRole('complementary', { name: 'Party at a glance' });
    this.giddyKnows = page.getByRole('region', { name: 'Giddy knows' });
    this.errorBlock = page
      .getByRole('alert')
      .filter({ hasText: 'We couldn’t load this conversation' });
  }

  async openChat(): Promise<void> {
    await this.open('/ask-giddy');
  }

  messages(): Locator {
    return this.log.getByRole('listitem').filter({ has: this.page.locator('.bubble') });
  }

  parentMessage(text: string): Locator {
    return this.log.locator('.msg--me').filter({ hasText: text });
  }

  lastGiddyMessage(): Locator {
    return this.log.locator('.msg--agent').last();
  }

  /** The typing dots or a step in progress, whichever shows first. */
  progressIndicator(): Locator {
    return this.typing.or(this.workingSteps()).first();
  }

  doneSteps(): Locator {
    return this.log.locator('.tool-step--done');
  }

  workingSteps(): Locator {
    return this.log.locator('.tool-step:not(.tool-step--done)');
  }

  chip(name: string): Locator {
    return this.log.getByRole('button', { name, exact: true });
  }

  chipsIn(message: Locator): Locator {
    return message.locator('.suggestions').getByRole('button');
  }

  planRow(category: string): Locator {
    return this.planCard.locator('.plan-card__row').filter({ hasText: category });
  }

  planTotal(): Locator {
    return this.planCard.locator('.badge');
  }

  glanceValue(term: string): Locator {
    return this.partyAtAGlance
      .locator('dt', { hasText: term })
      .locator('xpath=following-sibling::dd[1]');
  }

  notSentAlert(): Locator {
    return this.log.getByRole('alert').filter({ hasText: 'wasn’t sent' });
  }

  giddyFailure(): Locator {
    return this.log.getByRole('alert').filter({ hasText: 'Giddy can’t answer right now' });
  }

  async type(text: string): Promise<void> {
    await this.messageBox.fill(text);
  }

  async send(text: string): Promise<void> {
    await this.messageBox.fill(text);
    await this.messageBox.press('Enter');
  }

  async pressShiftEnter(): Promise<void> {
    await this.messageBox.press('Shift+Enter');
  }

  async pressEscape(): Promise<void> {
    await this.messageBox.press('Escape');
  }

  async stop(): Promise<void> {
    await this.stopButton.click();
  }

  async chooseChip(name: string): Promise<void> {
    await this.chip(name).click();
  }

  async useThisPlan(): Promise<void> {
    await this.planCard.getByRole('button', { name: 'Use this plan' }).click();
  }

  async swapSomething(): Promise<void> {
    await this.planCard.getByRole('button', { name: 'Swap something' }).click();
  }

  async sendAgain(): Promise<void> {
    await this.notSentAlert().getByRole('button', { name: 'Send again' }).click();
  }

  async editMessage(): Promise<void> {
    await this.notSentAlert().getByRole('button', { name: 'Edit message' }).click();
  }

  async startNewChat(): Promise<void> {
    await this.main.getByRole('button', { name: 'New chat' }).click();
  }

  async tryAgain(): Promise<void> {
    await this.errorBlock.getByRole('button', { name: 'Try again' }).click();
  }

  openPlanInstead(): Locator {
    return this.errorBlock.getByRole('link', { name: 'Open the plan instead' });
  }

  manageMemories(): Locator {
    return this.giddyKnows.getByRole('link', { name: 'Manage' });
  }
}
