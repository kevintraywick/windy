import { useState, useCallback } from 'react'
import Map from './components/Map.jsx'
import SetupPanel from './components/SetupPanel.jsx'
import { geocode, fetchWindData } from './utils/api.js'
import { calculateSavings } from './utils/windCalc.js'
import { TURBINES } from './constants.js'

const DEFAULT_CONFIG = {
  turbineKey: 'small',
  heightFt: 20,
  monthlyBill: 150,
  anemMph: '',
}

export default function App() {
  const [address, setAddress]   = useState('')
  const [location, setLocation] = useState(null)   // { lat, lon, state, displayName }
  const [results, setResults]   = useState(null)   // output of calculateSavings()
  const [config, setConfig]     = useState(DEFAULT_CONFIG)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const analyze = useCallback(async (queryOverride) => {
    const query = queryOverride ?? address
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const loc = await geocode(query)
      setLocation(loc)

      const windData = await fetchWindData(loc.lat, loc.lon)

      const turbine = TURBINES[config.turbineKey]
      const res = calculateSavings(windData, {
        turbine,
        heightFt:    config.heightFt,
        monthlyBill: config.monthlyBill,
        anemMph:     parseFloat(config.anemMph) || 0,
      }, loc.state)

      setResults(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [address, config])

  const handleMapClick = useCallback((latLonStr) => {
    setAddress(latLonStr)
    analyze(latLonStr)
  }, [analyze])

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0f4c81] via-[#1a6fad] to-[#0d9488] text-white px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">🌬️ Windy</h1>
            <p className="text-xs text-white/75">Is wind power right for your home?</p>
          </div>
          <a
            href="https://www.nrel.gov/wind/small-wind.html"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-white/70 hover:text-white hidden sm:block"
          >
            NREL Wind Resource →
          </a>
        </div>
      </header>

      {/* Search bar */}
      <div className="bg-[#0f4c81] px-6 pb-4 pt-2 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze()}
            placeholder="Enter your address or ZIP code…"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-slate-800 shadow-md outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={() => analyze()}
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-md transition-colors whitespace-nowrap"
          >
            {loading ? 'Analyzing…' : 'Analyze →'}
          </button>
        </div>
        {error && (
          <p className="text-red-300 text-xs text-center mt-2">{error}</p>
        )}
      </div>

      {/* Main content: map + panel */}
      <div className="flex flex-1 overflow-hidden">
        <Map
          location={location}
          results={results}
          onMapClick={handleMapClick}
        />
        <SetupPanel
          config={config}
          onChange={setConfig}
          results={results}
          loading={loading}
        />
      </div>
    </div>
  )
}
