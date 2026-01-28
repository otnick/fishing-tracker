'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCatchStore } from '@/lib/store'
import { uploadPhoto, compressImage } from '@/lib/utils/photoUpload'
import { getCurrentPosition, getLocationName, formatCoordinates } from '@/lib/utils/geolocation'
import { getCurrentWeather } from '@/lib/utils/weather'
import type { Coordinates } from '@/lib/utils/geolocation'

interface CatchFormProps {
  onSuccess: () => void
}

const FISH_SPECIES = [
  'Hecht',
  'Zander',
  'Barsch',
  'Karpfen',
  'Forelle',
  'Aal',
  'Wels',
  'Döbel',
  'Rotauge',
  'Brassen',
  'Schleie',
  'Andere',
]

export default function CatchForm({ onSuccess }: CatchFormProps) {
  const addCatch = useCatchStore((state) => state.addCatch)
  const user = useCatchStore((state) => state.user)
  
  const [formData, setFormData] = useState({
    species: '',
    length: '',
    weight: '',
    location: '',
    bait: '',
    notes: '',
    date: new Date().toISOString().slice(0, 16),
  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [weather, setWeather] = useState<any>(null)
  const [fetchingWeather, setFetchingWeather] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getLocation = async () => {
    setGettingLocation(true)
    try {
      const position = await getCurrentPosition()
      setCoordinates(position)
      
      if (position) {
        const locationName = await getLocationName(position)
        setFormData(prev => ({ ...prev, location: locationName || '' }))

        const weatherData = await getCurrentWeather(position)
        setWeather(weatherData)
      }
    } catch (error) {
      console.error('Location error:', error)
      alert('Konnte Standort nicht ermitteln')
    } finally {
      setGettingLocation(false)
    }
  }

  const getWeatherData = async () => {
    if (!coordinates) {
      alert('Bitte zuerst Standort aktivieren')
      return
    }

    setFetchingWeather(true)
    try {
      const weatherData = await getCurrentWeather(coordinates)
      setWeather(weatherData)
    } catch (error) {
      console.error('Weather error:', error)
      alert('Konnte Wetter nicht laden')
    } finally {
      setFetchingWeather(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Bitte melde dich an')
      return
    }

    if (!formData.species || !formData.length) {
      alert('Bitte Fischart und Länge angeben')
      return
    }

    setUploading(true)

    try {
      let photoUrl: string | undefined = undefined

      if (photo) {
        const compressed = await compressImage(photo)
        const url = await uploadPhoto(compressed, user.id)
        if (url) {
          photoUrl = url
        }
      }

      const catchData = {
        species: formData.species,
        length: parseInt(formData.length),
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        location: formData.location || undefined,
        bait: formData.bait || undefined,
        notes: formData.notes || undefined,
        date: new Date(formData.date).toISOString(),
        photo: photoUrl,
        coordinates: coordinates || undefined,
        weather: weather || undefined,
      }

      await addCatch(catchData)

      setFormData({
        species: '',
        length: '',
        weight: '',
        location: '',
        bait: '',
        notes: '',
        date: new Date().toISOString().slice(0, 16),
      })
      setPhoto(null)
      setPhotoPreview(null)
      setCoordinates(null)
      setWeather(null)

      onSuccess()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Fehler beim Speichern')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <label className="block text-ocean-light text-sm mb-2">
          Foto
        </label>
        {photoPreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
            <Image
              src={photoPreview}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPhoto(null)
                setPhotoPreview(null)
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
            >
              Entfernen
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-full h-48 border-2 border-dashed border-ocean-light/30 rounded-lg cursor-pointer hover:border-ocean-light transition-colors">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-ocean-light">Foto hochladen</div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Species */}
      <div>
        <label className="block text-ocean-light text-sm mb-2">
          Fischart *
        </label>
        <select
          value={formData.species}
          onChange={(e) => setFormData({ ...formData, species: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none"
          required
        >
          <option value="">Wähle eine Art</option>
          {FISH_SPECIES.map((species) => (
            <option key={species} value={species}>
              {species}
            </option>
          ))}
        </select>
      </div>

      {/* Length & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-ocean-light text-sm mb-2">
            Länge (cm) *
          </label>
          <input
            type="number"
            value={formData.length}
            onChange={(e) => setFormData({ ...formData, length: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-ocean-light text-sm mb-2">
            Gewicht (g)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none"
            min="1"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div>
        <label className="block text-ocean-light text-sm mb-2">
          Datum & Uhrzeit
        </label>
        <input
          type="datetime-local"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-ocean-light text-sm mb-2">
          Standort
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="flex-1 px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none"
            placeholder="z.B. Müggelsee, Berlin"
          />
          <button
            type="button"
            onClick={getLocation}
            disabled={gettingLocation}
            className="px-4 py-2 bg-ocean hover:bg-ocean-light text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {gettingLocation ? '...' : '📍'}
          </button>
        </div>
        {coordinates && (
          <p className="text-xs text-ocean-light mt-1">
            📍 {formatCoordinates(coordinates)}
          </p>
        )}
      </div>

      {/* Weather */}
      {coordinates && (
        <div>
          <button
            type="button"
            onClick={getWeatherData}
            disabled={fetchingWeather}
            className="text-ocean-light hover:text-white text-sm transition-colors"
          >
            {weather ? '☁️ Wetter aktualisieren' : '☁️ Wetter laden'}
          </button>
          {weather && (
            <div className="mt-2 p-3 bg-ocean-dark/50 rounded-lg text-sm">
              <div className="text-white">
                🌡️ {weather.temperature}°C • 💨 {weather.windSpeed} km/h
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bait */}
      <div>
        <label className="block text-ocean-light text-sm mb-2">
          Köder
        </label>
        <input
          type="text"
          value={formData.bait}
          onChange={(e) => setFormData({ ...formData, bait: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none"
          placeholder="z.B. Wobbler, Gummifisch, Wurm"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-ocean-light text-sm mb-2">
          Notizen
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-ocean-dark text-white border border-ocean-light/30 focus:border-ocean-light focus:outline-none resize-none"
          placeholder="Zusätzliche Infos..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-gradient-to-r from-ocean-light to-ocean hover:from-ocean hover:to-ocean-dark text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
      >
        {uploading ? 'Speichern...' : 'Fang speichern'}
      </button>
    </form>
  )
}
