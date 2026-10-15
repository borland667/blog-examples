import assert from 'node:assert/strict';
import { provision } from './provision.mjs';

const plan = await provision('demo-db', {
  makeAdapters() { throw new Error('Planning cannot construct adapters'); },
});
console.log('PLAN:', JSON.stringify(plan, null, 2));

const calls = [];
const applied = await provision('demo-db', {
  mode: 'apply',
  makeAdapters: () => Object.fromEntries(plan.actions.map(({ action }) => [
    action, async target => { calls.push({ action, target }); },
  ])),
});
assert.deepEqual(calls, plan.actions);
console.log('IN-MEMORY APPLY:', JSON.stringify(applied, null, 2));
console.log('No external resources were created.');
