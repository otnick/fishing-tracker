# 🔧 Database Update - Photo Column Fix

## ⚠️ Problem

Wenn du den Fehler siehst:
```
Could not find the 'photo' column of 'catches' in the schema cache
```

Das bedeutet: Die Datenbank-Tabelle muss aktualisiert werden!

---

## ✅ Lösung: Datenbank aktualisieren

### Option 1: Komplettes Schema neu ausführen (Empfohlen)

**⚠️ ACHTUNG:** Das löscht alle existierenden Fänge!

1. **Öffne Supabase SQL Editor**
   - Supabase Dashboard → SQL Editor

2. **Führe dieses SQL aus:**

```sql
-- Tabelle löschen (falls vorhanden)
DROP TABLE IF EXISTS public.catches CASCADE;

-- Jetzt führe das komplette Schema aus
-- Kopiere den KOMPLETTEN Inhalt von supabase/schema.sql und führe ihn aus
```

3. **Kopiere & führe aus:**
   - Öffne `supabase/schema.sql`
   - Kopiere den **kompletten Inhalt**
   - Paste in SQL Editor
   - Klick **"Run"**

4. **Prüfen:**
   - Gehe zu Table Editor → catches
   - Du solltest jetzt die Spalte `photo_url` sehen ✅

---

### Option 2: Nur Photo-Spalte hinzufügen (Behält Daten)

Wenn du schon Fänge hast und diese behalten willst:

```sql
-- Füge photo_url Spalte hinzu
ALTER TABLE public.catches 
ADD COLUMN IF NOT EXISTS photo_url TEXT;
```

---

## 🧪 Testen

Nach dem Update:

1. **App neu laden:** `npm run dev`
2. **Neuen Fang mit Foto hinzufügen**
3. **Sollte jetzt funktionieren!** ✅

---

## 🔍 Was wurde geändert?

### In der Datenbank:
- Spalte heißt: `photo_url` (URL zum Foto)

### Im Code:
- Frontend nutzt: `photo`
- Store mapped automatisch zwischen `photo` ↔ `photo_url`

---

## 💾 Alte Fänge behalten?

Wenn du schon Fänge hast:

1. **Export vor Update:**
```sql
-- In Supabase SQL Editor
SELECT * FROM public.catches;
```
   - Kopiere die Daten

2. **Nach Update importieren:**
   - Nutze Table Editor → Insert rows
   - Oder schreib SQL INSERT Statements

---

## 🐛 Immer noch Fehler?

### "relation 'catches' does not exist"

**Lösung:** Schema noch nicht ausgeführt
- Führe `supabase/schema.sql` komplett aus

### "column 'photo_url' does not exist"

**Lösung:** ALTER TABLE Statement ausführen
```sql
ALTER TABLE public.catches 
ADD COLUMN photo_url TEXT;
```

### "permission denied"

**Lösung:** RLS Policies fehlen
- Führe komplettes Schema neu aus

---

## ✅ Checkliste

Nach dem Fix sollte alles funktionieren:

- [ ] `supabase/schema.sql` ausgeführt
- [ ] Tabelle `catches` existiert
- [ ] Spalte `photo_url` existiert
- [ ] RLS Policies sind aktiv
- [ ] Storage Bucket "fish-photos" existiert
- [ ] App läuft ohne Fehler
- [ ] Foto-Upload funktioniert

Alles grün? Perfekt! 🎉

---

**Happy Fishing! 🎣**
