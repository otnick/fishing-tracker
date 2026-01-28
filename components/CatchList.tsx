'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCatchStore, type Catch } from '@/lib/store'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Eye, Trash2, MapPin, Calendar, Ruler } from 'lucide-react'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), { ssr: false })

interface CatchListProps {
  catches?: Catch[]
}

export default function CatchList({ catches: propCatches }: CatchListProps = {}) {
  const storeCatches = useCatchStore((state) => state.catches)
  const catches = propCatches || storeCatches
  const deleteCatch = useCatchStore((state) => state.deleteCatch)
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null)

  if (catches.length === 0) {
    return (
      <div className="bg-ocean/30 backdrop-blur-sm rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🎣</div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Noch keine Fänge
        </h3>
        <p className="text-ocean-light">
          Füge deinen ersten Fang hinzu!
        </p>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    if (confirm('Möchtest du diesen Fang wirklich löschen?')) {
      await deleteCatch(id)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">
        Meine Fänge ({catches.length})
      </h2>

      {/* Grid Layout - Like Social Page */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catches.map((catchItem) => (
          <div
            key={catchItem.id}
            className="bg-ocean/30 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Photo - Like Social Page */}
            <Link href={`/catch/${catchItem.id}`}>
              <div className="relative h-48 bg-ocean-dark cursor-pointer group">
                {catchItem.photo ? (
                  <>
                    <Image
                      src={catchItem.photo}
                      alt={catchItem.species}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-6xl opacity-50">🎣</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Content */}
            <div className="p-4">
              <Link href={`/catch/${catchItem.id}`}>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-ocean-light transition-colors cursor-pointer">
                  {catchItem.species}
                </h3>
              </Link>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-ocean-dark/50 rounded p-2">
                  <div className="text-ocean-light text-xs flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    Länge
                  </div>
                  <div className="text-white font-semibold">{catchItem.length} cm</div>
                </div>

                {catchItem.weight && (
                  <div className="bg-ocean-dark/50 rounded p-2">
                    <div className="text-ocean-light text-xs">Gewicht</div>
                    <div className="text-white font-semibold">
                      {catchItem.weight > 1000
                        ? `${(catchItem.weight / 1000).toFixed(2)} kg`
                        : `${catchItem.weight} g`}
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-ocean-light mb-3">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(catchItem.date), 'dd.MM.yyyy HH:mm', { locale: de })}
                </span>
              </div>

              {/* Location */}
              {catchItem.location && (
                <div className="flex items-center gap-2 text-xs text-ocean-light mb-3">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{catchItem.location}</span>
                </div>
              )}

              {/* Actions - Mobile Optimized */}
              <div className="flex gap-2 pt-3 border-t border-ocean-light/20">
                <Link href={`/catch/${catchItem.id}`} className="flex-1">
                  <button className="w-full px-3 py-2 bg-ocean hover:bg-ocean-light text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                </Link>

                {catchItem.coordinates && (
                  <button
                    onClick={() => setExpandedMapId(
                      expandedMapId === catchItem.id ? null : catchItem.id
                    )}
                    className="px-3 py-2 bg-ocean-dark hover:bg-ocean text-white rounded-lg transition-colors"
                    aria-label="Karte anzeigen"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(catchItem.id)}
                  className="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                  aria-label="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Map */}
            {expandedMapId === catchItem.id && catchItem.coordinates && (
              <div className="border-t border-ocean-light/20 p-4">
                <div className="h-48 rounded-lg overflow-hidden">
                  <Map
                    coordinates={catchItem.coordinates}
                    location={catchItem.location}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
