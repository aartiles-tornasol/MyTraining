#!/usr/bin/env node
/**
 * Comprueba que los vídeos de `src/lib/program/videos.ts` siguen existiendo, y
 * avisa si el título o el canal han cambiado respecto a lo que hay guardado.
 *
 *   node tools/check-videos.mjs
 *
 * Los vídeos de YouTube se borran, se hacen privados o cambian de dueño, y un
 * enlace roto en mitad de una sesión es justo lo que no queremos. El endpoint
 * `oembed` es público, no necesita API key y devuelve error en cuanto un vídeo
 * deja de estar disponible.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const src = await readFile(path.join(ROOT, 'src/lib/program/videos.ts'), 'utf8');

const entries = [...src.matchAll(
  /'([\w-]+)':\s*\{\s*id:\s*'([\w-]+)',\s*title:\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)"),\s*channel:\s*(?:'((?:[^'\\]|\\.)*)'|"([^"]*)")/g,
)].map((m) => ({
  exercise: m[1],
  id: m[2],
  title: (m[3] ?? m[4]).replace(/\\'/g, "'"),
  channel: m[5] ?? m[6],
}));

if (!entries.length) {
  console.error('No se pudo leer ninguna entrada de videos.ts.');
  process.exit(1);
}

const check = async ({ exercise, id, title, channel }) => {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`,
  )}&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return { exercise, id, state: 'roto', detail: `HTTP ${res.status}` };
    const d = await res.json();
    // El título se guarda normalizado (guiones, acentos), así que compararlo
    // literalmente daría falsos positivos: basta con vigilar el canal.
    if (d.author_name.trim() !== channel.split(' — ')[0].trim()) {
      return { exercise, id, state: 'cambiado', detail: `canal ahora: ${d.author_name}` };
    }
    return { exercise, id, state: 'ok', detail: d.title };
  } catch (e) {
    return { exercise, id, state: 'error', detail: String(e.message ?? e) };
  }
};

const results = [];
for (const e of entries) results.push(await check(e));

const broken = results.filter((r) => r.state === 'roto' || r.state === 'error');
const changed = results.filter((r) => r.state === 'cambiado');

for (const r of [...broken, ...changed]) {
  console.log(`${r.state.toUpperCase().padEnd(9)} ${r.exercise.padEnd(24)} ${r.id}  ${r.detail}`);
}

console.log(
  `\n${results.length} vídeos · ${results.filter((r) => r.state === 'ok').length} correctos · ` +
  `${changed.length} con el canal cambiado · ${broken.length} rotos`,
);
process.exit(broken.length ? 1 : 0);
