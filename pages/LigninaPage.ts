import { type Locator, type Page } from '@playwright/test';

/**
 * PARTE 5 · PAGE OBJECT DE MADERERA LIGNINA.
 *
 * Las pruebas cuentan la HISTORIA ("abro la Mesada de Dormitorio y presiono Comprar"), no el HTML
 * ('div[id^="d1"]', '.modal.show'). Los localizadores (el "cómo") viven aquí, en un solo lugar:
 * si mañana el sitio cambia su HTML, se corrige esta clase una vez y las pruebas siguen intactas.
 *
 * Regla de oro: la clase ofrece ACCIONES (abrirProducto, comprar, buscar…) y entrega LOCALIZADORES
 * (ventana, menu, campoRegistro…). Las aserciones (expect) se quedan en las pruebas.
 */

/** Páginas del sitio y su ruta (relativa a baseURL). */
export const PAGINAS = {
  Inicio: 'index.html',
  Nosotros: 'pages-01/seccion1.html',
  Categorías: 'pages-01/seccion2.html',
  'Venta de la semana': 'pages-01/seccion3.html',
  Consejos: 'pages-01/seccion4.html',
  Comentarios: 'pages-01/seccion5.html',
  Registro: 'pages-01/registro.html',
  Ingreso: 'pages-01/ingreso.html',
  'Carro de compras': 'pages-01/carro_de_compras.html',
} as const;
export type NombrePagina = keyof typeof PAGINAS;

/** Categorías de la página Categorías: cada una agrupa sus productos en contenedores d1x, d2x… */
const CATEGORIAS = { Dormitorio: 1, Baño: 2, Living: 3, Exterior: 4, Deco: 5, Fraccionado: 6, Rústica: 7 } as const;
export type Categoria = keyof typeof CATEGORIAS;

export class LigninaPage {
  /** El menú de navegación principal. */
  readonly menu: Locator;
  /** La ventana emergente (modal de Bootstrap) que esté abierta en este momento. */
  readonly ventana: Locator;

  constructor(readonly page: Page) {
    this.menu = page.locator('nav');
    // Solo hay una ventana abierta a la vez; las cerradas tienen aria-hidden y getByRole las ignora.
    this.ventana = page.getByRole('dialog');
  }

  // ---------- Navegación ----------
  /** Abre una página del sitio. */
  async abrir(pagina: NombrePagina = 'Inicio'): Promise<void> {
    await this.page.goto(PAGINAS[pagina]);
  }

  // ---------- Catálogo ----------
  /** El botón de un producto dentro de su categoría (el nombre se repite entre categorías: "Mesada", "Estante"…). */
  producto(categoria: Categoria, nombre: string): Locator {
    return this.page
      .locator(`div[id^="d${CATEGORIAS[categoria]}"]`)
      .getByRole('button', { name: nombre, exact: true });
  }

  /** Abre la ventana de detalle de un producto y espera a que termine de abrirse. */
  async abrirProducto(categoria: Categoria, nombre: string): Promise<void> {
    await this.producto(categoria, nombre).click();
    await this.esperarVentanaAbierta();
  }

  /** En el inicio: presiona una imagen (por su texto alternativo) para verla ampliada. */
  async ampliarImagen(nombre: string): Promise<void> {
    await this.page.getByRole('img', { name: nombre, exact: true }).first().click();
    await this.esperarVentanaAbierta();
  }

  /** Bootstrap termina de abrir la ventana (animación "fade") y le pasa el foco: recién ahí atiende Esc. */
  private async esperarVentanaAbierta(): Promise<void> {
    await this.ventana.waitFor({ state: 'visible' });
    await this.page.waitForFunction(() => !!document.activeElement?.closest('.modal.show'));
  }

  /** Presiona "Comprar" en la ventana de detalle abierta. */
  async comprar(): Promise<void> {
    await this.ventana.getByRole('button', { name: 'Comprar' }).click();
  }

  /** Cierra la ventana abierta con el botón "Cerrar", con la "X" o con la tecla Esc. */
  async cerrarVentana(como: 'Cerrar' | 'X' | 'Esc' = 'Cerrar'): Promise<void> {
    if (como === 'Esc') await this.page.keyboard.press('Escape');
    else await this.ventana.getByRole('button', { name: como === 'X' ? 'Close' : 'Cerrar' }).click();
    await this.ventana.waitFor({ state: 'hidden' });
  }

  /** Escribe un término en "Buscar" y presiona la lupa. */
  async buscar(termino: string): Promise<void> {
    await this.page.getByPlaceholder('Buscar').fill(termino);
    await this.menu.locator('button:has(.fa-search)').click();
  }

  // ---------- Cuenta ----------
  /** Un campo del formulario de registro, por el texto de su etiqueta. */
  campoRegistro(etiqueta: 'Nombre' | 'Apellido' | 'Nombre de usuario' | 'Ciudad' | 'Zona' | 'Postal'): Locator {
    return this.page.getByLabel(etiqueta, { exact: true });
  }

  /** Presiona "Registrarme!". */
  async registrarme(): Promise<void> {
    await this.page.getByRole('button', { name: 'Registrarme!' }).click();
  }

  /** Escribe correo y contraseña en Ingreso y presiona "Ingresar". */
  async ingresar(correo: string, clave: string): Promise<void> {
    await this.page.getByLabel('Email').fill(correo);
    await this.page.getByLabel('Contraseña').fill(clave);
    await this.page.getByRole('main').getByRole('button', { name: 'Ingresar' }).click();
  }

  // ---------- Pie de página ----------
  /** Escribe un correo en Newsletter y presiona su botón. (El campo no tiene etiqueta: por eso el placeholder.) */
  async suscribir(correo: string): Promise<void> {
    const newsletter = this.page.locator('#divnewsletter');
    await newsletter.getByPlaceholder('Email').fill(correo);
    await newsletter.getByRole('button').click();
  }
}
