# PodIQ Design System · Cobalt

The official design system for **PodIQ** — Kubernetes pod intelligence with a memory engine. Cobalt is one of three explored directions and the one we shipped with: Inter / Inter Tight pairing on a warm-grey paper, with a single bold orange accent and a four-tone semantic scale built for operational dashboards.

## What's in here

```
/                       — root
├── colors_and_type.css — all tokens (light + dark) · drop into any HTML
├── README.md           — this file
├── SKILL.md            — Claude skill manifest (also Anthropic Agent Skill compatible)
├── assets/             — logos, marks, brand bits
├── preview/            — Design System cards (each one is a tiny HTML doc)
├── ui_kit/             — JSX recreation of the live product surfaces
└── slides/             — (not in this brand — use the deck starter)
```

The full hi-fi mocks live one floor up at `/PodIQ Hi-fi.html` and the original wireframes at `/PodIQ Wireframes.html`. Treat those as the source of truth for screen-level patterns.

## Brand at a glance

**PodIQ** watches your Kubernetes pods, remembers every incident, and tells you exactly what's about to break — before it does. The product is for **platform / SRE / on-call** engineers who are tired of debugging the same outage twice. The differentiator is the **memory engine** — fingerprinting incidents and recognising patterns across deploys, services and clusters.

The brand is sober, technical, and a little dry. The product is the hero — never the marketing copy.

---

## Content fundamentals

**Tone.** Direct. Lowercase technical labels. No exclamation marks. We use "you" (the operator) and "PodIQ" (the product, in third person — *"PodIQ matched this pattern at 12:37"*). Never "we" inside the product UI. Never "I" except in surfaced AI summaries where attribution is part of the message: *"I've seen this 3 times this month."*

**Casing.** Sentence case for everything: titles, buttons, table headers. Two exceptions:
- **UPPERCASE 0.06em** for eyebrows, table column headers and meta labels — always paired with `--font-mono`.
- **lowercase** for tags ("crit", "ok", "stale", "FP-0142") — always paired with `--font-mono`.

**Numbers.** Always tabular nums on. Always units inline (`4m 12s`, `412ms`, `−42%`, `€840`). Use `−` (figure dash) not `-`. Show the baseline alongside the delta whenever space allows.

**Don'ts.**
- No emoji except a single 🍪 on the cookie banner (intentional).
- No vague AI-speak ("leverage", "supercharge", "magical").
- No exclamation marks.
- No "Welcome!" or "Awesome!" microcopy.
- No "powered by AI" — the product *is* AI; we don't need to say so.

**Examples from the live product.**

> "Your cluster doesn't have to crash twice."
> "Memory beats monitoring."
> "I've seen this 3 times this month. Each time, a redeploy of `auth-api@2.4.x`."
> "This config matches an outage you already had."
> "We never read pod stdout/stderr by default — only event metadata."

---

## Visual foundations

### Type

- **Display · `Inter Tight`** — weights 500–700, tracking `-0.025em` to `-0.035em`. Used for marketing heroes, page titles, KPI numbers, card titles.
- **Body · `Inter`** — weights 400–600. 13.5px is default body. 15px for emphasis (heroes, top-cards). 12px for captions.
- **Mono · `JetBrains Mono`** — weights 400–600, with `ss01` + `cv11` + `tnum`. Used for: pod identifiers, code, API keys, tags, ALL numeric metrics, column headers, meta labels.

Always pair display with mono nearby. The contrast between "Inter Tight 600 -0.02em" and "JetBrains Mono 500" is the brand's primary type signature.

### Color

- **Neutral · warm-grey paper.** Background is *not* white — it's `#fafaf7`. Cards are pure `#ffffff` and earn their place by sitting *above* the bg. This warmth is essential — never use cool greys.
- **Accent · single PodIQ orange `#d97706`.** One accent, used sparingly. Tinted `--accent-soft` is for tags, callouts, "PodIQ said this" surfaces. Never use accent on body text — only `--accent-ink` (`#b25c00`).
- **Semantic · four tones** — ok (forest green), warn (amber), crit (deep red), info (teal). Each has a `-soft` companion for chips and bands. Never use semantic tones decoratively.

### Spacing & radii

- 4-pt grid. Standard gaps are 8, 12, 16, 24.
- Radius: cards `10`, buttons/inputs `6`, chips `4`, pills `999`. We avoid the 16-20px "soft tech" radii.

### Elevation

Four shadow stops, all warm and low-contrast:
- `--shadow-xs` — flat dividers
- `--shadow-sm` — every card, every button
- `--shadow-md` — popovers, tooltips
- `--shadow-lg` — modals, command palette

We never use coloured shadows.

### Layout & rhythm

- **App shell** is a 220px left sidebar (`var(--surface)`), 56px topbar with breadcrumb above title, and a 24-padding content area. Always 1400×880 in our hi-fi exports.
- **Marketing** is 1400 wide, 48px padding, generous whitespace. Card-grid features. No bento.
- **Tables** are flat (no zebra). Headers in `--surface-2` with uppercase mono labels. Rows have 1px `--border` dividers. Critical rows get a 3px `--crit` left border plus a 30%-tint background — never a glow or full-row colour wash.

### Backgrounds & decoration

- **No gradients.** Anywhere. Except the Help page hero (`accent-soft → surface`) which is intentional and reserved.
- **No patterns**, except: the onboarding right-side panel uses a 24px-grid of 1px dots at 0.6 opacity, very subtle. Use sparingly.
- **No textures, no grain, no noise.** PodIQ is digital — we lean into it.

### Animation

- 150ms ease-out for toggles, hovers, accordions.
- Pulse halo on the firing crit dot — 2s loop, expand-then-fade, never bouncy.
- No springs, no parallax, no scroll-driven animation.
- Page transitions: fade-only, 120ms.

### Interactive states

- **Hover** — cards lift via `--shadow-md`. Buttons: primary stays accent, secondary swaps bg to `--surface-2`. Ghost buttons get `--surface-2` bg.
- **Focus** — 3px `--accent-soft` ring + border swaps to `--accent`. Never blue (browser default) — override globally.
- **Press** — 1px translateY, 100ms.
- **Disabled** — 50% opacity, `cursor: not-allowed`. Never grey out colours individually.

### Transparency & blur

- The command palette and PR-preview modals use a 40% `--ink`-mix backdrop. No blur except on the iOS lockscreen mock (intentional iOS pattern).
- The marketing topbar gets a 90% bg colour + 8px backdrop-blur on scroll. Single exception.

### Imagery

We don't use stock photos. We don't use illustrations. The product UI itself is the imagery — terminal mockups, dashboard fragments, and the orange-on-warm-grey pairing carry every page. If we ever need a hero image: black & white, generous negative space, high-contrast.

---

## Iconography

We use **Lucide icons** (custom-drawn from the same path data) at 14–22px, stroke 1.6, line-cap and join `round`. Inline SVG, current colour. The icon set is intentionally small and tight — auth (`shield`, `key`, `user`), state (`alert`, `check`, `clock`, `bolt`), nav (`cube`, `bell`, `git`, `settings`), motion (`refresh`, `arrow`, `chevron`).

We never use:
- Emoji as icons (one intentional 🍪 exception).
- Heroicons solid fills.
- Filled glyph systems (Phosphor fill, etc).
- Brand logos for integrations — instead, a 32×32 tile with the first two letters in mono.

When we don't have a Lucide path, we sub-in the closest match and stamp the path data into `hifi/icons.jsx`.

---

## Light & dark

Both modes are first-class. The product remembers user preference. Cobalt-dark shifts:
- Background pure cool-warm black `#0c0c0b`
- Surfaces step `#161614 → #1f1e1c`
- Accent shifts to a brighter amber `#f59e0b` so it sits comfortably against the dark
- Semantic tones brighten and pair with low-alpha `-soft` backgrounds (10% opacity)

All cards, tokens and components inherit via CSS variables — never hardcode hex values in components.

---

## Index

| File / folder | What it is |
|---|---|
| `colors_and_type.css` | The full token sheet. Drop into any HTML and you have Cobalt. |
| `assets/logo-mark.svg` | Square 32px mark · ink on warm-grey |
| `assets/logo-mark-orange.svg` | Square 32px mark · accent fill |
| `assets/logo-wordmark.svg` | Full wordmark · ink |
| `preview/*.html` | One card per design-system concept. These are what populate the Design System tab. |
| `ui_kit/index.html` | Live UI kit — links into the hi-fi screens via reusable React components. |
| `SKILL.md` | Manifest for using this design system as a Claude skill. |
| `../PodIQ Hi-fi.html` | All 25 product screens, source of truth for screen-level patterns. |
| `../PodIQ Wireframes.html` | Lo-fi wireframes (still useful for IA discussions). |

---

## Caveats

- The **logo** is currently a typographic placeholder (`P` in Inter Tight). When you have a final mark, swap `assets/logo-*.svg` and the design system tab will pick it up automatically.
- We sub-in **Lucide-derived** SVG paths inline. If you adopt the real Lucide React package downstream, the names match 1:1.
- Slides aren't included in this design system because PodIQ doesn't ship a deck template — use the project's built-in `deck_stage.js` starter and feed it Cobalt tokens.
