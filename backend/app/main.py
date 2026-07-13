from fastapi import FastAPI

from app.api.routes import health

app = FastAPI(title="Strength Analytics Platform")

app.include_router(health.router)


@app.get("/")
def root():
    return {"message": "Strength analytics API is running"}
