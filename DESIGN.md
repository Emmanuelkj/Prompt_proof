# DESIGN.md

> Precision Cybernetic Security Instrument: High-density, tactical dark-mode interface built for mission-critical LLM vulnerability analysis and prompt hardening.

---

## 1. Visual Theme & Atmosphere

- **Style:** Obsidian Tactical Cybernetic (Dark Tech L2)
- **Keywords:** Cryptographic, Defensive, High-density, Precision, SOC Console, Tactical, Non-Generic
- **Tone:** Mission-critical AI security cockpit — NOT a generic AI marketing template, NOT cookie-cutter SaaS slop.
- **Feel:** A classified aerospace or SOC telemetry screen where every pixel communicates security state, real-time threat detection, and cryptographic certainty.
- **Interaction Tier:** L2 (Fluid Framer Motion micro-interactions, reactive glowing edge borders, live telemetry tickers, smooth state transitions).
- **Dependencies:** `react`, `lucide-react`, `framer-motion`, `tailwind-merge`, `clsx`.

---

## 2. Color Palette & Roles

```css
:root {
  /* Background Layers */
  --bg-base: #06080D;             /* Absolute canvas background */
  --surface-primary: #0B0F17;     /* Primary container cards */
  --surface-secondary: #101623;   /* Secondary inputs and inner boxes */
  --surface-elevated: #151D2E;    /* Floating modals and tooltips */
  --surface-hover: #1A2438;       /* Hover state on list rows */

  /* Hair-Thin Tactical Borders */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-medium: rgba(255, 255, 255, 0.14);
  --border-active: rgba(0, 242, 254, 0.4);

  /* Typography */
  --text-main: #F8FAFC;           /* High-contrast headings */
  --text-body: #94A3B8;           /* Legible secondary copy */
  --text-muted: #64748B;          /* Subtle metadata and timestamp */

  /* Threat & Status Accents */
  --accent-cyan: #00F2FE;         /* Brand accent, system telemetry */
  --accent-cyan-glow: rgba(0, 242, 254, 0.15);
  --status-pass: #10B981;         /* Emerald defense: Passed attack */
  --status-pass-bg: rgba(16, 185, 129, 0.12);
  --status-fail: #F43F5E;         /* Crimson breach: Vulnerability detected */
  --status-fail-bg: rgba(244, 63, 94, 0.12);
  --status-ambiguous: #F59E0B;    /* Amber anomaly: Refusal echo */
  --status-ambiguous-bg: rgba(245, 158, 11, 0.12);
  --accent-purple: #8B5CF6;       /* AI synthesis & Hardener engine */
}
```

### Color Rules:
1. Never use pure `#000000` or washed-out `#1F2937`; use cool obsidian `#06080D` with `#0B0F17` surfaces.
2. Every interactive status tag has a distinct background tint, hair-thin border, and high-contrast text label (not color alone).
3. Glowing accents are applied strategically to indicators and active stages—never gratuitous neon smears.

---

## 3. Typography Rules

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
```

| Role | Font Family | Size | Weight | Letter Spacing | Purpose |
|---|---|---|---|---|---|
| **App Title** | `Space Grotesk` | 1.25rem (20px) | 700 Bold | -0.03em | Brand Identity |
| **Section Headings** | `Space Grotesk` | 0.95rem (15px) | 600 SemiBold | -0.02em | Panel titles |
| **Body & Labels** | `Inter` | 0.8125rem (13px) | 400-500 | Normal | Descriptions & UI labels |
| **Telemetry & Code** | `JetBrains Mono`| 0.75rem (12px) | 500-600 | -0.01em | Tokens, markers, attack payloads |
| **Score Dial** | `JetBrains Mono`| 2.5rem (40px) | 800 ExtraBold | -0.04em | Resistance score metric |

---

## 4. Component Stylings

### Tactical Action Buttons
- Surface: Linear gradient from cyan-500 to blue-600 with 1px inset highlight.
- Active state: Subtle scale `scale-[0.98]` and shadow glow.
- Disabled state: `opacity-40 grayscale pointer-events-none`.

### Card Containers
- Background: `#0B0F17` with subtle linear gradient (`linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)`).
- Border: `1px solid rgba(255, 255, 255, 0.08)` with rounded corners (`rounded-xl`).
- Micro-texture: Subtle radial gradient backlight for focal cards.

### Live Security Table
- Dense, monospace-friendly terminal aesthetic.
- Status badges with icon + text label.
- Expandable payload inspect drawer with formatted codeblocks and copy actions.

---

## 5. Animation & Motion Design (Tier L2)

- **Entry Motion:** Staggered fade and slide-up via `framer-motion` (`initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}`).
- **Real-Time Stream:** New attack results insert smoothly with an entrance pulse.
- **Score Transition:** Arc and numerical counter animate smoothly with spring physics.
- **Accessibility:** Fully respects `prefers-reduced-motion`.

---

## 6. Do's and Don'ts

### Do:
- Use hairline borders (`border-white/10`) to separate dense operational data.
- Pair every icon with a clear contextual text label.
- Provide instant feedback (tooltips, copy checks, loading spinners).
- Maintain high information density suitable for security professionals.

### Don't:
- No generic purple "AI magic" blobs with floating emojis.
- No low-contrast grey-on-dark-grey text.
- No unstyled raw text dumps.
- No color-only status indicators.
