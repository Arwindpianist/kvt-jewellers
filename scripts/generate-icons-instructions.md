# Generate PWA Icons from app.jpg

## Quick Method (Recommended)

### Option 1: Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload `public/app.jpg`
3. Configure settings:
   - Android Chrome: Enable
   - iOS: Enable
   - Windows Metro: Enable
   - Favicon: Enable
4. Generate and download
5. Extract files to `public/icons/` and replace `favicon.ico`

### Option 2: Using Node.js Script
1. Install sharp: `npm install --save-dev sharp`
2. Run: `node scripts/generate-icons.js`
3. Icons will be generated in `public/icons/`

### Option 3: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first, then:
cd public/icons
magick ../app.jpg -resize 72x72 icon-72x72.png
magick ../app.jpg -resize 96x96 icon-96x96.png
magick ../app.jpg -resize 128x128 icon-128x128.png
magick ../app.jpg -resize 144x144 icon-144x144.png
magick ../app.jpg -resize 152x152 icon-152x152.png
magick ../app.jpg -resize 192x192 icon-192x192.png
magick ../app.jpg -resize 384x384 icon-384x384.png
magick ../app.jpg -resize 512x512 icon-512x512.png
```

### Option 4: Using Python (Pillow)
```python
from PIL import Image
import os

source = 'public/app.jpg'
output_dir = 'public/icons'
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

img = Image.open(source)
os.makedirs(output_dir, exist_ok=True)

for size in sizes:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f'{output_dir}/icon-{size}x{size}.png')
```

## After Generating Icons

1. Update `public/manifest.json` to use the generated PNG files
2. Update `app/layout.tsx` favicon reference if needed
3. Test PWA installation on mobile device
