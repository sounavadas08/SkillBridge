from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="SkillBridge API",
    version="1.0.0",
    description="Academia-Industry Integration Platform Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SkillBridge API",
        "model": settings.cloudflare_model
    }

from app.database import init_db
from app.routers import ai, skills, jobs, auth

init_db()


app.include_router(ai.router)
app.include_router(skills.router)
app.include_router(jobs.router)
app.include_router(auth.router)

