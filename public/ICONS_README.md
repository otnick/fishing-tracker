# PWA Icons

## Required Icons

Place the following icon files in this `/public` directory:

### Required Files:
- `icon-192x192.png` - 192x192px PNG icon
- `icon-512x512.png` - 512x512px PNG icon

### How to Create Icons:

1. **Design Tool:** Use Figma, Canva, or Photoshop
2. **Design:** Create a 512x512px square with your FishBox logo (🎣)
3. **Background:** Use the ocean blue color (#2c5f8d)
4. **Export:** 
   - Export as 512x512px → save as `icon-512x512.png`
   - Resize to 192x192px → save as `icon-192x192.png`

### Quick Solution (Emoji Icon):

You can use a simple emoji-based icon temporarily:
- Background: Ocean blue (#2c5f8d)
- Emoji: 🎣 (fishing pole)
- Text: "FishBox" below emoji

### Online Icon Generators:

- **Favicon.io** - https://favicon.io/
- **RealFaviconGenerator** - https://realfavicongenerator.net/
- **PWA Builder** - https://www.pwabuilder.com/

### Icon Requirements:

- **Format:** PNG
- **Sizes:** 192x192 and 512x512
- **Purpose:** App icons for PWA installation
- **Design:** Should be recognizable at small sizes

### Testing:

After adding icons:
1. Open app in Chrome
2. Open DevTools → Application → Manifest
3. Check if icons are loaded correctly
4. Test "Install App" prompt

---

**Note:** The app will work without icons, but they're required for proper PWA experience.
