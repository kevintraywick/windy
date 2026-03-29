/**
 * GET /api/wind?lat=XX.XXXX&lon=XX.XXXX
 *
 * Proxy + PostgreSQL cache for Open-Meteo historical wind data.
 * Rounds lat/lon to 0.1° grid (~7 miles) to maximize cache hits.
 * Cache TTL: 7 days (wind climatology doesn't change quickly).
 */

const router = require('express').Router()
const pool   = require('../db')

const CACHE_TTL_DAYS = 7

// Round to nearest 0.1° for cache bucketing
const bucket = (v) => Math.round(v * 10) / 10

async function fetchFromOpenMeteo(lat, lon) {
  const end   = new Date()
  end.setDate(end.getDate() - 2)
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - 1)

  const fmt = (d) => d.toISOString().slice(0, 10)

  const url =
    `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat}&longitude=${lon}` +
    `&start_date=${fmt(start)}&end_date=${fmt(end)}` +
    `&hourly=wind_speed_10m,wind_direction_10m` +
    `&wind_speed_unit=mph&timezone=auto`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  return res.json()
}

router.get('/', async (req, res) => {
  const lat = parseFloat(req.query.lat)
  const lon = parseFloat(req.query.lon)

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'lat and lon are required' })
  }

  const bLat = bucket(lat)
  const bLon = bucket(lon)

  try {
    // 1. Check cache
    const cached = await pool.query(
      'SELECT payload FROM wind_cache WHERE lat=$1 AND lon=$2 AND expires_at > NOW()',
      [bLat, bLon]
    )

    if (cached.rows.length) {
      return res.json(cached.rows[0].payload)
    }

    // 2. Fetch fresh data
    const data = await fetchFromOpenMeteo(bLat, bLon)

    // 3. Upsert into cache
    const expires = new Date()
    expires.setDate(expires.getDate() + CACHE_TTL_DAYS)

    await pool.query(
      `INSERT INTO wind_cache (lat, lon, payload, fetched_at, expires_at)
       VALUES ($1, $2, $3, NOW(), $4)
       ON CONFLICT (lat, lon)
       DO UPDATE SET payload=$3, fetched_at=NOW(), expires_at=$4`,
      [bLat, bLon, JSON.stringify(data), expires]
    )

    return res.json(data)
  } catch (err) {
    console.error('wind route error:', err)

    // Graceful degradation: try direct fetch if DB is unavailable
    try {
      const data = await fetchFromOpenMeteo(bLat, bLon)
      return res.json(data)
    } catch (err2) {
      return res.status(500).json({ error: 'Could not fetch wind data.' })
    }
  }
})

module.exports = router
