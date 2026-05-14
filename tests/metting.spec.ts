import { expect, Page, test } from '@playwright/test';

const TEST_EMAIL = 'synapse.test@test.com';
const TEST_PASSWORD = 'Password123';

function getFutureDatetimeLocal(): string {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

async function login(page: Page): Promise<void> {
  await page.goto('/login');

  await page.getByLabel(/correo/i).fill(TEST_EMAIL);
  await page.getByLabel(/contrase(?:n|ñ)a/i).fill(TEST_PASSWORD);

  await page.getByRole('button', { name: /entrar/i }).click();

  await expect(page).toHaveURL(/dashboard/, {
    timeout: 30_000,
  });
}

test.describe('Flujo de reunión en deploy', () => {
  test('debe crear una reunión, entrar y controlar cámara/micrófono', async ({ page }) => {
    test.setTimeout(120_000);

    await login(page);

    const meetingTitle = `Reunión E2E ${Date.now()}`;

    await page.getByRole('button', { name: /nueva reunión/i }).click();

    await expect(page.getByRole('heading', { name: /nueva reunión/i })).toBeVisible();

    await page.getByLabel(/título/i).fill(meetingTitle);
    await page.getByLabel(/fecha y hora/i).fill(getFutureDatetimeLocal());

    await page.getByRole('button', { name: /crear reunión/i }).click();

    await expect(page.getByText(meetingTitle)).toBeVisible({
      timeout: 30_000,
    });

    const meetingCard = page.locator('.meeting-card').filter({
      hasText: meetingTitle,
    });

    await expect(meetingCard).toBeVisible();

    await meetingCard.getByRole('button', { name: /unirse/i }).click();

    await expect(page).toHaveURL(/\/room\/.+/, {
      timeout: 30_000,
    });

    await expect(page.getByText(/en vivo/i)).toBeVisible({
      timeout: 30_000,
    });

    // Prueba cámara
    await page.getByTitle(/apagar cámara/i).click();
    await expect(page.getByTitle(/activar cámara/i)).toBeVisible();

    await page.getByTitle(/activar cámara/i).click();
    await expect(page.getByTitle(/apagar cámara/i)).toBeVisible();

    // Prueba micrófono
    await page.getByTitle(/silenciar/i).click();
    await expect(page.getByTitle(/activar micrófono/i)).toBeVisible();

    await page.getByTitle(/activar micrófono/i).click();
    await expect(page.getByTitle(/silenciar/i)).toBeVisible();
  });
});