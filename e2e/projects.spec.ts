// U-15: /projects and the /work/sluice case study against the production build (PROJ-AC-07,
// PROJ-AC-08, PROJ-AC-10). The e2e server runs with no SLUICE_ORIGIN, so no "Play" link renders.
import { expect, test } from '@playwright/test';

test('PROJ-AC-07 /projects lists Sluice with a case-study link and no Play link', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  const card = page.getByRole('article').filter({ hasText: 'Sluice' });
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('link', { name: 'Read the case study' })).toHaveAttribute('href', '/work/sluice');
  await expect(page.getByRole('link', { name: 'Play', exact: true })).toHaveCount(0);
});

test('PROJ-AC-10 the home Sluice card links to /work/sluice and the link works', async ({ page }) => {
  await page.goto('/');
  await page.locator('#work').getByRole('link', { name: 'Read the case study' }).click();
  await expect(page).toHaveURL(/\/work\/sluice$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sluice');
});

test('PROJ-AC-08 /work/sluice has the five sections and "Evaluation in progress"', async ({ page }) => {
  await page.goto('/work/sluice');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Problem', 'Why it matters', 'Architecture', 'Evaluation', 'Trade-offs']);
  await expect(page.getByText('Evaluation in progress')).toBeVisible();
  await expect(page.locator('svg[role="img"]')).toHaveCount(2);
});
