# 🔧 Troubleshooting Guide

## Häufige Fehler & Lösungen

### ❌ "setUser is not a function"

**Problem:** Zustand Store wird nicht richtig initialisiert

**Lösung 1: Cache löschen**
```bash
# Stoppe den Server (Strg+C)
rm -rf .next
npm run dev
```

**Lösung 2: Prüfe AuthProvider.tsx**

Die Datei sollte so aussehen:
```tsx
'use client'

import { useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useCatchStore } from '@/lib/store'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const setUser = useCatchStore.getState().setUser
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const setUser = useCatchStore.getState().setUser
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
```

---

### ❌ "Failed to fetch" / Network Error

**Problem:** Supabase Credentials fehlen oder falsch

**Lösung:**
1. Prüfe ob `.env.local` existiert
2. Prüfe ob Werte korrekt sind:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```
3. Server neu starten: `npm run dev`

---

### ❌ "relation "catches" does not exist"

**Problem:** SQL Schema nicht ausgeführt

**Lösung:**
1. Öffne Supabase SQL Editor
2. Führe `supabase/schema.sql` aus
3. Prüfe in Table Editor ob Tabelle "catches" existiert

---

### ❌ "new row violates row-level security policy"

**Problem:** RLS Policies nicht richtig gesetzt

**Lösung:**
1. Supabase → Table Editor → catches
2. Tab "Policies" öffnen
3. Du solltest 4 Policies sehen:
   - Users can view own catches
   - Users can insert own catches
   - Users can update own catches
   - Users can delete own catches

Wenn nicht: SQL Schema nochmal ausführen!

---

### ❌ "Invalid login credentials"

**Problem:** Passwort falsch oder Account nicht bestätigt

**Lösung:**
1. Passwort korrekt eingegeben?
2. Email-Bestätigung erhalten? (Check Spam!)
3. Oder: Email-Bestätigung deaktivieren:
   - Supabase → Authentication → Providers
   - Email → Settings → "Confirm email" AUS

---

### ❌ "Email rate limit exceeded"

**Problem:** Zu viele Emails in kurzer Zeit

**Lösung:**
- Warte 1 Minute
- Verwende Magic Link statt Register

---

### ❌ Seite lädt nicht / Weißer Screen

**Problem:** JavaScript Fehler

**Lösung:**
1. Öffne Browser Console (F12)
2. Sieh dir Fehler an
3. Häufigste Ursachen:
   - `.env.local` fehlt
   - Dependencies nicht installiert: `npm install`
   - Port schon belegt: `npm run dev -- -p 3001`

---

### ❌ "Cannot find module '@/components/auth/Auth'"

**Problem:** Datei fehlt oder falsch benannt

**Lösung:**
1. Prüfe ob Ordner existiert: `components/auth/`
2. Prüfe Dateinamen:
   - `components/auth/Auth.tsx`
   - `components/auth/AuthProvider.tsx`

---

### ❌ TypeScript Errors

**Problem:** Type Konflikte

**Lösung:**
```bash
# Stoppe Server
rm -rf .next node_modules
npm install
npm run dev
```

---

### ❌ "window is not defined" (SSR Error)

**Problem:** Client-only Code wird auf Server ausgeführt

**Lösung:**
- Prüfe ob `'use client'` am Anfang der Datei steht
- Alle Components die Browser-APIs nutzen brauchen `'use client'`

---

## 🧹 Nuclear Option (Alles neu)

Wenn gar nichts funktioniert:

```bash
# Alles löschen
rm -rf node_modules package-lock.json .next

# Neu installieren
npm install

# Cache löschen
npm cache clean --force

# Starten
npm run dev
```

---

## 🐛 Debug-Tipps

### Console Logs hinzufügen

In `lib/store.ts`:
```tsx
setUser: (user) => {
  console.log('setUser called with:', user)
  set({ user })
  if (user) {
    get().fetchCatches()
  } else {
    set({ catches: [] })
  }
},
```

### Supabase Queries debuggen

```tsx
const { data, error } = await supabase
  .from('catches')
  .select('*')
  
console.log('Supabase response:', { data, error })
```

### Auth State checken

In Browser Console:
```js
// Aktuellen User checken
const user = useCatchStore.getState().user
console.log(user)

// Alle Catches checken
const catches = useCatchStore.getState().catches
console.log(catches)
```

---

## 📞 Noch Fragen?

Wenn nichts hilft:
1. Prüfe Browser Console (F12) für Fehler
2. Prüfe Terminal für Server-Fehler
3. Schreib den genauen Fehler auf
4. Frag mich! 😊

---

## ✅ Alles läuft?

Wenn alles funktioniert, siehst du:
- Login Screen beim Start
- Nach Login: Dashboard mit 3D-Aquarium
- Fänge werden gespeichert und geladen
- Logout funktioniert
- Refresh behält Login bei

Happy Fishing! 🎣
