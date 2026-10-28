import { test, expect } from '@playwright/test';
import { LigninaPage } from '../pages/LigninaPage';

/**
 * BLOQUE CUENTA · US-08 y US-09 (historias MLIG-8 y MLIG-9).
 *
 * Validación nativa del navegador: cuando un campo rechaza un dato, el navegador guarda su motivo en
 * campo.validationMessage (es el globo "Incluye un signo @…"). Si está vacío, el navegador NO rechazó nada.
 */

test.describe('US-08 · Registrarme como cliente', () => {
  test('CA2: el formulario de registro arranca con todos los campos vacíos', async ({ page }) => {
    // CAZABUGS. En el HTML, el Apellido tiene  value= required  (sin comillas): el navegador lo lee como value="required".
    test.fail(true, 'MLIG-112 · El campo Apellido aparece prellenado con el texto "required"');
    const lignina = new LigninaPage(page);
    await lignina.abrir('Registro');

    for (const campo of ['Nombre', 'Apellido', 'Nombre de usuario', 'Ciudad', 'Postal'] as const) {
      await expect(lignina.campoRegistro(campo), `campo ${campo}`).toHaveValue('');
    }
  });

  test('CA2: enviar el registro vacío muestra un error por campo y no sale de Registro', async ({ page }) => {
    // CAZABUGS. El formulario tiene "novalidate" y no hay JavaScript que valide: se envía igual.
    test.fail(true, 'MLIG-111 · El registro se envía vacío y sin términos, sin mostrar errores');
    const lignina = new LigninaPage(page);
    await lignina.abrir('Registro');

    await lignina.registrarme();

    await expect(page).toHaveURL(/registro\.html/);
    await expect(page.getByText('Por favor escribe tu ciudad.')).toBeVisible();
    await expect(page.getByText('Debes aceptar antes de registrarte.')).toBeVisible();
  });
});

test.describe('US-09 · Ingresar con mi cuenta', () => {
  // PRUEBA DIRIGIDA POR DATOS con fallo conocido SOLO en las filas que fallan: la columna "bug" dice cuál.
  const CORREOS_INVALIDOS = [
    { correo: '', bug: 'MLIG-115 · El campo de correo vacío se acepta sin aviso' },
    { correo: 'juan@', bug: '' },
  ];
  for (const { correo, bug } of CORREOS_INVALIDOS) {
    test(`CA3: el correo "${correo}" se rechaza con un mensaje claro`, async ({ page }) => {
      test.fail(bug !== '', bug);
      const lignina = new LigninaPage(page);
      await lignina.abrir('Ingreso');

      await lignina.ingresar(correo, 'Clave123');

      // Rechazado = sigue en Ingreso sin enviarse (la URL no ganó un "?") y el campo explica por qué.
      await expect(page).toHaveURL(/ingreso\.html$/);
      const motivo = await page.getByLabel('Email').evaluate((campo: HTMLInputElement) => campo.validationMessage);
      expect(motivo).not.toBe('');
    });
  }
});
