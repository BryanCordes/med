---
status: pending
last_updated: ""
depends_on: []
branch: ai-dlc/body-quadrant-enhancements/01-quadrant-display-enhancements
discipline: frontend
pass: ""
workflow: ""
ticket: ""
design_ref: ""
views: ["/"]
---

# unit-01-quadrant-display-enhancements

## Description
Enhance the Body Quadrant Reference tool with a labeled SVG diagram (organ names at anatomical positions, individually clickable), remove the quadrant badge from flashcard fronts, and randomize deck order on each open. All changes are in-place edits to existing files — no new files required.

## Discipline
frontend — vanilla JS/HTML/CSS, no build step.

## Domain Entities
- **OrganEntry** — gains three new data fields: `svgX`, `svgY`, `svgLabel`
- **FlashCard** — front face loses the quadrant badge; deck is shuffled at open

## Data Sources
- `src/quadrant-data.js` — add `svgX`, `svgY`, `svgLabel` to each organ object
- `src/app.js` — modify `renderBodyDiagram()`, `renderCard()`, `showDeckView()`
- `src/style.css` — adjust `.body-svg` max-width; add `.organ-label` style

## Technical Specification

### 1. `src/quadrant-data.js` — add SVG position fields

Add three fields to every organ entry. SVG coordinate system is the existing 240×320 viewBox.

Anatomy of the hit areas (for reference):
- RUQ: x=66–114, y=38–153 → label center x=90
- LUQ: x=118–174, y=38–153 → label center x=146
- RLQ: x=63–114, y=158–276 → label center x=88
- LLQ: x=118–174, y=158–276 → label center x=146

Positions per organ (add to each existing object literal):

**RUQ (5 organs, y starts at 50, spacing 20):**
- Liver (Right Lobe):      `svgX: 90,  svgY: 50,  svgLabel: 'Liver'`
- Gallbladder:             `svgX: 90,  svgY: 68,  svgLabel: 'Gallbladder'`
- Right Kidney (Upper):    `svgX: 90,  svgY: 86,  svgLabel: 'R. Kidney'`
- Duodenum:                `svgX: 90,  svgY: 104, svgLabel: 'Duodenum'`
- Pancreas (Head):         `svgX: 90,  svgY: 122, svgLabel: 'Pancreas (Hd)'`

**LUQ (5 organs, y starts at 50, spacing 20):**
- Stomach:                 `svgX: 146, svgY: 50,  svgLabel: 'Stomach'`
- Spleen:                  `svgX: 146, svgY: 68,  svgLabel: 'Spleen'`
- Left Kidney (Upper):     `svgX: 146, svgY: 86,  svgLabel: 'L. Kidney'`
- Pancreas (Body/Tail):    `svgX: 146, svgY: 104, svgLabel: 'Pancreas (B/T)'`
- Left Adrenal Gland:      `svgX: 146, svgY: 122, svgLabel: 'L. Adrenal'`

**RLQ (5 organs, y starts at 170, spacing 18):**
- Appendix:                `svgX: 88,  svgY: 170, svgLabel: 'Appendix'`
- Cecum:                   `svgX: 88,  svgY: 188, svgLabel: 'Cecum'`
- Ascending Colon (Lower): `svgX: 88,  svgY: 206, svgLabel: 'Asc. Colon'`
- Right Ureter:            `svgX: 88,  svgY: 224, svgLabel: 'R. Ureter'`
- Right Ovary/Tube:        `svgX: 88,  svgY: 242, svgLabel: 'R. Ovary'`

**LLQ (4 organs, y starts at 170, spacing 22):**
- Sigmoid Colon:           `svgX: 146, svgY: 170, svgLabel: 'Sigmoid Colon'`
- Descending Colon:        `svgX: 146, svgY: 192, svgLabel: 'Desc. Colon'`
- Left Ureter:             `svgX: 146, svgY: 214, svgLabel: 'L. Ureter'`
- Left Ovary/Tube:         `svgX: 146, svgY: 236, svgLabel: 'L. Ovary'`

### 2. `src/app.js` — renderBodyDiagram()

After the existing hit rects, add a second loop that generates `<text>` elements for each organ label:

```js
const organLabels = QUADRANT_ORGANS.map(o =>
  `<text class="organ-label" data-organ="${escapeHtml(o.name)}"
        x="${o.svgX}" y="${o.svgY}" text-anchor="middle"
        style="cursor:pointer" tabindex="0"
        role="button" aria-label="${escapeHtml(o.name)}">${escapeHtml(o.svgLabel)}</text>`
).join('\n  ');
```

Append `organLabels` inside the SVG markup after the existing labels block.

After setting innerHTML, bind click and keydown handlers on `.organ-label` elements:

```js
container.querySelectorAll('.organ-label').forEach(el => {
  el.addEventListener('click', () => selectOrgan(el.dataset.organ));
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOrgan(el.dataset.organ); }
  });
});
```

Add a new `selectOrgan(name)` function:

```js
function selectOrgan(name) {
  const organ = QUADRANT_ORGANS.find(o => o.name === name);
  if (!organ) return;

  // Highlight the selected organ label; reset others
  document.querySelectorAll('.organ-label').forEach(el => {
    el.classList.toggle('organ-label--selected', el.dataset.organ === name);
  });

  // Also highlight the quadrant background
  document.querySelectorAll('.q-hit').forEach(rect => {
    const isActive = rect.dataset.quadrant === organ.quadrant;
    rect.setAttribute('fill-opacity', isActive ? '0.8' : '0.3');
    rect.setAttribute('stroke', isActive ? '#1d4ed8' : 'transparent');
  });

  // Show single-organ detail in info panel
  const region = QUADRANT_REGIONS.find(r => r.id === organ.quadrant);
  const panel = document.getElementById('quadrant-info-panel');
  panel.innerHTML = `
    <h3 style="margin-bottom:1rem">${escapeHtml(organ.name)}</h3>
    <div class="organ-card">
      <div class="organ-fact"><strong>Quadrant:</strong> ${escapeHtml(region.label)}</div>
      <div class="organ-fact"><strong>Location:</strong> ${escapeHtml(organ.description)}</div>
      ${organ.painReferral  ? `<div class="organ-fact"><strong>Pain / Referral:</strong> ${escapeHtml(organ.painReferral)}</div>` : ''}
      ${organ.examTechnique ? `<div class="organ-fact"><strong>Exam Technique:</strong> ${escapeHtml(organ.examTechnique)}</div>` : ''}
    </div>`;
}
```

The existing `selectQuadrant()` should also reset `.organ-label--selected` so clicking the background doesn't leave a stale highlight. Add at the start of `selectQuadrant()`:

```js
document.querySelectorAll('.organ-label').forEach(el => el.classList.remove('organ-label--selected'));
```

### 3. `src/app.js` — showDeckView() — randomize order

Add a module-level variable alongside `deckIndex`:
```js
let deckOrder = [];
```

In `showDeckView()`, replace the current `deckIndex = 0` setup with:
```js
deckOrder = fisherYates([...QUADRANT_ORGANS]);
deckIndex = 0;
deckFlipped = false;
renderCard();
```

### 4. `src/app.js` — renderCard() — use deckOrder, remove front badge

Change the organ lookup from:
```js
const organ = QUADRANT_ORGANS[deckIndex];
```
to:
```js
const organ = deckOrder[deckIndex];
```

Replace the `flashcard-front` innerHTML — remove the `fc-quadrant-badge` line:
```js
document.getElementById('flashcard-front').innerHTML = `
  <div class="fc-organ-name">${escapeHtml(organ.name)}</div>
  <div class="fc-hint">Click to reveal</div>`;
```

The `flashcard-back` innerHTML is unchanged (keep the quadrant badge there).

Update the progress counter to use `deckOrder.length`:
```js
document.getElementById('deck-progress').textContent = `${deckIndex + 1} of ${deckOrder.length}`;
document.getElementById('btn-next-card').textContent =
  deckIndex < deckOrder.length - 1 ? 'Next →' : 'Restart';
```

In `nextCard()`, replace the length reference:
```js
deckIndex = deckIndex < deckOrder.length - 1 ? deckIndex + 1 : 0;
```

### 5. `src/style.css` — organ label styles and enlarged SVG

Change `.body-svg` max-width from `280px` to `400px`.

Add the organ label style:
```css
.organ-label {
  font-size: 7px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  fill: #334155;
  pointer-events: all;
  user-select: none;
}
.organ-label--selected {
  fill: #1d4ed8;
  font-weight: 700;
}
.organ-label:hover { fill: #1d4ed8; }
.organ-label:focus { outline: none; }
.organ-label:focus-visible { fill: #1d4ed8; }
```

Also update the quadrant layout grid to give the SVG more visual weight:
```css
.quadrant-layout {
  grid-template-columns: 1.2fr 1fr;
}
```

## Success Criteria
- [ ] Each of the 19 organs appears as a named label inside its quadrant in the SVG
- [ ] Labels are positioned at anatomically plausible locations (stacked top-to-bottom within the quadrant, not overlapping)
- [ ] Clicking an organ label turns it blue and shows that organ's detail in the panel (Quadrant, Location, Pain/Referral, Exam Technique)
- [ ] Clicking the quadrant background still shows all organs in that quadrant (existing behavior)
- [ ] Flashcard front shows only the organ name — no quadrant badge visible before flip
- [ ] Flashcard back shows the quadrant badge + all clinical facts
- [ ] Opening the deck twice in a row produces a different card order at least 50% of the time (randomization is working)
- [ ] Prev/Next/flip/progress counter work correctly after shuffle
- [ ] SVG is visually larger than before (organ labels are legible at typical desktop viewport)
- [ ] Mobile layout (≤640px stacked) remains intact

## Risks
- **Label overflow beyond quadrant boundary**: Labels at the quadrant edges (x=90, 146) might be clipped by the torso silhouette outline or divider lines. Mitigation: verify at 400px display width that no label overlaps the midline divider (x=120) or torso boundary.
- **deckOrder empty on prevCard/nextCard if deck not opened via showDeckView**: If `deckOrder` is empty and `renderCard()` is called directly, `organ` will be undefined. Mitigation: guard with `if (!deckOrder.length) deckOrder = [...QUADRANT_ORGANS];` at the top of `renderCard()`.
- **Organ label font too small on mobile**: At 375px viewport with max-width:400px SVG, scale factor is ~1.56; 7px SVG = ~11px display — acceptable but tight. Mitigation: no action needed; organ labels are supplementary to the info panel.

## Boundaries
This unit does NOT handle:
- Anatomy-accurate organ *shapes* (only text labels, not SVG paths for each organ)
- Persistent deck order across browser sessions (each open re-shuffles)
- Changes to the exam question flow (Timed, Practice, Results, Review screens)
- Changes to the quadrant data content (organ descriptions, pain referrals, exam techniques)
