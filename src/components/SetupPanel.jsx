import Results from './Results.jsx'
import { TURBINES } from '../constants.js'

export default function SetupPanel({ config, onChange, results, loading }) {
  const set = (key) => (e) => onChange((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
      {/* Setup card */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">⚙️ Your Setup</p>

        <label className="block text-xs font-semibold text-slate-500 mb-1">Turbine size</label>
        <select
          value={config.turbineKey}
          onChange={set('turbineKey')}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          {Object.entries(TURBINES).map(([key, t]) => (
            <option key={key} value={key}>
              {t.label} — {t.subtitle} · ${t.costLo.toLocaleString()}–{t.costHi.toLocaleString()}
            </option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-slate-500 mt-3 mb-1">Tower / mounting height</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={config.heightFt}
            onChange={set('heightFt')}
            min={5} max={60} step={1}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="text-xs text-slate-400">ft above ground</span>
        </div>

        <label className="block text-xs font-semibold text-slate-500 mt-3 mb-1">Monthly electric bill</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">$</span>
          <input
            type="number"
            value={config.monthlyBill}
            onChange={set('monthlyBill')}
            min={10} max={1000} step={5}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="text-xs text-slate-400">/month</span>
        </div>

        <label className="block text-xs font-semibold text-slate-500 mt-3 mb-1">
          Anemometer reading <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={config.anemMph}
            onChange={set('anemMph')}
            placeholder="uses historical data"
            min={0} max={100} step={0.1}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="text-xs text-slate-400">mph avg</span>
        </div>
      </div>

      {/* Results or placeholder */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin" />
          Fetching wind data…
        </div>
      )}
      {!loading && !results && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6 text-slate-400">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm">Enter your address above or click anywhere on the map to get your personalized wind estimate.</p>
        </div>
      )}
      {!loading && results && <Results results={results} />}
    </div>
  )
}
