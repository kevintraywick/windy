import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Leaflet marker icon fix for Vite/Webpack bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ESRI_SAT_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_SAT_ATTR =
  'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, AeroGRID, IGN, GIS Community'

export default function Map({ location, results, onMapClick, phase }) {
  // ── Main (wind) map refs ──
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markerRef    = useRef(null)
  const circleRef    = useRef(null)

  // ── Satellite map refs ──
  const satContainerRef = useRef(null)
  const satMapRef       = useRef(null)
  const satMarkerRef    = useRef(null)

  // ── Initialize main map once ──
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    mapRef.current = L.map(containerRef.current, { zoomControl: true })
      .setView([39.5, -98.35], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    setTimeout(() => mapRef.current?.invalidateSize(), 0)

    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng
      onMapClick(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    })
  }, [onMapClick])

  // ── Initialize satellite map when phase becomes 'address' ──
  useEffect(() => {
    if (phase !== 'address') return
    if (satMapRef.current) return           // already created
    if (!satContainerRef.current) return

    satMapRef.current = L.map(satContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([39.5, -98.35], 4)

    L.tileLayer(ESRI_SAT_URL, {
      attribution: ESRI_SAT_ATTR,
      maxZoom: 19,
    }).addTo(satMapRef.current)

    setTimeout(() => satMapRef.current?.invalidateSize(), 0)
  }, [phase])

  // ── Resize both maps when split changes ──
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize()
      satMapRef.current?.invalidateSize()
    }, 50)
    return () => clearTimeout(timer)
  }, [phase])

  // ── Update main-map marker when location / results change ──
  useEffect(() => {
    if (!mapRef.current || !location) return

    if (markerRef.current) mapRef.current.removeLayer(markerRef.current)
    if (circleRef.current) mapRef.current.removeLayer(circleRef.current)

    const color = results?.windClass?.color ?? '#1a6fad'
    const mph   = results?.effectiveAvgMph

    markerRef.current = L.circleMarker([location.lat, location.lon], {
      radius: 10, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9,
    })
      .addTo(mapRef.current)
      .bindPopup(mph ? `<b>${mph.toFixed(1)} mph</b> avg wind` : location.displayName)
      .openPopup()

    circleRef.current = L.circle([location.lat, location.lon], {
      radius: 8000, fillColor: color, color, weight: 1, opacity: 0.35, fillOpacity: 0.1,
    }).addTo(mapRef.current)

    mapRef.current.setView([location.lat, location.lon], 10)
  }, [location, results])

  // ── Update satellite map when location changes (address phase) ──
  useEffect(() => {
    if (phase !== 'address' || !satMapRef.current || !location) return

    if (satMarkerRef.current) satMapRef.current.removeLayer(satMarkerRef.current)

    satMarkerRef.current = L.marker([location.lat, location.lon])
      .addTo(satMapRef.current)
      .bindPopup(`<b>Your property</b><br/>${location.displayName?.split(',').slice(0, 2).join(',')}`)
      .openPopup()

    satMapRef.current.setView([location.lat, location.lon], 18)
  }, [location, phase])

  const showSat = phase === 'address'

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col">
      {/* Wind map — full height when no satellite, half when split */}
      <div
        ref={containerRef}
        className="w-full"
        style={{
          height: showSat ? '50%' : '100%',
          cursor: 'crosshair',
          transition: 'height 0.3s ease',
        }}
      />

      {/* Satellite pane — slides in from below */}
      {showSat && (
        <div className="w-full relative" style={{ height: '50%' }}>
          {/* Label overlay */}
          <div className="absolute top-2 left-2 z-[1000] bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-md pointer-events-none backdrop-blur-sm">
            Satellite View — Your Property
          </div>
          <div
            ref={satContainerRef}
            className="w-full h-full"
            style={{ cursor: 'crosshair' }}
          />
        </div>
      )}
    </div>
  )
}
