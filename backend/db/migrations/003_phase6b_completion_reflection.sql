-- Phase 6B: persist completion reflection on tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS completion_summary TEXT,
  ADD COLUMN IF NOT EXISTS achievement TEXT,
  ADD COLUMN IF NOT EXISTS reflection_note TEXT;
