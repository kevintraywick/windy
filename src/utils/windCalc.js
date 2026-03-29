import { AIR_DENSITY, CO2_KG_PER_KWH, WIND_CLASSES, STATE_RATES, MONTHS, DIRS } from '../constants.js'

// ─── Unit conversions ─────────────────────────────────────────────────────────
export const mphToMs = (mph) => mph * 0.44704
export const ftToM   = (ft)  => ft  * 0.3048

// ─── Height correction (1/7 power law) ───────────────────────────────────────
// Scales wind speed from 10 m (measurement height) to tower height.
export function heightFactor(heightFt) {
  const hM = ftToM(heightFt)
  return Math.pow(hM / 10, 1 / 7)
}

// ─── Instantaneous turbine power (W) ─────────────────────────────────────────
// Uses Betz-limited cubic law, capped at rated power.
export function calcPower(vMph, turbine) {
  const vMs = mphToMs(vMph)
  if (vMs < turbine.vin || vMs > turbine.vout) return 0
  const area = Math.PI * turbine.r * turbine.r
  const raw  = 0.5 * AIR_DENSITY * area * turbine.Cp * Math.pow(vMs, 3)
  return Math.min(raw, turbine.Prated)
}

// ─── Wind class lookup ────────────────────────────────────────────────────────
export function getWindClass(mph) {
  return WIND_CLASSES.find((c) => mph >= c.min && mph < c.max) ?? WIND_CLASSES.at(-1)
}

// ─── Monthly average wind speeds ─────────────────────────────────────────────
export function buildMonthlyAvgs(times, speeds) {
  const sums = new Array(12).fill(0)
  const cnts = new Array(12).fill(0)
  for (let i = 0; i < times.length; i++) {
    if (speeds[i] == null) continue
    const mo = new Date(times[i]).getMonth()
    sums[mo] += speeds[i]
    cnts[mo]++
  }
  return sums.map((s, i) => (cnts[i] ? s / cnts[i] : 0))
}

// ─── Wind rose frequencies (8 compass directions) ────────────────────────────
export function buildWindRose(directions) {
  const bins = new Array(8).fill(0)
  for (const d of directions) {
    if (d == null) continue
    const idx = Math.round(d / 45) % 8
    bins[idx]++
  }
  const total = bins.reduce((a, b) => a + b, 0)
  return bins.map((b) => (total ? b / total : 0))
}

// ─── Full savings calculation ─────────────────────────────────────────────────
// Returns a results object ready for UI display.
export function calculateSavings(windApiData, config, state) {
  const { hourly } = windApiData
  const speeds     = hourly.wind_speed_10m
  const directions = hourly.wind_direction_10m
  const times      = hourly.time

  const { turbine, heightFt, monthlyBill, anemMph } = config

  // Height correction + optional anemometer override
  const hFactor      = heightFactor(heightFt)
  const validSpeeds  = speeds.filter((s) => s != null)
  const histAvg10m   = validSpeeds.reduce((a, b) => a + b, 0) / validSpeeds.length

  let scaleFactor = hFactor
  if (anemMph && anemMph > 0) {
    // Preserve wind distribution shape; shift mean to match anemometer reading
    scaleFactor = anemMph / histAvg10m
  }

  const effectiveAvgMph = histAvg10m * (anemMph > 0 ? scaleFactor : hFactor)

  // Hourly energy simulation → annual kWh
  let totalKwh = 0
  for (const s of speeds) {
    if (s == null) continue
    totalKwh += calcPower(s * scaleFactor, turbine) / 1000
  }
  const annualKwh = (totalKwh / validSpeeds.length) * 8760

  // Electricity rate
  const rateCents  = STATE_RATES[state] ?? 15.0
  const rateUsd    = rateCents / 100

  // Financial outputs
  const annualSavings  = annualKwh * rateUsd
  const annualUsage    = (monthlyBill / rateUsd) * 12
  const pctOffset      = Math.min(100, (annualKwh / annualUsage) * 100)
  const turbineCostMid = (turbine.costLo + turbine.costHi) / 2
  const paybackYears   = annualSavings > 0 ? turbineCostMid / annualSavings : Infinity

  // 20-year projection at 3% annual rate escalation
  let twentyYrSavings = 0
  for (let y = 0; y < 20; y++) {
    twentyYrSavings += annualKwh * rateUsd * Math.pow(1.03, y)
  }

  // CO2 avoided over 20 years
  const co2TonsAvoided = (annualKwh * 20 * CO2_KG_PER_KWH) / 1000

  return {
    effectiveAvgMph,
    annualKwh,
    annualSavings,
    rateCents,
    pctOffset,
    paybackYears,
    twentyYrSavings,
    co2TonsAvoided,
    windClass:    getWindClass(effectiveAvgMph),
    monthlyAvgs:  buildMonthlyAvgs(times, speeds),
    windRose:     buildWindRose(directions),
    scaleFactor,
    state,
  }
}
