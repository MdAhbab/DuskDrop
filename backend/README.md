# DuskDrop Backend

FastAPI + SQLite backend for the DuskDrop hyperlocal expiring-soon marketplace.

## Stack

- **FastAPI 0.109** — async ASGI web framework
- **SQLAlchemy 2** — ORM (sync + SQLite)
- **Pydantic v2** — schema validation
- **Uvicorn** — ASGI server

## Quickstart

All dependencies are already installed system-wide (Python 3.13).

```powershell
# From the backend/ directory:
python -m uvicorn app.main:app --reload --port 8000
```

The server will:
1. Create `duskdrop.db` (SQLite file) on first run
2. Auto-seed with 6 vendors, 8 listings, 1 buyer, and 3 flock alerts
3. Serve the API at http://localhost:8000
4. Serve interactive docs at http://localhost:8000/docs

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/listings` | List active listings (filterable) |
| GET | `/api/listings/{id}` | Get a single listing |
| GET | `/api/listings/{id}/price` | Live price tick (lightweight) |
| POST | `/api/listings` | Create a listing |
| GET | `/api/vendors` | List all vendors |
| GET | `/api/vendors/{id}` | Get a vendor |
| POST | `/api/reservations` | Reserve (price-locked) |
| POST | `/api/reservations/{id}/pay` | Mark as paid |
| POST | `/api/reservations/{id}/collect` | Collect (QR scan) |
| GET | `/api/impact/me` | Buyer impact stats |
| GET | `/api/impact/ward/{code}` | Ward-level impact |
| GET | `/api/flock-alerts` | List alerts |
| POST | `/api/flock-alerts` | Create an alert |
| PATCH | `/api/flock-alerts/{id}` | Update alert |
| DELETE | `/api/flock-alerts/{id}` | Delete alert |
| POST | `/api/agents/listing-draft` | AI listing drafter |
| GET | `/api/agents/forecast/{vendor_id}` | Waste forecast nudges |
| POST | `/api/agents/concierge` | Natural language listing search |

## Frontend Wiring

The frontend reads `VITE_API_URL` from `frontend/.env.local`.
It defaults to `http://localhost:8000` in development.

Start both together:

```powershell
# Terminal 1 — backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
npm run dev
```
