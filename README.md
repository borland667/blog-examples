# Simple IT Automation — article examples

Runnable, synthetic examples for [Simple IT Automation](https://simpleitautomation.com/blog/) by Osvaldo Demo.

Each folder has its own scope, prerequisites, run command, and tests. These are teaching examples, not extracted company code or production-ready services. No cloud credentials or production systems are required.

| Article | Example | What it demonstrates |
| --- | --- | --- |
| [When a worker disappears](https://simpleitautomation.com/blog/leases-retries-and-expiration/) | [Guarded completion](examples/leases-retries-and-expiration/) | PostgreSQL rejects stale, expired, mismatched, and duplicate attempts. |
| [Short-lived sessions, long-lived workers](https://simpleitautomation.com/blog/database-sessions-in-long-lived-workers/) | [Session lifetime](examples/database-sessions-in-long-lived-workers/) | Commit, rollback, connection return, and bounded pool exhaustion. |
| [Load testing is an investigation](https://simpleitautomation.com/blog/load-testing-is-an-investigation/) | [Local arrival models](examples/load-testing-is-an-investigation/) | Open and closed workloads against a deliberately changing local fixture. |
| A dry run is a contract across every adapter — article in preparation | [Safe planning](examples/a-dry-run-is-a-contract-across-every-adapter/) | Planning cannot construct write-capable adapters; apply failures stay visible. |

## Run

Node.js 22 or newer is required for JavaScript examples. The JavaScript safety tests have no package dependencies:

```sh
npm test
node examples/a-dry-run-is-a-contract-across-every-adapter/demo.mjs
```

For the other examples, follow the linked READMEs. They additionally require Python and SQLAlchemy, PostgreSQL's `psql`, or k6. GitHub Actions runs all four examples independently.

## Safety and scope

- Use only disposable development databases. The SQL example uses temporary objects, but production is not a teaching environment.
- The load fixture binds only to `127.0.0.1`; its workload rejects non-loopback targets and does not follow redirects.
- The dry-run example uses in-memory adapters, even when demonstrating apply. It never provisions real infrastructure.
- All resource names, payloads, and timing choices are invented. Test measurements describe only the local fixture, not production capacity.
- This repository contains examples, not article manuscripts, internal repositories, employer details, or career research.

## Adding an example

Use `examples/<article-slug>/` and include a README, a reproducible command, assertions for failure paths, and explicit limits. Keep new examples independent: readers should not need to install every tool to run one article's code. Add CI coverage and link back to the article when it is public.

Article snippets and companion implementations should stay aligned. Tests in the website repository check its inline dry-run snippets; this repository tests the standalone version without requiring access to the website source.

## License

[MIT](LICENSE). Copyright © 2026 Osvaldo Demo.
