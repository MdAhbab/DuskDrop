"""
DuskDrop FastAPI application entry point.
Run: uvicorn app.main:app --reload
Docs: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .seed import seed_db
from .routers import listings, vendors, reservations, impact, alerts, agents

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DuskDrop API",
    description=(
        "Hyperlocal expiring-soon marketplace API. "
        "Time-decay pricing, reservations, impact tracking & agentic endpoints."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(listings.router)
app.include_router(vendors.router)
app.include_router(reservations.router)
app.include_router(impact.router)
app.include_router(alerts.router)
app.include_router(agents.router)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    seed_db()


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "duskdrop-api"}


@app.get("/", tags=["health"])
def root():
    return {
        "service": "DuskDrop API",
        "version": "0.1.0",
        "docs": "/docs",
    }
