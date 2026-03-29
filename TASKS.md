# Windy — Task List

## In Progress

- [ ] Push to GitHub and deploy on Railway

## Up Next

- [ ] Turbine comparison mode — let user compare 2 turbines side-by-side in the panel
- [ ] Battery storage ROI — toggle to add a paired battery (10 kWh) and show additional savings
- [ ] "Request an anemometer kit" CTA — show for sites with Fair/Good/Excellent wind class
- [ ] Refine mobile layout — map stacks above panel on small screens

## Backlog

- [ ] EIA API integration — replace hardcoded state rates with live API lookup (requires free EIA key)
- [ ] NREL Wind Toolkit — optional higher-res wind data (requires free NREL API key)
- [ ] User accounts — save locations, track readings over time
- [ ] Permit/zoning lookup by ZIP — surface wind turbine setback requirements
- [ ] Wind speed animation on map — Leaflet.wind or velocity layer for visual wow
- [ ] Maintenance cost toggle — let user input $200/yr maintenance and see adjusted payback
- [ ] Export to PDF — one-page summary homeowner can share with installer
- [ ] Anemometer kit landing page — product page for the DIY kit offering
- [ ] Multiple anemometer readings — let user log readings over time and average them

## Done

- [x] Vanilla JS prototype (see _reference/index.html)
- [x] Migrate to React + Tailwind + Vite
- [x] Express server with PostgreSQL wind data cache
- [x] Railway deployment config
- [x] CLAUDE.md project context
