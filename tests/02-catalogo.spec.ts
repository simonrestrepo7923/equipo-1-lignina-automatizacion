import { test, expect } from '@playwright/test';
import { LigninaPage } from '../pages/LigninaPage';

/**
 * BLOQUE CATÁLOGO · US-03 y US-04 (historias MLIG-3 y MLIG-4).
 *
 * "CAZABUGS" = la prueba afirma lo que dice el CRITERIO, no lo que el sitio hace hoy. Si el sitio no cumple,
 * la prueba queda roja: se diagnostica (Parte 3) y, si es un bug del producto, se marca con test.fail('CLAVE · …')
 * en su primera línea. Así la suite queda verde en CI y el bug conocido queda documentado.
 */

const CATEGORIAS = ['Dormitorio', 'Baño', 'Living', 'Exterior', 'Deco', 'Fraccionado', 'Rústico'];

test.describe('US-03 · Buscar productos por nombre', () => {
  test('CA1: buscar "Mesada" muestra las mesadas del catálogo', async ({ page }) => {
    // CAZABUGS. La lupa no tiene ninguna lógica: no filtra ni lleva a una página de resultados.
    test.fail(true, 'MLIG-104 · El buscador no busca: la lupa no hace nada');
    const lignina = new LigninaPage(page);
    await lignina.abrir();

    await lignina.buscar('Mesada');

    // Debe aparecer al menos un producto "Mesada" a la vista (en el inicio no hay ninguno).
    await expect(page.getByRole('button', { name: 'Mesada', exact: true }).first()).toBeVisible();
  });
});

test.describe('US-04 · Ver los productos de cada categoría', () => {
  test('CA1: las 7 categorías se muestran y ninguna imagen de producto está rota', async ({ page }) => {
    await page.goto('pages-01/seccion2.html');

    for (const categoria of CATEGORIAS) {
      await expect(page.getByRole('heading', { name: categoria, level: 3 })).toBeVisible();
    }
    // Una imagen rota está "completa" pero mide 0 px. goto() ya esperó el evento load: todas terminaron de cargar.
    const rotas = await page
      .locator('div[id^="d"] img')
      .evaluateAll((imagenes) =>
        (imagenes as HTMLImageElement[]).filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src),
      );
    expect(rotas).toEqual([]);
  });

  test('CA2: el detalle del Escritorio muestra nombre, imagen, descripción y precio', async ({ page }) => {
    const lignina = new LigninaPage(page);
    await lignina.abrir('Categorías');

    await lignina.abrirProducto('Dormitorio', 'Escritorio');

    await expect(lignina.ventana.getByRole('heading')).toHaveText('Escritorio');
    await expect(lignina.ventana.getByRole('img')).toBeVisible();
    await expect(lignina.ventana).toContainText('dimensiones');
    await expect(lignina.ventana).toContainText('Precio:');
  });

  test('CA3: el título del detalle coincide con el producto de la imagen (estante de Deco)', async ({ page }) => {
    // CAZABUGS. El ORÁCULO es la imagen (deco-estante-o.png), no el texto que hoy muestra el sitio.
    test.fail(true, 'MLIG-105 · El estante de Deco se titula "Escritorio" en su detalle');
    await page.goto('pages-01/seccion2.html');

    const tarjeta = page.locator('div[id^="d5"]').filter({ has: page.locator('img[src*="deco-estante"]') }).first();
    await tarjeta.getByRole('button').first().click();

    await expect(page.getByRole('dialog').getByRole('heading')).toHaveText('Estante');
  });

  test('CA4: todos los precios usan "$ " y punto como separador de miles', async ({ page }) => {
    // CAZABUGS. Formato esperado según el criterio: "$ 4.200", "$ 15.000"…
    test.fail(true, 'MLIG-106 · Precios sin separador de miles y con formato distinto entre páginas');
    const FORMATO = /^\$ \d{1,3}(\.\d{3})*$/;

    await page.goto('pages-01/seccion2.html');
    const deCategorias = await page.locator('.modal-body strong').allInnerTexts();
    await page.goto('pages-01/seccion3.html');
    const deVenta = await page.locator('td.columna3').allInnerTexts();

    const precios = [...deCategorias, ...deVenta].map((p) => p.trim());
    expect(precios.length).toBeGreaterThan(20);
    // Si falla, el reporte muestra exactamente cuáles precios no cumplen el formato.
    expect(precios.filter((p) => !FORMATO.test(p))).toEqual([]);
  });
});
