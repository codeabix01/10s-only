// ============================================================================
// 10s Only — SVG Event Cover Generator
// Deterministic (seeded). Each vibe has a unique gradient + pattern.
// ============================================================================

import type { EventVibe, City } from "./types";

// ---------------------------------------------------------------------------
// Seeded RNG — deterministic, no Math.random
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
}

// ---------------------------------------------------------------------------
// Vibe palettes
// ---------------------------------------------------------------------------

interface VibePalette {
  bg1: string;
  bg2: string;
  accent: string;
  accent2: string;
  pattern: "waveform" | "grid" | "circles" | "stripes" | "bursts" | "mist";
}

const VIBE_PALETTES: Record<EventVibe, VibePalette> = {
  techno: {
    bg1: "#080706",
    bg2: "#110e09",
    accent: "#C49030",
    accent2: "#7A5820",
    pattern: "waveform",
  },
  house: {
    bg1: "#07070a",
    bg2: "#0e0b0d",
    accent: "#BF9040",
    accent2: "#6B5020",
    pattern: "circles",
  },
  "drum-and-bass": {
    bg1: "#07080a",
    bg2: "#0c0e12",
    accent: "#A89878",
    accent2: "#5A4A30",
    pattern: "stripes",
  },
  experimental: {
    bg1: "#080709",
    bg2: "#0d0b10",
    accent: "#9A7860",
    accent2: "#604838",
    pattern: "bursts",
  },
  "hip-hop": {
    bg1: "#090606",
    bg2: "#120a08",
    accent: "#C07030",
    accent2: "#7A4018",
    pattern: "grid",
  },
  ambient: {
    bg1: "#070809",
    bg2: "#0b0c0e",
    accent: "#8A9080",
    accent2: "#4A5040",
    pattern: "mist",
  },
};

const DEFAULT_VIBE: EventVibe = "techno";
const VALID_VIBES: Set<EventVibe> = new Set([
  "techno",
  "house",
  "drum-and-bass",
  "experimental",
  "hip-hop",
  "ambient",
]);

const VALID_CITIES: Set<City> = new Set([
  "mumbai",
  "delhi",
  "bangalore",
  "goa",
  "pune",
  "hyderabad",
]);

function normalizeVibe(vibe: EventVibe | string | undefined): EventVibe {
  if (typeof vibe !== "string") return DEFAULT_VIBE;
  const normalized = vibe.toLowerCase().replace(/_/g, "-") as EventVibe;
  return VALID_VIBES.has(normalized) ? normalized : DEFAULT_VIBE;
}

function normalizeCity(city: City | string): City {
  if (typeof city !== "string") return "mumbai";
  const normalized = city.toLowerCase();
  return VALID_CITIES.has(normalized as City) ? (normalized as City) : "mumbai";
}

export function getVibeColor(vibe: EventVibe | string | undefined): string {
  const normalized = normalizeVibe(vibe);
  return VIBE_PALETTES[normalized].accent;
}

export function getSafeEventCover(
  rawCover: string | null | undefined,
  vibe: EventVibe | string | undefined,
  title: string,
  city: City | string
): string {
  if (typeof rawCover === "string") {
    const trimmed = rawCover.trim();
    if (trimmed && trimmed !== "undefined" && trimmed !== "null") {
      return trimmed;
    }
  }

  return getEventCover(vibe, title, city);
}

// ---------------------------------------------------------------------------
// Pattern generators
// ---------------------------------------------------------------------------

function genWaveform(rng: () => number, accent: string, accent2: string): string {
  const points: string[] = [];
  for (let x = 0; x <= 600; x += 8) {
    const h = 40 + rng() * 120;
    points.push(
      `<rect x="${x}" y="${160 - h / 2}" width="4" height="${h}" rx="2" fill="${accent}" opacity="${0.4 + rng() * 0.5}"/>`
    );
  }
  // secondary thin layer
  for (let x = 4; x <= 600; x += 16) {
    const h = 20 + rng() * 60;
    points.push(
      `<rect x="${x}" y="${160 - h / 2}" width="2" height="${h}" rx="1" fill="${accent2}" opacity="${0.3 + rng() * 0.4}"/>`
    );
  }
  return points.join("");
}

function genGrid(rng: () => number, accent: string, accent2: string): string {
  const lines: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = i * 50;
    const opacity = 0.08 + rng() * 0.18;
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="320" stroke="${accent}" stroke-width="1" opacity="${opacity}"/>`
    );
  }
  for (let i = 0; i <= 6; i++) {
    const y = i * 50;
    const opacity = 0.08 + rng() * 0.18;
    lines.push(
      `<line x1="0" y1="${y}" x2="600" y2="${y}" stroke="${accent2}" stroke-width="1" opacity="${opacity}"/>`
    );
  }
  // accent intersections
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(rng() * 12) * 50;
    const y = Math.floor(rng() * 6) * 50;
    lines.push(
      `<circle cx="${x}" cy="${y}" r="3" fill="${accent}" opacity="0.6"/>`
    );
  }
  return lines.join("");
}

function genCircles(rng: () => number, accent: string, accent2: string): string {
  const circles: string[] = [];
  for (let i = 0; i < 8; i++) {
    const cx = rng() * 600;
    const cy = rng() * 320;
    const r = 30 + rng() * 100;
    const color = rng() > 0.5 ? accent : accent2;
    const opacity = 0.1 + rng() * 0.3;
    circles.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${(1 + rng() * 2).toFixed(1)}" opacity="${opacity.toFixed(2)}"/>`
    );
  }
  return circles.join("");
}

function genStripes(rng: () => number, accent: string, accent2: string): string {
  const stripes: string[] = [];
  for (let i = 0; i < 18; i++) {
    const x = rng() * 620 - 20;
    const w = 2 + rng() * 14;
    const h = 100 + rng() * 220;
    const y = rng() * 100;
    const color = rng() > 0.5 ? accent : accent2;
    const opacity = 0.15 + rng() * 0.4;
    stripes.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" transform="skewX(${(-15 + rng() * 5).toFixed(1)} ${x.toFixed(1)})"/>`
    );
  }
  return stripes.join("");
}

function genBursts(rng: () => number, accent: string, accent2: string): string {
  const bursts: string[] = [];
  const count = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const cx = rng() * 600;
    const cy = rng() * 320;
    const rays = 8 + Math.floor(rng() * 8);
    const color = rng() > 0.5 ? accent : accent2;
    for (let r = 0; r < rays; r++) {
      const angle = (r / rays) * Math.PI * 2;
      const len = 40 + rng() * 80;
      const x2 = cx + Math.cos(angle) * len;
      const y2 = cy + Math.sin(angle) * len;
      bursts.push(
        `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${(1 + rng() * 1.5).toFixed(1)}" opacity="${(0.2 + rng() * 0.4).toFixed(2)}"/>`
      );
    }
  }
  return bursts.join("");
}

function genMist(rng: () => number, accent: string, accent2: string): string {
  const blobs: string[] = [];
  for (let i = 0; i < 6; i++) {
    const cx = rng() * 600;
    const cy = rng() * 320;
    const rx = 60 + rng() * 120;
    const ry = 30 + rng() * 60;
    const color = rng() > 0.5 ? accent : accent2;
    const opacity = 0.08 + rng() * 0.18;
    blobs.push(
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}"/>`
    );
  }
  return blobs.join("");
}

function renderPattern(palette: VibePalette, rng: () => number): string {
  switch (palette.pattern) {
    case "waveform":
      return genWaveform(rng, palette.accent, palette.accent2);
    case "grid":
      return genGrid(rng, palette.accent, palette.accent2);
    case "circles":
      return genCircles(rng, palette.accent, palette.accent2);
    case "stripes":
      return genStripes(rng, palette.accent, palette.accent2);
    case "bursts":
      return genBursts(rng, palette.accent, palette.accent2);
    case "mist":
      return genMist(rng, palette.accent, palette.accent2);
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a deterministic SVG event cover (data URI).
 * Title + city are used only as RNG seed so each event gets a unique pattern.
 */
export function getEventCover(
  vibe: EventVibe | string | undefined,
  title: string,
  city: City | string
): string {
  const normalizedVibe = normalizeVibe(vibe);
  const normalizedCity = normalizeCity(city);
  const palette = VIBE_PALETTES[normalizedVibe];
  const seed = hashString(`${normalizedVibe}|${title}|${normalizedCity}`);
  const rng = seededRandom(seed);

  const patternSvg = renderPattern(palette, rng);

  // Deterministic blob positions
  const blob1X = (rng() * 600).toFixed(1);
  const blob1Y = (rng() * 320).toFixed(1);
  const blob2X = (rng() * 600).toFixed(1);
  const blob2Y = (rng() * 320).toFixed(1);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320">
  <defs>
    <linearGradient id="bg-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}"/>
      <stop offset="100%" stop-color="${palette.bg2}"/>
    </linearGradient>
    <radialGradient id="spot-${seed}" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob-${seed}-1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blob-${seed}-2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.accent2}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${palette.accent2}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="600" height="320" fill="url(#bg-${seed})"/>

  <ellipse cx="300" cy="-20" rx="260" ry="200" fill="url(#spot-${seed})"/>
  <circle cx="${blob1X}" cy="${blob1Y}" r="140" fill="url(#blob-${seed}-1)"/>
  <circle cx="${blob2X}" cy="${blob2Y}" r="110" fill="url(#blob-${seed}-2)"/>

  <g opacity="0.35">${patternSvg}</g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
