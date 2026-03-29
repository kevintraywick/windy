const router = require('express').Router()
const pool   = require('../db')

router.get('/', async (req, res) => {
  let dbOk = false
  try {
    await pool.query('SELECT 1')
    dbOk = true
  } catch { /* db not connected in dev */ }

  res.json({
    status: 'ok',
    db:     dbOk ? 'connected' : 'unavailable',
    env:    process.env.NODE_ENV,
    ts:     new Date().toISOString(),
  })
})

module.exports = router
