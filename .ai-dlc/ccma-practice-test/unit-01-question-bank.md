---
status: pending
last_updated: ""
depends_on: []
branch: ai-dlc/ccma-practice-test/01-question-bank
discipline: backend
pass: ""
workflow: ""
ticket: ""
design_ref: ""
views: []
---

# unit-01: Question Bank

## Description
Author all 150 CCMA practice questions and export them as a single structured JavaScript
data file (`src/questions.js`). This unit produces the content layer; the quiz application
(unit-02) imports this file directly.

## Discipline
backend — This unit produces data/content assets, no UI.

## Domain Entities
- **Question** (all 150): id, domain, difficulty, content, options (A/B/C/D), correctAnswer, explanation
- **Domain** registry: the 6 domain objects with id, name, weight, targetCount

## Data Sources
Content authored from these authoritative sources (no external API):
- **NHA CCMA Official Content Outline**: defines domain names, sub-topics, and cognitive levels
- **Mometrix CCMA Study Guide**: primary question-writing reference for clinical and diagnostic content
- **NHA Official CCMA Study Guide**: secondary reference for administrative, legal, and terminology content
- **Kaplan Medical Assistant Exam Prep**: supplemental reference for pharmacology and safety topics

## Technical Specification

### Output File: `src/questions.js`

Export two constants:

```js
export const DOMAINS = [
  { id: "clinical", name: "Clinical Patient Care", weight: 0.38, targetCount: 57 },
  { id: "diagnostic", name: "Diagnostic Testing", weight: 0.19, targetCount: 29 },
  { id: "administrative", name: "Administrative / Clerical", weight: 0.15, targetCount: 22 },
  { id: "terminology", name: "Medical Terminology & Anatomy", weight: 0.12, targetCount: 18 },
  { id: "safety", name: "Safety, Infection Control & Professionalism", weight: 0.08, targetCount: 12 },
  { id: "sciences", name: "Basic Sciences (Pharmacology & Nutrition)", weight: 0.08, targetCount: 12 },
];

export const QUESTIONS = [
  {
    id: 1,
    domain: "clinical",       // must match a DOMAINS id
    difficulty: "medium",     // "easy" | "medium" | "hard"
    content: "Question stem here...",
    options: {
      A: "Option A text",
      B: "Option B text",
      C: "Option C text",
      D: "Option D text",
    },
    correctAnswer: "B",       // "A" | "B" | "C" | "D"
    explanation: "B is correct because... (clinical rationale, citing NHA content area)",
  },
  // ... 149 more
];
```

### Question Distribution Requirements

Write questions covering these sub-topics, matching real NHA exam depth:

**Clinical Patient Care (57 questions)**
- Vital signs (temperature, pulse, respiration, blood pressure, O2 sat)
- Patient positioning and draping
- Wound care, sterile technique, suture removal
- Injections (IM, SC, ID, Z-track) and injection sites
- Electrocardiogram prep and lead placement
- Medication administration (routes, rights of medication)
- Assisting with minor surgery and procedures
- Physical examination assistance
- Pediatric care and immunization schedules
- Orthopedic and respiratory procedures

**Diagnostic Testing (29 questions)**
- Phlebotomy: venipuncture technique, evacuated tube system, order of draw
- Specimen collection: urine, stool, throat culture
- CLIA-waived testing: urinalysis, glucose, hemoglobin, pregnancy test, rapid strep
- EKG interpretation basics: normal sinus rhythm, lead identification, artifact recognition
- Microbiology basics: culture media, infection cycle

**Administrative / Clerical (22 questions)**
- Medical records: SOAP notes, charting principles, corrections
- Scheduling and appointment types
- Insurance billing basics: CPT, ICD-10 coding concepts, EOB
- HIPAA: minimum necessary, patient rights, covered entities
- Patient registration and release of information
- Medical office safety and OSHA requirements

**Medical Terminology & Anatomy (18 questions)**
- Prefixes, suffixes, root words (cardio, pulmo, nephro, hepato, etc.)
- Body systems: cardiovascular, respiratory, musculoskeletal, GI, GU, nervous
- Medical abbreviations commonly used in clinical settings
- Anatomical directional terms and body planes

**Safety, Infection Control & Professionalism (12 questions)**
- Standard precautions and transmission-based precautions (contact, droplet, airborne)
- Hand hygiene: when and how
- PPE selection and donning/doffing order
- Sharps safety and bloodborne pathogens (OSHA BBP Standard)
- Professional ethics: scope of practice, patient confidentiality, duty of care
- Chain of infection and breaking the chain

**Basic Sciences (12 questions)**
- Drug classifications and common medications (antibiotics, antihypertensives, analgesics)
- Drug routes, half-life, and adverse effects
- Basic nutrition: macronutrients, therapeutic diets, BMI interpretation
- Metric system and dosage calculations

### Question Quality Rules
1. Each stem must be a complete clinical scenario or direct knowledge question
2. All 4 distractors must be plausible (no obviously wrong options)
3. Explanations must cite the clinical/administrative reason, not just restate the answer
4. No "all of the above" or "none of the above" options
5. Difficulty distribution per domain: ~30% easy, ~50% medium, ~20% hard
6. Questions must not repeat the same stem with minor wording changes

## Success Criteria
- [ ] `src/questions.js` exports `DOMAINS` array with exactly 6 domain objects, each with id/name/weight/targetCount
- [ ] `src/questions.js` exports `QUESTIONS` array with exactly 150 question objects
- [ ] Each question object has: id (unique integer), domain (valid domain id), difficulty, content, options {A,B,C,D}, correctAnswer, explanation
- [ ] Question counts per domain are within ±2 of the targets in the DOMAINS registry
- [ ] No question has correctAnswer set to an option that doesn't exist in its options object
- [ ] All explanations are substantive (>20 words, cite rationale not just restate answer)
- [ ] File passes JS syntax validation (no parse errors)

## Risks
- **Content accuracy**: Incorrect correct answers will mislead the learner. Mitigation: cross-reference each question against at least one authoritative source; flag uncertain items with a `// TODO: verify` comment for manual review.
- **Difficulty calibration**: All questions at the same difficulty skews study value. Mitigation: actively vary difficulty across the distribution targets (~30/50/20).
- **Duplicate questions**: Repetitive stems waste the 150-question budget. Mitigation: after writing each domain, scan for similar stems before moving to the next.

## Boundaries
This unit produces ONLY the data file (`src/questions.js`). It does NOT build any UI,
HTML, CSS, or application logic. All rendering is handled by unit-02.

## Notes
- IDs should be sequential integers starting at 1 (simplifies localStorage and URL state)
- Explanations are the highest-value part of this unit — a learner who gets a question wrong
  should understand WHY from the explanation alone without needing another resource
- Where a question references a specific value (e.g., "normal adult pulse is 60–100 bpm"),
  verify the value against current NHA-approved references before committing
