# Decisions Log

Brief, one-line-per-change record of what was built. For the reasoning behind
major architectural choices (framework, database, schema, auth, C++/Python
integration), see `INTERVIEW_NOTES.md` instead.

- Scaffolded monorepo: `backend/`, `frontend/`, `cpp_engine/`.
- Local Postgres via Docker Compose (`docker-compose.yml`); FastAPI runs natively and connects over `localhost:5432`.
- FastAPI skeleton: `config.py` (typed settings), `database.py` (engine/session/`get_db`), `/health` route verifying DB connectivity.
- Git repo initialized, pushed to public GitHub repo `Ashishranau/workout-tracker`.
- Added Alembic for versioned migrations; `env.py` reads `DATABASE_URL` from app settings and autogenerates from `Base.metadata`.
- Added `User`, `Exercise`, `WorkoutSession`, `WorkoutSet` SQLAlchemy models + first migration.
- Added Pydantic schemas for user/auth/exercise/workout request and response shapes.
- Added JWT auth (`core/security.py`): bcrypt hashing, JWT encode/decode, `/auth/register`, `/auth/login`, `get_current_user` dependency.
  - Gotcha: `passlib` 1.7.4 breaks with `bcrypt>=4.0` — pinned `bcrypt<4.0`.
- Added protected `/users/me` route.
- Seeded a 10-exercise curated catalog via `scripts/seed_exercises.py` (idempotent, safe to re-run).
- Added `/exercises` list route and `/sessions`, `/sessions/{id}`, `/sessions/{id}/sets` routes, scoped per-user via `user_id` filtering.
- Verified full auth + workout-logging flow end-to-end via curl.
