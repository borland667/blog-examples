export function planProvisioning(name) {
  if (typeof name !== 'string' || !/^[a-z][a-z0-9-]{2,30}$/.test(name)) {
    throw new Error('Invalid resource name');
  }
  return ['database.create', 'dns.publish', 'notification.send']
    .map(action => ({ action, target: name }));
}

export async function provision(name, options = {}) {
  const { mode = 'plan', makeAdapters } = options;
  if (mode !== 'plan' && mode !== 'apply') {
    throw new Error('Unknown execution mode');
  }
  const actions = planProvisioning(name);
  if (mode === 'plan') {
    return { mode, status: 'planned', actions };
  }
  if (typeof makeAdapters !== 'function') {
    throw new Error('Apply requires an adapter factory');
  }
  const adapters = makeAdapters();
  // Check every required operation before the first write.
  for (const { action } of actions) {
    if (typeof adapters[action] !== 'function') {
      throw new Error(`Unsupported operation: ${action}`);
    }
  }
  for (const { action, target } of actions) {
    await adapters[action](target);
  }
  return { mode, status: 'submitted', actions };
}
