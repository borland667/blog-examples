# Short-lived sessions, long-lived workers

Companion to [the database session article](https://simpleitautomation.com/blog/database-sessions-in-long-lived-workers/).

## Run

Python 3.10+, using a dedicated virtual environment from the repository root:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r examples/database-sessions-in-long-lived-workers/requirements.txt
.venv/bin/python -m unittest discover -s examples/database-sessions-in-long-lived-workers -p 'test_*.py' -v
```

Tests use SQLite in memory with an explicit one-connection `QueuePool`. No external database, workers, or credentials are needed. They exercise the article's `SessionFactory.begin()` boundary, commit, rollback after flush failure, connection return on exceptions, and pool exhaustion while a session holds the only connection.

## Limits

SQLite is deliberately local and does not model PostgreSQL isolation, network failures, distributed ownership, or concurrent Celery tasks. `record_result` demonstrates transaction lifetime, not stale-worker protection; do not mistake it for the guarded-completion example. The 10 ms pool timeout is a test fixture, not a production recommendation.
