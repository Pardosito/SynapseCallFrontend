import { test, expect } from '@playwright/test';

test.describe('Registro de usuario en SynapseCall', () => {
  test('debe mostrar la pantalla de registro', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByText(/registra tus datos/i)).toBeVisible();

    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/correo/i)).toBeVisible();
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible();
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();

    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });

  test('debe mantener deshabilitado el botón si el formulario está vacío', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
  });

  test('debe mostrar error si el nombre tiene menos de 5 caracteres', async ({ page }) => {
    await page.goto('/register');

    const nameInput = page.getByLabel(/nombre completo/i);

    await nameInput.fill('Ana');
    await nameInput.blur();

    await expect(page.getByText(/el nombre debe tener al menos 5 caracteres/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
  });

  test('debe mostrar error si el correo tiene formato incorrecto', async ({ page }) => {
    await page.goto('/register');

    const emailInput = page.getByLabel(/correo/i);

    await emailInput.fill('correo-invalido');
    await emailInput.blur();

    await expect(page.getByText(/el formato ingresado del email es icorrecto/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
  });

  test('debe mostrar error si la contraseña no tiene mayúscula', async ({ page }) => {
    await page.goto('/register');

    const passwordInput = page.getByLabel(/^contraseña$/i);

    await passwordInput.fill('password123');
    await passwordInput.blur();

    await expect(page.getByText(/la contraseña debe tener al menos una mayúscula/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
  });

  test('debe mostrar error si las contraseñas no coinciden', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel(/nombre completo/i).fill('Usuario Prueba');
    await page.getByLabel(/correo/i).fill('usuario@test.com');
    await page.getByLabel(/^contraseña$/i).fill('Password123');

    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);

    await confirmPasswordInput.fill('Password456');
    await confirmPasswordInput.blur();

    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled();
  });

  test('debe enviar el registro correctamente cuando los datos son válidos', async ({ page }) => {
    await page.route('**/auth/signup', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Cuenta creada con exito.',
        }),
      });
    });

    await page.goto('/register');

    await page.getByLabel(/nombre completo/i).fill('Usuario Prueba');
    await page.getByLabel(/correo/i).fill('usuario@test.com');
    await page.getByLabel(/^contraseña$/i).fill('Password123');
    await page.getByLabel(/confirmar contraseña/i).fill('Password123');

    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeEnabled();

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page.getByText(/cuenta creada con exito/i)).toBeVisible();
  });

  test('debe mostrar error cuando el backend rechaza el registro', async ({ page }) => {
    await page.route('**/auth/signup', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'El correo ya está registrado',
        }),
      });
    });

    await page.goto('/register');

    await page.getByLabel(/nombre completo/i).fill('Usuario Prueba');
    await page.getByLabel(/correo/i).fill('usuario@test.com');
    await page.getByLabel(/^contraseña$/i).fill('Password123');
    await page.getByLabel(/confirmar contraseña/i).fill('Password123');

    await page.getByRole('button', { name: /crear cuenta/i }).click();

    await expect(page.getByText(/el correo ya está registrado/i)).toBeVisible();
  });
});