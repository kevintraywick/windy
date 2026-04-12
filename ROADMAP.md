# Roadmap

The public roadmap for **Windy**. This file is parsed at runtime and rendered at `/do`.

Each item is a checkbox list entry with a version tag. Tags look like `<!-- windy-v1 -->`. Untagged items are ignored.

Status is read from the checkbox: `[x]` = built, `[ ]` = planned. Add `<!-- in-progress -->` to mark partial work. Add `<!-- deferred -->` to strike through.

---

## Windy

> A homeowner tool that answers: "Would a small wind turbine save me money on my electric bill?"

### v1 — live

- [x] Vanilla JS prototype <!-- windy-v1 -->
- [x] React + Tailwind + Vite migration <!-- windy-v1 -->
- [x] Express server with PostgreSQL wind data cache <!-- windy-v1 -->
- [x] Railway deployment config <!-- windy-v1 -->
- [x] Address / ZIP geocoding with Open-Meteo wind fetch <!-- windy-v1 -->
- [x] Physics-based power simulation (Betz limit, cut-in/cut-out) <!-- windy-v1 -->
- [x] Annual savings + payback period + 20-year ROI <!-- windy-v1 -->
- [x] Anemometer override input <!-- windy-v1 -->
- [x] Leaflet map with click-to-analyze <!-- windy-v1 -->

### v1 — in flight

- [ ] Push to GitHub and deploy on Railway <!-- windy-v1 --> <!-- in-progress -->

### v2 — planned

- [ ] Turbine comparison mode (side-by-side in panel) <!-- windy-v2 -->
- [ ] Battery storage ROI layer (paired 10 kWh battery) <!-- windy-v2 -->
- [ ] "Request an anemometer kit" CTA for high-wind sites <!-- windy-v2 -->
- [ ] Mobile layout refinement (map stacks above panel) <!-- windy-v2 -->
- [ ] Maintenance cost toggle ($200/yr adjustable) <!-- windy-v2 -->

### v3 — data & accounts

- [ ] EIA API integration (live state electricity rates) <!-- windy-v3 -->
- [ ] NREL Wind Toolkit integration (higher-res wind data) <!-- windy-v3 -->
- [ ] User accounts (save locations, track readings) <!-- windy-v3 -->
- [ ] Multiple anemometer readings (log over time, average) <!-- windy-v3 -->

### v4 — polish & growth

- [ ] Permit/zoning lookup by ZIP (setback requirements) <!-- windy-v4 -->
- [ ] Wind speed animation on map (Leaflet velocity layer) <!-- windy-v4 -->
- [ ] Export to PDF (one-page summary for installers) <!-- windy-v4 -->
- [ ] Anemometer kit landing page <!-- windy-v4 -->
