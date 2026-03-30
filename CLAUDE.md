# Windy — CLAUDE.md

Project context for AI-assisted development sessions.

## What this is

**Windy** is a homeowner tool that answers: "Would a small wind turbine save me money on my electric bill?"

Users enter their address (or click the map), and the tool fetches a year of historical wind data for their exact location, runs a physics-based power simulation using their chosen turbine size, and shows annual savings, payback period, and a 20-year ROI estimate. An optional anemometer input lets users validate estimates against a real measurement.

Live at: `https://meticulous-eagerness-production-411f.up.railway.app`

## Tech stack

| Layer      | Choice          | Why |
|------------|-----------------|-----|
| Frontend   | React + Vite    | Fast dev cycle; Leaflet integrates cleanly via useEffect |
| Styling    | Tailwind CSS    | Utility-first; easy to iterate on layout |
| Backend    | Node.js/Express | Simple, Railway-native |
| Database   | PostgreSQL       | Railway add-on; caches wind API responses |
| Deployment | Railway         | One service: Express serves both API and built React app |

## Project structure

```
Windy/
├── src/                    # React frontend
│   ├── App.jsx             # Root component + state
│   ├── constants.js        # Turbine specs, state rates, wind classes
│   ├── utils/
│   │   ├── api.js          # Geocoding + wind data fetching
│   │   └── windCalc.js     # All physics: power curve, height correction, savings
│   └── components/
│       ├── Map.jsx         # Leaflet map (vanilla Leaflet via useEffect)
│       ├── SetupPanel.jsx  # Right sidebar: inputs + results container
│       └── Results.jsx     # Wind summary, rose, savings, stats
├── server/
│   ├── index.js            # Express app entry
│   ├── db.js               # pg Pool connection
│   ├── db/schema.sql       # PostgreSQL schema (run once)
│   └── routes/
│       ├── health.js       # GET /api/health
│       └── wind.js         # GET /api/wind — proxy + 7-day cache
└── _reference/index.html   # Original vanilla JS prototype (reference only)
```

## Key data sources

- **Wind data:** Open-Meteo Historical API (ERA5 reanalysis) — free, no API key, hourly resolution
  - `https://archive-api.open-meteo.com/v1/archive`
  - Fetches past 12 months of hourly `wind_speed_10m` + `wind_direction_10m`
  - Server caches by 0.1° grid cell (≈7 mi) for 7 days in PostgreSQL
- **Geocoding:** Nominatim (OpenStreetMap) — free, no key, returns lat/lon + state code
- **Electricity rates:** EIA 2024 state averages embedded in `src/constants.js` — no API needed
- **Optional future:** NREL Wind Toolkit (higher-res, requires free API key), EIA API (live rates, key required)

## Physics model

Wind power: `P = 0.5 × ρ × A × Cp × v³`, capped at rated power
- ρ = 1.225 kg/m³ (air density at sea level)
- A = π × r² (rotor swept area)
- Cp = Betz-limited power coefficient per turbine
- Cut-in/cut-out speeds enforced per turbine

Height correction: `v(h) = v₁₀ × (h/10)^(1/7)` (power law, α=1/7 for open terrain)

Anemometer override: when provided, scales the historical wind distribution so its mean matches the user's measurement (preserves seasonal variation shape).

## Development

```bash
cp .env.example .env          # fill in DATABASE_URL
npm install
npm run dev                   # Vite (port 5173) + Express (port 3001) concurrently
```

Vite proxies `/api/*` to Express in dev. In production Express serves the `dist/` build directly.

## Deployment (Railway)

1. Push to GitHub
2. New Railway project → "Deploy from GitHub repo"
3. Add PostgreSQL add-on → `DATABASE_URL` is injected automatically
4. Run `psql $DATABASE_URL -f server/db/schema.sql` once via Railway shell
5. Set `NODE_ENV=production` in Railway env vars
6. `railway.toml` handles build (`npm install && npm run build`) and start (`node server/index.js`)

## Conventions

- All calculation logic lives in `src/utils/windCalc.js` — keep it pure (no React, no fetch)
- `src/constants.js` is the single source of truth for turbine specs and state rates
- The server is an enhancement (caching, future auth) — the app must work if the server is down
- Use Tailwind utility classes; avoid writing custom CSS except for Leaflet overrides

## Planned features (in rough priority order)

See `TASKS.md` for current status. High-level roadmap:
1. Side-by-side turbine comparison
2. Battery storage ROI layer (pair with Powerwall-class battery)
3. "Request an anemometer kit" CTA for high-wind sites
4. User accounts + saved locations
5. EIA live rate lookup (replace hardcoded state averages)
6. NREL Wind Toolkit integration (higher-resolution data)
7. Permit/zoning info by ZIP (wind turbine setback requirements)
