import assert from 'node:assert/strict';
import test from 'node:test';
import { planProvisioning, provision } from './provision.mjs';

function recordingAdapters(calls, failAt) {
  return Object.fromEntries(['database.create', 'dns.publish', 'notification.send']
    .map(action => [action, async target => {
      calls.push({ action, target });
      if (action === failAt) throw new Error('Provider unavailable');
    }]));
}

test('plan and default mode never construct adapters', async () => {
  for (const mode of [undefined, 'plan']) {
    const result = await provision('demo-db', {
      mode,
      makeAdapters() { assert.fail('Forbidden adapter construction'); },
    });
    assert.equal(result.status, 'planned');
    assert.equal(Object.hasOwn(result, 'resourceId'), false);
    assert.deepEqual(result.actions, planProvisioning('demo-db'));
  }
});

test('invalid modes fail closed', async () => {
  for (const mode of ['preview', '', 'APPLY', false, true, null, 0]) {
    await assert.rejects(provision('demo-db', {
      mode,
      makeAdapters() { assert.fail('Forbidden adapter construction'); },
    }), /Unknown execution mode/);
  }
});

test('both paths reject malformed input before adapter construction', async () => {
  for (const name of ['', 'x', 'Bad-Name', 'demo db', null, 42, 'a'.repeat(32)]) {
    for (const mode of ['plan', 'apply']) {
      await assert.rejects(provision(name, {
        mode,
        makeAdapters() { assert.fail('Forbidden adapter construction'); },
      }), /Invalid resource name/);
    }
  }
});

test('apply executes the plan in order', async () => {
  const calls = [];
  const result = await provision('demo-db', {
    mode: 'apply', makeAdapters: () => recordingAdapters(calls),
  });
  assert.equal(result.status, 'submitted');
  assert.deepEqual(calls, planProvisioning('demo-db'));
});

test('missing factory and missing last adapter fail before execution', async () => {
  await assert.rejects(provision('demo-db', { mode: 'apply' }), /adapter factory/);
  const calls = [];
  await assert.rejects(provision('demo-db', {
    mode: 'apply',
    makeAdapters() {
      const adapters = recordingAdapters(calls);
      delete adapters['notification.send'];
      return adapters;
    },
  }), /Unsupported operation/);
  assert.deepEqual(calls, []);
});

test('partial failures propagate and prevent later notification', async () => {
  const calls = [];
  await assert.rejects(provision('demo-db', {
    mode: 'apply', makeAdapters: () => recordingAdapters(calls, 'dns.publish'),
  }), /Provider unavailable/);
  assert.deepEqual(calls.map(item => item.action), ['database.create', 'dns.publish']);
});
