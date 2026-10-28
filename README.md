# Laboratorio 3.1 · Suite automatizada de madereraLignina

Laboratorio de **Verificación y validación de software** · Tema 3.1 *Introducción a la automatización de pruebas* · **equipo-1**.

Convertimos los casos de prueba **manuales** del plan de pruebas de madereraLignina (proyecto **MLIG** en Jira) en pruebas **automatizadas** con [Playwright](https://playwright.dev) y TypeScript, y las usamos para cazar bugs. Seguimos la guía del laboratorio del docente, adaptada a nuestro sitio:

- 🪵 **Sitio bajo prueba:** [Boni92/madereraLignina](https://github.com/Boni92/madereraLignina) (va como submódulo en la carpeta `sitio/`)
- 📘 **Guía del laboratorio:** https://qa-tienda-pruebas.vercel.app/lab-automatizacion.html
- 📋 **Historias, plan de pruebas y bugs:** Jira, proyecto MLIG (historias MLIG-1…15 y MLIG-78…82, bugs MLIG-103…128)

## Antes de empezar

Necesitan instalado: **Node.js 20 o superior** (`node -v`), **Git** y, recomendado, **Visual Studio Code**. Reserven ~600 MB: se descarga un navegador y el sitio.

## Empezar (una sola vez)

```bash
git clone --recurse-submodules https://github.com/SU-USUARIO/equipo-1-lignina-automatizacion.git
cd equipo-1-lignina-automatizacion
npm ci
npx playwright install chromium
npx playwright test 00-humo
```

Si la última línea termina en `1 passed`, su entorno funciona. (Si clonaron sin `--recurse-submodules`, no pasa nada: la primera ejecución descarga el sitio sola.)

### ¿Por qué el sitio va en una carpeta y no en una URL?

madereraLignina no está publicado en internet, así que Playwright lo levanta solo antes de las pruebas con `scripts/servidor.mjs` (en http://127.0.0.1:4173). El sitio **no se modifica**: el servidor lo entrega tal cual. Ese servidor **distingue mayúsculas y minúsculas**, igual que un hosting real; sin eso, en Windows el enlace roto `Ingreso.html` (bug MLIG-103) parecería funcionar.

Si algún día el sitio se publica (por ejemplo en GitHub Pages), se prueba la versión publicada sin tocar código:

```bash
BASE_URL=https://usuario.github.io/madereraLignina/ npx playwright test
```

## Comandos que van a usar

| Comando | Para qué sirve |
|---|---|
| `npx playwright test` | Ejecuta toda la suite (sin ventana) |
| `npx playwright test 02-catalogo` | Ejecuta solo los archivos cuyo nombre contenga ese texto |
| `npx playwright test -g "US-09"` | Ejecuta solo las pruebas cuyo título contenga ese texto |
| `npx playwright test --headed` | Lo mismo, viendo el navegador trabajar |
| `npx playwright test --ui` | Modo interactivo: elegir pruebas, verlas paso a paso y repetirlas |
| `npx playwright test --repeat-each=10` | Repite cada prueba 10 veces (así se descubre una prueba inestable) |
| `npm run report` | Abre el reporte HTML de la última ejecución (capturas y *trace* de lo que falló) |
| `npm run sitio` | Levanta el sitio en http://127.0.0.1:4173 para verlo a mano |
| `npm run codegen` | Abre un grabador que escribe código mientras usan el sitio (con `npm run sitio` corriendo) |

## Cómo está organizado

```
tests/              Las pruebas. Cada archivo es un bloque de historias del backlog
  00-humo           Prueba de humo: ¿funciona mi entorno?
  01-navegacion     EJEMPLO RESUELTO (US-01): léanlo primero
  02-catalogo       US-03, US-04
  03-compra-carrito US-05, US-07
  04-cuenta         US-08, US-09
  05-contenido      US-12, US-17
  06-calidad-de-uso US-14, US-15, US-20
  heredados         Tres pruebas que llegaron en cuarentena, ya diagnosticadas (Parte 4)
pages/LigninaPage.ts  Page Object del sitio (Parte 5)
scripts/servidor.mjs  Sirve la carpeta sitio/ distinguiendo mayúsculas
sitio/              madereraLignina (submódulo de Git): el sistema bajo prueba
ENTREGA.md          Decisiones, bugs detectados, diagnóstico, medidas y reflexión
playwright.config.ts
.github/workflows   Ejecuta la suite en GitHub cada vez que hacen push
```

## Cómo leer un resultado

- ✓ verde: el sitio cumple el criterio.
- ✘ que cuenta como *passed*: es un **bug conocido**. La prueba tiene en su primera línea `test.fail(true, 'MLIG-xxx · …')` con la clave del bug en Jira, y en ese bug hay un comentario con el nombre de la prueba. Cuando alguien corrija el bug, Playwright avisará *Expected to fail, but passed*: ese es el momento de quitar la anotación.

> Dos reglas: el sitio **no se modifica** (es el sistema bajo prueba) y cada prueba es **independiente**: no depende de que otra haya corrido antes.
