import sharp from "sharp";
import fs from "fs";

// ---- couleurs ----
function clampHex(h) { return Math.max(0, Math.min(255, Math.round(h))); }
function hexToRgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbToHex(r, g, b) { return "#" + [r, g, b].map((v) => clampHex(v).toString(16).padStart(2, "0")).join(""); }
function lighten(hex, f = 0.35) { const [r, g, b] = hexToRgb(hex); return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); }
function darken(hex, f = 0.55) { const [r, g, b] = hexToRgb(hex); return rgbToHex(r * (1 - f), g * (1 - f), b * (1 - f)); }

export function colorFor(couleur = "") {
  const c = couleur.toLowerCase();
  if (/rosso|rouge|red/.test(c)) return "#c81f28";
  if (/verde|british|vert|green/.test(c)) return "#2f7d4f";
  if (/papaya|orange/.test(c)) return "#ff6a1a";
  if (/portimao|requin|bleu|blue/.test(c)) return "#2f6fd6";
  if (/carrara|blanc|white/.test(c)) return "#dbe0e6";
  if (/nardo|anthracite|selenite|gris|grey|gray/.test(c)) return "#9aa0ab";
  if (/volcan|santorini|noir|black/.test(c)) return "#2a2e35";
  return "#c0c4cc";
}

// Silhouette supercar (viewBox 900x300, roues à x=222 et x=762, y=214)
const CAR_BODY = "M44 236 C34 232 40 214 78 212 C120 206 168 200 210 196 C210 176 220 162 244 156 L300 150 C356 120 452 104 560 108 C640 111 726 130 800 170 C842 176 872 184 872 198 C872 206 862 210 846 210 L820 210 C812 234 786 248 760 248 C734 248 712 234 704 210 L286 210 C278 234 254 248 228 248 C202 248 180 234 172 210 L96 212 C74 214 58 236 44 236 Z";
const CAR_CABIN = "M320 150 C372 118 452 102 548 106 C596 108 632 116 652 130 C606 146 520 154 430 154 L360 154 C344 153 330 152 320 150 Z";
const CAR_SILL = "M210 196 C360 190 560 190 704 196"; // ligne de caisse (accent)
const CAR_SHEEN = "M240 158 C340 132 470 120 580 124 C520 138 430 150 320 152 C288 152 258 156 240 158 Z";

function wheel(cx) {
  const spokes = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `<line x1="${cx}" y1="214" x2="${cx + Math.cos(a) * 40}" y2="${214 + Math.sin(a) * 40}" stroke="#4a4e57" stroke-width="4"/>`;
  }).join("");
  return `
    <ellipse cx="${cx}" cy="256" rx="52" ry="8" fill="#000" opacity="0.5"/>
    <circle cx="${cx}" cy="214" r="50" fill="#0a0b0d"/>
    <circle cx="${cx}" cy="214" r="46" fill="url(#wheel)"/>
    ${spokes}
    <circle cx="${cx}" cy="214" r="15" fill="#15171c" stroke="#4a4e57" stroke-width="2"/>
    <circle cx="${cx}" cy="214" r="50" fill="none" stroke="#000" stroke-width="2" opacity="0.6"/>`;
}

function carPaths() {
  return `
    <ellipse cx="490" cy="252" rx="470" ry="16" fill="#000" opacity="0.45"/>
    <path d="${CAR_BODY}" fill="url(#body)" stroke="#000" stroke-width="1.5"/>
    <path d="${CAR_SHEEN}" fill="#ffffff" opacity="0.10"/>
    <path d="${CAR_CABIN}" fill="#0b0e15" stroke="#2a2f38" stroke-width="1.5"/>
    <path d="${CAR_CABIN}" fill="url(#glass)" opacity="0.5"/>
    <path d="${CAR_SILL}" fill="none" stroke="url(#rim)" stroke-width="3.5" opacity="0.95" stroke-linecap="round"/>
    <path d="M812 182 L858 188 C866 190 866 198 858 199 L812 196 Z" fill="#ff7a2a"/>
    ${wheel(222)}
    ${wheel(762)}`;
}

export function studioSVG({ accent, variant = 0 }) {
  const W = 1600, H = 1000;
  const K = [1.35, 1.6, 1.2][variant % 3];
  const flip = variant % 3 === 1;
  const spotX = [0.5, 0.4, 0.6][variant % 3];
  const tint = variant % 3 === 2 ? "#ff5a00" : accent;
  const TX = W / 2 - 450 * K;
  const TY = 640 - 250 * K; // wheels near floor line ~640
  const carTransform = flip ? `translate(${TX + 900 * K}, ${TY}) scale(${-K}, ${K})` : `translate(${TX}, ${TY}) scale(${K})`;
  const B = TY + 250 * K;
  const reflTransform = flip
    ? `translate(${TX + 900 * K}, ${2 * B - TY}) scale(${-K}, ${-K})`
    : `translate(${TX}, ${2 * B - TY}) scale(${K}, ${-K})`;

  const gridLines = [];
  for (let i = 1; i <= 7; i++) {
    const y = 648 + i * i * 6;
    gridLines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff" stroke-opacity="${0.05 - i * 0.005}" stroke-width="1"/>`);
  }

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#111318"/><stop offset="0.55" stop-color="#0a0b0d"/><stop offset="1" stop-color="#050506"/>
    </linearGradient>
    <radialGradient id="spot" cx="${spotX}" cy="0.4" r="0.6">
      <stop offset="0" stop-color="${tint}" stop-opacity="0.5"/><stop offset="0.5" stop-color="${tint}" stop-opacity="0.1"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#15171c" stop-opacity="0.8"/><stop offset="1" stop-color="#050506" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(accent)}"/><stop offset="0.45" stop-color="${accent}"/><stop offset="1" stop-color="${darken(accent)}"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5a00"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4658"/><stop offset="1" stop-color="#0b0e15"/></linearGradient>
    <radialGradient id="wheel" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#1a1c21"/><stop offset="0.7" stop-color="#0a0b0d"/><stop offset="0.85" stop-color="#3a3d44"/><stop offset="1" stop-color="#0a0b0d"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.48" r="0.75">
      <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
    <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050506" stop-opacity="0"/><stop offset="0.75" stop-color="#050506" stop-opacity="0.9"/><stop offset="1" stop-color="#050506"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#spot)"/>
  <rect x="0" y="640" width="${W}" height="360" fill="url(#floor)"/>
  <ellipse cx="${W / 2}" cy="650" rx="640" ry="34" fill="${tint}" opacity="0.16"/>
  ${gridLines.join("")}

  <g transform="${reflTransform}" opacity="0.22">${carPaths()}</g>
  <rect x="0" y="640" width="${W}" height="360" fill="url(#reflFade)"/>

  <g transform="${carTransform}" filter="url(#none)">${carPaths()}</g>

  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

// mode test : génère 3 variantes d'exemple
if (process.argv[2] === "--sample") {
  const accent = colorFor(process.argv[3] || "Rosso Corsa");
  for (let v = 0; v < 3; v++) {
    const svg = studioSVG({ accent, variant: v });
    await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(`/tmp/studio-${v}.jpg`);
  }
  console.log("samples -> /tmp/studio-0.jpg .. studio-2.jpg");
}
