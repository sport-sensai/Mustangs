# FLXPOD OS Design System

Version 1.0 — Extracted from `flxpod_os_timer.html` (June 2026)

This document is the canonical design reference for FLXPOD OS. Every value was extracted from the production application. Nothing was invented, modernized, or reinterpreted.

---

## Deliverable 1 — Design Audit

### Visual Identity

#### Logo

| Rule | Value |
|---|---|
| Format | White monochrome SVG vector, single `<path>` element |
| Color | `#FFFFFF` only. No color variants exist |
| Background | Always on `#000000`. No light-mode variant exists |
| Aspect ratio | 1033:312 (approx 3.31:1, wide horizontal wordmark) |
| Rendering | `object-fit: contain` — never stretch, never crop |

**Logo Placement Rules**

| Context | Position | Sizing | Opacity |
|---|---|---|---|
| Setup header | Left-aligned, vertically centered in header row | `height: clamp(32px, 4.5vw, 48px)` | 1.0 (full) |
| TV running screen | Absolute positioned, top center | `height: clamp(35px, 11vh, 140px)`, `max-width: 45vw` | 0.7 |
| Transition screen | Absolute positioned, top center | `height: clamp(70px, 22vh, 280px)`, `max-width: 55vw` | 0.7 |

**Logo Clear Space**

- Setup header: Logo sits against left padding edge (20-24px). Clock text right-aligned provides natural clear space.
- TV mode: Minimum top offset `clamp(30px, 10%, 80px)` from viewport edge. Horizontally centered via `left:50%; transform:translateX(-50%)`.
- Transition: Minimum top offset `clamp(20px, 5%, 60px)`.

**Logo Opacity Rule**: When the logo coexists with a dominant data element (timer, transition text), it renders at `opacity: 0.7`. When it is the primary brand element in a header bar, it renders at full opacity.

#### Brand Personality

FLXPOD OS communicates through five channels:

| Channel | Expression |
|---|---|
| **Premium** | Reduced color palette. High contrast. Nothing decorative. Every element earns its pixel. |
| **Industrial** | Seven-segment LED display. Monochrome logo. Raw numeric data. No illustrations, no gradients, no rounded-friendly shapes. |
| **Operational** | Full-bleed black canvas. Status-driven color (green/yellow/red). Information hierarchy optimized for glance-reading at distance. |
| **Athletic** | Phase chips (WORK/REST). Interval structure. Round counters. Countdown beeps. Voice callouts. Everything serves the training floor. |
| **Minimalist** | Single typeface. No icons except the logo. No decorative borders. No background textures. No imagery. |

**Overall Visual Tone**: Mission control, not fitness app. The aesthetic references aerospace operations software (SpaceX-style precision) rather than consumer health products. The interface exists to deliver data, not to engage or entertain.

---

### Color System

#### Color Tokens

```css
:root {
  /* ── Backgrounds ── */
  --bg-primary:          #000000;
  --bg-secondary:        rgba(255, 255, 255, 0.03);
  --bg-card:             rgba(255, 255, 255, 0.03);
  --bg-card-hover:       rgba(255, 255, 255, 0.08);
  --bg-overlay:          rgba(0, 0, 0, 0.96);
  --bg-switch-off:       rgba(255, 255, 255, 0.08);
  --bg-switch-on:        rgba(255, 255, 255, 0.18);

  /* ── Borders ── */
  --border-primary:      rgba(255, 255, 255, 0.08);
  --border-secondary:    rgba(255, 255, 255, 0.10);
  --border-divider:      rgba(255, 255, 255, 0.06);
  --border-divider-soft: rgba(255, 255, 255, 0.03);

  /* ── Text ── */
  --text-primary:        #FFFFFF;
  --text-secondary:      rgba(255, 255, 255, 0.5);
  --text-tertiary:       rgba(255, 255, 255, 0.35);
  --text-quaternary:     rgba(255, 255, 255, 0.25);
  --text-ghost:          rgba(255, 255, 255, 0.2);
  --text-whisper:        rgba(255, 255, 255, 0.15);
  --text-label:          rgba(255, 255, 255, 0.4);
  --text-muted:          rgba(255, 255, 255, 0.3);

  /* ── Status ── */
  --status-green:        #36e25b;
  --status-green-bg:     #06160a;
  --status-green-glow:   rgba(54, 226, 91, 0.1);
  --status-green-border: rgba(54, 226, 91, 0.5);
  --status-yellow:       #ffce2e;
  --status-yellow-bg:    #1a1300;
  --status-red:          #e8271b;
  --status-warning:      #f5c518;

  /* ── LED Display ── */
  --led-red-on:          #ff3030;
  --led-red-off:         rgba(255, 70, 70, 0.06);
  --led-red-glow:        rgba(255, 40, 40, 0.55);
  --led-green-on:        #36e25b;
  --led-green-off:       rgba(90, 255, 130, 0.07);
  --led-green-glow:      rgba(50, 230, 90, 0.5);

  /* ── Progress Bar ── */
  --bar-track:           rgba(255, 255, 255, 0.06);
  --bar-fill:            rgba(255, 255, 255, 0.7);
  --bar-warning:         #f5c518;
  --bar-critical:        #e8271b;

  /* ── Interactive ── */
  --btn-primary-bg:      #FFFFFF;
  --btn-primary-text:    #000000;
  --switch-knob-off:     rgba(255, 255, 255, 0.25);
  --switch-knob-on:      #FFFFFF;
}
```

#### Color Usage Rules

1. The only full-opacity white (`#FFFFFF`) elements are: logo on setup header, primary button background, active switch knob, LED segment text, and active preset card text.
2. All other white elements use alpha transparency against `#000000`. This creates depth without introducing new hues.
3. Color enters the system exclusively through status states: green (active/go), yellow (warning/rest), red (critical/urgent).
4. Status colors are never decorative. They always communicate operational state.
5. The green-on-black and red-on-black LED palette is the signature visual. It must never be replaced with flat text.

---

### Typography System

#### Font Stack

```css
font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
```

Barlow is the sole design typeface. System fonts exist only as fallbacks. All weights load via Google Fonts: 300, 400, 500, 600, 700.

#### Typography Tokens

| Token | Size | Weight | Letter Spacing | Usage |
|---|---|---|---|---|
| `display-xl` | `clamp(40px, 8vw, 130px)` | 600 | 0.12em | Transition screen headline text |
| `display-lg` | N/A (LED segments) | N/A | N/A | TV timer — rendered via CSS seven-segment display, not font |
| `display-md` | N/A (LED segments) | N/A | N/A | Setup timer preview — smaller LED segments |
| `heading-lg` | `clamp(16px, 2.5vw, 24px)` | 500 | 0.15em | Overlay prompt text (sound unlock) |
| `heading-md` | 20px | 500 | 0.04em | Stepper values (work/rest/rounds display) |
| `label-md` | 14px | 400 | 0.02em | Toggle labels, body text |
| `label-sm` | 13px | 600 | 0.04em | Preset tile name, navigation text |
| `label-xs` | `clamp(11px, 1.2vw, 16px)` | 600 | 0.18em | Phase chips (WORK/REST) |
| `caption-md` | 12px | 400 | 0.15em | Setup header clock |
| `caption-sm` | 11px | 500 | 0.15em–0.20em | Section headings, stepper labels |
| `caption-xs` | 10px | 400–500 | 0.04em–0.22em | Preset descriptions, group labels, footer text |
| `meta` | `clamp(11px, 1.1vw, 17px)` | 400 | 0.18em | TV info bar (clock, round label) |
| `meta-sm` | `clamp(11px, 1.4vw, 14px)` | 400 | 0.08em | Overlay subtext |

#### Typography Rules

1. **All text is uppercase.** Applied via CSS `text-transform: uppercase` or content authored in caps. There are zero instances of sentence case or title case in the UI.
2. **Letter spacing scales with importance.** Display text: 0.12em. Labels: 0.15em–0.22em. Body text: 0.02em–0.04em.
3. **`font-variant-numeric: tabular-nums`** is applied to any element displaying time or numeric data (stepper values, clock, meta bar).
4. **Line height** is not explicitly set on most elements (inherits browser default ~1.2). Transition text uses `line-height: 1.15`.
5. **Weight distribution**: 400 (body/labels), 500 (section headings, navigation, values), 600 (buttons, preset names, chips, display text), 700 (loaded but reserved).

---

### Layout System

#### Spacing Tokens

```css
:root {
  --space-3:   3px;
  --space-4:   4px;
  --space-6:   6px;
  --space-8:   8px;
  --space-10:  10px;
  --space-12:  12px;
  --space-14:  14px;
  --space-16:  16px;
  --space-20:  20px;
  --space-24:  24px;
  --space-28:  28px;
}
```

#### Page-Level Layout

| Context | Padding | Max Width | Alignment |
|---|---|---|---|
| Setup screen | `20px 24px 24px` | None (full width, content constrained) | Column, top-aligned, scrollable |
| TV screen | `6% 5% 6%` | None (full viewport) | Column, vertically centered |
| Transition screen | `5%` all sides | None (full viewport) | Column, vertically centered |
| Overlay (sound unlock) | `0 20px` (text padding only) | None | Column, vertically centered |

#### Content Width Constraints

- Setup body content: `max-width: 400px`, horizontally centered
- Primary button: `max-width: 400px`, full width within constraint
- TV progress bar: `width: clamp(200px, 50vw, 800px)` — always horizontally centered
- TV logo: `max-width: 45vw`

#### Responsive Strategy

All responsive sizing uses `clamp()` functions. No media queries exist. No breakpoints are defined. The system scales fluidly between iPad portrait and TV landscape via viewport units (`vw`, `vh`) bounded by pixel minimums and maximums.

| Element | Clamp Pattern |
|---|---|
| Setup logo | `clamp(32px, 4.5vw, 48px)` |
| TV logo | `clamp(35px, 11vh, 140px)` |
| LED digit (setup) | `clamp(36px, 7vw, 80px)` |
| LED digit (TV) | `clamp(56px, 13vw, 190px)` |
| Section margins | `clamp(16px, 2.5vh, 28px)` |
| Header padding-bottom | `clamp(12px, 2vh, 20px)` |
| Header margin-bottom | `clamp(16px, 3vh, 28px)` |

#### Vertical Rhythm

Setup screen uses sequential sections with `margin-bottom: clamp(16px, 2.5vh, 28px)` between them. No fixed grid. Content flows vertically with `overflow-y: auto`.

TV screen uses flexbox centering with the logo removed from flow (absolute positioned). Remaining content vertically centers in the padded viewport area.

#### Safe Areas

- TV overscan: `6%` symmetric top/bottom padding, `5%` horizontal
- TV logo inset: `clamp(30px, 10%, 80px)` from top edge
- Navigation elements: `clamp(14px, 3vh, 36px)` from top, `clamp(16px, 3vw, 44px)` from sides
- iOS viewport: `viewport-fit=cover` with no `env(safe-area-inset)` adjustments (full-bleed design)

---

### Border System

#### Border Tokens

```css
:root {
  --radius-sm:   2px;   /* Progress bar */
  --radius-md:   4px;   /* Phase chips */
  --radius-lg:   6px;   /* Cards, buttons */
  --radius-pill: 999px; /* Toggle switches */

  --border-width:  1px;  /* All borders */
  --divider-width: 1px;  /* All dividers */
  --bar-height:    3px;  /* Progress bar track */
}
```

#### Border Rules

1. There is exactly one border width in the system: `1px`. No 2px borders exist.
2. Border radius has four tiers: 2px (progress bar), 4px (chips), 6px (cards/buttons), 999px (pill switches).
3. Borders use alpha-transparent white: `rgba(255,255,255, 0.08)` (cards) or `rgba(255,255,255, 0.10)` (interactive controls).
4. Dividers use softer alpha: `rgba(255,255,255, 0.06)` (section dividers) or `rgba(255,255,255, 0.03)` (row dividers).
5. Selected state borders use status green with alpha: `rgba(54, 226, 91, 0.5)`.

---

### Shadow System

#### Glow Effects (the only shadows in the system)

| Effect | Value | Usage |
|---|---|---|
| LED segment glow | `box-shadow: 0 0 calc(var(--w)*0.12) var(--glow)` | Active LED segments (red and green) |
| LED colon glow | `box-shadow: 0 0 calc(var(--ledw)*0.1) rgba(255,40,40,.55)` | Colon dots in timer display |
| Selected card glow | `box-shadow: 0 0 12px rgba(54,226,91,.1)` | Selected preset tile |

**There are no drop shadows.** No `box-shadow` with offset values exists anywhere in the system. No elevation system exists. No card shadows exist. No hover shadows exist. Depth is communicated exclusively through opacity layers and subtle glow on active/selected states.

---

## Deliverable 2 — Component Library

### Buttons

#### Primary Button (`.start-btn`)

```
Background:    #FFFFFF
Text color:    #000000
Font size:     14px
Font weight:   600
Letter spacing: 0.2em
Padding:       16px 0
Border:        none
Border radius: 6px
Width:         100%, max-width 400px
```

**States:**
- Default: White background, black text
- Active (pressed): `transform: scale(0.98); opacity: 0.9`
- Disabled: Not implemented (no disabled state exists in the current system)

#### Secondary Button (`.flx-save-btn`)

```
Background:    rgba(255, 255, 255, 0.04)
Text color:    rgba(255, 255, 255, 0.4)
Font size:     11px
Font weight:   500
Letter spacing: 0.15em
Padding:       8px 0
Border:        1px solid rgba(255, 255, 255, 0.1)
Border radius: 6px
Width:         100%
```

**States:**
- Default: Near-transparent background, muted text
- Active: `transform: scale(0.98); background: rgba(255,255,255,0.08)`

#### Stepper Button (`.flx-sbtn`)

```
Background:    rgba(255, 255, 255, 0.04)
Text color:    rgba(255, 255, 255, 0.5)
Font size:     20px
Font weight:   500
Size:          40px x 40px
Border:        1px solid rgba(255, 255, 255, 0.1)
Border radius: 6px
```

**States:**
- Default: Subtle background, medium-opacity text
- Active: `transform: scale(0.96); background: rgba(255,255,255,0.08)`

#### Ghost Button (`.tv-back`)

```
Background:    transparent
Text color:    rgba(255, 255, 255, 0.2)
Font size:     13px
Font weight:   500
Letter spacing: 0.15em
Padding:       8px 4px
Border:        none
```

**States:**
- Default: Very low opacity text, invisible background
- Active: `color: rgba(255,255,255,0.5)`

#### Delete Button (`.flx-preset-del`)

```
Background:    transparent
Text color:    rgba(255, 255, 255, 0.2)
Font size:     14px
Padding:       2px 4px
Border:        none
Position:      absolute top-right of parent card
```

**States:**
- Active: `color: rgba(255,255,255,0.5)`

---

### Cards

#### Preset Card (`.flx-preset`)

```
Background:    rgba(255, 255, 255, 0.03)
Border:        1px solid rgba(255, 255, 255, 0.08)
Border radius: 6px
Padding:       10px 8px
Text align:    center
Position:      relative (for delete button positioning)
```

**Card content structure:**
```
.pn  — Name:        13px, weight 600, spacing 0.04em, white
.pd  — Description: 10px, weight 400, spacing 0.04em, rgba(255,255,255,0.3), margin-top 3px
```

**States:**
- Default: Subtle background, muted border
- Selected (`.sel`): `border-color: rgba(54,226,91,0.5); box-shadow: 0 0 12px rgba(54,226,91,0.1)`
- Active (pressed): `transform: scale(0.98)`

**Grid layout:** `grid-template-columns: 1fr 1fr; gap: 6px`

---

### Toggle Switch (`.switch`)

```
Width:         42px
Height:        24px
Border radius: 999px (pill)
Background:    rgba(255, 255, 255, 0.08)
Knob size:     18px x 18px
Knob offset:   3px from edge
Transition:    background 0.2s, knob position 0.15s ease
```

**States:**
- Off: `background: rgba(255,255,255,0.08)`, knob at `left: 3px`, knob color `rgba(255,255,255,0.25)`
- On (`.on`): `background: rgba(255,255,255,0.18)`, knob at `left: 21px`, knob color `#FFFFFF`

---

### Status Indicators

#### Phase Chips (`.flx-chip`)

```
Padding:       5px 14px
Border radius: 4px
Font weight:   600
Letter spacing: 0.18em
Font size:     clamp(11px, 1.2vw, 16px)
```

| State | Background | Text | Border |
|---|---|---|---|
| Inactive | transparent | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.08)` |
| Work active | `#36e25b` | `#06160a` | `#36e25b` |
| Rest active | `#ffce2e` | `#1a1300` | `#ffce2e` |

**Usage rule:** Chips are hidden entirely when `restSec === 0` (coaching mode). They only appear during interval training (conditioning mode with rest > 0).

#### Progress Bar States

| State | Bar Color | Trigger |
|---|---|---|
| Normal | `rgba(255,255,255,0.7)` | `remaining > 60` |
| Warning | `#f5c518` | `remaining <= 60` |
| Critical | `#e8271b` | `remaining <= 10` |

#### Pause Indicator (`.tv-paused`)

```
Position:      absolute, top-right corner
Font size:     13px
Font weight:   500
Letter spacing: 0.2em
Color:         rgba(255, 255, 255, 0.35)
Animation:     1.2s ease-in-out infinite blink (opacity 1 → 0.3 → 1)
```

---

### Progress Indicators

#### Progress Bar

```
Track:         height 3px, border-radius 2px, rgba(255,255,255,0.06)
Fill:          border-radius 2px, transition width 0.12s linear
Width:         clamp(200px, 50vw, 800px)
```

The bar fills left-to-right as time elapses. It represents elapsed percentage of the current phase: `(phaseDur - remaining) / phaseDur * 100`.

#### Seven-Segment LED Timer

The primary data display. Not a font — each digit is constructed from 7 CSS elements using `clip-path` polygons.

```
Digit width:      var(--w)
Digit height:     calc(var(--w) * 1.84)
Segment thickness: calc(var(--w) * 0.17)
Digit spacing:    calc(var(--w) * 0.07)
Skew:             -5deg (italic lean)
```

**Two display contexts:**
- Setup: `--ledw: clamp(36px, 7vw, 80px)` — preview size
- TV: `--ledw: clamp(56px, 13vw, 190px)` — full presentation size

**Color channels:**
- Time digits: Red (`#ff3030` on, `rgba(255,70,70,0.06)` off)
- Round digits: Green (`#36e25b` on, `rgba(90,255,130,0.07)` off)
- Round digits are 56% the width of time digits

---

### Headers

#### Setup Header

```
Layout:        flex, space-between, vertically centered
Padding bottom: clamp(12px, 2vh, 20px)
Border bottom: 1px solid rgba(255,255,255,0.06)
Margin bottom: clamp(16px, 3vh, 28px)
```

Left: Logo. Right: Clock (12px, weight 400, spacing 0.15em, `rgba(255,255,255,0.3)`).

#### Section Header (`.flx-groupLabel`)

```
Font size:     10px
Font weight:   500
Letter spacing: 0.22em
Color:         rgba(255, 255, 255, 0.25)
Margin:        14px 0 6px
Text transform: uppercase (content authored in caps)
```

#### Audio Section Header (`.setup-section h2`)

```
Font size:     11px
Font weight:   500
Letter spacing: 0.2em
Color:         rgba(255, 255, 255, 0.3)
Margin bottom: 10px
Text transform: uppercase
```

---

### Navigation

#### Setup → TV Transition

No animation. Immediate screen swap via `display: none/flex`. Triggered by primary button ("START SESSION").

#### TV → Setup Transition

Ghost button "← END" in top-left corner. Resets timer, releases wake lock, exits fullscreen.

#### Keyboard: `Escape` key triggers exit.

#### Tap-to-pause: Full TV screen area is a tap target for pause/resume (excludes END button). No visual button — the entire viewport responds.

---

### Footer

```
Padding top:   clamp(10px, 2vh, 16px)
Border top:    1px solid rgba(255,255,255,0.03)
Text:          10px, weight 400, spacing 0.15em, rgba(255,255,255,0.15)
Alignment:     center
Content style: UPPERCASE · SEPARATED BY MIDDOT
```

---

## Deliverable 3 — Interaction Principles

### UX Philosophy

These principles were extracted from the existing product behavior:

1. **One-glance comprehension.** The LED timer dominates the TV screen. A trainer 30 feet away can read the time and round. No squinting, no parsing.

2. **Operational clarity.** Green means go (work active, round counter). Yellow means caution (time warning, rest phase). Red means urgent (final seconds, critical state). No ambiguity.

3. **Minimal cognitive load.** Setup presents presets first, manual config second. TV mode shows only the timer and phase state. Nothing to think about during a session.

4. **Large tap targets.** Stepper buttons: 40x40px. Primary button: full-width. Pause: entire screen. Toggle switches: 42x24px. Nothing requires precision aim.

5. **Readable at distance.** TV LED digits scale to `clamp(56px, 13vw, 190px)`. Phase chips and progress bar are the only secondary elements. Clock and metadata at very low opacity.

6. **Calm interface.** The setup screen scrolls quietly. No progress spinners, no loading states, no notifications, no badges. The system waits until you tell it to go.

7. **Audio as interface.** Voice callouts ("One minute remaining", "Thirty seconds", "Ten seconds", "Rest", "Session complete") extend the UI to athletes who cannot see the screen. Triple-beep patterns for state changes. Single beeps for countdown. Sound is a first-class output channel.

8. **Zero onboarding.** Tap to enable sound → pick a preset → start session. Three interactions from launch to running timer.

---

### Information Hierarchy

#### TV Screen (Running Mode)

| Level | Element | Treatment |
|---|---|---|
| **Dominant** | LED timer (MM:SS) | Largest element. Red segments, centered vertically. |
| **Primary** | Round counter | Green LED segments, smaller, left of timer. |
| **Secondary** | Phase chips (WORK/REST) | Status-colored when active, ghost when inactive. Hidden in coaching mode. |
| **Secondary** | Progress bar | Thin 3px line. Color shifts with urgency. |
| **Tertiary** | Clock time | Very low opacity (0.2), bottom center. |
| **Ambient** | Logo | 70% opacity, top center, out of content flow. |
| **Ambient** | END button | 20% opacity, top-left. Invisible until needed. |

#### Setup Screen

| Level | Element | Treatment |
|---|---|---|
| **Primary** | LED preview + phase chips | Top of scroll area, shows current config. |
| **Primary** | Preset grid | Immediately below, scannable tiles. |
| **Secondary** | Steppers (work/rest/rounds) | Below presets, for manual adjustment. |
| **Tertiary** | Audio toggles | Below steppers, set-and-forget. |
| **Action** | START SESSION button | Full-width white, maximum contrast. Always visible above fold on iPad. |
| **Ambient** | Header (logo + clock) | Top bar, very low visual weight. |
| **Ambient** | Footer text | Near-invisible, system status. |

#### Emphasis Rules

- Emphasis is applied through **size** (LED segments are 10x–20x larger than labels) and **opacity** (dominant: 1.0, secondary: 0.3–0.5, ambient: 0.15–0.2).
- **Color is never used for emphasis** except status states. Important ≠ colorful. Important = large and high-contrast.
- **White on black** is the only emphasis mechanism for non-status elements.

---

### Animation Rules

| Interaction | Behavior | Duration |
|---|---|---|
| Button press | `transform: scale(0.96–0.98); opacity: 0.9` | Instant (CSS `:active`) |
| Toggle switch slide | Background + knob position | `0.15s ease` (knob), `0.2s` (background) |
| Progress bar fill | `width` transition | `0.12s linear` |
| Pause indicator blink | Opacity 1 → 0.3 → 1 | `1.2s ease-in-out infinite` |
| Ghost button hover | `color` transition | `0.2s` |
| Preset card selection | Border color + box shadow | `0.15s` (via `transition: all`) |
| Screen transitions | `display: none ↔ flex` | **Instant. No animation.** |

#### Animation Constitution

1. **No page transitions.** Screens swap instantly. No fades, slides, or morphs.
2. **No entrance animations.** Elements appear at their final position. No fly-ins, no scale-ups.
3. **No loading animations.** The application is a single HTML file. There is nothing to load.
4. **Micro-interactions only.** The only animations are direct responses to touch: button depression, switch toggle, progress fill.
5. **Maximum duration: 0.2s** for any non-looping animation. The pause blink is the only infinite animation.

---

## Deliverable 4 — FLXPOD OS Design Constitution

### ALWAYS

- **Use black backgrounds.** `#000000` is the canvas. There is no dark gray, no charcoal, no near-black. Pure black.
- **Maintain visual simplicity.** Every screen should pass the "screenshot test" — a stranger seeing a screenshot should understand the primary action within 1 second.
- **Prioritize one dominant element per screen.** Setup: the preset grid. TV: the LED timer. Transition: the headline text. Never two things competing.
- **Use large, readable typography.** Timer digits must be legible from 30+ feet. Labels and controls must be legible from arm's length on iPad.
- **Preserve operational focus.** This is a tool used during live coaching sessions. Every element must justify its existence by serving the person running the session.
- **Communicate state through opacity.** Primary elements at full opacity. Secondary at 0.3–0.5. Ambient at 0.15–0.25. This creates hierarchy without color.
- **Restrict color to status.** Green = active/go. Yellow = warning/rest. Red = critical/stop. White = neutral data. No other colors.
- **Use CSS `clamp()` for all sizing.** Set a minimum (iPad), a preferred (viewport-relative), and a maximum (TV). No media queries. No breakpoints.
- **Keep all text uppercase.** The system speaks in commands, not sentences.
- **Maintain the Barlow typeface.** One font family. All weights from one source. No mixing.
- **Preserve the LED display.** The seven-segment clock is the product's signature element. It appears on every screen that displays time.
- **Design for gloves and sweat.** Large tap targets. Full-screen pause zones. No precision interactions.

### NEVER

- **Introduce blue, purple, or SaaS colors.** No `#4A90D9`, no `#6C5CE7`, no gradient CTAs. The color palette is black, white, green, yellow, red. Period.
- **Introduce glassmorphism.** No `backdrop-filter: blur()`, no frosted glass, no transparency layering over content.
- **Introduce neon effects.** The LED glow is subtle (`box-shadow` at 0.1–0.55 opacity). No `text-shadow` neon, no animated glows, no cyberpunk aesthetics.
- **Create cluttered dashboards.** No stat grids, no metric cards, no multi-widget layouts. One dominant element per screen.
- **Use generic fitness app aesthetics.** No rounded progress rings, no calorie counters, no heart rate zones, no gamification badges, no streak indicators.
- **Use generic startup design patterns.** No hero sections, no feature cards, no pricing tables, no onboarding carousels, no toast notifications.
- **Add decorative elements.** No background patterns, no gradients, no illustrations, no stock photography, no emoji in the UI (except the speaker icon on the sound unlock overlay).
- **Introduce shadows for depth.** No `box-shadow` with offset. No elevation system. Depth comes from opacity.
- **Use rounded-friendly shapes.** No `border-radius: 50%` on cards. No circles except switch knobs and LED colon dots. Cards are rectangles with 6px corners.
- **Add horizontal rules or decorative dividers.** Dividers exist only as 1px lines at 3–6% white opacity between functional groups.
- **Override the LED display with font-based timers.** The seven-segment display is constructed from CSS geometry. It is never acceptable to replace it with a monospace font rendering "12:34".
- **Introduce modal dialogs or popups.** The system uses full-screen modes. Sound unlock is a full-screen overlay. There are no centered modal boxes with dimmed backgrounds.
- **Add navigation bars, tab bars, or hamburger menus.** Screen transitions are triggered by single buttons (START SESSION, ← END). No persistent navigation chrome.

---

### Reference: Component Decision Matrix

When building a new FLXPOD OS screen, use this matrix:

| Question | Answer |
|---|---|
| What is the single most important element? | Make it the largest thing on screen. |
| Does it need to be read from 30 feet? | Use LED segments or `display-xl` text. |
| Does it show state? | Use green/yellow/red status tokens. |
| Is it a user action? | If primary: white button. If secondary: ghost/outline. |
| Is it metadata? | Render at 0.15–0.3 opacity. |
| Does it need to be configurable? | Use preset cards + steppers pattern. |
| Does it show progress? | Use the 3px progress bar with color states. |
| Where does the logo go? | Setup: header-left. Fullscreen: absolute top-center at 70%. |

---

*This document is the source of truth. If a future design decision conflicts with this specification, the specification wins.*
