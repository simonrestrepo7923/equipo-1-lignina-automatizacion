# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Equipo:** `equipo-1` · **Integrantes:** Simon Restrepo Aristizabal  **Repositorio:** https://github.com/simonrestrepo7923/equipo-1-lignina-automatizacion

**Sitio que probamos:** madereraLignina ([Boni92/madereraLignina](https://github.com/Boni92/madereraLignina), versión `df7ec97`) · **Jira:** proyecto MLIG

## 1. ¿Qué automatizamos y por qué?

| Criterio (US-xx · CAy) | ¿Automatizamos? | Por qué |
|---|---|---|
| US-01 · CA1 (el menú abre cada sección) | Sí | Si un enlace del menú se daña, se daña todo el sitio. Es fácil de comprobar: la dirección y el título de la pestaña. |
| US-01 · CA3 (Registrarse, Ingresar y carrito) | Sí | Si "Ingresar" no abre, nadie puede entrar a su cuenta. La prueba encontró MLIG-103, que en Windows a mano no se nota. |
| US-04 · CA3 y CA4 (títulos y precios) | Sí | Revisar 30 precios y 28 títulos a mano es lento y se escapan errores. La máquina los revisa todos en segundos. |
| US-05 · CA1/CA2 y US-07 · CA2 (comprar y carrito) | Sí | Comprar es lo más importante de una tienda. Es fácil de comprobar: el producto está en el carrito o no está. |
| US-08 · CA2 y US-09 · CA3 (formularios) | Sí | Hay que probar varios datos distintos y repetirlo a mano es aburrido. En US-09 CA3 una sola prueba revisa varios correos. |
| US-14 · CA1 (el sitio en celular, 375 px) | Sí | Revisar cada página en modo celular a mano es tedioso. La máquina mide el ancho exacto. |
| US-15 · CA1 (texto de las imágenes) | Sí | Son 28 imágenes; a mano hay que revisarlas una por una. |
| US-02 · CA1 (tarjetas de categoría) | Más adelante | Funciona bien y no es tan importante: preferimos automatizar primero lo que falla. |
| US-08 · CA1 (registro exitoso) | No | El sitio no guarda cuentas, así que no hay nada que comprobar. Se queda como prueba manual (MLIG-110). |
| US-10 · CA1 (el video) | No | Hay que ver y oír si el video funciona bien, y eso lo juzga mejor una persona. |
| US-13 · CA2/CA3 (redes sociales y mapa) | No | Son páginas de otras empresas (Facebook, Google Maps). Cambian sin avisar y harían fallar la prueba sin culpa del sitio. |
| US-19 · CA1/CA2 (Recordarme) | Más adelante | Hoy no se puede iniciar sesión. Cuando el ingreso funcione, sí vale la pena automatizarlas. |

## 2. Bugs que encuentran nuestras pruebas

Cada una de estas pruebas falla por un error **del sitio**: lo revisamos también a mano, y la prueba pide lo mismo que dice el criterio. En el código quedó marcada con `test.fail('MLIG-xxx · …')`, y en Jira cada bug tiene un comentario con el nombre de la prueba que lo encuentra.

| Prueba (archivo › título) | Bug en Jira | ¿Marcada con `test.fail(...)`? | Qué se ve cuando falla |
|---|---|---|---|
| 01-navegacion › US-01 · CA3: desde Categorías, "Ingresar" abre la página de Ingreso | MLIG-103 | Sí | La página no existe (error 404) |
| 02-catalogo › US-03 · CA1: buscar "Mesada" muestra las mesadas | MLIG-104 | Sí | La búsqueda no muestra nada |
| 02-catalogo › US-04 · CA3: el título del detalle coincide con el producto (estante de Deco) | MLIG-105 | Sí | Esperaba "Estante" y dice "Escritorio" |
| 02-catalogo › US-04 · CA4: precios con "$ " y punto de miles | MLIG-106 | Sí | Los 30 precios están sin punto ("$ 15000", "$1550") |
| heredados › H2 · el Armario de Dormitorio muestra $ 15.000 | MLIG-106 (el mismo) | Sí | Dice "Precio: $ 15000" |
| 03-compra-carrito › US-05 · CA1: "Comprar" lleva la Mesada al carrito | MLIG-107 | Sí | La Mesada no llega al carrito |
| 03-compra-carrito › US-05 · CA2: "Comprar" lleva la Silla de caña al carrito | MLIG-108 | Sí | La Silla de caña no llega al carrito |
| 03-compra-carrito › US-07 · CA2: carrito vacío con mensaje y total $ 0 | MLIG-109 | Sí | No aparece "Tu carrito está vacío" |
| 04-cuenta › US-08 · CA2: el registro arranca con los campos vacíos | MLIG-112 | Sí | El Apellido ya viene escrito con "required" |
| 04-cuenta › US-08 · CA2: registro vacío muestra errores | MLIG-111 | Sí | No sale ningún error y se envía igual |
| 04-cuenta › US-09 · CA3: el correo "" se rechaza (solo esa fila) | MLIG-115 | Sí, solo en esa fila | Con el correo vacío, el formulario se envía igual |
| 05-contenido › US-12 · CA1: suscripción exitosa con correo válido | MLIG-118 | Sí | No sale ningún mensaje de suscripción |
| 05-contenido › US-17 · CA3: la imagen ampliada tiene botón para cerrar | MLIG-125 | Sí | La ventana no tiene botón para cerrar |
| 06-calidad-de-uso › US-14 · CA1: "Consejos" cabe en 375 px (solo esa fila) | MLIG-121 | Sí, solo en esa fila | La página mide 408 px y se sale de la pantalla |
| 06-calidad-de-uso › US-15 · CA1: texto alternativo de cada producto | MLIG-122 | Sí | 4 de 28 imágenes dicen "escritorio" |
| 06-calidad-de-uso › US-20 · CA1: pestaña de Inicio con formato "Sección \| LIGNINA" | MLIG-126 | Sí | Dice "LIGNINA \| Maderera-Borsari" |

Las capturas de cada fallo están en el reporte de Playwright (`npm run report`, o el archivo `reporte-playwright` que se descarga en la pestaña Actions de GitHub).

**¿Cuántos bugs son?** Las 16 pruebas encuentran **15 bugs distintos**, porque US-04 CA4 y la prueba heredada H2 encuentran el mismo error de los precios (MLIG-106). Los otros 11 bugs del plan los seguimos revisando con pruebas manuales.

## 3. Pruebas heredadas: qué encontramos

| Prueba | ¿Qué fallaba? (sitio / prueba / prueba inestable / entorno) | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · el menú principal tiene 6 secciones | **La prueba** (tenía un dato equivocado) | Siempre fallaba igual: esperaba 6 y había 5. El menú tiene 5 secciones, igual que en el criterio US-01 CA1 y el caso CP-01.1. El 6 no salía de ninguna parte. | Cambiamos el 6 por 5. Ahora pasa. |
| H2 · el Armario de Dormitorio muestra el precio $ 15.000 | **El sitio** (es un bug) | Siempre fallaba igual: dice "$ 15000". Lo vimos también a mano, y la prueba pide lo mismo que el criterio US-04 CA4. Es el mismo error que ya encuentra la prueba de precios. | La dejamos igual y la marcamos con `test.fail('MLIG-106 · …')`. Lo comentamos en MLIG-106 sin crear un bug repetido. |
| H3 · abrir el Armario de Dormitorio muestra su ventana de detalle | **Prueba inestable** (a veces pasa y a veces falla) | La corrimos 20 veces, tres veces seguidas: falló 4, 6 y 3 veces sin cambiar nada. La prueba revisaba la ventana una sola vez, justo después del clic, y la ventana tarda un momento en aparecer. | Cambiamos la prueba para que espere a que la ventana aparezca (`toBeVisible()`), sin poner tiempos fijos. Después la corrimos 60 veces y pasó las 60. |

## 4. Números

- Casos de prueba de nuestro plan en Jira: **61** · automatizados: **19** (**31 %**)
- Tiempo que nos tomó escribir las pruebas (estimado): **~3 h (180 min)**, contando instalar Playwright, aprender a usarlo y corregir las pruebas que fallaban por error nuestro · tiempo que tarda la máquina en correrlas todas (30 pruebas): **~2 min** en nuestro computador (estimado) y **1 min 31 s** en GitHub Actions (medido, contando la instalación)
- Tiempo que tomaría hacer esos 19 casos **a mano** (estimado): **~57 min** (unos 3 min por caso: abrir la página, hacer los pasos, revisar y anotar)
- ¿Cuándo vale la pena? 180 min ÷ (57 − 2) min que ahorramos cada vez ≈ **3,3: desde la cuarta vez que corremos las pruebas ya ganamos tiempo**. Además, GitHub las corre solas cada vez que subimos un cambio.

## 5. Reflexión

1. **¿Qué casos no automatizaríamos y por qué?** El video y el audio (US-10), porque hay que ver y oír si funcionan bien, y eso lo hace mejor una persona. Tampoco el mapa ni las redes sociales (US-13), porque son páginas de otras empresas que cambian sin avisar. Ni el registro exitoso (US-08 CA1), porque el sitio no guarda cuentas y no hay nada que comprobar.
2. **Si el sitio cambia un botón, ¿qué se daña? ¿Para qué sirvió el Page Object?** Las pruebas que usan el Page Object no se dañan, porque dicen cosas como `abrirProducto('Baño', 'Lavabo')` y el "cómo" está escrito en un solo archivo (`LigninaPage.ts`). Si el sitio cambia, arreglamos ese archivo una vez. Las pruebas que buscan los elementos directamente (como `#divnewsletter` o los ids `d5x` en US-04 CA3) sí habría que arreglarlas una por una.
3. **Una prueba que falló pero no por culpa del sitio: ¿cómo nos dimos cuenta?** La de cerrar la imagen con Esc (US-17 CA2) a veces pasaba y a veces fallaba, sin que el sitio cambiara. A mano, Esc sí cerraba la ventana. El problema era que la prueba presionaba Esc muy rápido, antes de que la ventana terminara de abrir. Lo arreglamos haciendo que espere a que la ventana esté lista, y después pasó en todas las corridas. Con la prueba heredada H3 pasó algo parecido.
4. **¿Qué error no habría encontrado la máquina sola?** Que los íconos de redes sociales llevan a la página principal de Facebook o Instagram y no a la cuenta de la tienda (MLIG-120): la prueba sabe si el enlace abre, pero no si es el correcto. Tampoco nota si una imagen se ve borrosa o si un texto no tiene sentido. Eso lo nota una persona que mira.
5. **¿Qué haríamos distinto en un proyecto real?** Le pediríamos a quien hace el sitio que ponga nombres fijos a los botones y etiquetas a todos los campos, para que las pruebas los encuentren sin adivinar. Publicaríamos el sitio en internet para probarlo ahí, y correríamos las pruebas también en Firefox, no solo en Chrome.