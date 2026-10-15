import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
let phaseStarted;
const server = createServer((request, response) => {
  if (request.url !== '/work') {
    response.writeHead(404).end();
    return;
  }
  // Start the timeline at the first request, excluding process startup time.
  phaseStarted ??= Date.now();
  const delay = Date.now() - phaseStarted < 2000 ? 20 : 200;
  setTimeout(() => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ fixture: true, delayMs: delay }));
  }, delay);
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
try {
  const target = `http://127.0.0.1:${server.address().port}/work`;
  const workload = fileURLToPath(new URL('./workload.js', import.meta.url));
  // Prove a non-loopback target fails before attempting the local experiments.
  await assert.rejects(run('k6', ['run', '--quiet', workload], {
    env: { ...process.env, K6_NO_USAGE_REPORT: 'true', TARGET_URL: 'https://example.invalid/work', MODEL: 'open' },
    timeout: 10000,
  }), error => error.stderr.includes('Only the local fixture URL is allowed'));
  for (const model of ['closed', 'open']) {
    phaseStarted = undefined;
    console.log(`\n${model.toUpperCase()} MODEL — synthetic loopback fixture`);
    const result = await run('k6', ['run', '--quiet', workload], {
      env: { ...process.env, K6_NO_USAGE_REPORT: 'true', TARGET_URL: target, MODEL: model },
      timeout: 15000,
    });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }
} finally {
  await new Promise(resolve => server.close(resolve));
}
