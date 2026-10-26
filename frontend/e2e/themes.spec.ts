import { expect, test } from './fixtures/test';
import { ThemesPage } from './pages/themes.page';

test.describe('browsing themes', () => {
  test('shows themes for the child’s age by default, with interests tagged', async ({ page }) => {
    const themes = new ThemesPage(page);
    await themes.openThemes();

    await expect(themes.chip('For Zuri (7)')).toHaveAttribute('aria-pressed', 'true');
    await expect(themes.subtitle).toHaveText('13 themes · 11 for Zuri’s age');
    await expect(themes.theme('Unicorn Rainbow')).toHaveCount(0);
    const science = themes.theme('Mad Science Lab');
    await expect(science).toContainText('Zuri might love');
    await expect(science).toContainText('Slime, fizzing potions and a lab coat each.');
    await expect(science).toContainText('Ages 6–12');
    await expect(themes.theme('Dino Dig')).toContainText('Chosen for Zuri');
  });

  test('filters update without a reload and announce their state', async ({ page }) => {
    const themes = new ThemesPage(page);
    await themes.openThemes();

    await themes.chip('Outdoor').click();

    await expect(themes.chip('Outdoor')).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => themes.names())
      .toEqual(['Camping Under the Stars', 'Jungle Safari', 'Pirate Adventure', 'Sports Day']);
    await themes.chip('For Zuri (7)').click();
    await themes.chip('Ages 3–5').click();
    await expect.poll(() => themes.names()).toEqual(['Jungle Safari', 'Pirate Adventure']);
  });

  test('offers to clear the filters or ask Giddy when nothing matches', async ({
    page,
    fakeApi,
  }) => {
    fakeApi.themeStore.themes = fakeApi.themeStore.themes.filter((t) => !t.outdoor);
    const themes = new ThemesPage(page);
    await themes.openThemes();

    await themes.chip('Outdoor').click();

    await expect(themes.emptyState).toContainText('No themes match these filters');
    await expect(themes.chip('Outdoor')).toBeVisible();
    await expect(
      themes.emptyState.getByRole('link', { name: 'Ask Giddy instead' }),
    ).toHaveAttribute('href', '/ask-giddy');
    await themes.emptyState.getByRole('button', { name: 'Clear filters' }).click();
    await expect(themes.chip('For Zuri (7)')).toHaveAttribute('aria-pressed', 'false');
    await expect(themes.results).toHaveCount(9);
  });
});

test.describe('choosing a theme', () => {
  test('sets the party’s theme and offers Undo', async ({ page, fakeApi }) => {
    const themes = new ThemesPage(page);
    await themes.openThemes();

    await themes.use('Space Explorers');

    await expect(themes.theme('Space Explorers')).toContainText('Chosen for Zuri');
    await expect(themes.theme('Dino Dig')).not.toContainText('Chosen for Zuri');
    const toast = themes.toast('Space Explorers is Zuri’s theme');
    await expect(toast).toContainText(
      'Giddy will use it for invites, the cake and activity ideas.',
    );
    await toast.getByRole('button', { name: 'Undo' }).click();
    await expect(themes.theme('Dino Dig')).toContainText('Chosen for Zuri');
    expect(fakeApi.themeStore.partyTheme).toBe('Dino Dig');
  });

  test('the undo offer goes after eight seconds', async ({ page }) => {
    const themes = new ThemesPage(page);
    await themes.openThemes();

    await themes.use('Space Explorers');

    await expect(themes.toast('Space Explorers is Zuri’s theme')).toBeVisible();
    await expect(themes.toast('Space Explorers is Zuri’s theme')).toHaveCount(0, {
      timeout: 10_000,
    });
  });

  test('viewers can browse but not choose', async ({ page, fakeApi }) => {
    fakeApi.partyStore.parties[0].role = 'viewer';
    const themes = new ThemesPage(page);
    await themes.openThemes();

    await expect(themes.theme('Space Explorers')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use this theme' })).toHaveCount(0);
  });
});

for (const width of [360, 1280]) {
  test(`themes pass accessibility checks at ${width}px`, async ({ page }) => {
    const themes = new ThemesPage(page);
    await themes.useWidth(width);
    await themes.openThemes();
    await expect(themes.results.first()).toBeVisible();

    expect(await themes.seriousAccessibilityViolations()).toEqual([]);
    expect(await themes.scrollsSideways()).toBe(false);
  });
}
