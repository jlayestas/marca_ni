-- Add brand submission support to trademarks table
ALTER TABLE trademarks
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_note TEXT;

CREATE INDEX IF NOT EXISTS idx_trademarks_approval_status ON trademarks (approval_status);
