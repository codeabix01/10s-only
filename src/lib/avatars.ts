// ============================================================================
// 10s Only — SVG Avatar Generator
// Deterministic gradient + initials. No Math.random.
// ============================================================================

const AVATAR_GRADIENTS: ReadonlyArray<[string, string]> = [
  ["#C6A769", "#A89878"],
  ["#A89878", "#C6A769"],
  ["#D6B77A", "#C6A769"],
  ["#C6A769", "#8A7A60"],
  ["#B09060", "#C6A769"],
  ["#A89878", "#D6B77A"],
  ["#C6A769", "#B09060"],
  ["#D6B77A", "#A89878"],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates a deterministic SVG avatar (data URI) from a name.
 * Uses initials over a neon gradient background.
 */
export function getAvatar(name: string): string {
  const seed = hashString(name || "anon");
  const [c1, c2] = AVATAR_GRADIENTS[seed % AVATAR_GRADIENTS.length];
  const initials = getInitials(name);
  const angle = seed % 360;
  const id = `av-${seed}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="30%" cy="25%" r="80%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.35)"/>
      <stop offset="60%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="128" height="128" rx="64" fill="url(#${id})"/>
  <rect width="128" height="128" rx="64" fill="url(#${id}-glow)"/>
  <text x="50%" y="50%" dy="0.36em" text-anchor="middle"
    font-family="'Space Grotesk', 'Inter', system-ui, sans-serif"
    font-size="48" font-weight="700" fill="#ffffff" letter-spacing="-1">${initials}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
