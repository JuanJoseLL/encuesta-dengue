-- Manual migration to add strategy importance ratings
-- This script updates the metadata JSON field in ResponseSession to include strategyRatings
-- Only assigns rating 5 to completed strategies (not skipped)

-- Update all sessions that have completed strategies
-- A completed strategy is one where the sum of weights equals 100
UPDATE "ResponseSession" rs
SET metadata = CASE
  WHEN rs.metadata IS NULL THEN
    jsonb_build_object(
      'strategyRatings',
      (
        SELECT jsonb_object_agg(strategy_id, 5)
        FROM (
          SELECT DISTINCT r."strategyId" as strategy_id
          FROM "Response" r
          WHERE r."sessionId" = rs.id
          GROUP BY r."strategyId"
          HAVING SUM(r.weight) BETWEEN 99.99 AND 100.01
        ) completed_strategies
      )
    )
  ELSE
    rs.metadata || jsonb_build_object(
      'strategyRatings',
      (
        SELECT jsonb_object_agg(strategy_id, 5)
        FROM (
          SELECT DISTINCT r."strategyId" as strategy_id
          FROM "Response" r
          WHERE r."sessionId" = rs.id
          GROUP BY r."strategyId"
          HAVING SUM(r.weight) BETWEEN 99.99 AND 100.01
        ) completed_strategies
      )
    )
  END
WHERE EXISTS (
  SELECT 1
  FROM "Response" r
  WHERE r."sessionId" = rs.id
  GROUP BY r."strategyId"
  HAVING SUM(r.weight) BETWEEN 99.99 AND 100.01
);

-- Verification query (run this to check the results)
-- SELECT
--   rs.id,
--   rs.metadata->>'strategyRatings' as strategy_ratings,
--   COUNT(DISTINCT r."strategyId") as completed_strategies_count
-- FROM "ResponseSession" rs
-- LEFT JOIN "Response" r ON r."sessionId" = rs.id
-- GROUP BY rs.id
-- ORDER BY rs."startedAt" DESC
-- LIMIT 10;
