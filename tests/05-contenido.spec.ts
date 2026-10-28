import { test, expect } from '@playwright/test';
import { LigninaPage } from '../pages/LigninaPage';

/**
 * BLOQUE CONTENIDO · US-12 y US-17 (historias MLIG-12 y MLIG-79).
 */

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
