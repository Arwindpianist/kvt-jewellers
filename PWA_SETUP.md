# PWA Setup & Mobile Installation Guide

## ✅ Current PWA Configuration

### 1. **Manifest.json** (`public/manifest.json`)
- ✅ Configured with proper name, description, theme colors
- ✅ Icons defined (need to add actual icon files)
- ✅ Shortcuts for Live Rates and Products
- ✅ Standalone display mode

### 2. **Service Worker** (via next-pwa)
- ✅ Configured in `next.config.mjs`
- ✅ Runtime caching enabled
- ✅ NetworkFirst strategy for offline support
- ✅ Only enabled in production

### 3. **Install Prompt Component**
- ✅ Created `PWAInstallPrompt.tsx`
- ✅ Shows install prompt on mobile devices
- ✅ Respects user dismissal (7-day cooldown)
- ✅ Integrated into public layout

### 4. **Meta Tags**
- ✅ Apple touch icon configured
- ✅ Theme color set
- ✅ Viewport optimized for mobile

---

## 📱 How Users Install the PWA

### On Mobile (iOS - Safari):
1. Visit the website
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name (optional)
5. Tap **"Add"**

### On Mobile (Android - Chrome):
1. Visit the website
2. Browser will show install banner automatically
3. OR tap the **menu** (3 dots) → **"Install app"** or **"Add to Home Screen"**
4. Confirm installation

### On Desktop (Chrome/Edge):
1. Visit the website
2. Look for install icon in address bar
3. Click **"Install"** button
4. App opens in standalone window

---

## 🎯 PWA Features for Users

### ✅ What Works:
- **Offline Access**: Cached prices and products available offline
- **App-like Experience**: Standalone window, no browser UI
- **Quick Access**: Shortcuts to Live Rates and Products
- **Fast Loading**: Service worker caches resources
- **Mobile Optimized**: Responsive design works perfectly

### 📋 What Users Can Do:
- View live gold/silver prices (cached when offline)
- Browse product catalog
- Access from home screen
- Works without internet (cached data)

---

## 🔧 Required: Add PWA Icons

**Action Required:** Add icon files to `public/icons/` directory:

```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

**Icon Design Guidelines:**
- Square PNG images
- Use brand colors (purple #521540, gold accents)
- Include KVT logo or initials
- Ensure icons are clear at small sizes
- Use maskable icons for better Android support

**Tools to Generate Icons:**
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

---

## 🧪 Testing PWA

### Development:
1. Build for production: `npm run build`
2. Start production server: `npm start`
3. Test on mobile device or Chrome DevTools
4. Check install prompt appears
5. Verify offline functionality

### Production Checklist:
- [ ] Icons added to `public/icons/`
- [ ] Manifest.json validated
- [ ] Service worker registered
- [ ] Install prompt appears on mobile
- [ ] Offline mode works
- [ ] App installs correctly
- [ ] Shortcuts work

---

## 📊 PWA Analytics

Consider tracking:
- Install rate (how many users install)
- Offline usage
- Service worker errors
- Cache hit rates

---

## 🚀 Future Enhancements

1. **Push Notifications**: Alert users of price changes
2. **Background Sync**: Update prices in background
3. **Share Target**: Allow sharing to app
4. **File Handler**: Handle price data files
5. **Periodic Background Sync**: Auto-update prices

---

## 📝 Notes

- PWA only works over HTTPS (required for service workers)
- iOS Safari has limited PWA support (no install prompt API)
- Android Chrome has full PWA support
- Desktop browsers support PWA installation
- Service worker caches API responses for offline access
