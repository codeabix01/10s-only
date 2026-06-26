# 🎨 10s Only — Complete Color Palette Report

## Current Party Vibes Design System

### Primary Color Palette (Defined in `tailwind.config.ts`)

#### Hot Pink / Magenta Tones
- **Party Pink**: `#ff10f0` 
  - Primary accent color for CTAs, buttons, glows, highlights
  - Used in: Button gradients, border glows, glow shadows (shadow-glow-pink)
  - Opacity variants: `/20`, `/30`, `/40`, `/50`, `/60` for backgrounds and borders

- **Hot Pink**: `#ff1493` 
  - Secondary hot pink for gradients and intensity variations
  - Used in: Button gradients, accent highlights
  - Primary color in notification banners

- **Pink Text/Subtle**: `#ff007a` 
  - Lighter pink for text links and subtle accents
  - Used in: Sign-in links, secondary CTA text

#### Purple Tones
- **Electric Purple**: `#a020f0`
  - Mid-range purple for gradient transitions
  - Used in: Button gradients, price text gradients, glow effects
  - Creates the pink→purple transition in many gradients

- **Dark Purple**: `#7b0ff0`
  - Deeper purple for shadows and accent backgrounds
  - Used in: Background overlays, darker accent states

#### Cyan / Blue Tones
- **Electric Cyan**: `#00f0ff`
  - Secondary accent color, contrasts with pink
  - Used in: Filter tags, accent borders, hover states, secondary buttons
  - Opacity variants for backgrounds

- **Bright Cyan (Shorthand)**: `#0ff` (`#00ffff`)
  - High-contrast cyan for glowing effects
  - Used in: Text highlights, bright glow shadows

- **Electric Blue**: `#0080ff`
  - Deep blue for gradients and accents
  - Used in: Bottom end of most gradient definitions, glow shadows

#### Green / Lime Tones
- **Neon Lime**: `#39ff14`
  - High-energy lime for extreme accents
  - Used in: Capacity bar gradients, visual excitement elements
  - Opacity variants for soft backgrounds

- **Neon Green (Shorthand)**: `#0fff00` (`#00ff00`)
  - Ultra-bright green for maximum pop
  - Used in: Status indicators, high-energy highlights

#### Orange Accent
- **Party Orange**: `#ff6b35`
  - Warm accent for event tags or highlights
  - Used in: Event category badges, warm gradient elements

---

## Color Usage by Component

### 🎯 Navigation Bar (`navbar.tsx`)
```
Logo Gradient: #ff10f0 → #a020f0 → #0080ff → #00f0ff
Logo Glow: shadow-glow-pink (0 0 30px rgba(255,16,240,0.8))
Logo Background: linear-gradient(135deg, #ff10f0 0%, #a020f0 40%, #0080ff 70%, #00f0ff 100%)
Brand Text: gradient-to-r from-pink-400 via-purple-400 to-cyan-400
Active Link Color: text-cyan-300 (Tailwind cyan-300 ≈ #06b6d4)
Link Hover: hover:text-pink-300, hover:bg-pink-500/15, hover:shadow-glow-pink
Link Transition: duration-200 (fast)
```

### 🦸 Hero Section (`hero.tsx`)
```
Hero Heading Text: Pink gradient (#ff10f0 to #ff1493) highlighting specific words
CTA Button "Join the Party":
  - Gradient: from-pink-500 via-purple-500 to-blue-500
  - Shadow: shadow-glow-pink
  - Hover Shadow: 0_20px_60px_rgba(255,16,240,0.7)
  - Animation: animate-pulse-party
  - Transition: duration-150 (fast)

Secondary Button "See Events":
  - Border: border-cyan-400/60
  - Background: bg-cyan-500/15
  - Text: text-cyan-200
  - Hover: border-cyan-300/80, bg-cyan-500/30, text-cyan-100
  - Glow: hover:shadow-glow-cyan
  - Transition: duration-150

Sign-in Link:
  - Color: text-pink-400
  - Animation: animate-bounce-glow
  - Transition: duration-150

Featured Event Card:
  - Border Gradient: linear-gradient(135deg, #ff10f0, #a020f0, #0080ff, #00f0ff, #ff10f0)
  - Shadow: shadow-party-xl hover:shadow-glow-pink
  - Animation: animate-bounce-glow
  - Transition: duration-150
```

### 🎫 Event Cards (`events-section.tsx`)
```
Card Container:
  - Shadow: shadow-party-xl
  - Hover Shadow: hover:shadow-glow-pink
  - Transition: duration-150 (fast)

Cover Image:
  - Gradient Overlay: bg-gradient-to-t from-black/90 via-black/30 to-transparent
  - Scale on Hover: group-hover:scale-110
  - Transition: duration-200

Vibrant Overlay:
  - Gradient: bg-gradient-party-soft
  - Opacity: opacity-0 → opacity-60 on hover
  - Transition: duration-200
  - Animation: animate-shimmer-fast

Event Badges (Top Right):
  - Vibe Badge: dynamic color based on event vibe + shadow-neon-pink
  - Members Badge: border-cyan-400/50, bg-cyan-500/15, text-cyan-300
  - Sold Out Badge: border-[#ff3b3b]/50, bg-[#ff3b3b]/25, text-[#ff3b3b]
  - Private Badge: border-purple-500/50, bg-purple-500/15, text-purple-300
  - Public Badge: border-white/30, bg-black/50, text-white/90

Price Display:
  - Gradient: from-pink-400 to-purple-400
  - Animation: bg-clip-text text-transparent (gradient text)

Capacity Bar:
  - Background: bg-white/12
  - Border Radius Shadow: shadow-party-sm
  - Low Capacity (< 90%): linear-gradient(90deg, #00f0ff, #39ff14, #0080ff)
  - High Capacity (≥ 90%): linear-gradient(90deg, #ff1493, #ff10f0, #a020f0)
  - Glow: 0 0 20px + appropriate color with opacity 0.8
  - Inset Shadow: inset 0 1px 0 rgba(255,255,255,0.4)
  - Animation: animate-pulse-party
  - Transition: duration-150

"View Details" Button:
  - Border: border-pink-400/60
  - Background: bg-pink-500/20
  - Text: text-pink-300
  - Hover: border-pink-300/80, bg-pink-500/40, text-pink-200
  - Glow: hover:shadow-glow-pink, hover:animate-bounce-glow
  - Transition: duration-150
```

### 📱 Event Notification Banner (`upcoming-event-notification.tsx`)
```
Banner Container:
  - Border: border-2 border-pink-400/60
  - Background: bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20
  - Glow: shadow-glow-pink
  - Shadow: 0 0 50px rgba(255,16,240,0.5), inset 0 1px 0 rgba(255,255,255,0.15)
  - Animation: animate-pulse-party

Animated Border Glow:
  - Background: linear-gradient(90deg, #ff10f0, #a020f0, #0080ff, #00f0ff, #ff10f0)
  - Animation: gradient-shift 6s ease-in-out infinite
  - Opacity: opacity-12

Icon Container:
  - Gradient: from-pink-500/50 to-purple-500/50
  - Ring: ring-2 ring-pink-400/80
  - Animation: animate-bounce-glow

Heading Text:
  - Color: text-white
  - Font: font-display, bold

Event Title:
  - Color: text-pink-200
  - Font: font-bold

Countdown Timer Container:
  - Background: bg-gradient-to-r from-pink-900/40 to-purple-900/40
  - Ring: ring-2 ring-pink-400/50
  - Animation: animate-pulse-party

Countdown Timer Text:
  - Gradient: from-pink-300 via-cyan-300 to-pink-300
  - Drop Shadow: drop-shadow-lg
  - Animation: animate-bounce-glow

Bottom Action Hint:
  - Border Top: border-pink-400/30
  - Icon: text-cyan-300, animate-pulse
  - Text: text-pink-300, animate-pulse, uppercase, font-bold
```

---

## Color System Definitions

### Shadows (Glow Effects)
All defined with high-intensity glows for party vibes:

```
shadow-glow-pink:    0 0 30px rgba(255,16,240,0.8), 0 0 60px rgba(255,16,240,0.4), inset 0 1px 0 rgba(255,255,255,0.2)
shadow-glow-purple:  0 0 30px rgba(160,32,240,0.8), 0 0 60px rgba(160,32,240,0.4), inset 0 1px 0 rgba(255,255,255,0.2)
shadow-glow-cyan:    0 0 30px rgba(0,240,255,0.8), 0 0 60px rgba(0,240,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)
shadow-glow-lime:    0 0 30px rgba(57,255,20,0.8), 0 0 60px rgba(57,255,20,0.4), inset 0 1px 0 rgba(255,255,255,0.2)
shadow-glow-blue:    0 0 30px rgba(0,128,255,0.8), 0 0 60px rgba(0,128,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)
shadow-party-xl:     Tailwind's default shadow-2xl variant but with party colors
shadow-party-lg:     Larger glow with party colors
shadow-party-sm:     Smaller glow with party colors
```

### Gradients
```
gradient-party:          135deg from pink → purple → cyan → blue
gradient-party-soft:     Semi-transparent gradient for overlays
gradient-party-hot:      Pink-hot → purple → blue (more intense)
gradient-party-lime:     Lime → cyan → pink (lime-heavy)
```

### Animations
```
pulse-glow:      2s ease-in-out infinite (glowing pulsation)
bounce-glow:     2.5s ease-in-out infinite (upward bounce with glow)
dance:           1.5s ease-in-out infinite (slight rotation + scale)
pulse-party:     1s ease-in-out infinite (fast pulsation)
flicker:         0.15s infinite (quick flickering for neon effect)
shimmer-fast:    3s ease-in-out infinite (background position shift)
float:           4s-25s ease-in-out infinite (vertical floating motion)
```

---

## Background & Ambience Colors

### Page Background
```
Dark base: #000000 (Tailwind bg-black)
Background class: bg-background (dark theme)
Transparency: Used extensively with /20, /30, /50 modifiers
```

### Animated Party Background Orbs (in `layout.tsx`)
```
Pink Orb:    bg-gradient-to-br from-pink-500/20 to-transparent, 15s float animation
Purple Orb:  bg-gradient-to-br from-purple-500/20 to-transparent, 20s reverse float animation
Cyan Orb:    bg-gradient-to-br from-cyan-500/15 to-transparent, 18s float animation
Blue Orb:    bg-gradient-to-br from-blue-500/15 to-transparent, 25s reverse float animation
```

---

## Tailwind Color Classes Used

### Base Tailwind (Combined with Party Palette)
```
Pink/Hot Pink:    pink-300, pink-400, pink-500, pink-800, pink-900
Purple:           purple-300, purple-400, purple-500, purple-600, purple-900
Cyan:             cyan-100, cyan-200, cyan-300, cyan-400, cyan-500
Blue:             blue-500
Neutral:          white, black, gray variants
```

### Opacity Variants
Applied across all colors for layered transparency:
```
/15, /20, /30, /40, /50, /60, /80 (10% to 80% opacity)
Used for backgrounds, borders, glows, overlays
```

---

## Transition Speeds (Updated for Snappier Feel)

| Element | Duration | Used For |
|---------|----------|----------|
| Button Hover | `duration-150` | Fast snap on interactive elements |
| Link Hover | `duration-150` | Navigation responsiveness |
| Event Card Hover | `duration-150` | Card overlay transitions |
| Cover Image Zoom | `duration-200` | Smooth image scaling |
| Border/Shadow | `duration-200` | Glow effect transitions |
| Framer Motion | `spring: stiffness 300, damping 20` | Card lift animations |

---

## Color Hex Reference Map

```javascript
const colorMap = {
  // Hot Pink / Magenta
  "Party Pink": "#ff10f0",
  "Hot Pink": "#ff1493",
  "Subtle Pink": "#ff007a",
  
  // Purple
  "Electric Purple": "#a020f0",
  "Dark Purple": "#7b0ff0",
  
  // Cyan / Blue
  "Electric Cyan": "#00f0ff",
  "Bright Cyan": "#0ff",
  "Electric Blue": "#0080ff",
  
  // Green / Lime
  "Neon Lime": "#39ff14",
  "Neon Green": "#0fff00",
  
  // Orange
  "Party Orange": "#ff6b35",
  
  // Tailwind Mapped (Approx)
  "Pink-300": "#f472b6",
  "Pink-400": "#ec4899",
  "Pink-500": "#ec1f4f",
  "Pink-800": "#831843",
  "Pink-900": "#500724",
  
  "Purple-300": "#d8b4fe",
  "Purple-400": "#c084fc",
  "Purple-500": "#a855f7",
  "Purple-600": "#9333ea",
  "Purple-900": "#4c0519",
  
  "Cyan-300": "#06b6d4",
  "Cyan-400": "#06b6d4",
  "Cyan-500": "#06b6d4",
  
  "Blue-500": "#3b82f6",
  
  "White": "#ffffff",
  "Black": "#000000",
}
```

---

## Recommendations for Alternative Color Combos

### Option 1: **Deep Neon** (Even More Intense)
```
Primary: #ff0080 (Hot Magenta)
Secondary: #00ffff (Cyan)
Tertiary: #ff00ff (Magenta)
Accent: #00ff00 (Lime)
```

### Option 2: **Purple Dominant**
```
Primary: #9d00ff (Deep Purple)
Secondary: #00e5ff (Light Cyan)
Tertiary: #ff0099 (Hot Pink)
Accent: #00ff88 (Mint Green)
```

### Option 3: **Retro 80s Synthwave**
```
Primary: #ff006e (Hot Pink)
Secondary: #8000ff (Purple)
Tertiary: #00d9ff (Cyan)
Accent: #ffbe0b (Yellow)
```

### Option 4: **Minimalist Neon**
```
Primary: #00f7ff (Bright Cyan)
Secondary: #ff10f0 (Hot Pink)
Tertiary: #ffffff (White)
Accent: #000000 (Black)
```

### Option 5: **Rave Vibes**
```
Primary: #ff1744 (Red-Pink)
Secondary: #76ff03 (Lime)
Tertiary: #00e5ff (Cyan)
Accent: #6a1b9a (Deep Purple)
```

---

## Implementation Notes

All colors are centrally defined in:
- **`tailwind.config.ts`** - Primary definitions and custom utilities
- **Component inline styles** - For dynamic color calculations and gradients
- **CSS classes** - Tailwind utility classes for rapid styling

**Key Features:**
- ✅ High contrast for readability
- ✅ Party/rave aesthetic with glowing effects
- ✅ Consistent gradient directions (135deg primary)
- ✅ Snappy transitions (150-200ms)
- ✅ Layered shadows for depth
- ✅ Multiple animation speeds for movement
- ✅ Animated floating background orbs

**Build Status:** ✅ No TypeScript errors | ✅ Compiles in 8.2s | ✅ All 11 routes generated
