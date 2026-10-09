-- Phase 6A: persist tags (normalized), reminder, and recurrence on tasks.
-- Safe to run on existing taskflow_db; does not drop or recreate tables.
-- Run manually in pgAdmin or: psql -d taskflow_db -f 001_phase6a_tags_reminder_recurrence.sql

-- Reminder / recurrence configuration (nullable = none / does not repeat)
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS reminder VARCHAR(10);

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20);

-- Normalized tags (many per task)
CREATE TABLE IF NOT EXISTS task_tags (
    id         BIGSERIAL PRIMARY KEY,
    task_id    BIGINT       NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    label      VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_tags_task_id ON task_tags (task_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_task_tags_task_id_label_lower
    ON task_tags (task_id, lower(label));
