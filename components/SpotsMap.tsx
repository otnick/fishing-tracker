'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import type { Catch } from '@/lib/store'

// Fix default marker icon issue in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface SpotsMapProps {
  catches: Catch[]
}

function FitBounds({ catches }: { catches: Catch[] }) {
  const map = useMap()
  
  useMemo(() => {
    if (catches.length > 0) {
      const bounds = L.latLngBounds(
        catches
          .filter(c => c.coordinates)
          .map(c => [c.coordinates!.lat, c.coordinates!.lng] as [number, number])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [catches, map])
  
  return null
}

export default function SpotsMap({ catches }: SpotsMapProps) {
  // Group catches by location
  const groupedSpots = useMemo(() => {
    const spots = new Map<string, Catch[]>()

    catches.forEach(c => {
      if (!c.coordinates) return
      const key = `${c.coordinates.lat.toFixed(5)},${c.coordinates.lng.toFixed(5)}`
      if (!spots.has(key)) {
        spots.set(key, [])
      }
      spots.get(key)!.push(c)
    })

    return Array.from(spots.entries()).map(([key, catchList]) => ({
      coordinates: catchList[0].coordinates!,
      catches: catchList,
      location: catchList[0].location || 'Unbekannt',
    }))
  }, [catches])

  const center = useMemo(() => {
    if (catches.length === 0) return [52.52, 13.405] as [number, number]
    const firstCatch = catches[0]
    return [firstCatch.coordinates!.lat, firstCatch.coordinates!.lng] as [number, number]
  }, [catches])

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {groupedSpots.map((spot, index) => (
          <Marker
            key={index}
            position={[spot.coordinates.lat, spot.coordinates.lng]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="font-bold text-lg mb-2">{spot.location}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {spot.catches.length} Fänge hier
                </div>
                <div className="space-y-1">
                  {spot.catches.slice(0, 3).map((c, i) => (
                    <div key={i} className="text-sm">
                      • {c.species} ({c.length} cm)
                    </div>
                  ))}
                  {spot.catches.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ...und {spot.catches.length - 3} weitere
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds catches={catches} />
      </MapContainer>
    </div>
  )
}
