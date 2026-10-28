import { test, expect } from '@playwright/test';
import { LigninaPage } from '../pages/LigninaPage';

/**
 * BLOQUE CONTENIDO · US-11, US-12, US-13, US-17 y US-18 (historias MLIG-11, 12, 13, 79 y 80).
 */

test.describe('US-11 · Dejar un comentario', () => {
  test('CA1: un comentario válido se publica en la lista', async ({ page }) => {
    // CAZABUGS. El formulario de comentarios no tiene ninguna acción.
    test.fail(true, 'MLIG-116 · Los comentarios no se publican ni se valida el campo vacío');
    const COMENTARIO = 'Excelente calidad en la mesa que compré.';
    await page.goto('pages-01/seccion5.html');

    await page.getByLabel('Escribe tu comentario aquí. Gracias!').fill(COMENTARIO);
    await page.getByRole('main').getByRole('button').click();

    // El texto debe aparecer publicado en la página, fuera del campo donde se escribió.
    await expect(page.getByRole('main').getByText(COMENTARIO)).toBeVisible();
  });

  test('CA3: el botón del formulario de comentarios está en español ("Enviar")', async ({ page }) => {
    // CAZABUGS. Todo el sitio está en español, pero el botón dice "Submit".
    test.fail(true, 'MLIG-117 · El botón de comentarios dice "Submit" en vez de "Enviar"');
    await page.goto('pages-01/seccion5.html');

    await expect(page.getByRole('main').getByRole('button')).toHaveText('Enviar');
  });
});

test.describe('US-12 · Suscribirme al newsletter', () => {
  test('CA1: con un correo válido veo un mensaje de suscripción exitosa', async ({ page }) => {
    // CAZABUGS. El campo y el botón no están dentro de un formulario ni tienen JavaScript: no pasa nada.
    test.fail(true, 'MLIG-118 · El newsletter no suscribe ni valida el correo');
    const lignina = new LigninaPage(page);
    await lignina.abrir();

    await lignina.suscribir('juan@correo.com');

    await expect(page.locator('#divnewsletter')).toContainText(/suscri/i);
  });
});

test.describe('US-13 · Consultar contacto y atención al cliente', () => {
  for (const enlace of ['Envíos', 'Plazos', 'Legales', 'Pago']) {
    test(`CA1: "${enlace}" en Atención al cliente lleva a su información (no a "#")`, async ({ page }) => {
      // CAZABUGS. Los cuatro enlaces fallan por el mismo defecto: es UN solo bug en Jira.
      test.fail(true, 'MLIG-119 · Envíos, Plazos, Legales y Pago apuntan a "#"');
      await page.goto('/');

      const link = page.locator('#divatencion').getByRole('link', { name: enlace });

      await expect(link).not.toHaveAttribute('href', '#');
    });
  }
});

test.describe('US-17 · Ampliar las imágenes de la página de inicio', () => {
  test('CA2: la imagen ampliada de la estancia se cierra con Esc', async ({ page }) => {
    const lignina = new LigninaPage(page);
    await lignina.abrir();

    await lignina.ampliarImagen('estancia');
    await expect(lignina.ventana).toBeVisible();
    await lignina.cerrarVentana('Esc');

    await expect(lignina.ventana).toBeHidden();
  });

  test('CA3: la imagen ampliada tiene un botón visible para cerrarla', async ({ page }) => {
    // CAZABUGS. La ventana solo trae la imagen: no hay "X" ni "Cerrar".
    test.fail(true, 'MLIG-125 · La imagen ampliada no tiene botón para cerrar');
    const lignina = new LigninaPage(page);
    await lignina.abrir();

    await lignina.ampliarImagen('estancia');

    await expect(lignina.ventana.getByRole('button', { name: /cerrar|close/i })).toBeVisible();
  });
});

test.describe('US-18 · Volver al inicio de la página con el botón flotante', () => {
  test('CA2 y CA3: el botón aparece al bajar y, al presionarlo, sube al principio', async ({ page }) => {
    await page.goto('pages-01/seccion2.html');
    // El botón lo crea un script (jQuery) cuando la página termina de cargar; arranca transparente.
    const boton = page.locator('#topcontrol');
    await expect(boton).toHaveCSS('opacity', '0');

    await page.mouse.wheel(0, 2000);
    // Aparece con una animación de medio segundo: se espera la CONDICIÓN (opacidad 1), no un tiempo fijo.
    await expect(boton).toHaveCSS('opacity', '1');

    await boton.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(boton).toHaveCSS('opacity', '0');
  });
});
