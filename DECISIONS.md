# Decisions Log

## Project folder structure (monorepo)
Built `backend/`, `frontend/`, `cpp_engine/` as sibling folders in one repo.
Chose monorepo over separate repos since it's a solo project — one place to
manage, easy to deploy pieces independently later anyway.
Concept: `backend/app/` is split by responsibility (config, db, models,
schemas, routes) rather than one big file — standard FastAPI layout.

## Local Postgres via Docker Desktop
Chose Docker over a native Windows Postgres install or a hosted free tier
(Neon/Supabase) — containers are disposable/resettable and match how most
real backend teams run local dev, without permanently installing a Windows
service.
Concept: `docker-compose.yml` defines one Postgres service exposed on
`localhost:5432`; FastAPI runs natively on the host and connects to it like
any remote DB.

## FastAPI + Postgres skeleton
Built `backend/app/config.py` (typed settings from `.env`), `database.py`
(SQLAlchemy engine/session + `get_db()` dependency), and
`api/routes/health.py` (`GET /health` running `SELECT 1`).
Chose pydantic-settings over raw `os.getenv()` for validated, typed config.
Concept: FastAPI's `Depends(get_db)` is dependency injection — it opens a
DB session per request and guarantees it closes, even on error.

## Git + GitHub
Initialized git locally, committed the skeleton, created a public GitHub
repo (`Ashishranau/workout-tracker`), pushed via HTTPS using Git Credential
Manager's browser-based login (no manual token handling needed).
Chose public repo since this is a placements portfolio piece.
Concept: `.env` is gitignored from the start — secrets never get committed,
even by accident.

## Alembic migrations
Wired `alembic/env.py` to read `DATABASE_URL` from our own `Settings` (not a
duplicated URL in `alembic.ini`) and to autogenerate from `Base.metadata`.
Chose migrations over `Base.metadata.create_all()` because real schema
changes (adding a column to a table with live data) need a controlled,
reversible upgrade path, not a blunt "recreate everything" call.
Concept: each migration is a version-controlled Python file with
`upgrade()`/`downgrade()` — the DB schema's history lives in git, same as
the code.

## Core data models: User, Exercise, WorkoutSession, WorkoutSet
`User` holds login credentials. `Exercise` is a curated catalog (seeded, not
free text) so cross-user comparisons (percentile ranking later) refer to
the same canonical lift. `WorkoutSession` is one gym visit (date + notes);
`WorkoutSet` is one set within it (exercise, weight_kg, reps, optional RPE).
Chose session→sets nesting over flat timestamped sets because it matches
how a workout is actually logged and gives clean per-exercise time series
for 1RM/plateau analytics later.
Concept: `weight_kg`/`rpe` are SQL `Numeric`, not `Float` — avoids binary
floating-point rounding drift on stored weights.

## Auth: custom JWT (not a library)
Built register/login by hand: `passlib` (bcrypt) for password hashing,
`python-jose` for JWT encode/decode, `OAuth2PasswordBearer` +
`get_current_user` dependency to guard routes.
Chose hand-rolled over `fastapi-users` so there's a real story to explain
in interviews, at the cost of more code to maintain.
Concept: `Depends(get_current_user)` on a route means "this endpoint
requires a valid Bearer token" — FastAPI decodes it, loads the user, and
injects it as an argument before your route body runs.
Gotcha hit: `passlib` 1.7.4 + `bcrypt>=4.0` breaks (a known upstream
incompatibility) — pinned `bcrypt<4.0` in requirements.txt to fix.

## Exercise catalog seed script
`backend/scripts/seed_exercises.py` inserts 10 canonical barbell/dumbbell/
machine/bodyweight lifts, skipping ones that already exist (safe to re-run).
Chose a plain idempotent script over an Alembic data migration since this
is reference data we'll keep tweaking, not a one-time structural change.

## Workout session/set routes
`POST/GET /sessions`, `GET /sessions/{id}`, `POST /sessions/{id}/sets` — all
behind `get_current_user` and filtered by `user_id` so one user can never
read or write another's data.
Concept: `selectinload(WorkoutSession.sets)` eager-loads sets in the same
query — without it, accessing `.sets` after the DB session closes would
raise a `DetachedInstanceError`.