from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database import engine, Base
from app.rate_limit import limiter
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.curriculum.router import router as curriculum_router
from app.learning.router import router as learning_router
from app.compliance.router import router as compliance_router
from app.ai.router import router as ai_router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(curriculum_router, prefix="/api/curriculum", tags=["curriculum"])
app.include_router(learning_router, prefix="/api/learning", tags=["learning"])
app.include_router(compliance_router, prefix="/api/compliance", tags=["compliance"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
