import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Optional native-tool runner: never connects to an existing database cluster.
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-examples-pg-'));
const data = path.join(root, 'data');
const port = '58439';
let started = false;
try {
  execFileSync('initdb', ['-D', data, '-U', 'example', '-A', 'trust', '--no-locale'], { stdio: 'pipe' });
  execFileSync('pg_ctl', ['-D', data, '-l', path.join(root, 'server.log'), '-o', `-k ${root} -p ${port} -c listen_addresses=''`, '-w', 'start'], { stdio: 'pipe' });
  started = true;
  execFileSync('psql', ['-h', root, '-p', port, '-U', 'example', '-d', 'postgres', '-X', '-v', 'ON_ERROR_STOP=1', '-f',
    fileURLToPath(new URL('../examples/leases-retries-and-expiration/verify.sql', import.meta.url)),
  ], { stdio: 'inherit' });
} finally {
  if (started) execFileSync('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop'], { stdio: 'pipe' });
  // Only this invocation's generated, disposable cluster is removed.
  fs.rmSync(root, { recursive: true, force: true });
}
