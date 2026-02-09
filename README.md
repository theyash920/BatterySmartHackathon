# Digital Twin: BSS OPS (PS-5)

Operational Decision Support System for a **Battery Swapping Station (BSS)** network. This repo contains:

- **Backend**: FastAPI service that runs simulations and serves analytics/recommendations.
- **Frontend**: React + Vite dashboard that visualizes stations, KPIs, analytics, and “what-if” scenarios.

---

## Project Structure

- `backend/`
  - `main.py`: FastAPI app entrypoint
  - `api/routes.py`: API routes (mounted under `/api`)
  - `core/`: simulation/analytics/recommendation logic
  - `data/`: CSV/JSON inputs used by the API
  - `scenarios/`: predefined scenario JSONs
  - `requirements.txt`: Python dependencies
- `frontend/ReactPart/`
  - Vite + React app
  - `src/services/api.js`: axios client that calls the backend

---

## Backend (FastAPI)

### Requirements

- Python 3.10+ recommended

### Setup

From `PS5/backend`:

```bash
python -m venv venv
# Windows PowerShell
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

### Run

From `PS5/backend`:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Health / Docs

- `GET http://localhost:8000/`
- Swagger UI: `http://localhost:8000/docs`

---

## Frontend (React + Vite)

### Requirements

- Node.js 18+ recommended

### Setup

From `PS5/frontend/ReactPart`:

```bash
npm install
```

### Configure API URL

The frontend reads the backend base URL from **Vite env**:

Create `PS5/frontend/ReactPart/.env` (or `.env.local`) with:

```env
VITE_API_URL=http://localhost:8000
```

Then restart Vite after any env change.

### Run

From `PS5/frontend/ReactPart`:

```bash
npm run dev
```

Open:

- `http://localhost:5173`

---

## API Endpoints (Backend)

All routes are mounted under `/api`.

### Stations

- `GET /api/stations`
- `GET /api/stations/detailed`
- `GET /api/stations/realtime`
- `GET /api/stations/analyze-removal/{station_id}`
- `POST /api/stations/analyze-location`

### Simulation

- `POST /api/simulate`
  - Body:
    ```json
    {
      "tweaks": [
        {"station_id": "...", "extra_chargers": 1, "extra_batteries": 5}
      ]
    }
    ```

### Scenarios

- `GET /api/scenarios`
- `GET /api/scenarios/{scenario_name}`

### Analytics

- `GET /api/analytics/network`
- `GET /api/analytics/{station_id}`

### Replenishment

- `GET /api/replenishment/network`
- `GET /api/replenishment/{station_id}`
- `GET /api/replenishment/{station_id}/optimal-stock`

### Recommendations

- `GET /api/recommendations/all`
- `GET /api/recommendations/city`
- `GET /api/recommendations/{station_id}`

### City Configuration

- `GET /api/city-config`
- `GET /api/city-config/zones`

---

## Troubleshooting

### Frontend shows `Network Error` / console `ERR_CONNECTION_TIMED_OUT`

- Confirm backend is running: `http://localhost:8000/docs`
- Confirm frontend is calling the correct API base URL:
  - In DevTools `Network` tab, check the failing request’s **Request URL**.
- Ensure `VITE_API_URL` is set to `http://localhost:8000` and **restart** `npm run dev`.

### Python venv / pip launcher errors after moving folders (Windows)

If you moved the project folder after creating a venv, recreate it:

```bash
deactivate
Remove-Item -Recurse -Force .\venv
python -m venv .\venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

---

## Security Note (Important)

If this repository contains any private key material (for example `*.pem` files), it **must not** be committed to a public repository.

- Remove the key from git history and rotate/revoke the key immediately if it has been exposed.

---

## License

Add a license if you plan to distribute or open-source this project.
