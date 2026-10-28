import { test, expect } from '@playwright/test';

/**
 * PRUEBAS HEREDADAS (Parte 4) · YA DIAGNOSTICADAS.
 *
 * Llegaron en CUARENTENA (test.fixme) porque nadie sabía por qué fallaban. Para cada una:
 *   1. se sacó de cuarentena y se ejecutó;
 *   2. se diagnosticó QUÉ falla: ¿el PRODUCTO (bug), la PRUEBA (defecto de la prueba), la INESTABILIDAD o el ENTORNO?
 *      La inestabilidad se buscó repitiéndolas:  npx playwright test heredados -g H3 --repeat-each=20
 *   3. se dejó en su estado correcto. El veredicto y la evidencia están en ENTREGA.md, sección 3.
 * Arriba de cada una queda, como comentario, la línea original que fallaba.
 */

// VEREDICTO: DEFECTO DE LA PRUEBA (dato viejo). Falla siempre igual: Expected 6 · Received 5.
// El sitio tiene 5 secciones en el menú (Nosotros, Categorías, Venta de la semana, Consejos, Comentarios),
// igual que el criterio US-01 CA1 y el caso CP-01.1. La prueba esperaba un número que no sale de ningún requisito.
// Original:  await expect(page.locator('nav').getByRole('link')).toHaveCount(6);
test('H1 · el menú principal tiene 5 secciones', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav').getByRole('link')).toHaveCount(5);
});

// VEREDICTO: BUG DEL PRODUCTO. Falla siempre igual: Expected "Precio: $ 15.000" · Received "Precio: $ 15000".
// Se reproduce a mano y la prueba afirma lo que pide el criterio US-04 CA4 (punto como separador de miles).
// Es el mismo defecto que detecta 02-catalogo › US-04 CA4: no es un bug nuevo, se suma a MLIG-106.
test('H2 · el detalle del Armario de Dormitorio muestra el precio $ 15.000', async ({ page }) => {
  test.fail(true, 'MLIG-106 · Precios sin separador de miles y con formato distinto entre páginas');
  await page.goto('pages-01/seccion2.html');
  await page.locator('div[id^="d1"]').getByRole('button', { name: 'Armario', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Precio: $ 15.000');
});

// VEREDICTO: PRUEBA INESTABLE. Con --repeat-each=20 falló 4, 6 y 3 veces de 20 (resultados mezclados, sin cambios).
// isVisible() mira UNA sola vez, justo después del clic, y la ventana de Bootstrap tarda unos milisegundos en
// mostrarse (animación "fade"). Gana quien llegue primero. Se corrige esperando la CONDICIÓN con una aserción que
// reintenta (toBeVisible), no con waitForTimeout. Corregida: 60 de 60 en verde con --repeat-each=20 (tres veces).
// Original:  const abierta = await page.locator('#d14Modal').isVisible();  expect(abierta).toBe(true);
test('H3 · abrir el Armario de Dormitorio muestra su ventana de detalle', async ({ page }) => {
  await page.goto('pages-01/seccion2.html');
  await page.locator('div[id^="d1"]').getByRole('button', { name: 'Armario', exact: true }).click();
  await expect(page.locator('#d14Modal')).toBeVisible();
});
