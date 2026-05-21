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
created: 2026-05-21T00:00:00Z
status: active
epic: ""
quality_gates: []
---

# CCMA Practice Exam Web App

## Problem
Preparing for the NHA Certified Clinical Medical Assistant (CCMA) exam requires realistic,
full-length practice under exam conditions. Existing free resources are low-quality, outdated,
or lack explanations. There is no readily available static-site practice tool that mirrors the
NHA blueprint and provides instant feedback with rationales.

## Solution
Build a comprehensive static web app with 150 CCMA practice questions authored against the
NHA official CCMA content outline and validated by well-reviewed study resources (Mometrix,
NHA official study guide, Kaplan). The app supports timed full-exam mode, instant answer
feedback with explanations, a per-domain results breakdown, and a post-exam review mode.
Deployable to GitHub Pages or Netlify — zero backend required.

## Domain Model

### Entities

- **Question**: A single exam question with content, 4 answer options (A–D), one correct
  answer key, a written explanation of the rationale, a domain tag, and a difficulty
  level (easy / medium / hard). Total: 150 questions.

- **Domain**: One of 6 NHA CCMA content areas. Each domain has an id, name, target weight
  (percentage of real exam), and target question count.

- **ExamSession**: Live state of a test attempt — current question index, answers map
  (questionId → selectedOption), start timestamp, timer mode (timed/practice), and
  remaining seconds. Persisted to localStorage.

- **Result**: End-of-exam summary — total score (raw and %), per-domain score breakdown
  (raw/total and % per domain), time spent, and per-question review data
  (selected answer + correct answer + explanation for every question).

### Relationships
- Each Question belongs to exactly one Domain
- An ExamSession references an ordered array of Questions
- A Result is derived from an ExamSession once completed

### Data Sources

- **questions.js** (static bundled data): All 150 questions authored offline and bundled
  with the app. No external API. Questions are a JS array exported as a module constant.
- **localStorage** (browser): Key `ccma_session` stores serialized ExamSession JSON.
  Cleared on exam completion or explicit reset.

### Data Gaps
- None. All data is self-contained and bundled at build time.

## Domain Weights & Question Distribution

| Domain | NHA Blueprint % | Questions |
|--------|----------------|-----------|
| Clinical Patient Care | ~38% | 57 |
| Diagnostic Testing (EKG, phlebotomy, lab) | ~19% | 29 |
| Administrative / Clerical | ~15% | 22 |
| Medical Terminology & Anatomy | ~12% | 18 |
| Safety, Infection Control & Professionalism | ~8% | 12 |
| Basic Sciences (pharmacology, nutrition) | ~8% | 12 |

Total: 150 questions

## Success Criteria
- [ ] Quiz contains exactly 150 questions distributed across 6 NHA CCMA domains (±2 per domain)
- [ ] Every question has 4 options, exactly 1 correct answer, and a written explanation with clinical rationale
- [ ] Timed exam mode counts down from 2 hours (7,200 seconds); timer is visible and cannot be paused
- [ ] Instant feedback shows correct/incorrect after each answer with full explanation
- [ ] Results screen displays total score (% and X/150) plus per-domain breakdown (score + %)
- [ ] Review mode lets user page through all 150 questions with their answer, correct answer, and explanation
- [ ] Session state persisted to localStorage — page refresh during exam does not lose progress
- [ ] App runs as a fully static site (no server) deployable to GitHub Pages or Netlify
- [ ] Renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] All questions pass content-accuracy review (no wrong correct answers, no ambiguous distractors)

## Context
- Target exam: NHA CCMA (Certified Clinical Medical Assistant)
- Exam format: ~150 questions, 2-hour time limit, multiple choice 4 options
- Content validated against: NHA official CCMA study guide, Mometrix CCMA study guide
- Design direction: Clean & Clinical (white background, blue/teal accents, professional typography)
- No framework required — plain HTML/CSS/JS for maximum portability and zero build tooling
