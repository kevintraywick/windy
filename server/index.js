require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const path    = require('path')

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/health',   require('./routes/health'))
app.use('/api/wind',     require('./routes/wind'))
app.use('/api/roadmap',  require('./routes/roadmap'))

// ── Static files (production) ─────────────────────────────────────────────────
// In dev, Vite serves the frontend. In prod, Express serves the built dist/.
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))

  // SPA fallback — send index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Windy server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
