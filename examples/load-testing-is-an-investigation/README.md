# Load testing is an investigation

Companion to [the load-testing article](https://simpleitautomation.com/blog/load-testing-is-an-investigation/).

## Run

Install Node.js 22+ and [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/), then:

```sh
npm run test:load
```

The runner starts its own HTTP fixture on an OS-assigned port bound to `127.0.0.1`. It runs a four-second closed-model workload, then a four-second open-model workload. In each experiment the fixture changes its response delay from 20 ms to 200 ms halfway through. Both models check HTTP success; neither claims a capacity threshold.

Read the k6 summaries as evidence about this toy fixture. The closed model has one virtual user; the open model schedules ten iterations per second with a bounded VU allocation. Each iteration makes one request. Inspect iteration rate, request rate, duration, and any dropped iterations. Startup, scheduling, and drain time affect the observed totals.

## Safety and limits

The workload rejects any URL other than `http://127.0.0.1:<port>/work` and disables redirects. The runner sends no cloud telemetry and supplies the fixture URL itself. It closes the server when finished, including after a failed run.

Do not rewrite the guard to target production. This demo is not an environment safety framework, a realistic user journey, an overload experiment, or a readiness assessment. Its measurements are not evidence of any real application's throughput. Run metadata and workload definitions must accompany any comparison you make outside this fixture.
