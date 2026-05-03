-- Add nice_class column to existing trademarks table
ALTER TABLE trademarks
  ADD COLUMN IF NOT EXISTS nice_class SMALLINT CHECK (nice_class BETWEEN 1 AND 45);
