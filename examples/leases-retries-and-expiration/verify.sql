\set ON_ERROR_STOP on
CREATE TEMP TABLE report_jobs (
  id text PRIMARY KEY,
  owner_id text NOT NULL,
  generation bigint NOT NULL,
  status text NOT NULL,
  lease_until timestamptz NOT NULL,
  result jsonb
);

CREATE FUNCTION pg_temp.expect(condition boolean, label text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF condition IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'FAIL: %', label;
  END IF;
END;
$$;

\ir completion.sql

INSERT INTO report_jobs VALUES
  ('report-1', 'B', 42, 'running', clock_timestamp() + interval '1 minute', NULL);

EXECUTE complete_job('report-1', 'A', 41, '{"attempt":"stale"}');
SELECT pg_temp.expect(result IS NULL AND status = 'running', 'stale attempt rejected') FROM report_jobs;

EXECUTE complete_job('report-1', 'A', 42, '{"attempt":"wrong-owner"}');
SELECT pg_temp.expect(result IS NULL, 'wrong owner rejected') FROM report_jobs;

EXECUTE complete_job('report-1', 'B', 41, '{"attempt":"wrong-generation"}');
SELECT pg_temp.expect(result IS NULL, 'wrong generation rejected') FROM report_jobs;

EXECUTE complete_job('report-1', 'B', 42, '{"attempt":"current"}');
SELECT pg_temp.expect(status = 'completed' AND result->>'attempt' = 'current', 'current attempt accepted') FROM report_jobs;

EXECUTE complete_job('report-1', 'B', 42, '{"attempt":"duplicate"}');
SELECT pg_temp.expect(result->>'attempt' = 'current', 'duplicate cannot overwrite completion') FROM report_jobs;

UPDATE report_jobs SET status = 'running', result = NULL,
  lease_until = clock_timestamp() - interval '1 second';
EXECUTE complete_job('report-1', 'B', 42, '{"attempt":"expired"}');
SELECT pg_temp.expect(result IS NULL AND status = 'running', 'expired attempt rejected without replacement') FROM report_jobs;

SELECT 'PASS: stale, wrong-owner, wrong-generation, duplicate, and expired writes rejected; current write accepted.';
