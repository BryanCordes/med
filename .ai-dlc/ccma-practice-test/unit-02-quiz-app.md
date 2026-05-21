---
status: pending
last_updated: ""
depends_on: [unit-01-question-bank]
branch: ai-dlc/ccma-practice-test/02-quiz-app
discipline: frontend
pass: ""
workflow: ""
ticket: ""
design_ref: ""
views: ["/", "/exam", "/results", "/review"]
---

# unit-02: Quiz Application

## Description
Build the full interactive static web app that loads the question bank, runs timed and
untimed exam modes, shows instant answer feedback with explanations, and renders a
results screen with per-domain breakdown and a full review mode.

## Discipline
frontend — Plain HTML/CSS/JavaScript, no framework, no build tooling. Deployable as-is
to GitHub Pages or Netlify by dropping the files.

## Domain Entities
- **ExamSession**: current question index, answers map, start time, remaining seconds, mode
- **Result**: total score, domain scores, question-level review data
- **Question / Domain**: imported from `src/questions.js` (unit-01)

## Data Sources
- `src/questions.js` — imported via ES module `<script type="module">`. Contains `QUESTIONS`
  and `DOMAINS` arrays authored in unit-01.
- `localStorage` key `ccma_session` — serialized `ExamSession` JSON. Read on page load to
  resume an in-progress exam. Cleared on submit or explicit reset.

## Technical Specification

### File Structure
```
index.html          — Landing page / exam config screen
src/
  questions.js      — Question bank (unit-01 output)
  app.js            — Exam engine and all state management
  style.css         — All styles; CSS custom properties for design tokens
```

No build step. No npm. Open `index.html` in a browser or deploy the folder.

### Design Tokens (Clean & Clinical)
```css
:root {
  --color-primary: #1a7abf;      /* Blue — interactive elements */
  --color-primary-dark: #135e96; /* Hover state */
  --color-success: #2d8a4e;      /* Correct answer */
  --color-error: #c0392b;        /* Incorrect answer */
  --color-warning: #e67e22;      /* Timer <5 min */
  --color-bg: #f8fafc;           /* Page background */
  --color-surface: #ffffff;      /* Card/panel background */
  --color-text: #1e293b;         /* Primary text */
  --color-text-muted: #64748b;   /* Secondary text */
  --color-border: #e2e8f0;       /* Dividers and borders */
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Screen 1: Landing / Config (`index.html` initial state)
- App title: "CCMA Practice Exam"
- Subtitle: "NHA-Blueprint Aligned · 150 Questions"
- Two mode buttons:
  - **Timed Exam** — "Simulate the real exam (2:00:00)"
  - **Practice Mode** — "No timer, show answers immediately"
- If a saved session exists in localStorage: show a "Resume Exam" banner with progress
  (e.g., "You're on question 47/150 — 1:23:15 remaining") and a "Start Over" link
- Domain overview table showing the 6 domains and question counts (informational)

### Screen 2: Exam View (`#exam`)
Layout:
- **Header bar** (sticky): progress counter "Question X of 150", domain badge, timer
  (timed mode only — counts down MM:SS, turns --color-warning at 5:00 remaining,
  --color-error at 1:00 remaining)
- **Question card**: question number, content (full stem), 4 radio-button style option rows
- **Submit button**: "Check Answer" — disabled until an option is selected

Answer Feedback (inline, shown after submit):
- Selected option highlighted green (correct) or red (incorrect)
- Correct answer highlighted green if user was wrong
- Explanation block appears below options: light gray background, "Explanation:" label,
  full explanation text
- "Next Question" button appears (replaces "Check Answer")
- On the last question: "View Results" replaces "Next Question"

Timer behavior:
- Counts down from 7200 seconds
- Displayed as MM:SS
- At 0: auto-submits the exam (unanswered questions counted as incorrect)
- Saved to localStorage every 10 seconds

Practice mode (no timer): omit timer display. Feedback is identical.

### Screen 3: Results (`#results`)
- Score summary card: large display of "X / 150" and "XX%"
  - Pass indicator: ≥70% shows "Pass (Estimated)" in green; <70% shows "Needs Work" in amber
  - Note: "The actual NHA CCMA passing score is scaled; 70% is an approximate benchmark"
- Time spent (timed mode): "Completed in MM:SS"
- Domain Breakdown table:
  ```
  Domain                          | Score  | %
  --------------------------------|--------|------
  Clinical Patient Care           | 44/57  | 77%
  Diagnostic Testing              | 21/29  | 72%
  Administrative / Clerical       | 15/22  | 68%
  Medical Terminology & Anatomy   | 12/18  | 67%
  Safety & Professionalism        | 9/12   | 75%
  Basic Sciences                  | 7/12   | 58%
  ```
  - Rows with <70% domain score are highlighted in amber background
- Two action buttons: "Review All Questions" | "Start New Exam"

### Screen 4: Review Mode (`#review`)
- Displays all 150 questions in order, one per card
- Each card shows:
  - Question number, domain badge, difficulty badge
  - Full question stem
  - All 4 options — user's selection marked, correct answer marked (green checkmark)
  - Explanation block (always visible)
  - "Correct" or "Incorrect" indicator
- Sticky back-to-top button
- "← Back to Results" link at top and bottom
- Filter bar: "All | Incorrect Only | Correct Only" — filters visible cards

### State Management (`app.js`)

```js
// Session shape (serialized to localStorage)
const session = {
  mode: "timed" | "practice",
  questions: [...shuffledIds],   // shuffled question id order for this attempt
  currentIndex: 0,
  answers: {},                   // { [questionId]: "A" | "B" | "C" | "D" }
  startedAt: Date.now(),
  remainingSeconds: 7200,        // timed mode only
  completed: false,
};
```

Key functions in `app.js`:
- `startExam(mode)` — shuffles questions, initializes session, saves to localStorage, renders Screen 2
- `submitAnswer(questionId, selected)` — records answer, shows feedback
- `nextQuestion()` — advances currentIndex, re-renders question card
- `completeExam()` — marks session.completed, computes Result, renders Screen 3
- `renderReview()` — renders Screen 4 from completed session
- `saveSession()` — serializes session to localStorage
- `loadSession()` — reads and validates localStorage on page load
- `resetExam()` — clears localStorage, returns to Screen 1

### Responsiveness

Mobile (375px): single-column layout; options stack vertically; header collapses to
just timer + progress counter. Font size ≥16px on inputs to prevent iOS zoom.

Tablet (768px): same as mobile but with more padding and slightly wider max-width card.

Desktop (1280px): max-width 800px centered card; header bar full-width with question
number left, timer right.

### Accessibility
- All interactive elements keyboard-accessible (Tab through options, Enter to select)
- ARIA: `role="radiogroup"` on options list, `aria-label` on timer, `aria-live` on feedback
- Color is not the sole indicator of correctness (✓ / ✗ icons + text labels added)

### Deployment
GitHub Pages: push folder to repo, enable Pages from root or `/docs`. No `_config.yml` needed.
Netlify: drag-and-drop the folder into Netlify dashboard. No config needed.

## Success Criteria
- [ ] Landing screen renders with Timed Exam and Practice Mode buttons; shows Resume banner when session exists in localStorage
- [ ] Exam screen displays question content, 4 option rows, progress counter, and (in timed mode) a live countdown timer
- [ ] Submitting an answer shows inline feedback: correct option highlighted green, incorrect highlighted red, explanation revealed
- [ ] Timer auto-submits the exam at 00:00 and session is not recoverable after that
- [ ] Session state written to localStorage every 10 seconds; refreshing the page mid-exam resumes from the same question with correct remaining time
- [ ] Results screen shows total score (X/150 and %), per-domain breakdown table, and pass/needs-work indicator
- [ ] Domain rows with <70% score are visually flagged (amber highlight)
- [ ] Review mode shows all 150 questions with user answers, correct answers, and explanations; "Incorrect Only" filter works correctly
- [ ] App opens and runs correctly as a local file (`file://`) and when served from GitHub Pages
- [ ] Renders without horizontal scroll at 375px, 768px, and 1280px viewports
- [ ] All buttons and options are keyboard-accessible and have visible focus indicators

## Risks
- **ES module `file://` restriction**: Some browsers block `import` from `file://` URLs.
  Mitigation: provide a note in the README to use a local server (`npx serve .` or VS Code
  Live Server) for local development. The deployed GitHub Pages version is unaffected.
- **localStorage quota**: 150 questions with answers is ~20KB — well within the 5MB quota.
  No risk.
- **Timer drift on background tab**: `setInterval` throttles in background tabs.
  Mitigation: store `startedAt` and compute elapsed on each tick from `Date.now()` rather
  than decrementing a counter. This makes the timer accurate regardless of tab state.

## Boundaries
This unit does NOT author question content. It imports `src/questions.js` from unit-01 as-is.
If a question's correctAnswer is wrong, that is a unit-01 bug, not a unit-02 bug.
This unit also does NOT include any analytics, tracking, or server-side components.

## Notes
- Shuffle questions on each new exam attempt (Fisher-Yates) to prevent memorizing order
- The `≥70% = pass` benchmark is an approximation; the actual NHA CCMA uses scaled scoring.
  Display a disclaimer note on the Results screen.
- Inter font can be loaded from Google Fonts with a `<link>` in the HTML head;
  fall back to `system-ui` if offline
