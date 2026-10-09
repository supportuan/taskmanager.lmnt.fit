# TaskFlow Backend

Spring Boot REST API for TaskFlow (PostgreSQL + JWT).

## Prerequisites

- **Java 21** (matches local OpenJDK setup)
- **Maven 3.9+**
- **PostgreSQL 17** with database **`taskflow_db`** and existing tables **`users`**, **`tasks`**
- **pgAdmin 4** (optional, for inspecting data)

Hibernate is configured with **`spring.jpa.hibernate.ddl-auto=validate`** — the schema is **not** created or dropped by the app.

After pulling **Phase 6A** or later, apply the SQL migration once (safe on existing data):

```bash
psql -d taskflow_db -f db/migrations/001_phase6a_tags_reminder_recurrence.sql
```

## Environment variables

Copy `.env.example` to a local env file or export variables in your shell before starting:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `taskflow_db` | Database name |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | *(required)* | DB password — **never commit** |
| `JWT_SECRET` | *(required)* | Long random signing secret |
| `JWT_EXPIRATION_MS` | `43200000` | Token lifetime (12h default) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated frontend origins |
| `SERVER_PORT` | `8080` | HTTP port |

Example (macOS/Linux):

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=taskflow_db
export DB_USERNAME=postgres
export DB_PASSWORD='your_password'
export JWT_SECRET='your_long_random_secret'
export CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Start the backend

```bash
cd backend
mvn spring-boot:run
```

Base URL: **http://localhost:8080**

Build only:

```bash
cd backend
mvn -q package -DskipTests
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | Service health |
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer JWT | Current user |
| POST | `/api/tasks` | Bearer JWT | Create task (owned by authenticated user) |
| GET | `/api/tasks` | Bearer JWT | List current user's tasks |
| GET | `/api/tasks/{id}` | Bearer JWT | Get one task (must belong to user) |
| PUT | `/api/tasks/{id}` | Bearer JWT | Update task (must belong to user) |
| DELETE | `/api/tasks/{id}` | Bearer JWT | Delete task (must belong to user) |

Task APIs never accept `userId` from the client. Ownership is derived from the JWT only.

### Health

```bash
curl -s http://localhost:8080/api/health
```

Expected:

```json
{"status":"UP","service":"TaskFlow Backend"}
```

### Register

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Srinivas","email":"srinivas@example.com","password":"examplePassword"}'
```

Expected: **201** with `{"message":"Registration successful"}`.

Duplicate email: **409** with `{"message":"An account with this email already exists."}`.

Verify in pgAdmin: `users.password_hash` must look like BCrypt (`$2a$10$...`), not plaintext.

### Login

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"srinivas@example.com","password":"examplePassword"}'
```

Expected: **200** with `token`, `user`, and `expiresAt` (no password fields).

Wrong password: **401** with `{"message":"Invalid email or password."}`.

### Current user

```bash
TOKEN='paste_jwt_here'
curl -s http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Without token: **401** `{"message":"Unauthorized."}`.

### Tasks (JWT required)

```bash
TOKEN='paste_jwt_here'

curl -s -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Complete backend API",
    "description": "Implement TaskFlow task APIs",
    "taskDate": "2026-10-07",
    "startTime": "15:00:00",
    "endTime": "16:30:00",
    "plannedDuration": 90,
    "priority": "HIGH",
    "category": "Development",
    "status": "PENDING",
    "progress": 0
  }'

curl -s http://localhost:8080/api/tasks -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:8080/api/tasks/1 -H "Authorization: Bearer $TOKEN"
```

Another user's task ID returns **404**. Requests without JWT return **401**.

## Frontend (development)

Frontend: **http://localhost:5173**

Set in project root `.env.local` (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080
```

The React app can call the API via `src/services/api.ts`, `src/services/authService.ts`, and `src/services/taskService.ts`. UI is unchanged; pages are not wired to task APIs yet.

## Architecture

```
React (Vite) → REST → Spring Boot → JPA → PostgreSQL (taskflow_db)
                      Spring Security + JWT
```

Dashboard, Tracker, Completed, Focus, and Analytics APIs are **not** implemented yet — only secure CRUD for `/api/tasks`.
