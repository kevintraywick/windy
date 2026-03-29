import { useEffect, useRef } from 'react'
import L from 'leaflet'

// Leaflet marker icon fix for Vite/Webpack bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function Map({ location, results, onMapClick }) {
  const containerRef    = useRef(null)
  const mapRef          = useRef(null)
  const markerRef       = useRef(null)
  const circleRef       = useRef(null)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    mapRef.current = L.map(containerRef.current, { zoomControl: true }).setView([39.5, -98.35], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    // Force Leaflet to re-measure container after flex layout settles
    setTimeout(() => mapRef.current?.invalidateSize(), 0)

    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng
      onMapClick(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    })
  }, [onMapClick])

  // Update marker when location / results change
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

  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0 h-full"
      style={{ cursor: 'crosshair' }}
    />
  )
}
