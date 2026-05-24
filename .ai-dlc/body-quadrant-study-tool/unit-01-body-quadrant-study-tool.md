---
status: pending
last_updated: ""
depends_on: []
branch: ai-dlc/body-quadrant-study-tool/01-body-quadrant-study-tool
discipline: frontend
pass: ""
workflow: ""
ticket: ""
design_ref: ""
views: ["/"]
---

# unit-01-body-quadrant-study-tool

## Description
Build the Body Quadrant Study Tool — a new study screen accessible from the landing page. The screen has two sub-views: an interactive SVG body diagram (Diagram View) and a flip-card deck (Deck View). All content is static CCMA study material covering organs in all 4 abdominal quadrants with clinical facts.

## Discipline
frontend — vanilla JS/HTML/CSS, no build step, same pattern as existing screens.

## Domain Entities
- **QuadrantRegion** — RUQ, LUQ, RLQ, LLQ. Each has: id, label, color, and a list of organ entries
- **OrganEntry** — A structure within a quadrant. Has: name, quadrant id, description, painReferral (string or null), examTechnique (string or null)
- **FlashCard** — Stateful wrapper over OrganEntry for the deck view. Tracks `flipped` (boolean)

## Data Sources
**`src/quadrant-data.js`** (new file, loaded as `<script>` before `src/app.js`):
```js
const QUADRANT_REGIONS = [
  { id: 'ruq', label: 'Right Upper Quadrant (RUQ)', color: '#dbeafe' },
  { id: 'luq', label: 'Left Upper Quadrant (LUQ)', color: '#dcfce7' },
  { id: 'rlq', label: 'Right Lower Quadrant (RLQ)', color: '#fef9c3' },
  { id: 'llq', label: 'Left Lower Quadrant (LLQ)', color: '#fce7f3' },
];

const QUADRANT_ORGANS = [
  // RUQ
  {
    name: 'Liver (Right Lobe)',
    quadrant: 'ruq',
    description: 'Largest solid organ; occupies most of the RUQ beneath the right costal margin.',
    painReferral: 'Referred pain to right shoulder (diaphragmatic irritation); RUQ pain with hepatitis or liver distension.',
    examTechnique: 'Percuss for liver span at right MCL; palpate 1–3 cm below costal margin on deep inspiration.'
  },
  {
    name: 'Gallbladder',
    quadrant: 'ruq',
    description: 'Bile storage organ beneath the liver; at the junction of the right MCL and costal margin.',
    painReferral: 'Referred right shoulder/scapular pain; classic biliary colic is episodic RUQ pain after fatty meals.',
    examTechnique: "Murphy's sign: press under right costal margin at MCL and ask patient to inhale deeply — positive if patient stops due to pain."
  },
  {
    name: 'Right Kidney (Upper)',
    quadrant: 'ruq',
    description: 'Retroperitoneal; the right kidney sits slightly lower than the left due to the liver.',
    painReferral: 'Flank pain radiating to groin (ureteral colic); costovertebral angle (CVA) tenderness with pyelonephritis.',
    examTechnique: 'CVA percussion: fist percussion at the costovertebral angle posteriorly. Bimanual palpation for kidney size.'
  },
  {
    name: 'Duodenum',
    quadrant: 'ruq',
    description: 'First segment of small intestine; receives bile and pancreatic enzymes. Curves around the pancreatic head.',
    painReferral: 'Epigastric or RUQ pain; duodenal ulcer pain may be relieved by eating.',
    examTechnique: 'Deep palpation of epigastric/RUQ region; assess for guarding or rigidity suggesting perforation.'
  },
  {
    name: 'Pancreas (Head)',
    quadrant: 'ruq',
    description: 'The head of the pancreas lies in the curve of the duodenum in the RUQ/epigastric region.',
    painReferral: 'Epigastric pain radiating to the back (classic for pancreatitis); pain worsens supine, improves leaning forward.',
    examTechnique: 'Deep palpation of epigastric region; pancreas is not normally palpable — tenderness and rigidity are key findings.'
  },
  // LUQ
  {
    name: 'Stomach',
    quadrant: 'luq',
    description: 'Lies in the LUQ/epigastric region; variable size depending on contents.',
    painReferral: 'Epigastric pain (gastritis, PUD); nausea and early satiety with distension.',
    examTechnique: 'Auscultate for gastric splash (succussion splash); palpate epigastric region for tenderness.'
  },
  {
    name: 'Spleen',
    quadrant: 'luq',
    description: 'Lies posterolaterally in the LUQ; normally not palpable unless enlarged (splenomegaly).',
    painReferral: "Kehr's sign: referred left shoulder pain from diaphragmatic irritation (splenic rupture or abscess).",
    examTechnique: "Traube's space percussion (tympany = normal; dullness = splenomegaly); palpate from RLQ toward LUQ during deep inspiration."
  },
  {
    name: 'Left Kidney (Upper)',
    quadrant: 'luq',
    description: 'Retroperitoneal; slightly higher than the right kidney. Often not palpable without enlargement.',
    painReferral: 'Left flank pain radiating to groin (ureteral colic); left CVA tenderness with pyelonephritis.',
    examTechnique: 'Left CVA percussion; bimanual palpation with patient in lateral decubitus position.'
  },
  {
    name: 'Pancreas (Body/Tail)',
    quadrant: 'luq',
    description: 'Body and tail of the pancreas extend into the LUQ toward the splenic hilum.',
    painReferral: 'Epigastric/LUQ pain radiating to the back; radiation to left side more prominent with tail involvement.',
    examTechnique: 'Deep midline/LUQ palpation; pancreas not normally palpable — assess for epigastric mass or tenderness.'
  },
  {
    name: 'Left Adrenal Gland',
    quadrant: 'luq',
    description: 'Sits atop the left kidney; retroperitoneal. Not palpable unless grossly enlarged.',
    painReferral: 'Adrenal pathology (pheochromocytoma) can cause episodic severe hypertension with headache, diaphoresis, palpitations.',
    examTechnique: 'Not directly palpable; assessed via imaging. Check blood pressure for hypertensive crisis pattern.'
  },
  // RLQ
  {
    name: 'Appendix',
    quadrant: 'rlq',
    description: 'Vermiform appendix arises from the cecum; variable position (retrocecal is most common).',
    painReferral: "Classic appendicitis: begins periumbilical, migrates to McBurney's point (RLQ). Rovsing's sign: RLQ pain with LLQ palpation.",
    examTechnique: "McBurney's point: 1/3 distance from ASIS to umbilicus. Psoas sign: pain with right hip extension. Obturator sign: pain with internal rotation of flexed right hip."
  },
  {
    name: 'Cecum',
    quadrant: 'rlq',
    description: 'Blind pouch at the junction of the small and large intestine; the appendix attaches here.',
    painReferral: 'RLQ pain; cecal distension can mimic appendicitis.',
    examTechnique: 'Palpation of RLQ for masses or tenderness; auscultate for hyperactive bowel sounds (obstruction) or absence (ileus).'
  },
  {
    name: 'Ascending Colon (Lower)',
    quadrant: 'rlq',
    description: 'The ascending colon travels superiorly from the cecum to the hepatic flexure, beginning in the RLQ.',
    painReferral: 'RLQ to RUQ cramping; right-sided colon cancer may cause iron-deficiency anemia rather than obstruction (right colon is wider).',
    examTechnique: 'Palpate along the right flank; auscultate bowel sounds in all 4 quadrants.'
  },
  {
    name: 'Right Ureter',
    quadrant: 'rlq',
    description: 'Descends retroperitoneally from the right kidney to the bladder; passes through the RLQ.',
    painReferral: 'Ureteral colic: severe, colicky pain radiating from flank to groin to inner thigh/testicle or labia. Nausea and restlessness.',
    examTechnique: 'CVA tenderness; abdominal palpation for colic pattern; urinalysis for hematuria confirms urolithiasis.'
  },
  {
    name: 'Right Ovary / Fallopian Tube',
    quadrant: 'rlq',
    description: 'Female reproductive structures in the RLQ; must be considered in differential of RLQ pain in females.',
    painReferral: 'Ovarian cyst rupture, ectopic pregnancy (right tube), or mittelschmerz: sharp RLQ pain. Ectopic is a surgical emergency.',
    examTechnique: 'Pelvic exam; adnexal tenderness on bimanual exam; hCG for ectopic pregnancy; ultrasound for ovarian cysts.'
  },
  // LLQ
  {
    name: 'Sigmoid Colon',
    quadrant: 'llq',
    description: 'S-shaped segment of colon before the rectum; most common site of diverticulosis.',
    painReferral: 'LLQ pain and tenderness; diverticulitis classically causes LLQ pain with fever and leukocytosis ("left-sided appendicitis").',
    examTechnique: 'Palpate LLQ for tenderness and mass (pericolic abscess); assess for peritoneal signs (rebound, guarding).'
  },
  {
    name: 'Descending Colon',
    quadrant: 'llq',
    description: 'Travels inferiorly from the splenic flexure to the sigmoid; lies retroperitoneally along the left flank.',
    painReferral: 'Left flank/LLQ cramping; left-sided colon cancer more often causes obstructive symptoms (left colon is narrower).',
    examTechnique: 'Palpate along the left flank/LLQ; assess stool pattern changes and fecal occult blood testing in risk patients.'
  },
  {
    name: 'Left Ureter',
    quadrant: 'llq',
    description: 'Descends retroperitoneally from the left kidney through the LLQ to the bladder.',
    painReferral: 'Left ureteral colic: severe, colicky LLQ pain radiating to left groin, inner thigh, or labia/testicle.',
    examTechnique: 'Left CVA tenderness; urinalysis for hematuria; colicky pattern distinguishes ureteral colic from appendicitis/diverticulitis.'
  },
  {
    name: 'Left Ovary / Fallopian Tube',
    quadrant: 'llq',
    description: 'Female reproductive structures in the LLQ; important differential for LLQ pain in females of reproductive age.',
    painReferral: 'Ovarian cyst rupture (left), ectopic pregnancy (left tube), mittelschmerz, or PID causing diffuse lower abdominal pain.',
    examTechnique: 'Bimanual pelvic exam for adnexal tenderness; hCG to rule out ectopic; Chandelier sign (cervical motion tenderness) with PID.'
  },
];
```

## Technical Specification

### 1. `src/quadrant-data.js` (new file)
Exactly the `QUADRANT_REGIONS` and `QUADRANT_ORGANS` arrays shown above. Must be loaded before `src/app.js`.

### 2. `index.html` changes
- Add `<script src="src/quadrant-data.js"></script>` before `<script src="src/app.js"></script>`
- Add a third `<button class="mode-btn" id="btn-quadrant">` inside `.mode-buttons` on the landing screen:
  ```html
  <button class="mode-btn" id="btn-quadrant" aria-label="Body Quadrant Reference">
    <span class="mode-icon">🫁</span>
    <span class="mode-title">Body Quadrant Reference</span>
    <span class="mode-desc">Interactive diagram &amp; flashcards<br>4 abdominal quadrants · Organs &amp; clinical signs</span>
  </button>
  ```
- Add the quadrant screen div (before the closing `</body>` tag, after `screen-review`):
  ```html
  <div id="screen-quadrant" class="hidden">
    <div class="container">
      <div class="review-header" style="margin-bottom:1.5rem">
        <div>
          <button class="btn btn-ghost" id="btn-quadrant-back">← Back to Home</button>
          <h2 style="margin-top:0.5rem">Body Quadrant Reference</h2>
        </div>
        <div class="filter-bar" role="group" aria-label="Quadrant view mode">
          <button class="filter-btn active" id="btn-view-diagram" data-view="diagram">Diagram</button>
          <button class="filter-btn" id="btn-view-deck" data-view="deck">Flashcards</button>
        </div>
      </div>

      <!-- Diagram View -->
      <div id="quadrant-diagram-view">
        <div class="quadrant-layout">
          <div class="quadrant-svg-wrap">
            <!-- SVG inserted by JS -->
            <div id="quadrant-svg-container"></div>
          </div>
          <div class="quadrant-info-panel card" id="quadrant-info-panel">
            <p class="text-muted" style="text-align:center;padding:2rem 1rem">
              Click a quadrant on the diagram to see organs and clinical facts.
            </p>
          </div>
        </div>
        <div style="text-align:center;margin-top:1.5rem">
          <button class="btn btn-primary" id="btn-start-deck">Study Flashcards →</button>
        </div>
      </div>

      <!-- Deck View -->
      <div id="quadrant-deck-view" class="hidden">
        <div class="flashcard-container" id="flashcard-container" role="button" tabindex="0" aria-label="Flip card">
          <div class="flashcard" id="flashcard">
            <div class="flashcard-front" id="flashcard-front"></div>
            <div class="flashcard-back" id="flashcard-back"></div>
          </div>
        </div>
        <div class="deck-controls">
          <button class="btn btn-secondary" id="btn-prev-card">← Previous</button>
          <span class="deck-progress" id="deck-progress">1 of 20</span>
          <button class="btn btn-primary" id="btn-next-card">Next →</button>
        </div>
        <p class="text-muted" style="text-align:center;font-size:0.85rem;margin-top:0.5rem">
          Click the card to flip it
        </p>
      </div>
    </div>
  </div>
  ```
- Add `'screen-quadrant'` to the `showScreen()` array in `app.js`

### 3. `src/app.js` changes

Add the following to the DOMContentLoaded handler:
```js
document.getElementById('btn-quadrant').addEventListener('click', () => showQuadrantScreen());
document.getElementById('btn-quadrant-back').addEventListener('click', () => renderLanding());
document.getElementById('btn-start-deck').addEventListener('click', () => showDeckView());
document.getElementById('btn-view-diagram').addEventListener('click', () => showDiagramView());
document.getElementById('btn-view-deck').addEventListener('click', () => showDeckView());
document.getElementById('btn-prev-card').addEventListener('click', () => prevCard());
document.getElementById('btn-next-card').addEventListener('click', () => nextCard());
document.getElementById('flashcard-container').addEventListener('click', () => flipCard());
document.getElementById('flashcard-container').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
});
```

Add new functions (at end of app.js, before `// ─── INIT`):

```js
// ─── QUADRANT SCREEN ─────────────────────────────────────────────────────────

let deckIndex = 0;
let deckFlipped = false;
let activeQuadrant = null;

function showQuadrantScreen() {
  showScreen('screen-quadrant');
  showDiagramView();
  renderBodyDiagram();
}

function showDiagramView() {
  document.getElementById('quadrant-diagram-view').classList.remove('hidden');
  document.getElementById('quadrant-deck-view').classList.add('hidden');
  document.getElementById('btn-view-diagram').classList.add('active');
  document.getElementById('btn-view-deck').classList.remove('active');
}

function showDeckView() {
  document.getElementById('quadrant-diagram-view').classList.add('hidden');
  document.getElementById('quadrant-deck-view').classList.remove('hidden');
  document.getElementById('btn-view-diagram').classList.remove('active');
  document.getElementById('btn-view-deck').classList.add('active');
  deckIndex = 0;
  deckFlipped = false;
  renderCard();
}

function renderBodyDiagram() {
  const container = document.getElementById('quadrant-svg-container');
  const svg = `
  <svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg"
       class="body-svg" role="img" aria-label="Abdominal quadrant diagram">
    <!-- Torso outline -->
    <path d="M60,20 Q80,10 120,10 Q160,10 180,20 L190,80 Q195,140 180,200 L170,300 Q150,315 120,315 Q90,315 70,300 L60,200 Q45,140 50,80 Z"
          fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <!-- Quadrant dividers -->
    <line x1="60" y1="160" x2="180" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,3"/>
    <line x1="120" y1="30" x2="120" y2="295" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,3"/>
    <!-- Quadrant hit areas (invisible rects sized to clickable zones) -->
    ${QUADRANT_REGIONS.map(q => {
      const coords = { ruq: [70,35,45,120], luq: [120,35,55,120], rlq: [65,160,50,120], llq: [120,160,55,120] }[q.id];
      return `<rect class="q-hit" data-quadrant="${q.id}"
               x="${coords[0]}" y="${coords[1]}" width="${coords[2]}" height="${coords[3]}"
               fill="${q.color}" fill-opacity="0.5" stroke="transparent" stroke-width="8"
               rx="4" style="cursor:pointer" role="button" tabindex="0"
               aria-label="${q.label}"/>`;
    }).join('\n    ')}
    <!-- Quadrant labels -->
    <text x="93" y="95" text-anchor="middle" class="q-label">RUQ</text>
    <text x="148" y="95" text-anchor="middle" class="q-label">LUQ</text>
    <text x="90" y="215" text-anchor="middle" class="q-label">RLQ</text>
    <text x="148" y="215" text-anchor="middle" class="q-label">LLQ</text>
    <!-- Midline reference -->
    <text x="120" y="8" text-anchor="middle" style="font-size:6px;fill:#94a3b8">Midline</text>
  </svg>`;
  container.innerHTML = svg;

  // Bind quadrant click/keyboard
  container.querySelectorAll('.q-hit').forEach(rect => {
    rect.addEventListener('click', () => selectQuadrant(rect.dataset.quadrant));
    rect.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectQuadrant(rect.dataset.quadrant); }
    });
  });
}

function selectQuadrant(qId) {
  activeQuadrant = qId;
  // Highlight selected quadrant
  document.querySelectorAll('.q-hit').forEach(rect => {
    const region = QUADRANT_REGIONS.find(r => r.id === rect.dataset.quadrant);
    rect.setAttribute('fill-opacity', rect.dataset.quadrant === qId ? '0.85' : '0.35');
    rect.setAttribute('stroke', rect.dataset.quadrant === qId ? '#1d4ed8' : 'transparent');
    rect.setAttribute('stroke-width', '2');
  });
  renderQuadrantInfo(qId);
}

function renderQuadrantInfo(qId) {
  const region = QUADRANT_REGIONS.find(r => r.id === qId);
  const organs = QUADRANT_ORGANS.filter(o => o.quadrant === qId);
  const panel = document.getElementById('quadrant-info-panel');
  panel.innerHTML = `
    <h3 style="margin-bottom:1rem;color:var(--text)">${region.label}</h3>
    ${organs.map(o => `
      <div class="organ-card">
        <div class="organ-name">${escapeHtml(o.name)}</div>
        <div class="organ-fact"><strong>Location:</strong> ${escapeHtml(o.description)}</div>
        ${o.painReferral ? `<div class="organ-fact"><strong>Pain/Referral:</strong> ${escapeHtml(o.painReferral)}</div>` : ''}
        ${o.examTechnique ? `<div class="organ-fact"><strong>Exam:</strong> ${escapeHtml(o.examTechnique)}</div>` : ''}
      </div>`).join('')}`;
}

function renderCard() {
  const organ = QUADRANT_ORGANS[deckIndex];
  const region = QUADRANT_REGIONS.find(r => r.id === organ.quadrant);
  const fc = document.getElementById('flashcard');
  const front = document.getElementById('flashcard-front');
  const back = document.getElementById('flashcard-back');

  fc.classList.toggle('flipped', deckFlipped);

  front.innerHTML = `
    <div class="fc-quadrant-badge" style="background:${region.color}">${region.label}</div>
    <div class="fc-organ-name">${escapeHtml(organ.name)}</div>
    <div class="fc-hint">Click to reveal</div>`;

  back.innerHTML = `
    <div class="fc-quadrant-badge" style="background:${region.color}">${region.label}</div>
    <div class="fc-organ-name" style="font-size:1rem;margin-bottom:0.75rem">${escapeHtml(organ.name)}</div>
    <div class="fc-fact"><strong>Location:</strong> ${escapeHtml(organ.description)}</div>
    ${organ.painReferral ? `<div class="fc-fact"><strong>Pain/Referral:</strong> ${escapeHtml(organ.painReferral)}</div>` : ''}
    ${organ.examTechnique ? `<div class="fc-fact"><strong>Exam Technique:</strong> ${escapeHtml(organ.examTechnique)}</div>` : ''}`;

  document.getElementById('deck-progress').textContent = `${deckIndex + 1} of ${QUADRANT_ORGANS.length}`;
  document.getElementById('btn-prev-card').disabled = deckIndex === 0;
  document.getElementById('btn-next-card').textContent = deckIndex < QUADRANT_ORGANS.length - 1 ? 'Next →' : 'Restart';
}

function flipCard() {
  deckFlipped = !deckFlipped;
  document.getElementById('flashcard').classList.toggle('flipped', deckFlipped);
}

function nextCard() {
  if (deckIndex < QUADRANT_ORGANS.length - 1) {
    deckIndex++;
  } else {
    deckIndex = 0;
  }
  deckFlipped = false;
  renderCard();
}

function prevCard() {
  if (deckIndex > 0) {
    deckIndex--;
    deckFlipped = false;
    renderCard();
  }
}
```

Also update `showScreen()` to include `'screen-quadrant'` in the array of screen IDs to hide.

### 4. `src/style.css` additions

Append at the end of `src/style.css`:

```css
/* ─── QUADRANT SCREEN ─────────────────────────────────────── */

.quadrant-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 640px) {
  .quadrant-layout { grid-template-columns: 1fr; }
}

.quadrant-svg-wrap { display: flex; justify-content: center; }

.body-svg {
  width: 100%;
  max-width: 280px;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.q-label {
  font-size: 9px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  fill: #475569;
  pointer-events: none;
}

.q-hit:hover { filter: brightness(0.92); }
.q-hit:focus { outline: 2px solid var(--primary); outline-offset: 2px; }

.organ-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background: var(--bg);
}
.organ-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
  color: var(--text);
}
.organ-fact {
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 0.25rem;
}

/* ─── FLASHCARD ───────────────────────────────────────────── */

.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 540px;
  height: 320px;
  margin: 0 auto 1.5rem;
  cursor: pointer;
}
.flashcard {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
  border-radius: 16px;
}
.flashcard.flipped { transform: rotateY(180deg); }

.flashcard-front,
.flashcard-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.75rem;
  box-shadow: var(--shadow);
  background: var(--surface);
  border: 1px solid var(--border);
  text-align: center;
  overflow-y: auto;
}
.flashcard-back { transform: rotateY(180deg); justify-content: flex-start; padding-top: 1.5rem; }

.fc-quadrant-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1e293b;
}
.fc-organ-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.5rem;
}
.fc-hint { font-size: 0.78rem; color: var(--muted); margin-top: 0.5rem; }
.fc-fact { font-size: 0.82rem; color: var(--muted); line-height: 1.55; text-align: left; margin-bottom: 0.6rem; }

.deck-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.deck-progress {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--muted);
  min-width: 4rem;
  text-align: center;
}
```

## Success Criteria
- [ ] Landing page shows a third mode button "Body Quadrant Reference" in the `.mode-buttons` row
- [ ] Clicking the button shows `screen-quadrant` with the SVG torso diagram and two sub-view tabs (Diagram / Flashcards)
- [ ] SVG torso shows RUQ, LUQ, RLQ, LLQ labeled regions that are clickable
- [ ] Clicking a quadrant highlights it and renders organ cards in the info panel, each showing location, pain referral, and exam technique
- [ ] "Study Flashcards" button switches to the deck view
- [ ] Deck shows 20 flip-cards (5 per quadrant × 4 quadrants), each with organ name + quadrant on front, clinical facts on back
- [ ] Flip animation works on card click; prev/next navigation works; counter shows "N of 20"
- [ ] Deck restarts from card 1 when "Next" is pressed on the last card
- [ ] "← Back to Home" returns to the landing screen
- [ ] On mobile (≤640px), the layout stacks vertically (single column)
- [ ] All existing exam screens (timed, practice, results, review) continue to function correctly

## Risks
- **SVG click targets on mobile**: Touch areas may be too small on the SVG. Mitigation: use large invisible `<rect>` click targets with generous padding, test at 375px viewport.
- **Flashcard 3D transform browser support**: `preserve-3d` is unsupported in some older WebKit. Mitigation: graceful degradation — if flip doesn't animate, card just swaps content (acceptable for a study tool).
- **screen-quadrant missing from showScreen array**: If `'screen-quadrant'` is not added to the array in `showScreen()`, it won't be hidden when navigating away. Mitigation: explicitly verify array update.

## Boundaries
This unit does NOT handle:
- Exam question logic (questions.js, app.js exam flow) — those are untouched
- Session state or localStorage for the quadrant tool — it's stateless by design
- Any API calls — all data is hardcoded in quadrant-data.js
- Female reproductive organ content (ovary/fallopian tube entries are gender-neutral reference items only)
