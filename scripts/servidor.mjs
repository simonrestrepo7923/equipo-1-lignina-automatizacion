// Sirve el sitio madereraLignina (carpeta sitio/, submódulo de Git) en http://127.0.0.1:4173
//
// El sitio NO se modifica: es el sistema bajo prueba. Este servidor solo lo entrega tal cual.
//
// Distingue mayúsculas y minúsculas en las rutas, igual que un hosting real (GitHub Pages, Linux).
// Sin esto, en Windows "Ingreso.html" abriría "ingreso.html" y el bug MLIG-103 no se vería.
import { createServer } from 'node:http';
import { existsSync, readdirSync, statSync, createReadStream } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, extname, resolve } from 'node:path';

const RAIZ = resolve(process.env.SITIO_DIR ?? 'sitio');
const PUERTO = Number(process.env.PUERTO ?? 4173);

// Si el submódulo no se descargó al clonar, se descarga ahora.
if (!existsSync(join(RAIZ, 'index.html'))) {
  console.log('Descargando el sitio (git submodule update --init)…');
  execSync('git submodule update --init --depth 1', { stdio: 'inherit' });
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/** Devuelve la ruta del archivo solo si cada parte del camino existe con las mayúsculas exactas. */
function buscar(rutaUrl) {
  const partes = decodeURIComponent(rutaUrl).split('/').filter(Boolean);
  let actual = RAIZ;
  for (const parte of partes) {
    if (parte === '..') return null;
    let nombres;
    try {
      nombres = readdirSync(actual);
    } catch {
      return null;
    }
    if (!nombres.includes(parte)) return null;
    actual = join(actual, parte);
  }
  if (statSync(actual).isDirectory()) {
    actual = join(actual, 'index.html');
    if (!existsSync(actual)) return null;
  }
  return actual;
}

createServer((req, res) => {
  const ruta = new URL(req.url ?? '/', 'http://localhost').pathname;
  const archivo = buscar(ruta);
  if (!archivo) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 · No encontrado</h1>');
    return;
  }
  const tamano = statSync(archivo).size;
  const tipo = TIPOS[extname(archivo).toLowerCase()] ?? 'application/octet-stream';
  // Rangos (para que el audio y el video se puedan adelantar)
  const rango = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
  if (rango) {
    const inicio = rango[1] ? Number(rango[1]) : 0;
    const fin = rango[2] ? Number(rango[2]) : tamano - 1;
    res.writeHead(206, {
      'Content-Type': tipo,
      'Content-Range': `bytes ${inicio}-${fin}/${tamano}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': fin - inicio + 1,
    });
    createReadStream(archivo, { start: inicio, end: fin }).pipe(res);
    return;
  }
  res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': tamano, 'Accept-Ranges': 'bytes' });
  createReadStream(archivo).pipe(res);
}).listen(PUERTO, '127.0.0.1', () => {
  console.log(`madereraLignina en http://127.0.0.1:${PUERTO}`);
});
