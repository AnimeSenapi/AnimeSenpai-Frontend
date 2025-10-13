# Assets Creation Guide

## 🎨 Required Assets for Launch

This document outlines all visual assets needed for AnimeSenpai to be production-ready.

---

## 1. Favicon & App Icons

### Favicon
- **Location**: `/public/favicon.ico`
- **Sizes**: Multi-resolution ICO file (16x16, 32x32, 48x48)
- **Design**: Simple, recognizable "AS" or anime-themed icon
- **Tools**: 
  - [Favicon.io](https://favicon.io/) - Generate from text/image
  - [RealFaviconGenerator](https://realfavicongenerator.net/)
  - Figma/Sketch/Illustrator

**Quick Generation**:
```bash
# Using ImageMagick (if installed)
convert logo.png -resize 32x32 favicon.ico
```

---

## 2. PWA App Icons

### Required Sizes
All icons should be placed in `/public/icons/` directory:

| File Name | Size | Purpose |
|-----------|------|---------|
| `icon-72x72.png` | 72×72 | Android Chrome |
| `icon-96x96.png` | 96×96 | Android Chrome |
| `icon-128x128.png` | 128×128 | Android Chrome |
| `icon-144x144.png` | 144×144 | Android Chrome |
| `icon-152x152.png` | 152×152 | iPad |
| `icon-192x192.png` | 192×192 | Android Chrome (standard) |
| `icon-384x384.png` | 384×384 | Android Chrome |
| `icon-512x512.png` | 512×512 | Android Chrome (splash) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |

### Design Guidelines
- **Background**: Solid color (brand purple #8b5cf6 or black #0a0a0a)
- **Icon**: "AS" monogram or anime-themed symbol
- **Padding**: 10-20% safe area around icon
- **Format**: PNG with transparency (except backgrounds)
- **Maskable**: Center icon should fit in 80% safe zone

### Quick Generation Script

Create a simple icon generator using ImageMagick:

```bash
#!/bin/bash
# save as generate-icons.sh

INPUT_IMAGE="logo.png"  # Your base logo (1024x1024 recommended)

sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
  convert "$INPUT_IMAGE" -resize ${size}x${size} "public/icons/icon-${size}x${size}.png"
  echo "Generated icon-${size}x${size}.png"
done

# Apple touch icon
convert "$INPUT_IMAGE" -resize 180x180 "public/icons/apple-touch-icon.png"
echo "Generated apple-touch-icon.png"

echo "✅ All icons generated!"
```

### Online Tools
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [App Icon Generator](https://appicon.co/)
- [Figma PWA Plugin](https://www.figma.com/community/plugin/1171664362887000033)

---

## 3. Open Graph (OG) Image

### Specifications
- **Location**: `/public/og-image.png`
- **Size**: 1200×630 pixels
- **Format**: PNG or JPEG (PNG preferred for quality)
- **File Size**: < 1MB (aim for 300KB)

### Content Guidelines
- **Brand Name**: "AnimeSenpai" prominently displayed
- **Tagline**: "Track, Discover & Watch Anime"
- **Visual**: Anime-themed background or character silhouettes
- **Colors**: Match brand colors (purple, dark theme)
- **Text**: Large, readable even at thumbnail size

### Design Template (Figma/Canva)

```
┌──────────────────────────────────────┐
│                                      │
│     [AnimeSenpai Logo]               │
│                                      │
│     Track, Discover & Watch Anime    │
│                                      │
│     [Anime character silhouette or   │
│      abstract anime-themed graphics] │
│                                      │
│     animesenpai.app                  │
│                                      │
└──────────────────────────────────────┘
       1200px × 630px
```

### Tools
- [Canva](https://www.canva.com/) - Use "Facebook Post" template (1200×630)
- [Figma](https://www.figma.com/) - Free design tool
- [Photopea](https://www.photopea.com/) - Free Photoshop alternative

### Quick OG Image Generators
- [OG Image Generator](https://og-image.vercel.app/)
- [Social Image Generator](https://www.bannerbear.com/demos/social-media-image-generator/)

---

## 4. App Screenshots (PWA)

### Desktop Screenshot
- **Location**: `/public/screenshots/desktop.png`
- **Size**: 1280×720 pixels (16:9 ratio)
- **Content**: Dashboard or main app view
- **Format**: PNG

### Mobile Screenshot
- **Location**: `/public/screenshots/mobile.png`
- **Size**: 750×1334 pixels (iPhone 8 dimensions)
- **Content**: Mobile app view (My List or Dashboard)
- **Format**: PNG

### How to Capture

**Desktop**:
1. Open app at 1280×720 resolution
2. Use browser DevTools (F12) → Device Mode
3. Take screenshot (Cmd+Shift+P → "Capture screenshot")

**Mobile**:
1. Use browser DevTools → Device Mode → iPhone 8
2. Navigate to key page
3. Capture screenshot

---

## 5. Logo Files (Optional but Recommended)

### Locations
- `/public/logo.svg` - Primary logo (vector)
- `/public/logo.png` - PNG version (1024×1024)
- `/public/logo-white.svg` - White version for dark backgrounds
- `/public/logo-text.svg` - Logo with text "AnimeSenpai"

### Specifications
- **Format**: SVG (scalable) + PNG backup
- **Artboard**: Square (1:1 ratio) or horizontal for text version
- **Colors**: Brand colors with transparent background
- **Exports**: SVG, PNG (1024×1024), PNG (512×512)

---

## 6. Placeholder Images

### User Avatar Default
- **Location**: `/public/default-avatar.png`
- **Size**: 200×200 pixels
- **Content**: Generic anime character silhouette or "AS" icon

### Anime Cover Placeholder
- **Location**: `/public/placeholder-anime.png`
- **Size**: 460×645 pixels (poster ratio)
- **Content**: "No Image Available" with brand styling

---

## 🛠️ Asset Creation Workflow

### Option 1: Design from Scratch

1. **Choose a design tool**: Figma (free) or Canva
2. **Create base logo**: 1024×1024 canvas
3. **Design app icon**: Simple, recognizable symbol
4. **Generate all sizes** using script or online tool
5. **Create OG image**: Use 1200×630 template
6. **Export all assets** to correct locations

### Option 2: Use Logo Generator

1. Visit [Looka](https://looka.com/) or [Hatchful](https://hatchful.shopify.com/)
2. Input: "AnimeSenpai", "Anime Tracker", purple/black colors
3. Generate logo options
4. Download logo pack
5. Use logo to generate icons with [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

### Option 3: AI-Generated (Quick & Dirty)

1. Use [DALL-E](https://openai.com/dall-e-3) or [Midjourney](https://www.midjourney.com/)
2. Prompt: "minimalist anime app icon, purple and black, letter AS, modern, simple"
3. Generate and download
4. Use online tools to create all required sizes

---

## 📁 Final Asset Structure

```
AnimeSenpai-Frontend/
└── public/
    ├── favicon.ico                    ✅
    ├── og-image.png                   ✅
    ├── manifest.json                  ✅ (already created)
    ├── icons/
    │   ├── icon-72x72.png            ⏳
    │   ├── icon-96x96.png            ⏳
    │   ├── icon-128x128.png          ⏳
    │   ├── icon-144x144.png          ⏳
    │   ├── icon-152x152.png          ⏳
    │   ├── icon-192x192.png          ⏳
    │   ├── icon-384x384.png          ⏳
    │   ├── icon-512x512.png          ⏳
    │   └── apple-touch-icon.png      ⏳
    ├── screenshots/
    │   ├── desktop.png               ⏳
    │   └── mobile.png                ⏳
    └── assets/
        └── logo/
            ├── AnimeSenpai_Inline.svg  ✅ (already exists)
            └── AnimeSenpai_Stacked.svg ✅ (already exists)
```

**Legend**:
- ✅ Already exists
- ⏳ Needs to be created

---

## 🎯 Quick Start (30 minutes)

### Minimal Viable Assets

If you need to launch ASAP, create these essentials:

1. **Favicon** (5 min)
   - Use text-to-favicon generator with "AS"
   - Download and place in `/public/favicon.ico`

2. **App Icons** (10 min)
   - Use same favicon/logo
   - Upload to [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
   - Download zip, extract to `/public/icons/`

3. **OG Image** (10 min)
   - Use [Canva](https://www.canva.com/)
   - Search "Facebook Post" template
   - Add text: "AnimeSenpai - Track & Discover Anime"
   - Download as PNG → `/public/og-image.png`

4. **Screenshots** (5 min)
   - Open app in browser
   - DevTools → Take screenshots
   - Save to `/public/screenshots/`

---

## ✅ Verification Checklist

After creating assets:

- [ ] All icon files exist in `/public/icons/`
- [ ] Favicon appears in browser tab
- [ ] OG image displays when sharing link (test in [OpenGraph Debugger](https://www.opengraph.xyz/))
- [ ] PWA install prompt shows on mobile (Chrome → Add to Home Screen)
- [ ] Apple touch icon shows when adding to iOS home screen
- [ ] Screenshots display in PWA install prompt

---

## 🎨 Brand Colors Reference

Use these colors for consistency:

```css
/* Primary Purple */
--primary: #8b5cf6
--primary-dark: #7c3aed

/* Background */
--background: #0a0a0a
--surface: #1a1a1a

/* Text */
--text-primary: #ffffff
--text-secondary: #a0a0a0

/* Accent Colors */
--secondary: #ec4899
--success: #10b981
--warning: #f59e0b
--error: #ef4444
```

---

## 📞 Need Help?

- **Design Assistance**: Contact the design team
- **Quick Mockups**: Use existing logos from `/public/assets/logo/`
- **AI Generation**: Use ChatGPT/DALL-E with brand guidelines
- **Outsource**: Consider [Fiverr](https://www.fiverr.com/) for quick turnaround ($5-20)

---

**Last Updated**: October 13, 2024  
**Status**: Assets pending creation  
**Priority**: Medium (required before production launch)

