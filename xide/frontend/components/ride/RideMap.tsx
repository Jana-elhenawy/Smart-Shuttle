'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet's default marker icons reference image paths that don't resolve
// correctly when bundled by Next.js. Standard fix: clear the broken default
// getIconUrl and point the icon options at the unpkg CDN copies instead.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CAIRO_CENTER: [number, number] = [30.0444, 31.2357]

interface RideMapMarker {
  position: [number, number]
  label?: string
}

interface RideMapProps {
  className?: string
  center?: [number, number]
  zoom?: number
  markers?: RideMapMarker[]
}

export default function RideMap({
  className,
  center = CAIRO_CENTER,
  zoom = 14,
  markers = [],
}: RideMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {markers.map((m, i) => (
        <Marker key={i} position={m.position}>
          {m.label && <Popup>{m.label}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  )
}