# JPA entity mapping (validate mode)

Hibernate **`ddl-auto=validate`** checks entities against your existing PostgreSQL schema. If startup fails with schema validation errors, compare pgAdmin column types with the mappings in:

- `com.taskflow.entity.User`
- `com.taskflow.entity.Task`

## Expected columns

### `users`

| Column | Java field | Typical PostgreSQL type |
|--------|------------|-------------------------|
| `id` | `Long id` | `bigserial` / `bigint` |
| `name` | `String name` | `varchar` |
| `email` | `String email` | `varchar` (unique) |
| `password_hash` | `String passwordHash` | `varchar` |
| `created_at` | `Instant createdAt` | `timestamptz` or `timestamp` |
| `updated_at` | `Instant updatedAt` | `timestamptz` or `timestamp` |

### `tasks`

| Column | Java field | Typical PostgreSQL type |
|--------|------------|-------------------------|
| `id` | `Long id` | `bigserial` |
| `user_id` | `User user` | `bigint` FK → `users.id` |
| `title` | `String title` | `varchar` |
| `description` | `String description` | `text` |
| `task_date` | `LocalDate taskDate` | `date` |
| `start_time` | `LocalTime startTime` | `time` |
| `end_time` | `LocalTime endTime` | `time` |
| `planned_duration` | `Integer plannedDuration` | `integer` |
| `actual_duration` | `Integer actualDuration` | `integer` |
| `priority` | `String priority` | `varchar` |
| `category` | `String category` | `varchar` |
| `status` | `String status` | `varchar` |
| `progress` | `Integer progress` | `integer` |
| `started_at` | `Instant startedAt` | `timestamp` |
| `completed_at` | `Instant completedAt` | `timestamp` |
| `created_at` | `Instant createdAt` | `timestamp` |
| `updated_at` | `Instant updatedAt` | `timestamp` |
| `reminder` | `String reminder` | `varchar(10)` nullable — `5m`, `15m`, `30m`, `1h`, or null |
| `recurrence` | `String recurrence` | `varchar(20)` nullable — `daily`, `weekly`, `monthly`, or null |

### `task_tags` (Phase 6A)

| Column | Java field | Type |
|--------|------------|------|
| `id` | `Long id` | `bigserial` |
| `task_id` | `Task task` | FK → `tasks.id` ON DELETE CASCADE |
| `label` | `String label` | `varchar(100)` |

Apply `backend/db/migrations/001_phase6a_tags_reminder_recurrence.sql` before starting the app after upgrading.

If your `start_time` / `end_time` columns are `varchar` instead of `time`, change those fields in `Task.java` to `String` and re-run the app.
