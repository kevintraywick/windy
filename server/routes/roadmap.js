const express = require('express')
const fs      = require('fs')
const path    = require('path')

const router = express.Router()
const ROADMAP_PATH = path.join(__dirname, '..', '..', 'ROADMAP.md')

// ── Parser ───────────────────────────────────────────────────────────────────

function parseRoadmap(markdown) {
  const ladders = {}
  const lines = markdown.split('\n')

  const itemRe    = /^-\s+\[( |x)\]\s+(.+?)\s*$/
  const tagRe     = /<!--\s*(\w+)-v(\d+)\s*-->/
  const inProgRe  = /<!--\s*in-progress\s*-->/
  const deferRe   = /<!--\s*deferred\s*-->/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(itemRe)
    if (!match) continue

    const checked = match[1] === 'x'
    const rest    = match[2]
    const tag     = rest.match(tagRe)
    if (!tag) continue

    const ladder  = tag[1]
    const version = `v${tag[2]}`
    const isInProgress = inProgRe.test(rest)
    const isDeferred   = deferRe.test(rest)
    const title = rest
      .replace(tagRe, '')
      .replace(inProgRe, '')
      .replace(deferRe, '')
      .trim()

    let status
    if (isDeferred)        status = 'deferred'
    else if (checked)      status = 'built'
    else if (isInProgress) status = 'in_progress'
    else                   status = 'planned'

    if (!ladders[ladder]) ladders[ladder] = {}
    if (!ladders[ladder][version]) ladders[ladder][version] = []
    ladders[ladder][version].push({
      id: `${ladder}-${version}-${i}`,
      title,
      status,
    })
  }

  return ladders
}

// ── GET /api/roadmap ─────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  try {
    const raw = fs.readFileSync(ROADMAP_PATH, 'utf8')
    const ladders = parseRoadmap(raw)
    res.json(ladders)
  } catch (err) {
    console.error('Failed to read ROADMAP.md:', err.message)
    res.status(500).json({ error: 'Failed to read roadmap' })
  }
})

// ── POST /api/roadmap/add ────────────────────────────────────────────────────

router.post('/add', (req, res) => {
  const { ladder, version, text } = req.body
  if (!ladder || !version || !text) {
    return res.status(400).json({ error: 'Missing ladder, version, or text' })
  }

  try {
    let raw = fs.readFileSync(ROADMAP_PATH, 'utf8')
    const tag = `<!-- ${ladder}-v${version} -->`
    const newLine = `- [ ] ${text} ${tag}`

    // Find the last line with this ladder+version tag and insert after it
    const lines = raw.split('\n')
    let lastIdx = -1
    const searchTag = new RegExp(`<!--\\s*${ladder}-v${version}\\s*-->`)
    for (let i = 0; i < lines.length; i++) {
      if (searchTag.test(lines[i])) lastIdx = i
    }

    if (lastIdx >= 0) {
      lines.splice(lastIdx + 1, 0, newLine)
    } else {
      // No existing items for this version — append at end
      lines.push('', newLine)
    }

    fs.writeFileSync(ROADMAP_PATH, lines.join('\n'), 'utf8')
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to add roadmap item:', err.message)
    res.status(500).json({ error: 'Failed to add item' })
  }
})

// ── POST /api/roadmap/remove ─────────────────────────────────────────────────

router.post('/remove', (req, res) => {
  const { ladder, version, text } = req.body
  if (!ladder || !version || !text) {
    return res.status(400).json({ error: 'Missing ladder, version, or text' })
  }

  try {
    let raw = fs.readFileSync(ROADMAP_PATH, 'utf8')
    const lines = raw.split('\n')
    const tag = new RegExp(`<!--\\s*${ladder}-v${version}\\s*-->`)

    const filtered = lines.filter((line) => {
      if (!tag.test(line)) return true
      const cleaned = line
        .replace(/<!--.*?-->/g, '')
        .replace(/^-\s+\[[ x]\]\s+/, '')
        .trim()
      return cleaned !== text
    })

    fs.writeFileSync(ROADMAP_PATH, filtered.join('\n'), 'utf8')
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to remove roadmap item:', err.message)
    res.status(500).json({ error: 'Failed to remove item' })
  }
})

// ── POST /api/roadmap/toggle ─────────────────────────────────────────────────

router.post('/toggle', (req, res) => {
  const { ladder, version, text } = req.body
  if (!ladder || !version || !text) {
    return res.status(400).json({ error: 'Missing ladder, version, or text' })
  }

  try {
    let raw = fs.readFileSync(ROADMAP_PATH, 'utf8')
    const lines = raw.split('\n')
    const tag = new RegExp(`<!--\\s*${ladder}-v${version}\\s*-->`)

    let newStatus = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!tag.test(line)) continue

      const cleaned = line
        .replace(/<!--.*?-->/g, '')
        .replace(/^-\s+\[[ x]\]\s+/, '')
        .trim()
      if (cleaned !== text) continue

      // Toggle: planned → in_progress → built → planned
      if (/\[x\]/.test(line)) {
        // built → planned
        lines[i] = line.replace('[x]', '[ ]').replace(/\s*<!--\s*in-progress\s*-->/g, '')
        newStatus = 'planned'
      } else if (/<!--\s*in-progress\s*-->/.test(line)) {
        // in_progress → built
        lines[i] = line.replace('[ ]', '[x]').replace(/\s*<!--\s*in-progress\s*-->/g, '')
        newStatus = 'built'
      } else {
        // planned → in_progress
        const insertBefore = line.lastIndexOf('<!--')
        lines[i] = line.slice(0, insertBefore) + '<!-- in-progress --> ' + line.slice(insertBefore)
        newStatus = 'in_progress'
      }
      break
    }

    fs.writeFileSync(ROADMAP_PATH, lines.join('\n'), 'utf8')
    res.json({ ok: true, status: newStatus })
  } catch (err) {
    console.error('Failed to toggle roadmap item:', err.message)
    res.status(500).json({ error: 'Failed to toggle item' })
  }
})

module.exports = router
