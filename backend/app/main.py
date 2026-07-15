from fastapi import FastAPI

from app.api.routes import analytics, auth, exercises, health, users, workouts

app = FastAPI(title="Strength Analytics Platform")

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(exercises.router)
app.include_router(workouts.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "Strength analytics API is running"}
