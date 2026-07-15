# Strength Analytics Platform

A strength training tracker built around computation, not just logging. Instead of
just storing sets and reps, it estimates your one-rep max, detects when you've
plateaued on a lift, and classifies your current strength level against published
bodyweight-relative standards.

The analytics (1RM estimation, plateau detection via linear regression, strength
standard classification) run in a C++ engine exposed to the Python backend through
pybind11, rather than being reimplemented in Python.

## Features

- Email/password auth (JWT)
- Log workouts: sessions containing sets (exercise, weight, reps, optional RPE),
  with full edit/delete
- Add your own exercises beyond the built-in catalog
- Bodyweight tracking over time
- 1RM estimation (Epley + Brzycki) for any set
- Plateau detection: fits a trend to your estimated 1RM over time and flags
  stagnation, filtering out low-effort sets (warmups, deloads) by RPE
- Strength standard tiers (Beginner → Elite) based on bodyweight ratio, for the
  main barbell lifts
- Progress charts (recharts) showing the 1RM trend with bodyweight/RPE context
  on hover

## Stack

- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic
- **Analytics engine:** C++ compiled to a Python extension module via pybind11
- **Frontend:** React, TypeScript, Tailwind CSS, TanStack Query, React Router, recharts
- **Local dev:** Docker Compose (Postgres), Vite dev server

## Project structure

```
backend/        FastAPI app, SQLAlchemy models, Alembic migrations
cpp_engine/     C++ analytics engine (CMake + pybind11)
frontend/       React + TypeScript app
docker-compose.yml   Local Postgres
```

## Running it locally

**1. Postgres**

```
docker compose up -d
```

**2. Backend**

```
cd backend
python -m venv .venv
.venv/Scripts/activate   # or source .venv/bin/activate on Linux/Mac
pip install -r requirements.txt
cp .env.example .env     # then fill in a real SECRET_KEY
alembic upgrade head
python -m scripts.seed_exercises
uvicorn app.main:app --reload
```

**3. C++ engine**

Needs a C++ compiler (MSVC on Windows, gcc/clang on Linux/Mac) and CMake.

```
cd cpp_engine
cmake -S . -B build -Dpybind11_DIR=$(../backend/.venv/bin/python -m pybind11 --cmakedir)
cmake --build build --config Release
```

The backend picks up the compiled module automatically from `cpp_engine/build/Release`
(or `build/` on Linux/Mac).

**4. Frontend**

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `:8000`, frontend on `:5173`.

## Why it's built this way

`DECISIONS.md` has a running log of what was built and when. `INTERVIEW_NOTES.md`
goes deeper on the bigger calls (why FastAPI, why Postgres, why a curated exercise
catalog instead of free text, why strength standards instead of percentile ranking
against a population, why the C++/Python boundary looks the way it does) along with
the alternatives that were considered and the tradeoffs accepted.
