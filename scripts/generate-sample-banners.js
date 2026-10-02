const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/banners');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Banner 1: Cyberpunk / Neon Grid
const b1Desktop = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 800" width="1920" height="800">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070709"/>
      <stop offset="50%" stop-color="#120A1A"/>
      <stop offset="100%" stop-color="#0A0A0F"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.8" cy="0.4" r="0.6">
      <stop offset="0%" stop-color="#FF0055" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#FF0055" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid1" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#251633" stroke-width="1.5"/>
    </pattern>
  </defs>
  <rect width="1920" height="800" fill="url(#bg1)"/>
  <rect width="1920" height="800" fill="url(#grid1)"/>
  <rect width="1920" height="800" fill="url(#glow1)"/>
  <circle cx="1500" cy="400" r="220" fill="none" stroke="#00F0FF" stroke-width="4" stroke-dasharray="20,12" opacity="0.6"/>
  <circle cx="1500" cy="400" r="140" fill="none" stroke="#FF0055" stroke-width="6" opacity="0.8"/>
  <text x="1500" y="420" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="70" fill="#FFFFFF" opacity="0.9">東京</text>
  <text x="1500" y="660" text-anchor="middle" font-family="monospace" font-size="20" fill="#00F0FF" letter-spacing="12">REVNTRIX // 2099</text>
</svg>`;

const b1Mobile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="bg1m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070709"/>
      <stop offset="50%" stop-color="#160822"/>
      <stop offset="100%" stop-color="#0A0A0F"/>
    </linearGradient>
    <radialGradient id="glow1m" cx="0.5" cy="0.4" r="0.6">
      <stop offset="0%" stop-color="#FF0055" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FF0055" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#bg1m)"/>
  <rect width="1080" height="1350" fill="url(#glow1m)"/>
  <circle cx="540" cy="550" r="220" fill="none" stroke="#00F0FF" stroke-width="5" stroke-dasharray="16,10" opacity="0.7"/>
  <circle cx="540" cy="550" r="150" fill="none" stroke="#FF0055" stroke-width="6" opacity="0.8"/>
  <text x="540" y="580" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="90" fill="#FFFFFF">東京</text>
  <text x="540" y="850" text-anchor="middle" font-family="monospace" font-size="24" fill="#00F0FF" letter-spacing="14">REVNTRIX // 2099</text>
</svg>`;

// Banner 2: Brutalist Monochrome / Architecture
const b2Desktop = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 800" width="1920" height="800">
  <rect width="1920" height="800" fill="#0C0C0D"/>
  <line x1="960" y1="0" x2="960" y2="800" stroke="#222225" stroke-width="2"/>
  <line x1="0" y1="400" x2="1920" y2="400" stroke="#222225" stroke-width="2"/>
  <rect x="1200" y="180" width="450" height="440" fill="none" stroke="#333338" stroke-width="4"/>
  <text x="1425" y="420" text-anchor="middle" font-family="monospace" font-weight="900" font-size="80" fill="#FFFFFF" letter-spacing="16">ARCHIVE</text>
  <text x="1425" y="480" text-anchor="middle" font-family="monospace" font-size="20" fill="#888888" letter-spacing="10">SERIES 01 // IND</text>
</svg>`;

const b2Mobile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <rect width="1080" height="1350" fill="#0C0C0D"/>
  <line x1="540" y1="0" x2="540" y2="1350" stroke="#222225" stroke-width="2"/>
  <line x1="0" y1="675" x2="1080" y2="675" stroke="#222225" stroke-width="2"/>
  <rect x="190" y="380" width="700" height="580" fill="none" stroke="#333338" stroke-width="6"/>
  <text x="540" y="690" text-anchor="middle" font-family="monospace" font-weight="900" font-size="90" fill="#FFFFFF" letter-spacing="14">ARCHIVE</text>
  <text x="540" y="770" text-anchor="middle" font-family="monospace" font-size="28" fill="#888888" letter-spacing="12">SERIES 01 // IND</text>
</svg>`;

// Banner 3: Streetwear WhatsApp Concierge
const b3Desktop = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 800" width="1920" height="800">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0A"/>
      <stop offset="100%" stop-color="#0E1F14"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="800" fill="url(#bg3)"/>
  <circle cx="1500" cy="400" r="180" fill="#25D366" fill-opacity="0.15"/>
  <circle cx="1500" cy="400" r="90" fill="#25D366" fill-opacity="0.3"/>
  <text x="1500" y="420" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="64" fill="#25D366">WHATSAPP</text>
  <text x="1500" y="470" text-anchor="middle" font-family="monospace" font-size="18" fill="#A7F3D0" letter-spacing="8">DIRECT ORDERING</text>
</svg>`;

const b3Mobile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="bg3m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0A"/>
      <stop offset="100%" stop-color="#0E1F14"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#bg3m)"/>
  <circle cx="540" cy="550" r="260" fill="#25D366" fill-opacity="0.15"/>
  <circle cx="540" cy="550" r="140" fill="#25D366" fill-opacity="0.3"/>
  <text x="540" y="570" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="80" fill="#25D366">WHATSAPP</text>
  <text x="540" y="640" text-anchor="middle" font-family="monospace" font-size="24" fill="#A7F3D0" letter-spacing="10">DIRECT ORDERING</text>
</svg>`;

const files = {
  'banner-1-desktop.svg': b1Desktop,
  'banner-1-mobile.svg': b1Mobile,
  'banner-2-desktop.svg': b2Desktop,
  'banner-2-mobile.svg': b2Mobile,
  'banner-3-desktop.svg': b3Desktop,
  'banner-3-mobile.svg': b3Mobile,
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, name), content.trim());
  console.log('Created ' + name);
}
