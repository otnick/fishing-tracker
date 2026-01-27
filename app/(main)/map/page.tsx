'use client'

import { useMemo, lazy, Suspense } from 'react'
import { useCatchStore } from '@/lib/store'

const SpotsMap = lazy(() => import('@/components/SpotsMap'))

export default function MapPage() {
  const catches = useCatchStore((state) => state.catches)

  const catchesWithCoordinates = useMemo(() => {
    return catches.filter(c => c.coordinates)
  }, [catches])

  const spotStats = useMemo(() => {
    const spots = new Map<string, {
      catches: number
      species: Set<string>
      location: string
      coordinates: { lat: number; lng: number }
    }>()

    catchesWithCoordinates.forEach(catchData => {
      if (!catchData.coordinates) return
      
      const key = `${catchData.coordinates.lat},${catchData.coordinates.lng}`
      
      if (!spots.has(key)) {
        spots.set(key, {
          catches: 0,
          species: new Set(),
          location: catchData.location || 'Unbekannt',
          coordinates: catchData.coordinates,
        })
      }

      const spot = spots.get(key)!
      spot.catches++
      spot.species.add(catchData.species)
    })

    return Array.from(spots.values()).sort((a, b) => b.catches - a.catches)
  }, [catchesWithCoordinates])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Karte</h1>
        <p className="text-ocean-light mt-1">
          {catchesWithCoordinates.length} Fänge mit GPS • {spotStats.length} verschiedene Spots
        </p>
      </div>

      {/* Map */}
      {catchesWithCoordinates.length > 0 ? (
        <div className="bg-ocean/30 backdrop-blur-sm rounded-xl overflow-hidden">
          <Suspense fallback={
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-ocean-light">Karte lädt...</div>
            </div>
          }>
            <SpotsMap catches={catchesWithCoordinates} />
          </Suspense>
        </div>
      ) : (
        <div className="bg-ocean/30 backdrop-blur-sm rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Noch keine GPS-Daten
          </h3>
          <p className="text-ocean-light">
            Erfasse GPS-Positionen bei deinen Fängen, um sie hier auf der Karte zu sehen.
          </p>
        </div>
      )}

      {/* Top Spots */}
      {spotStats.length > 0 && (
        <div className="bg-ocean/30 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Spots</h2>
          <div className="space-y-3">
            {spotStats.slice(0, 5).map((spot, index) => (
              <div
                key={`${spot.coordinates.lat},${spot.coordinates.lng}`}
                className="flex items-center gap-4 bg-ocean-dark/50 rounded-lg p-4"
              >
                <div className="text-2xl font-bold text-ocean-light">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    📍 {spot.location}
                  </div>
                  <div className="text-sm text-ocean-light">
                    {spot.catches} Fänge • {spot.species.size} Arten
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
