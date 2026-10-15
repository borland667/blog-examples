PREPARE complete_job(text, text, bigint, jsonb) AS
UPDATE report_jobs
SET result = $4::jsonb,
    status = 'completed'
WHERE id = $1
  AND owner_id = $2
  AND generation = $3
  AND status = 'running'
  AND lease_until > clock_timestamp()
RETURNING id;
