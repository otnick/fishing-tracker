# 🐛 Multiple Photos Debug Guide

## Problem: Photos werden nicht angezeigt

### Quick Check Steps:

## 1. Check Database
```sql
-- In Supabase SQL Editor:

-- Check if catch_photos table exists
SELECT * FROM catch_photos LIMIT 5;

-- Check specific catch
SELECT * FROM catch_photos WHERE catch_id = 'YOUR_CATCH_ID';

-- Check catches table
SELECT id, species, photo_url FROM catches WHERE photo_url IS NOT NULL LIMIT 5;
```

## 2. Check Browser Console
1. Open catch detail page
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for these logs:
   - "Found photos: X" ← Should show number of photos
   - "Display photos: X" ← Should show number in grid

## 3. Common Issues:

### Issue A: Migration not run
**Symptom:** `table "catch_photos" does not exist`
**Fix:** 
```sql
-- Run in Supabase SQL Editor:
-- Copy content from: supabase/multiple_photos_migration.sql
```

### Issue B: No data in catch_photos
**Symptom:** `SELECT * FROM catch_photos` returns 0 rows
**Possible causes:**
1. Photos uploaded BEFORE migration was run
2. Upload failed silently
3. RLS policies blocking insert

**Fix:**
```sql
-- Check RLS policies:
SELECT * FROM pg_policies WHERE tablename = 'catch_photos';

-- Manually insert test data:
INSERT INTO catch_photos (catch_id, photo_url, order_index)
SELECT id, photo_url, 0 
FROM catches 
WHERE photo_url IS NOT NULL
LIMIT 1;
```

### Issue C: catches.photo_url is NULL
**Symptom:** Old catches show no photos
**Cause:** Uploaded before photo_url was populated
**Fix:**
```sql
-- Check:
SELECT id, species, photo_url FROM catches WHERE id = 'YOUR_CATCH_ID';

-- If photo_url is NULL but catch_photos has data:
UPDATE catches 
SET photo_url = (
  SELECT photo_url FROM catch_photos 
  WHERE catch_id = catches.id 
  ORDER BY order_index 
  LIMIT 1
)
WHERE id = 'YOUR_CATCH_ID';
```

## 4. Test Upload Flow:

### Upload New Catch with Multiple Photos:
1. Go to "Neuer Fang"
2. Select 3 photos
3. Fill out form
4. Click "Fang speichern"
5. Check Console for errors
6. Check database:
```sql
-- Get most recent catch:
SELECT * FROM catches ORDER BY created_at DESC LIMIT 1;
-- Copy the ID

-- Check its photos:
SELECT * FROM catch_photos WHERE catch_id = 'THAT_ID';
-- Should show 3 rows!
```

## 5. Verify Detail Page:

### Check React State:
1. Open detail page: `/catch/YOUR_CATCH_ID`
2. Check Console logs:
   - "Found photos: 3" ← Good!
   - "Display photos: 3" ← Good!
3. Should see photo grid with 3 photos

### If photos = 0:
Check `fetchPhotos` function:
- Does it run? (Check console)
- Any errors? (Check console)
- Does query return data?

```typescript
// Add this temporarily to detail page:
useEffect(() => {
  const debugPhotos = async () => {
    const { data, error } = await supabase
      .from('catch_photos')
      .select('*')
      .eq('catch_id', params.id)
    
    console.log('Debug photos:', data, error)
  }
  debugPhotos()
}, [params.id])
```

## 6. Build Error Fix:

### Error: "Type 'string | null' is not assignable to type 'string'"

**Quick Fix:**
```bash
# Clear build cache
rm -rf .next
npm run build
```

If still fails, the `|| ''` fix should be there already. Check line 92 in CatchForm.tsx:
```typescript
setFormData(prev => ({ ...prev, location: locationName || '' }))
```

## 7. Production Checklist:

✅ Migration run?
```sql
SELECT * FROM catch_photos LIMIT 1;
```

✅ RLS Policies active?
```sql
SELECT * FROM pg_policies WHERE tablename = 'catch_photos';
-- Should show 5 policies
```

✅ Trigger created?
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%catch_photos%';
```

✅ Test upload works?
- Upload new catch with 3 photos
- Check both tables populated
- Detail page shows all 3

## 8. Emergency Fallback:

If **nothing works**, try this simple fix:

### Option A: Show photo_url in grid
Even if catch_photos is empty, at least show the main photo:
```typescript
// In detail page:
const displayPhotos = [
  ...(photos.length > 0 ? photos : []),
  ...(catchData.photo_url && photos.length === 0 
    ? [{ id: 'main', photo_url: catchData.photo_url, order_index: 0 }] 
    : [])
]
```

### Option B: Force re-upload
Tell users to re-upload catches with multiple photos.

---

## Need Help?

Check these files:
- `/app/(main)/catch/[id]/page.tsx` - Detail page
- `/components/CatchForm.tsx` - Upload logic
- `/supabase/multiple_photos_migration.sql` - DB schema
- Browser Console (F12) - Runtime logs

**Most likely issue:** Photos uploaded before migration, so catch_photos table is empty even though catches.photo_url has data.

**Quick test:** Upload a brand new catch with 3 photos and see if THAT one works!
