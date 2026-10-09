-- Phase 6A.7: pause reason and planned resume time for Task Tracker.
-- Safe to run on existing taskflow_db; does not drop data.
-- Run manually: psql -d taskflow_db -f 002_phase6a7_pause_fields.sql

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS pause_reason TEXT;

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS scheduled_resume_at TIMESTAMPTZ;
