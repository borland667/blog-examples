# A dry run is a contract across every adapter

The companion article is still in preparation. This folder publishes only its synthetic sample code.

## Run

Node.js 22+, no package dependencies:

```sh
node examples/a-dry-run-is-a-contract-across-every-adapter/demo.mjs
node --test examples/a-dry-run-is-a-contract-across-every-adapter/provision.test.mjs
```

The demo prints a plan, then executes the same action list against in-memory recording functions. **Neither path contacts a provider, changes DNS, sends a message, or uses credentials.**

## Contract

`provision(name)` defaults to `plan`. Planning validates the name and returns intended actions without constructing adapters. `apply` requires an injected adapter factory. Unknown modes fail closed, and all required adapter methods are checked before the first action.

Tests cover the default, forbidden adapter construction during planning, invalid modes and inputs, matching plan/apply order, missing adapters, and partial failures.

## Limits

This is not an authorization system or a sandbox. The trusted caller and injected factory can execute arbitrary code. Real apply needs authorization, provider-specific request schemas, dependency outputs, idempotency, and recovery after partial failure. A successful request submission does not establish that a resource is ready.
