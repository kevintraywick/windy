import { MONTHS, DIRS } from '../constants.js'

// ─── Wind rose (SVG) ──────────────────────────────────────────────────────────
function WindRose({ freqs }) {
  const cx = 70, cy = 70, maxR = 50
  const colors = ['#0f4c81','#1a6fad','#0d9488','#14b8a6','#16a34a','#4ade80','#ca8a04','#fbbf24']

  const toXY = (deg, r) => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy + r * Math.sin((deg * Math.PI) / 180),
  ]

  const petals = freqs.map((f, i) => {
    const angle = i * 45 - 90
    const r     = f * maxR
    const [lx, ly] = toXY(angle - 18, r * 0.35)
    const [tx, ty] = toXY(angle, r)
    const [rx, ry] = toXY(angle + 18, r * 0.35)
    return (
      <polygon
        key={i}
        points={`${cx},${cy} ${lx},${ly} ${tx},${ty} ${rx},${ry}`}
        fill={colors[i]}
        opacity={0.85}
      />
    )
  })

  const labels = DIRS.map((label, i) => {
    const angle = i * 45 - 90
    const [x, y] = toXY(angle, maxR + 12)
    return (
      <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fill="#475569">
        {label}
      </text>
    )
  })

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="block mx-auto">
      {[0.33, 0.66, 1].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={maxR * r} fill="none" stroke="#e2e8f0" strokeWidth={0.75} />
      ))}
      {petals}
      {labels}
    </svg>
  )
}

// ─── Monthly bar chart ────────────────────────────────────────────────────────
function MonthlyChart({ monthlyAvgs, scaleFactor }) {
  const vals  = monthlyAvgs.map((v) => v * scaleFactor)
  const maxV  = Math.max(...vals, 1)
  const colors = ['#dc2626','#d97706','#ca8a04','#16a34a','#0d9488']

  const colorFor = (v) => {
    if (v < 4)  return colors[0]
    if (v < 7)  return colors[1]
    if (v < 10) return colors[2]
    if (v < 13) return colors[3]
    return colors[4]
  }

  return (
    <div className="flex items-end gap-0.5 h-14">
      {vals.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            title={`${MONTHS[i]}: ${v.toFixed(1)} mph`}
            style={{ height: `${(v / maxV) * 52}px`, backgroundColor: colorFor(v) }}
            className="w-full rounded-t min-h-0.5 transition-all"
          />
          <span className="text-[8px] text-slate-400 mt-0.5">{MONTHS[i][0]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
      <div className="text-lg font-bold text-[#0f4c81]">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

// ─── Main Results component ───────────────────────────────────────────────────
export default function Results({ results }) {
  const {
    effectiveAvgMph, annualKwh, annualSavings, rateCents,
    pctOffset, paybackYears, twentyYrSavings, co2TonsAvoided,
    windClass, monthlyAvgs, windRose, scaleFactor, state,
  } = results

  const savingsBg =
    annualSavings < 50  ? 'from-red-600 to-red-700' :
    annualSavings < 200 ? 'from-amber-500 to-amber-600' :
                          'from-green-600 to-green-700'

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Wind summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">💨 Wind at Your Location</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-2xl font-extrabold text-[#0f4c81]">{effectiveAvgMph.toFixed(1)} mph</div>
            <div className="text-[10px] text-slate-400">avg at your tower height</div>
          </div>
          <span
            className="text-sm font-bold px-3 py-1 rounded-full border"
            style={{ color: windClass.color, borderColor: windClass.color, background: windClass.color + '15' }}
            title={windClass.tip}
          >
            {windClass.label}
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">Monthly avg (mph)</p>
        <MonthlyChart monthlyAvgs={monthlyAvgs} scaleFactor={scaleFactor} />
      </div>

      {/* Wind rose */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">🧭 Prevailing Direction</p>
        <WindRose freqs={windRose} />
        <p className="text-[10px] text-slate-400 text-center mt-1">Face your turbine into the most frequent direction.</p>
      </div>

      {/* Savings banner */}
      <div className={`bg-gradient-to-br ${savingsBg} text-white rounded-xl p-4 text-center`}>
        <div className="text-[10px] opacity-80 mb-1">Estimated annual savings</div>
        <div className="text-3xl font-extrabold">${Math.round(annualSavings).toLocaleString()}</div>
        <div className="text-[10px] opacity-75 mt-1">{state ? `${state} rate: ${rateCents.toFixed(1)}¢/kWh` : `Rate: ${rateCents.toFixed(1)}¢/kWh`}</div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2">
        <Stat value={Math.round(annualKwh).toLocaleString()} label="kWh / year produced" />
        <Stat value={`${Math.round(pctOffset)}%`} label="of your bill offset" />
        <Stat value={isFinite(paybackYears) ? paybackYears.toFixed(1) : '∞'} label="year payback" />
        <Stat value={rateCents.toFixed(1) + '¢'} label="state avg rate" />
      </div>

      {/* 20-year projection */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">📈 20-Year Projection</p>
        <div className="grid grid-cols-2 gap-2">
          <Stat value={`$${Math.round(twentyYrSavings).toLocaleString()}`} label="total savings (3%/yr escalation)" />
          <Stat value={`${co2TonsAvoided.toFixed(1)} t`} label="CO₂ avoided" />
        </div>
      </div>

      {/* Notes */}
      <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
        <strong className="text-slate-500">Assumptions:</strong> ERA5 wind data via Open-Meteo (last 12 months).
        Net metering assumed. Tower height corrected via ¹⁄₇ power law.
        Does not include installation, permits, or maintenance.
      </div>
    </div>
  )
}
