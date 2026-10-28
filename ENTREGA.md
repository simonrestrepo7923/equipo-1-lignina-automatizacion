# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-1` · **Integrantes:** Simon Restrepo Aristizabal, Sebastian Palacio, Juan Pablo Cartagena · **Repositorio:** _enlace a este repositorio_

**Sistema bajo prueba:** madereraLignina ([Boni92/madereraLignina](https://github.com/Boni92/madereraLignina), commit `df7ec97`) · **Jira:** proyecto MLIG

## 1. ¿Qué automatizamos y por qué? (decisión)

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué (frecuencia · riesgo · estabilidad · facilidad de verificar) |
|---|---|---|
| US-01 · CA1 (menú abre cada sección) | Sí | Se rompe con cualquier cambio de rutas y afecta todo el sitio; el oráculo es objetivo (URL y título de pestaña). Una fila por sección. |
| US-01 · CA3 (Registrarse / Ingresar / carrito) | Sí | Riesgo alto: un 404 en el encabezado bloquea la cuenta. Encontró MLIG-103, que a mano en Windows no se ve. |
| US-04 · CA3 y CA4 (título y precios) | Sí | Revisar 30 precios y 28 títulos a mano es lento y se escapan errores; la máquina lo compara con una expresión regular. |
| US-05 · CA1/CA2 y US-07 · CA2 (comprar y carrito) | Sí | Es el flujo de negocio principal: riesgo máximo (sev-1). Verificación clara: el producto está o no está en el carrito. |
| US-08 · CA2 y US-09 · CA3 (formularios) | Sí | Validaciones repetitivas con varios datos de entrada; US-09 CA3 es dirigida por datos y marca como fallo solo la fila que falla. |
| US-14 · CA1 (375 px sin desplazamiento) | Sí | Revisar páginas en modo responsive es tedioso; `scrollWidth` es un número exacto. |
| US-15 · CA1 (texto alternativo) | Sí | 28 imágenes: a mano hay que inspeccionar una por una en DevTools. |
| US-02 · CA1 (tarjetas de categoría) | Más adelante | Funciona y es fácil de automatizar con datos (7 tarjetas), pero el riesgo es bajo: priorizamos los criterios que fallan. |
| US-08 · CA1 (registro exitoso) | No | El sitio no tiene backend: no hay cuenta que crear ni dato que verificar. Queda en el plan manual (MLIG-110). |
| US-10 · CA1 (video y sus controles) | No | Depende de controles nativos del navegador y la guía pide probarlo en Firefox; verificarlo bien es visual. |
| US-13 · CA2/CA3 (redes sociales y mapa) | No | Son páginas externas (Facebook, Google Maps): no son nuestras, cambian sin aviso y harían la suite inestable. |
| US-19 · CA1/CA2 (Recordarme) | Más adelante | Bloqueadas por US-08/US-09: no se puede iniciar sesión. Cuando exista el ingreso, sí conviene automatizarlas. |

## 2. Bugs que nuestra suite detecta

Todas estas pruebas fallan por un bug **del producto** (se confirmó a mano y la prueba afirma lo que dice el criterio). Cada una quedó con `test.fail('MLIG-xxx · …')` y cada bug tiene en Jira un comentario con el nombre de la prueba que lo detecta.

| Prueba (archivo › título) | Bug en Jira (clave) | ¿Quedó con `test.fail(...)`? | Evidencia (captura o trace) |
|---|---|---|---|
| 01-navegacion › US-01 · CA3: desde Categorías, "Ingresar" abre la página de Ingreso | MLIG-103 | Sí | Título recibido "" (página 404) |
| 02-catalogo › US-03 · CA1: buscar "Mesada" muestra las mesadas | MLIG-104 | Sí | Ningún resultado tras la búsqueda |
| 02-catalogo › US-04 · CA3: el título del detalle coincide con el producto (estante de Deco) | MLIG-105 | Sí | Expected "Estante" · Received "Escritorio" |
| 02-catalogo › US-04 · CA4: precios con "$ " y punto de miles | MLIG-106 | Sí | 30 de 30 precios sin separador ("$ 15000", "$1550") |
| heredados › H2 · el Armario de Dormitorio muestra $ 15.000 | MLIG-106 (el mismo) | Sí | Received "Precio: $ 15000" |
| 03-compra-carrito › US-05 · CA1: "Comprar" lleva la Mesada al carrito | MLIG-107 | Sí | El carrito no contiene "Mesada" |
| 03-compra-carrito › US-05 · CA2: "Comprar" lleva la Silla de caña al carrito | MLIG-108 | Sí | El carrito no contiene "Silla de caña" |
| 03-compra-carrito › US-07 · CA2: carrito vacío con mensaje y total $ 0 | MLIG-109 | Sí | No existe "Tu carrito está vacío" |
| 04-cuenta › US-08 · CA2: el registro arranca con los campos vacíos | MLIG-112 | Sí | Apellido: Expected "" · Received "required" |
| 04-cuenta › US-08 · CA2: registro vacío muestra errores | MLIG-111 | Sí | Mensajes de error ocultos; se envía igual |
| 04-cuenta › US-09 · CA3: el correo "" se rechaza (solo esa fila) | MLIG-115 | Sí, solo en esa fila | URL recibida "ingreso.html?": se envió |
| 05-contenido › US-12 · CA1: suscripción exitosa con correo válido | MLIG-118 | Sí | Sin mensaje de suscripción |
| 05-contenido › US-17 · CA3: la imagen ampliada tiene botón para cerrar | MLIG-125 | Sí | Ningún botón en la ventana |
| 06-calidad-de-uso › US-14 · CA1: "Consejos" cabe en 375 px (solo esa fila) | MLIG-121 | Sí, solo en esa fila | Received 408 px |
| 06-calidad-de-uso › US-15 · CA1: texto alternativo de cada producto | MLIG-122 | Sí | 4 de 28 imágenes con alt "escritorio" |
| 06-calidad-de-uso › US-20 · CA1: pestaña de Inicio con formato "Sección \| LIGNINA" | MLIG-126 | Sí | Received "LIGNINA \| Maderera-Borsari" |

Las capturas y los *trace* de cada fallo quedan en el reporte HTML (`npm run report`, o el artefacto `reporte-playwright` de GitHub Actions).

**¿Cuántos bugs hay en Jira?** Las 16 pruebas cazabugs apuntan a **15 bugs distintos**: US-04 CA4 y la heredada H2 son el mismo bug de precios (MLIG-106). Los otros 11 bugs del plan siguen cubiertos por las pruebas manuales.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto (producto / prueba / inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el menú principal tiene 6 secciones | **Prueba** (dato viejo) | Falla siempre igual (Expected 6 · Received 5). A mano el menú tiene 5 secciones, las mismas del criterio US-01 CA1 y del caso CP-01.1: el 6 no sale de ningún requisito. | Corregimos el dato a 5. Queda en verde. |
| H2 · el Armario de Dormitorio muestra el precio $ 15.000 | **Producto** (bug) | Falla siempre igual (Received "Precio: $ 15000"); se reproduce a mano y la prueba afirma lo que pide US-04 CA4. Es el mismo defecto que ya detecta 02-catalogo › US-04 CA4. | La dejamos igual y la marcamos con `test.fail('MLIG-106 · …')`. Sumamos un comentario en MLIG-106, sin crear un bug duplicado. |
| H3 · abrir el Armario de Dormitorio muestra su ventana de detalle | **Inestable** | `--repeat-each=20` tres veces: falló 4, 6 y 3 de 20 sin cambiar nada. Causa: `isVisible()` mira una sola vez justo después del clic, y la ventana de Bootstrap tarda milisegundos en mostrarse (animación *fade*). | Cambiamos la lectura única por una aserción que espera la condición: `await expect(ventana).toBeVisible()` (sin `waitForTimeout`). Después: 60 de 60 en verde con `--repeat-each=20` tres veces. |

## 4. Medidas

- Casos de prueba de nuestro plan en Jira: **61** · automatizados en este laboratorio: **19** (**31 %**)
- Tiempo que nos tomó escribir las pruebas automatizadas: **~60 min** · tiempo de ejecutar toda la suite (30 pruebas): **2,2 min** en un computador de 2 núcleos (1 proceso); en GitHub Actions: **\_\_ s** (ver la pestaña Actions)
- Tiempo estimado de ejecutar **a mano** esos mismos 19 casos: **~57 min** (≈ 3 min por caso: abrir la página, hacer los pasos, revisar y anotar)
- Con esos números, ¿en cuántas ejecuciones se paga la automatización? 60 min ÷ (57 − 2,2) min por ejecución ≈ **1,1: se paga en la segunda ejecución**. Además, cada push la vuelve a correr gratis en GitHub Actions.

## 5. Reflexión (máximo 5 líneas cada una)

1. **¿Qué casos de nuestro plan no automatizaríamos y por qué?** El video y el audio (US-10), porque lo importante es que se vea y se escuche bien, y eso lo juzga una persona. Tampoco el mapa ni las redes sociales (US-13 CA2 y CA3), que son páginas de otras empresas que cambian sin aviso, ni el registro exitoso (US-08 CA1), porque el sitio no tiene backend y no hay nada que verificar.
2. **Si el sitio cambia el HTML de un botón, ¿qué se rompe y qué no? ¿Qué aportó el Page Object?** Las pruebas migradas no se rompen: dicen `abrirProducto('Baño', 'Lavabo')` y el cómo está en un solo lugar (`LigninaPage.ts`). Si cambian los ids `d1x` de las categorías, se corrige una línea de la clase. Las que siguen con localizadores directos (por ejemplo, `#divnewsletter` o los ids `d5x` en US-04 CA3) sí habría que tocarlas una por una.
3. **Una prueba roja nuestra que no era un bug del producto: ¿cómo nos dimos cuenta?** US-17 CA2 (cerrar la imagen con Esc) pasó en una corrida completa y falló en otra, sin que el sitio cambiara. A mano Esc sí cierra la ventana; el problema era que la prueba presionaba Esc antes de que Bootstrap terminara de abrirla y le pasara el foco. Era la prueba: ahora el Page Object espera a que la ventana tenga el foco (después, 3 corridas completas en verde). Lo mismo pasó con H3.
4. **¿Qué bug o riesgo no habría encontrado la automatización por sí sola?** Que los íconos de redes llevan a la página principal de Facebook o Instagram y no a la cuenta de la tienda (MLIG-120): la prueba solo sabe si el enlace abre, no si es "el correcto". Tampoco el texto de copyright incoherente o que una imagen se vea pixelada: eso lo nota una persona que mira.
5. **¿Qué haríamos distinto en un proyecto real?** Pediríamos al equipo de desarrollo atributos `data-testid` y un `<label>` en cada campo, para no depender de ids como `d52` ni de placeholders. Publicaríamos el sitio en un ambiente de pruebas en vez de servirlo localmente, y correríamos la suite en Chrome y en Firefox, porque hoy solo usamos Chromium.
