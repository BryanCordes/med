---
workflow: default
git:
  change_strategy: intent
  auto_merge: true
  auto_squash: false
announcements: [changelog]
passes: []
active_pass: ""
iterates_on: ""
created: 2026-05-24T00:00:00Z
status: active
epic: ""
quality_gates: []
---

# Body Quadrant Study Tool

## Problem
CCMA students using the practice exam app have no way to study the anatomical quadrant knowledge that appears on the CCMA exam. The current app only supports timed and practice exam modes — there's no reference or study tool for the 4 abdominal quadrants, the organs within each, or the clinical signs/exam techniques tied to each region.

## Solution
Add a third mode option on the landing page — "Body Quadrant Reference" — that opens a dedicated study screen. The screen has two sub-views:

1. **Diagram View** — An SVG torso outline divided by horizontal and vertical lines into RUQ, LUQ, RLQ, LLQ. Quadrants are color-coded and clickable. Clicking a quadrant highlights it and displays a list of organs/structures for that region, each with key clinical facts (location details, pain referral patterns, relevant exam technique).

2. **Flashcard Deck View** — Launched from the diagram view via a "Study Flashcards" button. Full-screen flip-cards cycling through all organs across all quadrants. Front: organ name + quadrant badge. Back: description, pain referral, exam technique. Users can navigate forward/backward and track progress.

## Domain Model

### Entities
- **QuadrantRegion** — One of 4 abdominal regions. Key fields: id (ruq/luq/rlq/llq), label, color, organs[]
- **OrganEntry** — A structure within a quadrant. Key fields: name, quadrant, description, painReferral, examTechnique, clinicalNotes
- **FlashCard** — Presentation wrapper over OrganEntry. Front = name + quadrant badge. Back = all clinical facts.

### Relationships
- QuadrantRegion has many OrganEntries (5–10 per quadrant)
- FlashCard is derived from OrganEntry (same data, flip-card UI state)

### Data Sources
- **`src/quadrant-data.js`** (new static JS file): Exports `QUADRANT_REGIONS` array and `QUADRANT_ORGANS` array. Hardcoded medical content, no API calls.

### Organs Covered
| Quadrant | Organs/Structures |
|---|---|
| RUQ | Liver (R lobe), Gallbladder, R kidney (upper), Duodenum, Pancreas (head) |
| LUQ | Stomach, Spleen, L kidney (upper), Pancreas (body/tail), L adrenal gland |
| RLQ | Appendix, Cecum, Ascending colon (lower), R ureter, R ovary/fallopian tube |
| LLQ | Sigmoid colon, Descending colon, L ureter, L ovary/fallopian tube |

## Success Criteria
- [ ] A "Body Quadrant Reference" button appears on the landing page alongside the two existing mode buttons
- [ ] Clicking the button shows the quadrant screen with a clean SVG torso outline divided into 4 labeled, color-coded, clickable quadrants
- [ ] Clicking any quadrant highlights it and displays its organ list in a side/bottom panel
- [ ] Each organ entry shows: name, description, pain referral pattern (where applicable), and relevant exam technique
- [ ] A "Study Flashcards" button launches the flip-card deck showing all organs across all quadrants
- [ ] Each flip-card shows organ name + quadrant badge on front; description, pain referral, and exam technique on back
- [ ] Deck navigation: next/previous buttons + "N of M" progress counter
- [ ] A "Back to Home" link/button on the quadrant screen returns the user to the landing screen
- [ ] The quadrant screen is mobile-responsive and visually consistent with the existing Inter font and card/badge design system
- [ ] All existing exam functionality (Timed, Practice, Results, Review) remains unbroken

## Context
- App is vanilla JS/HTML/CSS with no build step — all additions must use the same pattern
- Existing screens are toggled via `showScreen(id)` in app.js
- New screen added as `<div id="screen-quadrant">` in index.html
- New data file `src/quadrant-data.js` added as a `<script>` tag before app.js
- No deployment surface — static file, no infrastructure changes needed
