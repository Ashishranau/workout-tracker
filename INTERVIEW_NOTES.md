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

## C++/Python integration: pybind11

**Chosen:** A pybind11-based C++ extension module (`analytics_engine`), built with
CMake, imported directly into the FastAPI process like any other Python module.

**Alternatives considered:** `ctypes`/`cffi` calling into a plain C ABI shared
library; a separate C++ microservice (e.g. over gRPC or a small HTTP server) that
FastAPI calls over the network; shelling out to a compiled CLI binary and parsing
its stdout.

**Why rejected:** `ctypes` would work but pushes all the type-marshalling and
error-handling by hand (no automatic C++ exception → Python exception translation,
no easy way to return a struct like `OneRepMaxEstimate` without manually defining a
mirrored `ctypes.Structure`) — pybind11 generates that binding code from ordinary
C++ signatures instead. A separate microservice would add real deployment
complexity (another process to run, monitor, and version alongside the API) and
network latency for what's fundamentally a synchronous, in-process calculation —
that overhead only pays off if the C++ side needed independent scaling, which
these computations don't. Shelling out to a CLI binary per request means paying
process-spawn cost on every call and communicating through text serialization
instead of native types.

**Tradeoff accepted:** The extension is compiled per-platform (a `.pyd` on
Windows, a `.so` on Linux) and isn't committed to git — it has to be rebuilt
wherever the backend runs, which means the Render deployment will need a build
step (installing a compiler + CMake + running the build) rather than a plain
`pip install`. Accepted this because in-process calls with real C++ types and
automatic exception translation are worth the extra deploy-time build step,
especially since the analytics engine is the project's core differentiator and
should run as fast and as directly-integrated as possible.

**Gotcha hit:** on this Windows machine, CMake auto-detected "Visual Studio 18
2026" as the installed toolset — the generator name `"Visual Studio 17 2022"`
(what most tutorials show) failed because the actual installed MSBuild/toolset
version didn't match. Fixed by checking `cmake --help` for the generator CMake
actually detected on this machine, rather than assuming a fixed generator string.

## Third analytics feature: strength standard tiers, not percentile ranking

**Chosen:** Classify a lift into Beginner/Novice/Intermediate/Advanced/Elite
tiers using bodyweight-ratio breakpoints (per exercise and sex), rather than
computing a true percentile against a population dataset.

**Alternatives considered:** The original plan (see project stack) was
"strength percentile ranking" against a real population - the obvious source
being OpenPowerlifting, a large (CC0-licensed) open dataset of competition
results.

**Why rejected:** OpenPowerlifting is competition-entry data - a self-selected
population of people who specifically trained for and entered powerlifting
meets. Comparing an ordinary gym-goer's lift against that population is an
apples-to-oranges comparison: a genuinely strong casual lifter would land in
a low percentile purely because the comparison group is elite, not because
their lifting is actually below average. For an app whose feedback feature is
meant to be motivating and informative, that's actively the wrong signal to
show someone. There's also a second, practical problem specific to this
project: true percentile ranking needs a real population of *this app's*
users to compare against, and as a resume project with a handful of users at
most, that number would be statistically meaningless (or a trivial "100th
percentile of 1") regardless of data quality.

**Tradeoff accepted:** Bodyweight-ratio standard tiers don't tell a user
exactly "how many people" they're stronger than - they place a lift on a
general, published-style bodyweight-relative scale instead. The specific
breakpoint numbers used are approximate, commonly-cited general strength
benchmarks (the same style used by tools like Strength Level/ExRx), not a
reproduction of one single verified academic or federation source - this is
disclosed directly in the code and is an intentional accuracy/scope tradeoff
given the project's purpose. It also only covers exercises with a
well-established standard (the five main barbell lifts); machine and
dumbbell exercises cleanly report "not supported" rather than a fabricated
number. This is also why `sex` became a required signup field and bodyweight
became its own time-series table (`BodyweightLog`) instead of a single mutable
field on `User` - both are inputs the ratio calculation genuinely needs, and
bodyweight specifically needs to reflect what it was *at the time* of a given
lift, not just today's number.

## Frontend stack: TypeScript, Tailwind CSS, TanStack Query

**Chosen:** Vite + React + TypeScript, styled with Tailwind CSS, server state
(API data) managed by TanStack Query, client state (auth) via a small React
Context, `react-router-dom` for routing, `recharts` for the progression chart.

**Alternatives considered:** Plain JavaScript instead of TypeScript; a
component library (Mantine) instead of Tailwind; plain `fetch` +
`useEffect`/`useState` instead of TanStack Query; Create React App instead of
Vite.

**Why rejected:** Plain JavaScript would remove one axis of new-concept load
while first learning React, but loses compile-time checking against the
FastAPI/Pydantic response shapes - a mismatch (e.g. a renamed field) would
only surface at runtime instead of at build time. A component library would
get a polished UI faster with less CSS knowledge required, but Tailwind's
utility classes stay colocated with the markup they style, which matters more
once components get reused across pages (Dashboard, Log Workout, Progress all
share button/input styles). Plain `fetch`/`useEffect` is fewer concepts to
learn up front, but means hand-writing loading/error state and manual
re-fetching on every page - TanStack Query centralizes that (`isLoading`,
`isError`, caching, and `invalidateQueries` to refresh data after a mutation,
e.g. re-fetching the bodyweight list right after logging a new entry). Create
React App is now unmaintained by its team; Vite is the de facto successor.

**Tradeoff accepted:** Three new libraries/concepts (TypeScript, Tailwind,
TanStack Query) to learn simultaneously while also learning React itself -
more upfront friction than the minimal alternative, in exchange for patterns
that scale better as more pages get added and that are closer to what
production React codebases actually look like.

**Gotcha hit:** the 1RM trend chart's Y-axis initially rendered garbled,
repeated tick labels (e.g. "3333334kg") - recharts was generating ticks from
raw unrounded floating-point 1RM estimates and clipping the label width. This
wasn't caught by DOM-text assertions in an automated check (the text
"Improving" and the data were both present and correct) - only visually
inspecting a screenshot surfaced it. Fixed with a `tickFormatter` rounding
values to whole kg. Take-away: verifying a chart needs looking at the
rendered chart, not just checking that the underlying data arrived.

## Effort-quality filtering: RPE threshold, not an RPE-adjusted formula

**Chosen:** A set only counts toward the 1RM trend/plateau calculation if its
RPE is >= 8 or wasn't logged at all. Explicitly low-RPE sets (warmups,
deload work, e.g. RPE 6-7) are excluded outright rather than adjusted.

**Alternatives considered:** (1) Ignore RPE entirely for the computation (the
original implementation - RPE was captured and displayed but never used).
(2) A full RPE-adjusted 1RM formula - reps-in-reserve tables (as used in
Mike Tuchscherer's RTS system) that convert a reps+RPE combination into an
estimated %1RM, so even a deliberately submaximal set contributes a
(corrected) data point instead of being discarded.

**Why rejected:** Ignoring RPE entirely was the status quo this decision
replaced - it meant a warmup set or an intentional deload could silently
distort the trend (e.g. reading as "regression" when it was actually planned
lighter work), which is exactly the failure mode a plateau-detection feature
should avoid. A full RPE-adjustment formula would be more accurate in
principle, but reps-in-reserve tables are themselves approximations with
real disagreement between sources, layering one more approximate correction
on top of an already-approximate 1RM formula (Epley/Brzycki). That compounds
uncertainty for a marginal accuracy gain, and makes the number harder to
explain ("why is my 1RM different from what I calculated by hand").

**Tradeoff accepted:** Sets logged at RPE 7 or below are excluded from the
trend entirely rather than contributing an adjusted estimate - so a user who
only ever trains at moderate RPE could end up with too little qualifying
data to detect a trend at all. Accepted this since a smaller set of
high-confidence data points is more useful than a larger set of
uncertain-quality ones for something meant to answer "am I actually
stagnating." Missing RPE defaults to *included*, not excluded, specifically
because most already-logged data predates RPE tracking - a stricter default
would have silently discarded a user's own history.

## User-created exercises: per-user scoped, not global free text

**Chosen:** Users can add their own exercises beyond the curated catalog.
Each custom exercise has a nullable `created_by_user_id` - null means it's
part of the official catalog, otherwise it's visible only to the user who
created it. `GET /exercises` returns official + the caller's own.

**Alternatives considered:** (1) Just keep expanding the seeded catalog
indefinitely instead of letting users add exercises. (2) Free-text exercise
names entered per-set (no catalog entity at all). (3) User-created
exercises visible globally to every user, same table, no scoping.

**Why rejected:** Endlessly expanding a hand-seeded catalog doesn't scale -
there will always be a lift someone wants that isn't in it. This is also
the same free-text-vs-catalog tension from the original schema decision
(see "Schema design" above) - that decision rejected free text specifically
because inconsistent naming (e.g. "Bench", "Bench Press", "flat bench")
breaks the strength-standard feature's exercise-identity assumption. Custom
exercises don't reopen that problem because they never get a strength
standard anyway (only the curated "big 5" do) - so there's nothing for
inconsistent naming to corrupt. Making custom exercises globally visible was
rejected because, unlike the original percentile-ranking concern, this one
actually would degrade the shared catalog over time: every user's one-off or
oddly-named addition would clutter every other user's dropdown, even though
the exercises table already enforces globally unique names (so it's a
noise problem, not a duplicate-data problem).

**Tradeoff accepted:** A genuinely common exercise (say, "Trap Bar Deadlift")
gets added independently by every user who wants it, rather than being
added once and shared - some duplicated effort across users in exchange for
no cross-user clutter. For a project with a small number of real users, that
tradeoff clearly favors cleanliness over deduplication.
