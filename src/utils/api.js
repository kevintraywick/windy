// ─── Geocoding via Nominatim (OpenStreetMap) ─────────────────────────────────

export async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  const data = await res.json()

  if (!data.length) throw new Error('Address not found. Try a ZIP code or "City, State".')

  const item = data[0]
  const addr = item.address
  const stateRaw = addr.state_code || addr['ISO3166-2-lvl4']?.split('-')[1] || null

  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    displayName: item.display_name,
    state: stateRaw?.toUpperCase() ?? null,
    country: addr.country_code?.toUpperCase() ?? null,
  }
}

// ─── Wind data via Open-Meteo Historical (ERA5 reanalysis) ───────────────────
// Routes through /api/wind in prod (for caching), directly in dev.

export async function fetchWindData(lat, lon) {
  // Try server-side proxy first (adds PostgreSQL caching)
  try {
    const res = await fetch(`/api/wind?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`)
    if (res.ok) return res.json()
  } catch {
    // Fall through to direct call in dev if server isn't available
  }

  return fetchWindDataDirect(lat, lon)
}

export async function fetchWindDataDirect(lat, lon) {
  const end   = new Date()
  end.setDate(end.getDate() - 2)
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)

  const fmt = (d) => d.toISOString().slice(0, 10)

  const url =
    `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
    `&hourly=wind_speed_10m,wind_direction_10m` +
    `&wind_speed_unit=mph&timezone=auto`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Could not fetch wind data. Please try again.')
  return res.json()
}
