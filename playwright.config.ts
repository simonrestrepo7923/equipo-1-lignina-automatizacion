import { defineConfig, devices } from '@playwright/test';

// El sitio que vamos a probar. Por defecto, Playwright lo levanta solo en http://127.0.0.1:4173
// (scripts/servidor.mjs sirve la carpeta sitio/). Si el sitio está publicado en otra parte, se cambia sin tocar código:
//   BASE_URL=https://usuario.github.io/madereraLignina/ npx playwright test
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4173/';

export default defineConfig({
  testDir: './tests',

  // Tiempo máximo por prueba y por aserción (las aserciones reintentan hasta este límite).
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Las pruebas son independientes entre sí, así que pueden correr en paralelo.
  fullyParallel: true,

  // En CI: no se permite dejar un test.only por error, y se reintenta una vez.
  // Un reintento NO arregla una prueba inestable: solo la deja en evidencia (sale como "flaky").
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  // Resultado en la terminal + reporte HTML (npm run report)
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    // Evidencia: una captura de TODAS las pruebas (también las que encuentran bugs, marcadas con test.fail)
    // y el "trace" (línea de tiempo navegable) cuando una prueba falla sin esperarlo.
    screenshot: 'on',
    trace: 'retain-on-failure',
  },

  // Levanta el sitio antes de las pruebas (solo si no se pasó otra BASE_URL).
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'node scripts/servidor.mjs',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});