# 🌤️👥 Social Features + Wetter Integration - Guide

## ✨ Was ist NEU?

### 🌤️ **Wetter-Integration (Automatisch!)**
- ✅ Wetter wird automatisch erfasst beim GPS-Capture
- ✅ API: Open-Meteo (kostenlos, kein API Key!)
- ✅ Daten: Temperatur, Wind, Luftdruck, Bedingungen
- ✅ Anzeige in Fang-Cards mit Icon & Temperatur
- ✅ Später: Statistik "Bei welchem Wetter fängst du am besten?"

### 👥 **Social Features**
- ✅ **Activity Feed** - Sieh was andere fangen
- ✅ **Öffentliche Fänge** - Teile deine Erfolge
- ✅ **Leaderboards** - Wöchentlich, Monatlich, All-Time
- ✅ **Likes** - Gefällt mir auf Fänge
- ✅ **Comments** (Vorbereitet)
- ✅ **4 Kategorien** - Meiste Fänge, Gewicht, Größe, Arten

---

## 🚀 Installation & Setup

### 1. **Dependencies installieren**

```bash
npm install
```

Keine neuen Packages - Wetter nutzt fetch() API!

### 2. **Datenbank Migration ausführen**

**WICHTIG:** Neue Tabellen & Spalten müssen angelegt werden!

1. **Öffne Supabase SQL Editor**
2. **Kopiere kompletten Inhalt** von `supabase/social_migration.sql`
3. **Führe aus** (Run button)
4. ✅ Success: "Completed successfully"

**Was wird angelegt:**
- Spalten: `weather`, `is_public`, `likes_count`, `comments_count`
- Tabellen: `profiles`, `friendships`, `catch_likes`, `catch_comments`, `activities`
- Policies: RLS für alle neuen Tabellen
- Triggers: Auto-Update von likes/comments count

### 3. **App starten**

```bash
npm run dev
```

### 4. **Testen**

**Wetter:**
1. Neuer Fang → GPS erfassen
2. Wetter wird automatisch geladen ✅
3. Formular zeigt Wetter an (falls vorhanden)
4. Nach dem Speichern: Wetter in Fang-Card sichtbar

**Social:**
1. Gehe zu Social-Seite
2. Du siehst Feed (noch leer)
3. Mache einen Fang öffentlich (später)
4. Erscheint im Feed!

---

## 🌤️ Wetter-Feature erklärt

### Wie funktioniert's?

**Automatisch beim GPS:**
```
1. User klickt "GPS erfassen"
2. GPS-Position wird ermittelt
3. Automatisch: Wetter-API Call zu Open-Meteo
4. Wetter-Daten werden gespeichert (JSON)
5. Beim Speichern: In Datenbank als JSONB
```

### Was wird gespeichert?

```json
{
  "temperature": 18,
  "windSpeed": 12,
  "windDirection": 180,
  "pressure": 1013,
  "humidity": 65,
  "description": "Bewölkt",
  "icon": "☁️"
}
```

### Wo wird's angezeigt?

- **Fang-Card:** Icon + Temperatur (z.B. "☁️ 18°C")
- **Detail-View:** Vollständige Wetter-Info
- **Später in Stats:** "Beste Wetter-Bedingungen"

### API-Limits

**Open-Meteo:**
- ✅ **Kostenlos** - kein API Key nötig!
- ✅ **10.000 Requests/Tag** - mehr als genug
- ✅ **Weltweit** - funktioniert überall
- ✅ **Historische Daten** - bis 7 Tage zurück

---

## 👥 Social Features erklärt

### 1. **Leaderboard** (`/leaderboard`)

**Was du siehst:**
- Filter: Zeitraum (Woche, Monat, Alle Zeit)
- Filter: Kategorie (Fänge, Gewicht, Größe, Arten)
- Dein Rang (highlighted)
- Top 100 Angler (Tabelle)

**Kategorien:**
- **Meiste Fänge** - Wer am meisten gefangen hat
- **Gesamt-Gewicht** - Wer am schwersten gefangen hat
- **Größter Fisch** - Wer den größten Fisch hat
- **Meiste Arten** - Wer am vielfältigsten ist

**Medaillen:**
- 🥇 Platz 1
- 🥈 Platz 2  
- 🥉 Platz 3
- #4-100

### 2. **Social Feed** (`/social`)

**Was du siehst:**
- Activity Feed mit öffentlichen Fängen
- Fotos, Art, Größe, Datum
- Likes & Comments (Buttons)
- "Mehr laden" für ältere Posts

**Interaktionen:**
- ❤️ Like geben
- 💬 Kommentieren (kommt bald)

### 3. **Öffentliche Fänge**

**Wie mache ich Fänge öffentlich?**

Aktuell: Beim Hinzufügen ist `is_public` auf `false`

**Später implementiert:**
- Toggle in Fang-Details
- "Öffentlich teilen" Button
- Oder direkt beim Erstellen auswählbar

---

## 🗄️ Datenbank-Schema (Neu)

### Neue Spalten in `catches`:

```sql
weather JSONB               -- Wetter-Daten als JSON
is_public BOOLEAN          -- Öffentlich sichtbar?
likes_count INTEGER        -- Anzahl Likes (auto-update)
comments_count INTEGER     -- Anzahl Comments (auto-update)
```

### Neue Tabellen:

**`profiles`**
- User-Profile (Username, Bio, Avatar)

**`friendships`**
- Freundschafts-Anfragen & Status

**`catch_likes`**
- Likes auf Fänge (User ↔ Catch)

**`catch_comments`**
- Kommentare auf Fänge

**`activities`**
- Activity Feed Einträge

---

## 🎯 Typischer Workflow

### Fang mit Wetter hinzufügen:

1. **Dashboard** → "+ Neuer Fang"
2. **Foto aufnehmen** 📸
3. **GPS erfassen** 📍
   - Automatisch: Wetter wird geladen!
   - Du siehst: "☁️ 18°C, Bewölkt" (oder ähnlich)
4. **Formular ausfüllen**
5. **Speichern**
6. **In Fang-Liste:** Wetter wird angezeigt ✅

### Leaderboard checken:

1. **Gehe zu Bestenliste**
2. **Filter setzen:** z.B. "Dieser Monat" + "Meiste Fänge"
3. **Sieh dein Rang** (highlighted wenn du in Top 100)
4. **Compare** mit anderen Anglern

### Social Feed browsen:

1. **Gehe zu Social**
2. **Scroll durch Feed**
3. **Like geben** auf coole Fänge
4. **Inspiration holen!**

---

## 📊 Zukünftige Statistiken

### Wetter-Analysen (kommt bald):

**"Beste Wetter-Bedingungen"**
- Bei welcher Temperatur fängst du am meisten?
- Bei welchem Wind?
- Bewölkt vs. Sonnig?
- Luftdruck-Einfluss?

**Charts:**
- Fänge pro Temperatur-Range
- Fänge pro Wetter-Typ
- Wind-Speed vs. Erfolg

---

## 💡 Pro-Tipps

### Wetter:
- **GPS erfassen** ist Pflicht für Wetter!
- Wetter wird zum **aktuellen Zeitpunkt** erfasst
- Historische Fänge: Kein Wetter (kann nicht nachträglich)
- **Open-Meteo** ist sehr genau (nutzt NOAA Daten)

### Social:
- Mache **beste Fänge** öffentlich für Leaderboard
- **Likes geben** um Community zu supporten
- **Vergleiche dich** im Leaderboard
- **Filter nutzen** um verschiedene Rankings zu sehen

### Privacy:
- **Standardmäßig privat** - nur du siehst deine Fänge
- **Opt-In für Social** - du entscheidest was geteilt wird
- **GPS-Daten** werden nicht in Social angezeigt
- **Nur Statistiken** sind im Leaderboard

---

## 🔐 Privacy & Sicherheit

### Was ist öffentlich?

**Wenn Fang public (`is_public = true`):**
- ✅ Art, Größe, Gewicht
- ✅ Foto (falls vorhanden)
- ✅ Datum
- ✅ Wetter (falls vorhanden)
- ❌ GPS-Koordinaten (NICHT öffentlich!)
- ❌ Gewässer-Name (NICHT öffentlich!)

### RLS Policies:

- **Catches:** Nur eigene ODER öffentliche
- **Likes:** Jeder kann Likes sehen
- **Comments:** Nur auf öffentliche Catches
- **Activities:** Nur von Freunden & Öffentliche

---

## 🐛 Troubleshooting

### ❌ Wetter wird nicht geladen

**Problem:** API Call schlägt fehl

**Lösungen:**
1. Prüfe Internet-Verbindung
2. GPS muss erfasst sein (Wetter braucht Koordinaten)
3. Check Browser Console für Fehler
4. Open-Meteo API down? (sehr selten)

### ❌ Leaderboard ist leer

**Problem:** Keine öffentlichen Fänge vorhanden

**Lösung:**
- Mache Fänge öffentlich (Feature kommt bald!)
- Oder: Migration noch nicht ausgeführt?

### ❌ "relation does not exist"

**Problem:** Migration nicht ausgeführt

**Lösung:**
1. Öffne Supabase SQL Editor
2. Führe `social_migration.sql` aus
3. App neu laden

### ❌ Likes funktionieren nicht

**Problem:** RLS Policies fehlen

**Lösung:**
- Migration nochmal ausführen
- Prüfe in Supabase → Tables → catch_likes → Policies

---

## 📈 Performance

### Was wir optimiert haben:

✅ **Wetter-Caching** - Einmal pro Fang
✅ **Leaderboard-Query** - Optimiert für 1000+ Fänge
✅ **Feed-Pagination** - Nur 50 Posts auf einmal
✅ **Indexes** - Auf allen wichtigen Feldern
✅ **Triggers** - Auto-Update von Counts (kein Extra-Query)

### Bundle Impact:

- Wetter: **0 KB** (nutzt fetch, kein Package)
- Social: **0 KB** (nutzt Supabase, schon vorhanden)
- Gesamt: **Keine** neuen Dependencies!

---

## 🎊 Was als nächstes?

Du hast jetzt:
- ✅ Wetter-Tracking
- ✅ Social Feed
- ✅ Leaderboards (4 Kategorien)
- ✅ Likes-System
- ✅ Privacy-Features

### Nächste mögliche Features:

1. **Toggle für Öffentlich/Privat** (UI Button)
2. **Kommentar-System** (vollständig)
3. **Freunde hinzufügen** (per Email)
4. **Notifications** (neue Likes/Comments)
5. **Wetter-Statistiken** (beste Bedingungen)
6. **Share-Links** (einzelne Fänge teilen)
7. **Follow-System** (anderen Anglern folgen)

**Was willst du als nächstes?** 🎣

---

## ✅ Checkliste nach Update

Alles funktioniert wenn:

- [ ] `supabase/social_migration.sql` ausgeführt
- [ ] Tabellen angelegt (profiles, friendships, etc.)
- [ ] Spalten vorhanden (weather, is_public, etc.)
- [ ] App startet ohne Fehler
- [ ] Navigation zeigt Social & Leaderboard
- [ ] GPS erfassen → Wetter wird angezeigt
- [ ] Leaderboard zeigt Daten
- [ ] Social Feed funktioniert
- [ ] Likes funktionieren

Alles grün? **Du bist ready!** 🎉

---

**Happy Fishing with Weather & Friends! 🌤️👥🎣**
