# 📸 Foto-Upload & 🗺️ GPS Setup Guide

## ✨ Neue Features

### 📸 Foto-Upload
- Fotos hochladen oder direkt aufnehmen (Mobile)
- Automatische Kompression (spart Speicherplatz)
- Vorschau beim Hinzufügen
- Lightbox zum Vergrößern
- Fotos werden in Supabase Storage gespeichert

### 🗺️ GPS-Integration
- GPS-Position automatisch erfassen
- Auf OpenStreetMap Karte anzeigen
- Koordinaten speichern
- Kostenlos (kein Google Maps API Key nötig!)

---

## 🚀 Supabase Storage Setup (für Fotos)

### Schritt 1: Storage Bucket prüfen

Das SQL Schema hat bereits den Bucket erstellt, aber wir müssen prüfen ob er public ist:

1. **Öffne Supabase Dashboard**
2. Gehe zu **Storage** (linke Sidebar)
3. Du solltest den Bucket **"fish-photos"** sehen
4. Wenn nicht vorhanden, erstelle ihn:
   - Klick "New bucket"
   - Name: `fish-photos`
   - **Public bucket**: ✅ AN
   - Klick "Create bucket"

### Schritt 2: Policies prüfen

1. Klick auf den **"fish-photos"** Bucket
2. Gehe zu **"Policies"** Tab
3. Du solltest 3 Policies sehen:
   - `Users can upload their own photos`
   - `Users can view their own photos`
   - `Users can delete their own photos`

Falls nicht vorhanden, SQL Schema nochmal ausführen!

### Schritt 3: Public Access testen

1. Gehe zurück zu Storage
2. Klick auf "fish-photos"
3. Upload ein Test-Bild
4. Klick auf das Bild → "Get public URL"
5. Öffne die URL im Browser
6. ✅ Bild sollte sichtbar sein

---

## 📦 Dependencies installieren

```bash
npm install
```

Das installiert:
- `leaflet` - OpenStreetMap Bibliothek
- `react-leaflet` - React Wrapper für Leaflet
- `@types/leaflet` - TypeScript Types

---

## 🧪 Features testen

### Foto-Upload testen:

1. **App starten:**
```bash
npm run dev
```

2. **Neuen Fang hinzufügen:**
   - Klick "+ Neuer Fang"
   - Klick auf Foto-Upload Bereich
   - Wähle ein Foto aus (oder aufnehmen auf Mobile)
   - Siehst du die Vorschau? ✅
   - Fülle Formular aus
   - Klick "Fang speichern"

3. **Foto in Liste anzeigen:**
   - Das Foto sollte oben in der Karte sichtbar sein
   - Klick auf Foto → Lightbox öffnet sich ✅

### GPS testen:

1. **Position erfassen:**
   - Klick "+ Neuer Fang"
   - Klick "🎯 Aktuelle Position erfassen"
   - Browser fragt nach Standort-Erlaubnis → **Erlauben**
   - Position wird angezeigt ✅
   - Optional: Gewässer-Name wird automatisch vorgeschlagen

2. **Karte anzeigen:**
   - Füge Fang mit GPS hinzu
   - In der Catch-Liste: Klick "📍 Karte anzeigen"
   - OpenStreetMap Karte erscheint ✅
   - Marker zeigt exakten Spot

---

## 📱 Mobile Features

### Foto direkt aufnehmen:

Auf Mobile:
- Formular öffnet automatisch Kamera
- `capture="environment"` nutzt Haupt-Kamera
- Foto direkt aufnehmen oder aus Galerie wählen

### GPS auf Mobile:

- GPS ist präziser als auf Desktop
- "Hochpräziser Modus" aktiviert
- Funktioniert auch ohne Internet (GPS-Koordinaten)
- Karte braucht Internet (OpenStreetMap)

---

## 🎨 Was kannst du anpassen?

### Foto-Kompression:

In `lib/utils/photoUpload.ts`:
```typescript
// Standard: 1920x1080, quality 0.8
const compressed = await compressImage(photo, 1920, 1080, 0.8)

// Für mehr Qualität:
const compressed = await compressImage(photo, 2560, 1440, 0.9)

// Für kleinere Files:
const compressed = await compressImage(photo, 1280, 720, 0.7)
```

### Karten-Zoom:

In `components/Map.tsx`:
```typescript
// Standard zoom: 13
<Map coordinates={coords} zoom={13} />

// Mehr Detail:
<Map coordinates={coords} zoom={15} />

// Weniger Detail:
<Map coordinates={coords} zoom={10} />
```

### GPS-Genauigkeit:

In `lib/utils/geolocation.ts`:
```typescript
{
  enableHighAccuracy: true, // Hochpräzise (braucht mehr Akku)
  timeout: 10000,           // 10 Sekunden Timeout
  maximumAge: 0,            // Keine gecachten Positionen
}
```

---

## 🐛 Troubleshooting

### ❌ Foto wird nicht hochgeladen

**Problem:** Upload schlägt fehl

**Lösungen:**
1. Prüfe Supabase Storage Bucket existiert
2. Prüfe Policies sind aktiviert
3. Prüfe ob Bucket public ist
4. Check Browser Console für Fehler

### ❌ "GPS-Position konnte nicht ermittelt werden"

**Problem:** Browser hat keinen Zugriff auf GPS

**Lösungen:**
1. Browser-Standort-Berechtigung erteilen
2. HTTPS erforderlich (nicht http)
3. Auf Mobile: GPS in System-Einstellungen aktiviert?
4. Im Browser: Site Settings → Location → Allow

### ❌ Karte wird nicht angezeigt

**Problem:** Leaflet CSS nicht geladen

**Lösungen:**
1. Prüfe `globals.css` hat Import: `@import 'leaflet/dist/leaflet.css';`
2. `npm install` ausgeführt?
3. Dev-Server neu starten
4. Browser Cache leeren

### ❌ "Cannot find module 'leaflet'"

**Problem:** Dependencies fehlen

**Lösung:**
```bash
npm install leaflet react-leaflet @types/leaflet
```

### ❌ Foto-Preview funktioniert nicht

**Problem:** FileReader Issue

**Lösung:**
- Nur auf Client-Side! (Datei hat `'use client'`)
- Browser unterstützt FileReader API
- Check Browser Console

---

## 💾 Speicher-Limits

### Supabase Free Tier:

- **Storage**: 1 GB kostenlos
- **Bandwidth**: 2 GB/Monat
- **Fotos**: Ca. 500-1000 Fotos (je nach Kompression)

### Tipps zum Sparen:

1. **Kompression nutzen** (macht das Tool automatisch)
2. **Große Fotos vermeiden** (max 1920x1080)
3. **Quality auf 0.8** lassen (guter Kompromiss)
4. **Alte Fänge löschen** wenn nicht mehr gebraucht

---

## 🗺️ OpenStreetMap Features

### Was ist möglich?

- ✅ Kostenlos (keine API Keys)
- ✅ Weltweit verfügbar
- ✅ Seen, Flüsse, Spots sichtbar
- ✅ Satelliten-View (andere Tile-Server)
- ✅ Custom Marker

### Alternative Tile-Server:

In `components/Map.tsx` kannst du andere Karten nutzen:

```typescript
// Standard OpenStreetMap
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

// Satellit (Esri)
url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

// Outdoor (Thunderforest - braucht API Key)
url="https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=YOUR_KEY"
```

---

## 📊 Nächste Features?

Jetzt wo Fotos & GPS funktionieren:

1. **Mehrere Fotos pro Fang** (Galerie)
2. **Foto-Editor** (Crop, Rotate, Filter)
3. **Heatmap aller Spots** (wo am meisten gefangen)
4. **Spot-Empfehlungen** (basierend auf Erfolg)
5. **Wetter-Daten** zur Fangzeit (API Integration)

Welches Feature willst du als nächstes? 🎣

---

## ✅ Checkliste

Nach dem Setup sollte alles funktionieren:

- [ ] Supabase Storage Bucket "fish-photos" existiert
- [ ] Bucket ist public
- [ ] Storage Policies sind aktiviert
- [ ] `npm install` ausgeführt
- [ ] App läuft ohne Fehler
- [ ] Foto-Upload funktioniert
- [ ] Fotos werden in Liste angezeigt
- [ ] Lightbox öffnet sich beim Klick
- [ ] GPS-Position kann erfasst werden
- [ ] Karte wird angezeigt
- [ ] Koordinaten werden gespeichert

Alles grün? Perfekt! 🎉

---

**Happy Fishing! 📸🗺️🎣**
