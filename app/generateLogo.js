const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create assets directory and its subdirectories
const assetsDir = path.join(__dirname, 'assets');
const soundsDir = path.join(assetsDir, 'sounds');

// Create directories if they don't exist
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir);
}

// Create a 512x512 logo with a gradient background and an accessibility-themed icon
const width = 512;
const height = 512;
const centerX = width / 2;
const centerY = height / 2;

// Create an SVG with a gradient background and an eye symbol
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#007AFF;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
        </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" rx="60" ry="60"/>
    <g transform="translate(${centerX},${centerY})" fill="white" filter="url(#shadow)">
        <path d="M-120,-20 Q0,-80 120,-20 Q0,40 -120,-20 M-30,-20 A30,30 0 1,1 30,-20 A30,30 0 1,1 -30,-20" />
        <circle cx="0" cy="-20" r="15" fill="#007AFF"/>
    </g>
    <circle cx="${centerX}" cy="${centerY - 20}" r="10" fill="white"/>
</svg>`;

// Convert SVG to PNG with higher quality settings
sharp(Buffer.from(svg))
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'logo.png'))
    .then(() => console.log('Logo generated successfully!'))
    .catch(err => console.error('Error generating logo:', err));
