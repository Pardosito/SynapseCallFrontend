import { test, expect } from '@playwright/test';

test.describe('Login de SynapseCall', () => {
  test('debe mostrar la pantalla de inicio de sesión', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /iniciar sesion/i })).toBeVisible();
    await expect(page.getByText(/accede con tu cuenta/i)).toBeVisible();

    await expect(page.getByLabel(/correo/i)).toBeVisible();
    await expect(page.getByLabel(/contrasena/i)).toBeVisible();

    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('debe mantener deshabilitado el botón si los campos están vacíos', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('button', { name: /entrar/i })).toBeDisabled();
  });

  test('debe mostrar error si el correo tiene formato incorrecto', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByLabel(/correo/i);
    const passwordInput = page.getByLabel(/contrasena/i);

    await emailInput.fill('correo-invalido');
    await passwordInput.fill('Password123');

    await emailInput.blur();

    await expect(page.getByText(/el formato ingresado del email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeDisabled();
  });

  test('debe iniciar sesión correctamente y redirigir al dashboard', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'token-de-prueba',
          user: {
            id: '1',
            name: 'Usuario Prueba',
            email: 'usuario@test.com',
          },
        }),
      });
    });

    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          name: 'Usuario Prueba',
          email: 'usuario@test.com',
        }),
      });
    });

    await page.goto('/login');

    await page.getByLabel(/correo/i).fill('usuario@test.com');
    await page.getByLabel(/contrasena/i).fill('Password123');

    await expect(page.getByRole('button', { name: /entrar/i })).toBeEnabled();

    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page).toHaveURL(/dashboard/);
  });

  test('debe mostrar mensaje de error cuando las credenciales son incorrectas', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Credenciales incorrectas',
        }),
      });
    });

    await page.goto('/login');

    await page.getByLabel(/correo/i).fill('usuario@test.com');
    await page.getByLabel(/contrasena/i).fill('PasswordIncorrecto123');

    await page.getByRole('button', { name: /entrar/i }).click();

    await expect(page.getByText(/credenciales incorrectas/i)).toBeVisible();
  });
});