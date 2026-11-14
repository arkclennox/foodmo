#!/usr/bin/env node
/**
 * Build the public site as a static export into ./out.
 *
 * `output: 'export'` cannot include the admin panel, API routes or middleware
 * (they need a server), so they are moved aside for the duration of the build
 * and always put back afterwards. If a previous run was interrupted, the
 * leftovers in .static-stash are restored first.
 */
import { existsSync, mkdirSync, renameSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const STASH = '.static-stash';
const MOVES = [
  ['src/app/admin', `${STASH}/admin`],
  ['src/app/api', `${STASH}/api`],
  ['src/middleware.ts', `${STASH}/middleware.ts`],
];

function restore() {
  for (const [orig, stashed] of MOVES) {
    if (existsSync(stashed) && !existsSync(orig)) renameSync(stashed, orig);
  }
  if (existsSync(STASH) && readdirSync(STASH).length === 0) rmSync(STASH, { recursive: true });
}

restore();
mkdirSync(STASH, { recursive: true });
for (const [orig, stashed] of MOVES) {
  if (existsSync(orig)) renameSync(orig, stashed);
}

let status = 1;
try {
  rmSync('out', { recursive: true, force: true });
  const r = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, STATIC_EXPORT: '1' },
  });
  status = r.status ?? 1;
} finally {
  restore();
}
process.exit(status);
