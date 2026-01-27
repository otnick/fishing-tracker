'use client'

import { useState, useEffect } from 'react'
import { useCatchStore } from '@/lib/store'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  notificationService, 
  getNotificationPreference, 
  setNotificationPreference 
} from '@/lib/utils/notifications'

export default function ProfilePage() {
  const { user, catches, signOut } = useCatchStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    setNotificationsEnabled(getNotificationPreference())
  }, [])

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Request permission
      const granted = await notificationService.requestPermission()
      if (granted) {
        setNotificationPreference(true)
        setNotificationsEnabled(true)
        // Send test notification
        await notificationService.send({
          title: '🎣 Benachrichtigungen aktiviert!',
          body: 'Du erhältst jetzt Updates zu Likes, Kommentaren und mehr.',
        })
      }
    } else {
      setNotificationPreference(false)
      setNotificationsEnabled(false)
    }
  }

  const handleExportJSON = () => {
    const data = JSON.stringify(catches, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fishbox-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const headers = ['Datum', 'Art', 'Länge (cm)', 'Gewicht (g)', 'Ort', 'Köder', 'Notizen']
    const rows = catches.map(c => [
      format(new Date(c.date), 'dd.MM.yyyy'),
      c.species,
      c.length,
      c.weight || '',
      c.location || '',
      c.bait || '',
      c.notes || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fishbox-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    totalCatches: catches.length,
    uniqueSpecies: new Set(catches.map(c => c.species)).size,
    withPhotos: catches.filter(c => c.photo).length,
    withGPS: catches.filter(c => c.coordinates).length,
    totalWeight: catches.reduce((sum, c) => sum + (c.weight || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Profil</h1>
        <p className="text-ocean-light mt-1">Verwalte dein Konto und deine Daten</p>
      </div>

      {/* User Info */}
      <div className="bg-ocean/30 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <div className="text-ocean-light text-sm">E-Mail</div>
            <div className="text-white font-semibold">{user?.email}</div>
          </div>
          <div>
            <div className="text-ocean-light text-sm">Mitglied seit</div>
            <div className="text-white font-semibold">
              {user?.created_at 
                ? format(new Date(user.created_at), 'dd. MMMM yyyy', { locale: de })
                : '-'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-ocean/30 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Deine Statistiken</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-ocean-light text-sm">Gesamt Fänge</div>
            <div className="text-2xl font-bold text-white">{stats.totalCatches}</div>
          </div>
          <div>
            <div className="text-ocean-light text-sm">Verschiedene Arten</div>
            <div className="text-2xl font-bold text-white">{stats.uniqueSpecies}</div>
          </div>
          <div>
            <div className="text-ocean-light text-sm">Mit Fotos</div>
            <div className="text-2xl font-bold text-white">{stats.withPhotos}</div>
          </div>
          <div>
            <div className="text-ocean-light text-sm">Mit GPS</div>
            <div className="text-2xl font-bold text-white">{stats.withGPS}</div>
          </div>
          <div>
            <div className="text-ocean-light text-sm">Gesamt Gewicht</div>
            <div className="text-2xl font-bold text-white">
              {(stats.totalWeight / 1000).toFixed(1)} kg
            </div>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-ocean/30 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Daten exportieren</h2>
        <p className="text-ocean-light text-sm mb-4">
          Exportiere deine Fänge als Backup oder zur Weiterverarbeitung
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExportJSON}
            className="flex-1 bg-ocean hover:bg-ocean-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📦 Als JSON exportieren
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 bg-ocean hover:bg-ocean-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📊 Als CSV exportieren
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-ocean/30 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Einstellungen</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-ocean-light/20">
            <div>
              <div className="text-white font-semibold">Benachrichtigungen</div>
              <div className="text-ocean-light text-sm">
                Erhalte Updates zu Likes, Kommentaren und Freunden
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-ocean-light/20">
            <div>
              <div className="text-white font-semibold">Dark Mode</div>
              <div className="text-ocean-light text-sm">Immer aktiv</div>
            </div>
            <div className="text-white">✓</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/30">
        <h2 className="text-xl font-bold text-red-400 mb-4">Account löschen</h2>
        <p className="text-red-300 text-sm mb-4">
          Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
        </p>
        <button
          onClick={() => alert('Account-Löschung: Bitte kontaktiere den Support')}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Account löschen
        </button>
      </div>

      {/* Logout */}
      <div className="text-center">
        <button
          onClick={signOut}
          className="bg-ocean-dark hover:bg-ocean text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Abmelden
        </button>
      </div>
    </div>
  )
}
