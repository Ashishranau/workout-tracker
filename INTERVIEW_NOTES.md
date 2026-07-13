# Interview Notes

Major architectural decisions only — for interview prep, not day-to-day reference.
Each entry: what we chose, what else we considered, why we rejected those, and what
tradeoff we accepted by choosing this way.

## Backend framework: FastAPI

**Chosen:** FastAPI for the API layer (auth, CRUD, serving analytics results).

**Alternatives considered:** Django + Django REST Framework, Flask, Node/Express.

**Why rejected:** Django/DRF bundles an ORM, admin panel, and templating engine that
would go entirely unused in an API-only backend — it's a heavier framework than this
project needs. Flask is minimal but has no built-in request/response validation or
auto-generated API docs, both of which FastAPI provides via Pydantic for free. Node/
Express was ruled out early: the analytics engine needs a Python↔C++ bridge either
way (pybind11), so keeping the API layer in Python too avoids a second language
boundary in the stack.

**Tradeoff accepted:** FastAPI has a thinner "batteries-included" ecosystem than
Django — there's no built-in auth system, so we hand-rolled JWT auth ourselves. In
exchange we get automatic request validation, free interactive docs (Swagger/ReDoc,
useful when demoing), and async support if analytics endpoints need it later.

## Database: PostgreSQL, run locally via Docker

**Chosen:** PostgreSQL as the primary datastore; Docker Compose for local dev,
Render's managed Postgres for deployment.

**Alternatives considered:** MongoDB (NoSQL/document store), SQLite, MySQL.

**Why rejected:** Workout data is inherently relational — sessions belong to users,
sets belong to sessions, sets reference a shared exercise catalog. A document store
would force either duplicating exercise data into every set document or manually
maintaining referential integrity that foreign keys give for free in a relational DB.
SQLite doesn't hold up for a real deployed multi-user service (weak concurrent-write
support). MySQL is a reasonable alternative to Postgres, but Postgres has stronger
support for statistical SQL (percentile_cont, stddev, window functions) that the
percentile-ranking feature will likely lean on, and it's Render's first-class managed
option.

**Tradeoff accepted:** More local setup overhead than SQLite (needs Docker or a
hosted instance) — accepted for correctness and because local dev then mirrors
production, catching environment-specific bugs early instead of at deploy time.

## Schema design: session→set model + curated exercise catalog

**Chosen:** `WorkoutSession` (one gym visit: date + notes) contains many
`WorkoutSet` rows (exercise, weight, reps, RPE). Exercises are a curated,
seeded catalog table, not free text.

**Alternatives considered:** A flat `sets` table with just a timestamp (no session
grouping); free-text exercise names entered per set.

**Why rejected:** A flat table without sessions loses the natural "workout day"
grouping and turns "show me today's workout" into a date-range group-by instead of
a direct foreign key lookup. Free-text exercise names would let the same lift get
logged as "bench" / "Bench Press" / "flat bench" — which breaks percentile ranking,
since comparing a user's squat against the population only works if "squat" always
resolves to the same catalog row.

**Tradeoff accepted:** Users can't log an exercise the catalog doesn't have yet
without an admin/seed step — less flexible than free text. Accepted because
analytics correctness (comparable, aggregable data) is the actual value proposition
of this project, ahead of logging flexibility.

## Auth strategy: hand-rolled JWT vs. a library

**Chosen:** Custom auth — `passlib`/bcrypt for password hashing, `python-jose` for
JWT issuing/verification, a `get_current_user` FastAPI dependency guarding routes.

**Alternatives considered:** `fastapi-users` (pre-built FastAPI auth package),
server-side session auth, a third-party auth provider (Auth0/Clerk/Firebase Auth).

**Why rejected:** `fastapi-users` ships working auth fastest but is a black box —
for a placements project, being able to explain exactly how hashing, token issuance,
and verification work end-to-end is worth more than the time saved. Server-side
sessions need sticky storage (or a shared store like Redis), disproportionate
infra complexity for a solo project, and don't map as cleanly onto a stateless API
consumed by a separate React frontend. A third-party provider handles security best
practices well but again makes auth a black box, and adds a paid external dependency
to a project meant to demonstrate independent full-stack ability.

**Tradeoff accepted:** We're responsible for getting every security detail right
ourselves (token expiry is handled; things like secret rotation aren't built yet and
would need to be added manually) — a library would have handled more of this by
default. Accepted the extra implementation/review burden for full understanding,
control, and material to discuss in interviews.

## C++/Python integration (pybind11)

_To be filled in once the analytics engine is actually built — will cover pybind11
vs. a separate microservice/subprocess vs. ctypes, and the tradeoffs of embedding a
compiled extension directly in the Python process._
