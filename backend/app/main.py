from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, auth, bodyweight, exercises, health, users, workouts

app = FastAPI(title="Strength Analytics Platform")

# Dev-only origin (the Vite dev server). Update this when the frontend is
# deployed to Vercel so the production domain is allowed instead/as well.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(bodyweight.router)
app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "Strength analytics API is running"}
