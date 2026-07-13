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