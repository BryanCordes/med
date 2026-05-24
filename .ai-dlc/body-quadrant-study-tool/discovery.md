---
intent: body-quadrant-study-tool
created: 2026-05-24T00:00:00Z
status: active
---

# Discovery Log: Body Quadrant Study Tool

## Project Architecture

- **Vanilla JS/HTML/CSS** — zero build step, no framework, no npm
- `index.html` — single HTML file with all screens as `div[id^=screen-]`, shown/hidden via `.hidden` class
- `src/app.js` — all application logic (~546 lines); handles session state, routing (showScreen), rendering
- `src/style.css` — all styles, CSS custom properties for design tokens
- `src/questions.js` + 4 extension files — QUESTIONS array and DOMAINS array

## Screen Pattern

Each screen is a `<div id="screen-{name}">` element. `showScreen(id)` hides all screens and shows the target. The landing screen renders on DOMContentLoaded.

## Design Tokens (from style.css)

- Font: Inter (Google Fonts)
- Mode buttons: `.mode-btn` class — flex column, border, rounded corners, hover/active states
- Cards: `.card` class with box shadow
- Badges: `.badge` + modifier classes (`badge-blue`, `badge-green`, etc.)
- Color vars: `--primary`, `--bg`, `--surface`, `--border`, `--text`, `--muted`

## Existing Mode Buttons

The `.mode-buttons` container uses `display:flex; gap:1rem; flex-wrap:wrap`. Each `.mode-btn` has:
- `.mode-icon` — emoji icon
- `.mode-title` — bold label
- `.mode-desc` — small description text

A third button can be added directly to the existing `.mode-buttons` group.

## Quadrant Anatomy Context (CCMA-relevant)

### RUQ (Right Upper Quadrant)
Organs: Liver (right lobe), gallbladder, right kidney (upper), duodenum, head of pancreas
Pain patterns: Murphy's sign (gallbladder), referred right shoulder pain (hepatobiliary)
Exam: Deep palpation under right costal margin, Murphy's sign technique, percussion for liver span

### LUQ (Left Upper Quadrant)
Organs: Stomach, spleen, left kidney (upper), body/tail of pancreas, left adrenal gland
Pain patterns: Kehr's sign (splenic — referred left shoulder), epigastric pain (stomach/pancreas)
Exam: Splenic percussion (Traube's space), palpation for splenomegaly

### RLQ (Right Lower Quadrant)
Organs: Appendix, cecum, ascending colon (lower), right ureter, right ovary/tube (female)
Pain patterns: McBurney's point, Rovsing's sign, psoas sign, obturator sign
Exam: McBurney's point palpation, rebound tenderness test, psoas/obturator maneuvers

### LLQ (Left Lower Quadrant)
Organs: Sigmoid colon, descending colon, left ureter, left ovary/tube (female)
Pain patterns: Sigmoid diverticulitis (LLQ), referred testicular/ovarian pain
Exam: Palpation for sigmoid tenderness, assessment for diverticulitis

## No Deployment Surface

This is a pure front-end static site — no server, no infrastructure, no monitoring needed.
