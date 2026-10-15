# Guarded job completion

Companion to [When a worker disappears](https://simpleitautomation.com/blog/leases-retries-and-expiration/).

## Run

Use PostgreSQL 14+ and `psql`, connected to a **disposable development database**. For example, start an isolated local container:

```sh
docker run --rm --name blog-examples-pg -e POSTGRES_PASSWORD=example-only -p 127.0.0.1:55432:5432 -d postgres:18
PGPASSWORD=example-only psql -h 127.0.0.1 -p 55432 -U postgres -d postgres -X -v ON_ERROR_STOP=1 -f examples/leases-retries-and-expiration/verify.sql
docker stop blog-examples-pg
```

Wait for PostgreSQL to be ready before running `psql`. The password above is a disposable example, not a production credential. The script uses temporary objects that vanish when its session ends; do not point it at production anyway.

Alternatively, on macOS or Linux with `initdb`, `pg_ctl`, and `psql` on your PATH, run `node scripts/test-postgres.mjs`. It creates a temporary cluster with a private Unix-socket directory and no TCP listener, runs the checks, then stops and removes only that generated cluster. Do not run `initdb` as root.

`completion.sql` is the article's parameterized update. `verify.sql` supplies a temporary schema, prepares that statement, and fails on incorrect results. It checks owner and generation mismatch, deadline expiry, successful completion, and duplicate completion with a different payload.

## Limits

These are single-session guarded-write checks, not a complete lease or queue implementation and not a concurrent claim/renewal proof. Claims must atomically assign ownership and increment generations; renewals must enforce the same ownership rules. This guards a result on the job row, not email, external APIs, or other side effects. The clock check happens during execution, not necessarily at commit.
