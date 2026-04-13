import { useState, useEffect, useRef } from 'react'

const STATUS_ORDER = ['in_progress', 'planned', 'deferred', 'built']

function sortVersions(ladder) {
  return Object.keys(ladder).sort((a, b) => {
    return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)
  })
}

/* ── Glyph (status dot) ────────────────────────────────────────────────────── */

function Glyph({ status, onClick }) {
  const clickable = onClick && status !== 'deferred'
  const base = 'inline-block w-3 h-3 rounded-full mr-2.5 flex-shrink-0 transition-transform'

  if (status === 'built') {
    return (
      <span
        aria-label="built"
        onClick={onClick}
        className={`${base} bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.5)] ${clickable ? 'cursor-pointer' : ''}`}
      />
    )
  }
  if (status === 'in_progress') {
    return (
      <span
        aria-label="in progress"
        onClick={onClick}
        className={`${base} border border-teal-400 animate-pulse ${clickable ? 'cursor-pointer' : ''}`}
        style={{ background: 'linear-gradient(90deg, #2dd4bf 0 50%, transparent 50% 100%)' }}
      />
    )
  }
  if (status === 'deferred') {
    return (
      <span
        aria-label="deferred"
        className={`${base} border border-slate-600`}
      />
    )
  }
  return (
    <span
      aria-label="planned"
      onClick={onClick}
      className={`${base} border border-slate-400 ${clickable ? 'cursor-pointer' : ''}`}
    />
  )
}

/* ── Item row ──────────────────────────────────────────────────────────────── */

function ItemRow({ item, index, ladderKey, version, onRemove, onToggle }) {
  const dim = item.status === 'deferred'
  const built = item.status === 'built'
  return (
    <li className={`flex items-center py-1 text-sm ${dim ? 'text-slate-600 line-through' : built ? 'text-slate-300' : 'text-slate-400'}`}>
      <span className="w-6 flex-shrink-0 text-xs text-slate-500">{index}.</span>
      <Glyph
        status={item.status}
        onClick={item.status !== 'deferred' ? () => onToggle(ladderKey, version, item.title, item.id) : undefined}
      />
      <span className="flex-1">{item.title}</span>
      {item.status !== 'built' && item.status !== 'deferred' && (
        <button
          onClick={() => onRemove(ladderKey, version, item.title, item.id)}
          className="text-slate-600 hover:text-red-400 text-xs px-1.5 ml-2 flex-shrink-0 transition-colors"
          title="Remove item"
        >
          ✕
        </button>
      )}
    </li>
  )
}

/* ── Version card ──────────────────────────────────────────────────────────── */

function VersionCard({ version, items, ladderKey, startIndex, onRemove, onToggle }) {
  const [showCompleted, setShowCompleted] = useState(false)

  const active = []
  const completed = []
  items.forEach((item, i) => {
    const entry = { item, origIdx: i }
    if (item.status === 'built') completed.push(entry)
    else active.push(entry)
  })

  return (
    <div className="border border-slate-700 rounded mb-3 bg-slate-800/50">
      <div className={`p-4 ${completed.length > 0 ? 'pb-3' : ''}`}>
        <div className="text-lg text-teal-400 mb-2 lowercase tracking-wide">
          {version}
        </div>
        {active.length > 0 && (
          <ul className="list-none p-0 m-0">
            {active.map(({ item, origIdx }) => (
              <ItemRow
                key={item.id}
                item={item}
                index={startIndex + origIdx}
                ladderKey={ladderKey}
                version={version}
                onRemove={onRemove}
                onToggle={onToggle}
              />
            ))}
          </ul>
        )}
        {active.length === 0 && completed.length > 0 && (
          <div className="text-slate-600 italic text-sm">All done.</div>
        )}
      </div>
      {completed.length > 0 && (
        <div className="border-t border-slate-700 bg-slate-900/50 rounded-b">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full bg-transparent border-none px-4 py-1.5 cursor-pointer flex items-center justify-between text-slate-600 hover:text-teal-400 text-xs uppercase tracking-widest transition-colors"
          >
            <span>{completed.length} completed</span>
            <span className="text-[0.6rem]">{showCompleted ? '▲' : '▼'}</span>
          </button>
          {showCompleted && (
            <ul className="list-none px-4 pb-2.5 m-0">
              {completed.map(({ item, origIdx }) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={startIndex + origIdx}
                  ladderKey={ladderKey}
                  version={version}
                  onRemove={onRemove}
                  onToggle={onToggle}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Add input ─────────────────────────────────────────────────────────────── */

function AddInput({ ladderKey, placeholder, onAdd }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const timerRef = useRef(undefined)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    const match = trimmed.match(/^v(\d+)\s+(.+)/i)
    if (!match) {
      setError('Start with v{N}, e.g. "v2 Battery storage ROI"')
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setError(''), 3000)
      return
    }
    onAdd(ladderKey, parseInt(match[1], 10), match[2].trim())
    setValue('')
    setError('')
  }

  return (
    <div className="mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm outline-none focus:border-teal-400 transition-colors"
      />
      {error && (
        <div className="text-red-400 text-xs mt-1">{error}</div>
      )}
    </div>
  )
}

/* ── Ladder column ─────────────────────────────────────────────────────────── */

function LadderColumn({ title, ladder, ladderKey, onAdd, onRemove, onToggle }) {
  const versions = sortVersions(ladder)
  const cumulativeIndex = {}
  let runningIdx = 1
  for (const v of versions) {
    cumulativeIndex[v] = runningIdx
    runningIdx += (ladder[v]?.length ?? 0)
  }
  const firstVersion = versions[0] ?? 'v1'
  const placeholder = `${firstVersion} feature name…`

  return (
    <div className="flex-1 min-w-0">
      <div className="text-xl text-teal-300 mb-3">{title}</div>
      <AddInput ladderKey={ladderKey} placeholder={placeholder} onAdd={onAdd} />
      {versions.length === 0 ? (
        <div className="text-slate-600 italic">Nothing tagged yet.</div>
      ) : (
        versions.map((v) => (
          <VersionCard
            key={v}
            version={v}
            items={ladder[v]}
            ladderKey={ladderKey}
            startIndex={cumulativeIndex[v]}
            onRemove={onRemove}
            onToggle={onToggle}
          />
        ))
      )}
    </div>
  )
}

/* ── Legend ─────────────────────────────────────────────────────────────────── */

function Legend() {
  return (
    <div className="flex gap-5 mb-8 text-xs text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_4px_rgba(45,212,191,0.4)]" />
        Built
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full border border-teal-400 animate-pulse" style={{ background: 'linear-gradient(90deg, #2dd4bf 0 50%, transparent 50% 100%)' }} />
        In progress
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-400" />
        Planned
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-600" />
        Deferred
      </span>
    </div>
  )
}

/* ── Open-items board (right pane) ─────────────────────────────────────────── */

function collectOpenItems(ladders) {
  const items = []
  for (const [ladderKey, versions] of Object.entries(ladders)) {
    const sortedVersions = Object.keys(versions).sort(
      (a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10)
    )
    for (const version of sortedVersions) {
      for (const item of versions[version]) {
        if (item.status === 'planned' || item.status === 'in_progress') {
          items.push({ ...item, ladderKey, version })
        }
      }
    }
  }
  return items
}

function ItemColumn({ item, onToggle }) {
  const isActive = item.status === 'in_progress'
  return (
    <div className="flex-shrink-0 w-52 border border-slate-700 rounded-lg bg-slate-800/60 flex flex-col">
      <div className="px-3 py-2.5 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <Glyph
            status={item.status}
            onClick={() => onToggle(item.ladderKey, item.version, item.title, item.id)}
          />
          <span className={`text-xs uppercase tracking-widest ${isActive ? 'text-teal-400' : 'text-slate-500'}`}>
            {isActive ? 'In progress' : 'Planned'}
          </span>
        </div>
        <div className="text-sm text-slate-200 leading-snug">{item.title}</div>
      </div>
      <div className="px-3 py-2 text-xs text-slate-600 flex items-center justify-between">
        <span>{item.ladderKey} · {item.version}</span>
      </div>
    </div>
  )
}

function OpenItemsBoard({ ladders, onToggle }) {
  const openItems = collectOpenItems(ladders)

  if (openItems.length === 0) {
    return (
      <div className="text-slate-600 italic text-sm py-4">
        No open items — everything's either built or deferred.
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
      {openItems.map((item) => (
        <ItemColumn key={item.id} item={item} onToggle={onToggle} />
      ))}
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────────────────── */

export default function DoPage() {
  const [ladders, setLadders] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    fetch('/api/roadmap')
      .then((r) => { if (!r.ok) throw new Error('Failed to load roadmap'); return r.json() })
      .then(setLadders)
      .catch((err) => setLoadError(err.message))
  }, [])

  async function handleAdd(ladder, version, text) {
    const res = await fetch('/api/roadmap/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ladder, version, text }),
    })
    if (!res.ok) return

    const vKey = `v${version}`
    setLadders((prev) => {
      const updated = { ...prev }
      const target = { ...(updated[ladder] || {}) }
      const items = target[vKey] ? [...target[vKey]] : []
      items.push({ id: `${ladder}-${vKey}-${Date.now()}`, title: text, status: 'planned' })
      target[vKey] = items
      updated[ladder] = target
      return updated
    })
  }

  async function handleRemove(ladder, version, text, itemId) {
    const vNum = version.replace('v', '')
    const res = await fetch('/api/roadmap/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ladder, version: parseInt(vNum, 10), text }),
    })
    if (!res.ok) return

    setLadders((prev) => {
      const updated = { ...prev }
      const target = { ...(updated[ladder] || {}) }
      const items = (target[version] ?? []).filter((item) => item.id !== itemId)
      if (items.length > 0) target[version] = items
      else delete target[version]
      updated[ladder] = target
      return updated
    })
  }

  async function handleToggle(ladder, version, text, itemId) {
    const vNum = version.replace('v', '')
    const res = await fetch('/api/roadmap/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ladder, version: parseInt(vNum, 10), text }),
    })
    if (!res.ok) return
    const { status: newStatus } = await res.json()

    setLadders((prev) => {
      const updated = { ...prev }
      const target = { ...(updated[ladder] || {}) }
      const items = (target[version] ?? []).map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
      target[version] = items
      updated[ladder] = target
      return updated
    })
  }

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-10 text-red-400">
        Failed to load roadmap: {loadError}
      </div>
    )
  }

  if (!ladders) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-10 text-slate-500">
        Loading roadmap…
      </div>
    )
  }

  const ladderKeys = Object.keys(ladders)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0f4c81] via-[#1a6fad] to-[#0d9488] text-white px-6 py-3">
        <div className="max-w-[90rem] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">🌬️ Windy — Roadmap</h1>
            <p className="text-xs text-white/75">What we're building and where we're headed</p>
          </div>
          <a
            href="/"
            className="text-xs text-white/70 hover:text-white"
          >
            ← Back to Windy
          </a>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-5 py-10">
        <Legend />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left pane — roadmap ladders */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="flex flex-col gap-10">
              {ladderKeys.map((key) => (
                <LadderColumn
                  key={key}
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                  ladder={ladders[key]}
                  ladderKey={key}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* Right pane — open items board */}
          <div className="flex-1 min-w-0">
            <div className="text-xl text-teal-300 mb-3">Open</div>
            <OpenItemsBoard ladders={ladders} onToggle={handleToggle} />
          </div>
        </div>
      </main>
    </div>
  )
}
