-- AlterTable: Change threshold from min/max range to single value
-- This migration is safe because thresholdMin and thresholdMax have no data in production

-- Add new threshold column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'Response' AND column_name = 'threshold') THEN
        ALTER TABLE "Response" ADD COLUMN "threshold" DOUBLE PRECISION;
    END IF;
END $$;

-- Drop old threshold columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'Response' AND column_name = 'thresholdMin') THEN
        ALTER TABLE "Response" DROP COLUMN "thresholdMin";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'Response' AND column_name = 'thresholdMax') THEN
        ALTER TABLE "Response" DROP COLUMN "thresholdMax";
    END IF;
END $$;
