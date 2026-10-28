import { test, expect } from '@playwright/test';
import { PAGINAS, type NombrePagina } from '../pages/LigninaPage';

/**
 * BLOQUE CALIDAD DE USO · US-14, US-15 y US-20 (historias MLIG-14, MLIG-15 y MLIG-82).
 */

test.describe('US-14 · Usar el sitio desde el celular', () => {
  // Pantalla de teléfono (375 px de ancho) solo para las pruebas de este bloque.
  test.use({ viewport: { width: 375, height: 812 } });

  const PAGINAS_MOVIL: { pagina: NombrePagina; bug: string }[] = [
    { pagina: 'Inicio', bug: '' },
    { pagina: 'Categorías', bug: '' },
    { pagina: 'Venta de la semana', bug: '' },
    { pagina: 'Consejos', bug: 'MLIG-121 · Consejos se desborda a lo ancho en 375 px' },
    { pagina: 'Comentarios', bug: '' },
  ];
  for (const { pagina, bug } of PAGINAS_MOVIL) {
    test(`CA1: "${pagina}" cabe en 375 px sin desplazamiento horizontal`, async ({ page }) => {
      test.fail(bug !== '', bug);
      await page.goto(PAGINAS[pagina]);

      // Si el contenido es más ancho que la pantalla, aparece la barra de desplazamiento horizontal.
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(ancho).toBeLessThanOrEqual(375);
    });
  }
});

test.describe('US-15 · Usar el sitio con lector de pantalla', () => {
  test('CA1: cada imagen de producto tiene un texto alternativo de ESE producto', async ({ page }) => {
    // CAZABUGS. Cuatro imágenes (Mesada, Estante y Armario de Dormitorio; Mesada de Baño) dicen "escritorio".
    test.fail(true, 'MLIG-122 · Imágenes de producto con texto alternativo "escritorio"');
    await page.goto('pages-01/seccion2.html');

    // Oráculo: el nombre del producto (texto de su botón). El texto alternativo debe empezar igual.
    const productos = await page.locator('div[id^="d"]').evaluateAll((divs) =>
      divs
        .filter((d) => /^d\d\d$/.test(d.id))
        .map((d) => ({
          id: d.id,
          producto: d.querySelector('button')?.textContent?.trim() ?? '',
          alt: d.querySelector('img')?.getAttribute('alt') ?? '',
        })),
    );
    const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s/g, '');
    const incorrectos = productos.filter((p) => !sinTildes(p.producto).startsWith(sinTildes(p.alt).slice(0, 4)));

    expect(productos).toHaveLength(28);
    expect(incorrectos).toEqual([]);
  });
});

test.describe('US-20 · Identificar la tienda en el navegador', () => {
  const TITULOS: { pagina: NombrePagina; bug: string }[] = [
    { pagina: 'Inicio', bug: 'MLIG-126 · El título del inicio dice "LIGNINA | Maderera-Borsari"' },
    { pagina: 'Nosotros', bug: '' },
    { pagina: 'Categorías', bug: '' },
    { pagina: 'Registro', bug: '' },
    { pagina: 'Carro de compras', bug: '' },
  ];
  for (const { pagina, bug } of TITULOS) {
    test(`CA1: la pestaña de "${pagina}" tiene el formato "Sección | LIGNINA"`, async ({ page }) => {
      test.fail(bug !== '', bug);
      await page.goto(PAGINAS[pagina]);

      await expect(page).toHaveTitle(/^[^|]+ \| LIGNINA$/);
    });
  }

  test('CA3: Categorías carga sin archivos del sitio que respondan 404', async ({ page, baseURL }) => {
    // CAZABUGS. La hoja de estilos pide img/seccion_22/cartel.png, que no existe.
    test.fail(true, 'MLIG-128 · Categorías pide img/seccion_22/cartel.png y responde 404');
    const rotos: string[] = [];
    // Solo los archivos del propio sitio (los de Google, redes, etc. no son nuestros).
    const origen = new URL(baseURL!).origin;
    page.on('response', (r) => {
      if (r.status() >= 400 && r.url().startsWith(origen)) rotos.push(r.url());
    });

    await page.goto('pages-01/seccion2.html');
    await page.waitForLoadState('networkidle');

    expect(rotos).toEqual([]);
  });

  test('CA3: los íconos del manifiesto (site.webmanifest) existen', async ({ page, request }) => {
    // CAZABUGS. El manifiesto pide /android-chrome-*.png en la raíz, pero los archivos están en img/Favicoon/.
    test.fail(true, 'MLIG-127 · Los íconos del manifiesto responden 404');
    await page.goto('/');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    const urlManifiesto = new URL(href!, page.url());
    const manifiesto = await (await request.get(urlManifiesto.href)).json();

    for (const icono of manifiesto.icons as { src: string }[]) {
      const respuesta = await request.get(new URL(icono.src, urlManifiesto).href);
      expect(respuesta.status(), icono.src).toBe(200);
    }
  });
});
