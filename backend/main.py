"""
ResumeIQ — FastAPI application entry point.
"""
import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import Base, engine
import models  # noqa: F401 — ensures all models are registered with Base
from routers import jobs, candidates, scoring, builder

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ResumeIQ API",
    description="Resume shortlisting simulator (Module A) + resume builder (Module B)",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────
_raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _raw_origins.split(",")]
# allow_credentials cannot be True when allow_origins=["*"] (browser restriction)
allow_creds = "*" not in origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Self-Test-Warnings"],
)

# ── Create tables on startup ───────────────────────────────────────────────
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")


# ── Global error handler — never leak stack traces to the client ───────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )


# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(scoring.router)
app.include_router(builder.router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
