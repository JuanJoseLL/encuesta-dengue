-- AlterTable: Convert threshold column from DOUBLE PRECISION to TEXT
-- This allows storing both numeric and text threshold values
-- Existing numeric values will be converted to text format

ALTER TABLE "Response" ALTER COLUMN "threshold" TYPE TEXT USING CASE
    WHEN "threshold" IS NULL THEN NULL
    ELSE "threshold"::TEXT
END;
