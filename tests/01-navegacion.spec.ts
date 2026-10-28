import { test, expect } from '@playwright/test';

/**
 * EJEMPLO RESUELTO · BLOQUE NAVEGACIÓN · US-01 (historia MLIG-1 en Jira).
 * Léanlo, ejecútenlo (npx playwright test 01-navegacion) y entiendan cada línea ANTES de escribir las suyas.
 *
 * Toda prueba automatizada tiene la misma forma, la de sus criterios de aceptación:
 *   ARRANGE (Dado)    → dejar el sistema en la situación inicial
 *   ACT     (Cuando)  → hacer la acción
 *   ASSERT  (Entonces) → comprobar el resultado
 *
 * Cada página del sitio tiene un título de pestaña "Sección | LIGNINA"; la página de error 404 no tiene título.
 * Por eso comprobar el título es una forma sencilla de saber que el enlace abrió la página correcta y no un 404.
 */

const SECCIONES = [
  { nombre: 'Nosotros', ruta: /seccion1\.html$/ },
  { nombre: 'Categorías', ruta: /seccion2\.html$/ },
  { nombre: 'Venta de la semana', ruta: /seccion3\.html$/ },
  { nombre: 'Consejos', ruta: /seccion4\.html$/ },
  { nombre: 'Comentarios', ruta: /seccion5\.html$/ },
];

test.describe('US-01 · Navegar entre las secciones del sitio', () => {
  // PRUEBA DIRIGIDA POR DATOS: una prueba por sección, generada desde la lista. El reporte dice cuál falla.
  for (const seccion of SECCIONES) {
    test(`CA1: desde Categorías, el menú "${seccion.nombre}" abre su sección`, async ({ page }) => {
      // ARRANGE: abrir la página Categorías (baseURL está en playwright.config.ts)
      await page.goto('pages-01/seccion2.html');

      // ACT: presionar el enlace del menú. exact: true evita que "Nosotros" coincida con otro texto parecido.
      await page.locator('nav').getByRole('link', { name: seccion.nombre, exact: true }).click();

      // ASSERT: la URL es la de la sección y la pestaña tiene su título (no es un 404).
      await expect(page).toHaveURL(seccion.ruta);
      await expect(page).toHaveTitle(`${seccion.nombre} | LIGNINA`);
    });
  }

  test('CA2: "Volver al inicio" desde Consejos regresa a la página de inicio', async ({ page }) => {
    await page.goto('pages-01/seccion4.html');

    await page.getByRole('link', { name: 'Volver al inicio' }).click();

    await expect(page).toHaveURL(/index\.html$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('LIGNINA');
  });

  test('CA3: desde Categorías, "Ingresar" abre la página de Ingreso (sin 404)', async ({ page }) => {
    // CAZABUGS. El enlace del encabezado apunta a "Ingreso.html" (con mayúscula) y el archivo es "ingreso.html".
    // En Windows parece funcionar porque sus carpetas no distinguen mayúsculas; un hosting real sí distingue.
    test.fail(true, 'MLIG-103 · "Ingresar" desde Categorías lleva a Ingreso.html y responde 404');
    await page.goto('pages-01/seccion2.html');

    await page.getByRole('link', { name: 'Ingresar' }).click();

    await expect(page).toHaveTitle('Ingreso | LIGNINA');
  });
});
