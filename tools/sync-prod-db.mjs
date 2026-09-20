#!/usr/bin/env node
/**
 * Trae la base de datos de producción (Dokploy) a la de desarrollo local.
 *
 *   node tools/sync-prod-db.mjs            # vuelca prod y la carga en local
 *   node tools/sync-prod-db.mjs --dump-only  # solo deja el .sql en .backup/
 *
 * No hace falta SSH a la VM: Dokploy expone una terminal de contenedor por
 * WebSocket que acepta la API key. El volcado viaja comprimido y en base64,
 * porque la terminal es un pty y parte las líneas largas donde quiere; al
 * quitar todos los saltos antes de decodificar, ese troceado deja de importar.
 *
 * Variables de entorno (o .env.dokploy en la raíz, que está en .gitignore):
 *   DOKPLOY_URL        http://192.168.10.164:3000
 *   DOKPLOY_API_KEY    la clave de Settings → Profile
 *   PROD_DB_CONTAINER  mytraining-app-6vnkta-db-1
 *   LOCAL_DB_CONTAINER mytraining-db-1
 */
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');

/* Un .env.dokploy suelto evita tener que exportar nada en cada terminal. */
const envFile = path.join(ROOT, '.env.dokploy');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const URL_ = process.env.DOKPLOY_URL ?? 'http://192.168.10.164:3000';
const KEY = process.env.DOKPLOY_API_KEY;
const PROD = process.env.PROD_DB_CONTAINER ?? 'mytraining-app-6vnkta-db-1';
const LOCAL = process.env.LOCAL_DB_CONTAINER ?? 'mytraining-db-1';
const DB = 'mytraining';
const USER = 'mytraining';

if (!KEY) {
  console.error('Falta DOKPLOY_API_KEY (ponla en .env.dokploy o expórtala).');
  process.exit(1);
}

const START = '__DUMP_START__';
const END = '__DUMP_END__';

/** Ejecuta un comando en el contenedor de producción y devuelve lo que imprime. */
function runInProd(command, timeoutMs = 120_000) {
  const ws = new WebSocket(
    `${URL_.replace(/^http/, 'ws')}/docker-container-terminal?containerId=${PROD}`,
    { headers: { 'x-api-key': KEY } },
  );

  return new Promise((resolve, reject) => {
    let buf = '';
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('La terminal de Dokploy no respondió a tiempo.'));
    }, timeoutMs);

    const finish = (value) => {
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve(value);
    };

    ws.addEventListener('open', () => {
      // Un respiro para que el shell termine de arrancar antes de escribir.
      setTimeout(() => ws.send(`echo ${START}; ${command}; echo ${END}\n`), 700);
    });

    ws.addEventListener('message', (e) => {
      buf += typeof e.data === 'string' ? e.data : Buffer.from(e.data).toString('utf8');
      // El eco del propio comando también contiene los marcadores, así que se
      // busca la última apertura: la de verdad.
      const endAt = buf.indexOf(END, buf.lastIndexOf(START) + START.length);
      if (endAt !== -1) {
        const startAt = buf.lastIndexOf(START) + START.length;
        finish(buf.slice(startAt, endAt));
      }
    });

    ws.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error(`No se pudo abrir la terminal de ${PROD} en ${URL_}.`));
    });
    ws.addEventListener('close', () => {
      clearTimeout(timer);
      reject(new Error('La terminal se cerró antes de acabar el volcado.'));
    });
  });
}

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

console.log(`Volcando ${DB} desde ${PROD}…`);
const raw = await runInProd(
  `pg_dump -U ${USER} -d ${DB} --clean --if-exists --no-owner | gzip -9 | base64`,
);

const b64 = raw.replace(/[^A-Za-z0-9+/=]/g, '');
if (!b64) {
  console.error('El volcado vino vacío. ¿Es correcto el nombre del contenedor?');
  process.exit(1);
}

let sql;
try {
  sql = gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
} catch {
  console.error('No se pudo descomprimir el volcado; la terminal devolvió algo inesperado.');
  process.exit(1);
}

await mkdir(path.join(ROOT, '.backup'), { recursive: true });
const file = path.join(ROOT, '.backup', `mytraining_prod_${stamp}.sql`);
await writeFile(file, sql);
console.log(`Volcado guardado: ${path.relative(ROOT, file)} (${(sql.length / 1024).toFixed(1)} kB)`);

if (process.argv.includes('--dump-only')) process.exit(0);

/* El dump trae DROP ... IF EXISTS de cada objeto, así que carga encima de la
   base local sin necesidad de recrearla. */
console.log(`Cargando en ${LOCAL}…`);
const { stderr } = await run('docker', ['exec', '-i', LOCAL, 'psql', '-U', USER, '-d', DB], {
  input: sql,
  maxBuffer: 64 * 1024 * 1024,
}).catch((e) => ({ stderr: e.stderr ?? String(e) }));

const real = (stderr ?? '').split('\n').filter((l) => l.includes('ERROR')).join('\n');
if (real) {
  console.error('Postgres se quejó:\n' + real);
  process.exit(1);
}

const { stdout: count } = await run('docker', [
  'exec', LOCAL, 'psql', '-U', USER, '-d', DB, '-At', '-c',
  'SELECT (SELECT count(*) FROM daily_check) || \' chequeos, \' || (SELECT count(*) FROM session_log) || \' sesiones\'',
]);
console.log(`Local actualizada: ${count.trim()}`);
