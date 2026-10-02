const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/designs');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const svgs = {
  'neo-tokyo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <text x="300" y="160" text-anchor="middle" font-family="monospace" font-weight="900" font-size="52" fill="#FF2A85" letter-spacing="10">NEO TOKYO</text>
    <text x="300" y="220" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="28" fill="#00F0FF" letter-spacing="16">2 0 9 9</text>
    <circle cx="300" cy="330" r="100" stroke="#FF2A85" stroke-width="6" fill="none" stroke-dasharray="16,8"/>
    <polygon points="300,250 370,390 230,390" fill="none" stroke="#00F0FF" stroke-width="6"/>
    <text x="300" y="340" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="36" fill="#FFFFFF">東京</text>
    <text x="300" y="470" text-anchor="middle" font-family="monospace" font-size="16" fill="#888888" letter-spacing="8">[REVNTRIX CYBER DIVISION]</text>
  </svg>`,

  'ghost-code.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <rect x="100" y="140" width="400" height="280" rx="20" stroke="#FFFFFF" stroke-width="4" fill="none"/>
    <text x="130" y="200" font-family="monospace" font-size="24" fill="#00FF66">&gt; INITIALIZING GHOST...</text>
    <text x="130" y="240" font-family="monospace" font-size="18" fill="#AAAAAA">&gt; NEURAL LINK: CONNECTED</text>
    <text x="130" y="280" font-family="monospace" font-size="18" fill="#AAAAAA">&gt; BIOMETRIC BYPASS: TRUE</text>
    <text x="130" y="340" font-family="monospace" font-weight="bold" font-size="28" fill="#FF0055">SYSTEM OVERRIDE</text>
    <line x1="100" y1="460" x2="500" y2="460" stroke="#FFFFFF" stroke-width="2"/>
    <text x="300" y="500" text-anchor="middle" font-family="monospace" font-size="14" fill="#888888" letter-spacing="6">REVNTRIX // CYBERNETIC PROTOCOL</text>
  </svg>`,

  'shinigami.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <circle cx="300" cy="270" r="120" fill="#E60000"/>
    <text x="300" y="300" text-anchor="middle" font-family="serif" font-weight="bold" font-size="90" fill="#FFFFFF">死神</text>
    <text x="300" y="440" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" letter-spacing="12">SHINIGAMI</text>
    <text x="300" y="480" text-anchor="middle" font-family="monospace" font-size="14" fill="#888888" letter-spacing="8">SOUL HARVEST ARCHIVE</text>
  </svg>`,

  'chaos-order.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <text x="300" y="200" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="64" fill="#FFFFFF" letter-spacing="8">CHAOS</text>
    <line x1="150" y1="240" x2="450" y2="240" stroke="#FF3333" stroke-width="8"/>
    <text x="300" y="320" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="64" fill="#FFFFFF" letter-spacing="8">ORDER</text>
    <rect x="200" y="370" width="200" height="50" fill="#FFFFFF"/>
    <text x="300" y="405" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#000000" letter-spacing="6">REVNTRIX</text>
    <text x="300" y="470" text-anchor="middle" font-family="monospace" font-size="12" fill="#777777" letter-spacing="4">PARADOX OF INDUSTRIAL REASON</text>
  </svg>`,

  'revntrix-archive.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <rect x="120" y="160" width="360" height="280" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <text x="300" y="240" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" letter-spacing="10">REVNTRIX</text>
    <text x="300" y="280" text-anchor="middle" font-family="monospace" font-size="14" fill="#AAAAAA" letter-spacing="8">AUTHENTIC HEAVYWEIGHT</text>
    <line x1="160" y1="310" x2="440" y2="310" stroke="#AAAAAA" stroke-width="1"/>
    <text x="300" y="350" text-anchor="middle" font-family="monospace" font-size="16" fill="#FFFFFF">COORD: 28.6139° N, 77.2090° E</text>
    <text x="300" y="390" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#E60000">SERIES 01 // ARCHIVE</text>
  </svg>`,

  'distortion.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <text x="302" y="238" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="52" fill="#00FFFF" opacity="0.8">DISTORTION</text>
    <text x="298" y="242" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="52" fill="#FF0055" opacity="0.8">DISTORTION</text>
    <text x="300" y="240" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="52" fill="#FFFFFF">DISTORTION</text>
    <text x="300" y="330" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#FFDD00" letter-spacing="12">SPECTRUM</text>
    <circle cx="300" cy="420" r="30" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <line x1="220" y1="420" x2="380" y2="420" stroke="#FFFFFF" stroke-width="2"/>
  </svg>`,

  'midnight-garage.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <text x="300" y="180" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="42" fill="#F4A261" letter-spacing="8">MIDNIGHT GARAGE</text>
    <text x="300" y="240" text-anchor="middle" font-family="serif" font-style="italic" font-size="70" fill="#E76F51">1984</text>
    <rect x="180" y="280" width="240" height="8" fill="#F4A261"/>
    <text x="300" y="340" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#FFFFFF" letter-spacing="6">TOKYO TOURING CLUB</text>
    <text x="300" y="390" text-anchor="middle" font-family="monospace" font-size="14" fill="#CCCCCC" letter-spacing="4">SHUTO EXPRESSWAY SPECIAL</text>
    <text x="300" y="440" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#888888">REVNTRIX MOTORWORKS</text>
  </svg>`,

  'analog-sunset.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <circle cx="300" cy="270" r="100" fill="#FF4E50"/>
    <rect x="180" y="290" width="240" height="8" fill="#121212"/>
    <rect x="180" y="310" width="240" height="12" fill="#121212"/>
    <rect x="180" y="335" width="240" height="18" fill="#121212"/>
    <text x="300" y="420" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="#F9D423" letter-spacing="8">ANALOG SUNSET</text>
    <text x="300" y="460" text-anchor="middle" font-family="monospace" font-size="14" fill="#FFFFFF" letter-spacing="6">SYNTHESIS AUDIO LABS</text>
  </svg>`,

  'desert-echoes.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <polygon points="300,160 400,340 200,340" fill="none" stroke="#D4A373" stroke-width="6"/>
    <circle cx="300" cy="280" r="40" fill="#D4A373"/>
    <text x="300" y="410" text-anchor="middle" font-family="serif" font-weight="bold" font-size="40" fill="#FAEDCD" letter-spacing="6">DESERT ECHOES</text>
    <text x="300" y="450" text-anchor="middle" font-family="monospace" font-size="16" fill="#CCD5AE" letter-spacing="8">WANDER UNBOUND</text>
    <text x="300" y="490" text-anchor="middle" font-family="monospace" font-size="12" fill="#888888">REVNTRIX OUTPOST</text>
  </svg>`,

  'monochrome-geo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <circle cx="300" cy="260" r="90" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <rect x="230" y="190" width="140" height="140" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <line x1="160" y1="360" x2="440" y2="360" stroke="#FFFFFF" stroke-width="3"/>
    <text x="300" y="420" text-anchor="middle" font-family="sans-serif" font-weight="300" font-size="32" fill="#FFFFFF" letter-spacing="12">GEOMETRIE</text>
    <text x="300" y="460" text-anchor="middle" font-family="monospace" font-size="14" fill="#888888" letter-spacing="6">STUDIO REVNTRIX</text>
  </svg>`,

  'topological.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <ellipse cx="300" cy="250" rx="140" ry="70" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <ellipse cx="300" cy="250" rx="105" ry="50" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <ellipse cx="300" cy="250" rx="70" ry="30" fill="none" stroke="#FFFFFF" stroke-width="3"/>
    <circle cx="300" cy="250" r="4" fill="#E63946"/>
    <text x="300" y="380" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="32" fill="#FFFFFF" letter-spacing="8">TOPOLOGY</text>
    <text x="300" y="420" text-anchor="middle" font-family="monospace" font-size="16" fill="#A8DADC" letter-spacing="4">ELEVATION 5,400 M</text>
    <text x="300" y="460" text-anchor="middle" font-family="monospace" font-size="12" fill="#888888">FIELD ARCHIVE</text>
  </svg>`,

  'quantum-orbit.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
    <rect width="600" height="600" fill="none"/>
    <circle cx="300" cy="260" r="12" fill="#FFFFFF"/>
    <ellipse cx="300" cy="260" rx="120" ry="40" fill="none" stroke="#FFFFFF" stroke-width="2" transform="rotate(-30 300 260)"/>
    <ellipse cx="300" cy="260" rx="120" ry="40" fill="none" stroke="#FFFFFF" stroke-width="2" transform="rotate(30 300 260)"/>
    <ellipse cx="300" cy="260" rx="120" ry="40" fill="none" stroke="#FFFFFF" stroke-width="2" transform="rotate(90 300 260)"/>
    <text x="300" y="410" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" letter-spacing="10">QUANTUM</text>
    <text x="300" y="450" text-anchor="middle" font-family="monospace" font-size="14" fill="#AAAAAA" letter-spacing="6">ORBITAL TRAJECTORY</text>
  </svg>`,
};

for (const [filename, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(dir, filename), content.trim());
  console.log('Created ' + filename);
}
