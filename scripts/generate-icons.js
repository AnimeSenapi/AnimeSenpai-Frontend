#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Creates all required app icons for PWA installation
 */

const fs = require('fs')
const path = require('path')

// Icon sizes required for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
]

// Shortcut icons
const shortcutIcons = [
  { name: 'shortcut-mylist.png', label: 'My List' },
  { name: 'shortcut-discover.png', label: 'Discover' },
  { name: 'shortcut-search.png', label: 'Search' },
  { name: 'shortcut-stats.png', label: 'Stats' },
]

// Create SVG icon template
function createIconSVG(size, label = 'AnimeSenpai') {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Anime Symbol -->
  <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.15}" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.08}" fill="url(#grad)"/>
  
  <!-- Text -->
  <text x="${size * 0.5}" y="${size * 0.75}" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" text-anchor="middle" fill="white">${label}</text>
</svg>`
}

// Create shortcut icon SVG
function createShortcutSVG(size, label) {
  const colors = {
    'My List': '#10b981',
    'Discover': '#f59e0b', 
    'Search': '#ef4444',
    'Stats': '#8b5cf6'
  }
  
  const color = colors[label] || '#6366f1'
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${label.replace(' ', '-')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad-${label.replace(' ', '-')})"/>
  
  <!-- Icon based on label -->
  ${label === 'My List' ? `<rect x="${size * 0.3}" y="${size * 0.3}" width="${size * 0.4}" height="${size * 0.4}" rx="${size * 0.1}" fill="white" opacity="0.9"/>` : ''}
  ${label === 'Discover' ? `<circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.2}" fill="white" opacity="0.9"/>` : ''}
  ${label === 'Search' ? `<circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.15}" fill="none" stroke="white" stroke-width="${size * 0.05}" opacity="0.9"/>` : ''}
  ${label === 'Stats' ? `<rect x="${size * 0.3}" y="${size * 0.3}" width="${size * 0.4}" height="${size * 0.4}" fill="white" opacity="0.9"/>` : ''}
  
  <!-- Text -->
  <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.1}" font-weight="bold" text-anchor="middle" fill="white">${label}</text>
</svg>`
}

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

console.log('🎨 Generating PWA icons...')

// Generate main app icons
iconSizes.forEach(({ size, name }) => {
  const svg = createIconSVG(size)
  const filePath = path.join(iconsDir, name)
  fs.writeFileSync(filePath.replace('.png', '.svg'), svg)
  console.log(`✅ Created ${name.replace('.png', '.svg')} (${size}x${size})`)
})

// Generate shortcut icons
shortcutIcons.forEach(({ name, label }) => {
  const svg = createShortcutSVG(96, label)
  const filePath = path.join(iconsDir, name)
  fs.writeFileSync(filePath.replace('.png', '.svg'), svg)
  console.log(`✅ Created ${name.replace('.png', '.svg')} (${label})`)
})

console.log('\n🎉 PWA icons generated successfully!')
console.log('\n📝 Next steps:')
console.log('1. Convert SVG files to PNG using an online converter or ImageMagick')
console.log('2. Optimize PNG files for web (use tools like TinyPNG)')
console.log('3. Test PWA installation on mobile devices')
console.log('\n💡 Tip: Use tools like "PWA Builder" or "Favicon Generator" for better icon quality')
