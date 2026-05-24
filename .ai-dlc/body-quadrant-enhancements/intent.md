---
workflow: default
git:
  change_strategy: intent
  auto_merge: true
  auto_squash: false
announcements: [changelog]
passes: []
active_pass: ""
iterates_on: "body-quadrant-study-tool"
created: 2026-05-24T00:00:00Z
status: active
epic: ""
quality_gates: []
---

# Body Quadrant Display Enhancements

## Problem
The existing Body Quadrant Reference tool shows only quadrant-level labels (RUQ, LUQ, RLQ, LLQ) in the SVG diagram — organ content is hidden until a quadrant is clicked. Flashcards show the quadrant badge on the front (giving away the answer before the student engages), and cards appear in fixed array order (always Liver first, always same sequence). These reduce study effectiveness.

## Solution
Three targeted enhancements to the existing quadrant screen:

1. **Labeled SVG diagram** — Enlarge the SVG display area and add individual organ name labels positioned at their approximate anatomical location within each quadrant. Each label is clickable and shows that organ's clinical detail in the info panel. Clicking the quadrant background still shows all organs in that quadrant.

2. **Flashcard front — remove quadrant badge** — The front of the card shows only the organ name + "Click to reveal." The student must recall the quadrant from memory. The back reveals the quadrant badge, description, pain referral, and exam technique.

3. **Randomized deck order** — Each time the flashcard deck is opened, the cards are shuffled with Fisher-Yates so the order is different from the previous session.

## Domain Model

### Entities (unchanged from prior intent)
- **QuadrantRegion** — RUQ, LUQ, RLQ, LLQ
- **OrganEntry** — organ within a quadrant; fields: name, quadrant, description, painReferral, examTechnique
- **FlashCard** — presentation wrapper over OrganEntry with flip state

### New Data Fields on OrganEntry
- **svgX** — x coordinate in the 240×320 SVG viewBox for this organ's label
- **svgY** — y coordinate in the 240×320 SVG viewBox
- **svgLabel** — short display name (≤13 chars) for the SVG label

### Data Sources
- **`src/quadrant-data.js`** — existing static file; organ entries gain `svgX`, `svgY`, `svgLabel` fields
- **`src/app.js`** — existing rendering functions modified in-place
- **`src/style.css`** — adjusted CSS for larger SVG, organ label styles

## Success Criteria
- [ ] The SVG body diagram is larger on screen (CSS max-width increased from 280px to 400px)
- [ ] Each organ appears as a labeled text element at its correct anatomical position within its quadrant in the SVG
- [ ] Clicking an organ label highlights it (blue color) and shows that organ's detail card in the info panel
- [ ] Clicking the quadrant background still shows all organs in that quadrant (existing behavior preserved)
- [ ] Flashcard front shows only organ name — no quadrant badge
- [ ] Flashcard back still shows the quadrant badge, description, pain referral, and exam technique
- [ ] Each time the deck is opened, cards appear in a new random order
- [ ] All 19 organs are present in the deck (4 quadrants × 4–5 organs each)
- [ ] Prev/next/flip/progress counter continue to work correctly after randomization
- [ ] Existing exam functionality (Timed, Practice, Results, Review) is unbroken

## Context
- App is vanilla JS/HTML/CSS with no build step
- Fisher-Yates (`fisherYates()`) already exists in app.js
- SVG viewBox stays at `0 0 240 320` — only CSS display size changes
- Organ label positions are added to quadrant-data.js as `svgX`, `svgY`, `svgLabel` fields
- No new files needed — all changes are in-place edits to existing files
