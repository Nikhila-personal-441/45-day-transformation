# Design Brief

## Direction

Forge — a high-energy 45-day fitness transformation brand for Indian users, built on a vibrant green/teal energy core with a warm amber action accent.

## Tone

Bold, athletic, and motivating — confident dark-first surfaces with electric green energy and warm amber drive, engineered to feel like a personal trainer pushing you forward.

## Differentiation

The signature is an energetic green-to-amber gradient identity used on CTAs, the active workout timer ring, and streak callouts — so every "do it now" moment glows with forward momentum.

## Color Palette

| Token      | OKLCH (dark)    | Role                          |
| ---------- | --------------- | ----------------------------- |
| background | 0.13 0.025 155  | deep green-black canvas       |
| foreground | 0.93 0.015 150  | primary text                  |
| card       | 0.17 0.03 155   | elevated surfaces             |
| primary    | 0.68 0.18 155   | energetic green (energy/health) |
| accent     | 0.78 0.16 70    | warm amber (action/streak)    |
| muted      | 0.21 0.03 155   | secondary surfaces            |
| success    | 0.65 0.18 150   | completion / calories         |
| warning    | 0.76 0.15 80    | streak / caution              |

## Typography

- Display: Space Grotesk — headings, hero, day numbers, big timers
- Body: DM Sans — paragraphs, UI labels, data
- Mono: JetBrains Mono — workout timer, calorie counts, numeric stats
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Layered surfaces — background, card, elevated card — with subtle cool shadows (`shadow-card`, `shadow-elevated`) and the green-to-amber gradient reserved for primary actions and active states.

## Structural Zones

| Zone    | Background          | Border     | Notes                                |
| ------- | ------------------- | ---------- | ------------------------------------ |
| Header  | bg-card             | border-b   | sticky app header, subtle elevation  |
| Content | bg-background       | —          | sections alternate bg-muted/30       |
| Footer  | bg-muted/40         | border-t   | muted footer                         |

## Spacing & Rhythm

Mobile-first with generous section gaps (space-y-12 to space-y-20); cards group tightly (gap-4) while program-grid days use compact 8px micro-spacing for density.

## Component Patterns

- Buttons: rounded-xl, gradient-primary for primary CTA, solid secondary, hover lifts with shadow-elevated
- Cards: rounded-2xl, bg-card, border-border, shadow-card, hover border-primary/40
- Badges: rounded-full pills, success green for complete, warning amber for streak, muted for locked
- Progress: rounded-full bars, primary green fill with progress-sweep shimmer on active

## Motion

- Entrance: fade-up 0.5s staggered for cards and sections
- Hover: cards lift (translate-y + shadow-elevated) via transition-smooth
- Decorative: pulse-ring around the active workout timer, float on hero stat chips, progress-sweep shimmer on in-progress bars

## Constraints

- Token-only styling: no raw hex/rgb literals or arbitrary color classes in components
- AA+ contrast in both light and dark; tune lightness, never rely on opacity for text
- 3 fonts max (Space Grotesk, DM Sans, JetBrains Mono), 3–5 core colors
- Dark mode is primary; light mode is a tuned inverse, not an afterthought

## Signature Detail

The green-to-amber gradient identity — applied to the primary CTA, the live workout timer ring, and the streak callout — is the single unmistakable mark of the Forge brand.
