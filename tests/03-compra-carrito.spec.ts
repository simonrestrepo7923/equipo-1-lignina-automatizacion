import { test, expect } from '@playwright/test';
import { LigninaPage } from '../pages/LigninaPage';

/**
 * BLOQUE CARRITO · US-05 y US-07 (historias MLIG-5 y MLIG-7).
 * Recuerden: cada prueba arranca con el navegador limpio (sin cookies ni datos guardados de la anterior).
 */

test.describe('US-05 · Comprar un producto desde su detalle', () => {
  test('CA1: "Comprar" en el detalle de la Mesada (Dormitorio) la lleva al carrito', async ({ page }) => {
    // CAZABUGS. El botón "Comprar" de las ventanas de detalle no tiene ninguna acción.
    test.fail(true, 'MLIG-107 · "Comprar" en el detalle de Categorías no agrega nada al carrito');
    const lignina = new LigninaPage(page);
    await lignina.abrir('Categorías');

    await lignina.abrirProducto('Dormitorio', 'Mesada');
    await lignina.comprar();
    await lignina.abrir('Carro de compras');

    await expect(page.getByRole('main')).toContainText('Mesada');
  });

  test('CA2: "Comprar" de la Silla de caña (Ventas antiguas) la lleva al carrito', async ({ page }) => {
    // CAZABUGS. Los "Comprar" de Venta de la semana son enlaces a "#": solo saltan al inicio de la página.
    test.fail(true, 'MLIG-108 · "Comprar" en Venta de la semana apunta a "#" y no compra');
    const lignina = new LigninaPage(page);
    await lignina.abrir('Venta de la semana');

    // El primer "Comprar" de Ventas antiguas es el de la Silla de caña.
    await page.getByRole('link', { name: 'Comprar' }).first().click();
    await lignina.abrir('Carro de compras');

    await expect(page.getByRole('main')).toContainText('Silla de caña');
  });

  test('CA3: cerrar el detalle del Lavabo con "Cerrar" o con la "X" no agrega nada', async ({ page }) => {
    const lignina = new LigninaPage(page);
    await lignina.abrir('Categorías');

    await lignina.abrirProducto('Baño', 'Lavabo');
    await lignina.cerrarVentana('Cerrar');
    await expect(lignina.ventana).toBeHidden();

    await lignina.abrirProducto('Baño', 'Lavabo');
    await lignina.cerrarVentana('X');
    await expect(lignina.ventana).toBeHidden();

    await lignina.abrir('Carro de compras');
    await expect(page.getByRole('main')).not.toContainText('Lavabo');
  });
});

test.describe('US-07 · Ver mi carrito de compras', () => {
  test('CA2: sin productos, el carrito dice "Tu carrito está vacío" y el total es $ 0', async ({ page }) => {
    // CAZABUGS. La página del carrito solo tiene el título "Carro de compras".
    test.fail(true, 'MLIG-109 · El carrito no muestra productos, mensaje de vacío ni total');
    await page.goto('pages-01/carro_de_compras.html');

    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Total');
    await expect(page.getByRole('main')).toContainText('$ 0');
  });
});
