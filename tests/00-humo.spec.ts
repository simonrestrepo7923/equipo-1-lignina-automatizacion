import { test, expect } from '@playwright/test';

// Prueba de humo: ¿está vivo el sitio y funciona mi entorno? Si esta falla, nada más tiene sentido.
// Ejecútenla primero:  npx playwright test 00-humo
test('humo: la página de inicio de Lignina carga', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('LIGNINA');
});
