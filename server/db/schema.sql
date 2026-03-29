-- Windy database schema
-- Run via: psql $DATABASE_URL -f server/db/schema.sql

-- Cache Open-Meteo wind API responses by grid cell
-- Grid cells are rounded to 0.1° lat/lon (~7 miles) to maximize cache hits
CREATE TABLE IF NOT EXISTS wind_cache (
  id           SERIAL PRIMARY KEY,
  lat          NUMERIC(6,3) NOT NULL,  -- rounded to 0.1°
  lon          NUMERIC(6,3) NOT NULL,
  fetched_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ  NOT NULL,  -- refresh after 7 days
  payload      JSONB        NOT NULL,  -- raw Open-Meteo response
  UNIQUE (lat, lon)
);

-- User-submitted anemometer readings
CREATE TABLE IF NOT EXISTS anemometer_readings (
  id           SERIAL PRIMARY KEY,
  lat          NUMERIC(8,5) NOT NULL,
  lon          NUMERIC(8,5) NOT NULL,
  avg_mph      NUMERIC(5,2) NOT NULL,
  height_ft    INTEGER      NOT NULL DEFAULT 20,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  source       TEXT         NOT NULL DEFAULT 'user'  -- 'user' | 'partner'
);

-- Saved locations (future: user accounts)
CREATE TABLE IF NOT EXISTS saved_locations (
  id           SERIAL PRIMARY KEY,
  address      TEXT         NOT NULL,
  lat          NUMERIC(8,5) NOT NULL,
  lon          NUMERIC(8,5) NOT NULL,
  state        CHAR(2),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS wind_cache_lat_lon ON wind_cache (lat, lon);
CREATE INDEX IF NOT EXISTS wind_cache_expires  ON wind_cache (expires_at);
