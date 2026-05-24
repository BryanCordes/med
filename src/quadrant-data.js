// CCMA Body Quadrant Study Data

const QUADRANT_REGIONS = [
  { id: 'ruq', label: 'Right Upper Quadrant (RUQ)', color: '#dbeafe' },
  { id: 'luq', label: 'Left Upper Quadrant (LUQ)',  color: '#dcfce7' },
  { id: 'rlq', label: 'Right Lower Quadrant (RLQ)', color: '#fef9c3' },
  { id: 'llq', label: 'Left Lower Quadrant (LLQ)',  color: '#fce7f3' },
];

const QUADRANT_ORGANS = [
  // ── RUQ ─────────────────────────────────────────────────────────────────────
  {
    name: 'Liver (Right Lobe)',
    quadrant: 'ruq',
    description: 'Largest solid organ; occupies most of the RUQ beneath the right costal margin.',
    painReferral: 'Referred pain to right shoulder (diaphragmatic irritation); RUQ pain with hepatitis or liver distension.',
    examTechnique: 'Percuss for liver span at right MCL; palpate 1–3 cm below costal margin on deep inspiration.',
  },
  {
    name: 'Gallbladder',
    quadrant: 'ruq',
    description: 'Bile storage organ beneath the liver; located at the junction of the right MCL and costal margin.',
    painReferral: 'Referred right shoulder/scapular pain; classic biliary colic is episodic RUQ pain after fatty meals.',
    examTechnique: "Murphy's sign: press under right costal margin at MCL and ask patient to inhale — positive if inspiration stops due to pain.",
  },
  {
    name: 'Right Kidney (Upper)',
    quadrant: 'ruq',
    description: 'Retroperitoneal; the right kidney sits slightly lower than the left due to the liver.',
    painReferral: 'Kidney pain (pyelonephritis, hydronephrosis): constant flank/CVA pain with fever and dysuria — does NOT radiate to groin. Renal/ureteral colic (stone moving in ureter): severe colicky flank-to-groin pain — that is the stone, not the kidney.',
    examTechnique: 'CVA percussion: fist percussion at the costovertebral angle posteriorly. Bimanual palpation: patient supine, anterior hand palpates flank deeply while posterior hand (under back) ballots kidney upward.',
  },
  {
    name: 'Duodenum',
    quadrant: 'ruq',
    description: 'First segment of the small intestine; receives bile and pancreatic enzymes. Curves around the pancreatic head.',
    painReferral: 'Duodenal ulcer: pain occurs 2–3 hours after eating (when stomach empties and acid is unbuffered) and classically wakes the patient at 2–4 AM. Food or antacids relieve it. Contrast: gastric ulcer pain is WORSENED by eating.',
    examTechnique: 'Deep palpation of epigastric/RUQ region; assess for guarding or rigidity suggesting perforation.',
  },
  {
    name: 'Pancreas (Head)',
    quadrant: 'ruq',
    description: 'The head of the pancreas lies in the curve of the duodenum in the RUQ/epigastric region.',
    painReferral: 'Epigastric pain radiating to the back (classic for pancreatitis); pain worsens supine, improves leaning forward.',
    examTechnique: 'Deep palpation of epigastric region; pancreas is not normally palpable — tenderness and rigidity are key findings.',
  },
  // ── LUQ ─────────────────────────────────────────────────────────────────────
  {
    name: 'Stomach',
    quadrant: 'luq',
    description: 'Lies in the LUQ/epigastric region; variable size depending on contents.',
    painReferral: 'Epigastric pain (gastritis, PUD); nausea and early satiety with distension.',
    examTechnique: 'Succussion splash: place stethoscope over epigastrium and rock the patient\'s torso side to side — a splashing sound indicates retained fluid (gastric outlet obstruction). Palpate epigastric region for tenderness.',
  },
  {
    name: 'Spleen',
    quadrant: 'luq',
    description: 'Lies posterolaterally in the LUQ; normally not palpable unless enlarged (splenomegaly).',
    painReferral: "Kehr's sign: referred left shoulder pain from diaphragmatic irritation (splenic rupture or abscess).",
    examTechnique: "Traube's space percussion (tympany = normal; dullness = splenomegaly); palpate from RLQ toward LUQ on deep inspiration.",
  },
  {
    name: 'Left Kidney (Upper)',
    quadrant: 'luq',
    description: 'Retroperitoneal; slightly higher than the right kidney. Often not palpable without enlargement.',
    painReferral: 'Left flank pain radiating to groin (ureteral colic); left CVA tenderness with pyelonephritis.',
    examTechnique: 'Left CVA percussion. Bimanual palpation: patient supine — anterior hand palpates deeply in left flank while posterior hand (placed under the patient\'s back at the flank) ballots the kidney upward toward the anterior hand.',
  },
  {
    name: 'Pancreas (Body/Tail)',
    quadrant: 'luq',
    description: 'Body and tail of the pancreas extend into the LUQ toward the splenic hilum.',
    painReferral: 'Epigastric/LUQ pain radiating to the back; left-sided radiation more prominent with tail involvement.',
    examTechnique: 'Deep midline/LUQ palpation; pancreas not normally palpable — assess for epigastric mass or tenderness.',
  },
  {
    name: 'Left Adrenal Gland',
    quadrant: 'luq',
    description: 'Sits atop the left kidney; retroperitoneal and not palpable unless grossly enlarged.',
    painReferral: 'Addison\'s disease (adrenal insufficiency): hypotension, hyperpigmentation, fatigue, hyponatremia, hyperkalemia — can present as adrenal crisis with severe hypotension and vomiting. Cushing\'s syndrome (excess cortisol): central obesity, moon face, buffalo hump, hypertension, striae.',
    examTechnique: 'Not directly palpable; assessed via lab values (cortisol, ACTH, electrolytes) and imaging. Recognize Addisonian crisis: acute hypotension + hyperpigmentation. Pheochromocytoma (adrenal medulla tumor): episodic hypertension, headache, diaphoresis, palpitations — "5 Hs."',
  },
  // ── RLQ ─────────────────────────────────────────────────────────────────────
  {
    name: 'Appendix',
    quadrant: 'rlq',
    description: 'Vermiform appendix arises from the cecum; retrocecal position is most common.',
    painReferral: "Classic appendicitis: begins periumbilical, migrates to McBurney's point in RLQ. Rovsing's sign: RLQ pain with LLQ palpation.",
    examTechnique: "McBurney's point: 1/3 distance from ASIS to umbilicus. Psoas sign: pain with right hip extension. Obturator sign: pain with internal rotation of flexed right hip.",
  },
  {
    name: 'Cecum',
    quadrant: 'rlq',
    description: 'Blind pouch at the junction of the small and large intestine; the appendix attaches here.',
    painReferral: 'RLQ pain; cecal distension can mimic appendicitis.',
    examTechnique: 'Palpation of RLQ for masses or tenderness; auscultate for hyperactive bowel sounds (obstruction) or silence (ileus).',
  },
  {
    name: 'Ascending Colon (Lower)',
    quadrant: 'rlq',
    description: 'The ascending colon travels superiorly from the cecum toward the hepatic flexure, beginning in the RLQ.',
    painReferral: 'RLQ to RUQ cramping; right-sided colon cancer may cause iron-deficiency anemia due to slow bleeding.',
    examTechnique: 'Palpate along the right flank; auscultate bowel sounds in all 4 quadrants.',
  },
  {
    name: 'Right Ureter',
    quadrant: 'rlq',
    description: 'Descends retroperitoneally from the right kidney to the bladder; passes through the RLQ.',
    painReferral: 'Ureteral colic: severe, colicky pain radiating from flank to groin and inner thigh. Nausea and restlessness common.',
    examTechnique: 'CVA tenderness (when stone is near UPJ); urinalysis showing hematuria is consistent with urolithiasis but does not confirm it — up to 15% of stones produce no hematuria. Non-contrast CT KUB is the gold standard. Colicky pattern distinguishes from appendicitis.',
  },
  {
    name: 'Right Ovary / Fallopian Tube',
    quadrant: 'rlq',
    description: 'Female reproductive structures in the RLQ; key differential for RLQ pain in females of reproductive age.',
    painReferral: 'Ovarian cyst rupture, ectopic pregnancy (right tube), or mittelschmerz: sharp RLQ pain. Ectopic is a surgical emergency.',
    examTechnique: 'Pelvic exam; adnexal tenderness on bimanual exam; serum hCG for ectopic; pelvic ultrasound for ovarian cysts.',
  },
  // ── LLQ ─────────────────────────────────────────────────────────────────────
  {
    name: 'Sigmoid Colon',
    quadrant: 'llq',
    description: 'S-shaped segment of colon before the rectum; most common site of diverticulosis.',
    painReferral: 'LLQ pain and tenderness; diverticulitis classically causes LLQ pain with fever and leukocytosis ("left-sided appendicitis").',
    examTechnique: 'Palpate LLQ for tenderness and mass (pericolic abscess); assess for peritoneal signs (rebound tenderness, guarding).',
  },
  {
    name: 'Descending Colon',
    quadrant: 'llq',
    description: 'Travels inferiorly from the splenic flexure to the sigmoid colon along the left flank; fixed to the posterior abdominal wall (secondarily retroperitoneal in most individuals).',
    painReferral: 'Left flank/LLQ cramping; left-sided colon cancer more often causes obstructive symptoms (narrower lumen than right colon).',
    examTechnique: 'Palpate along the left flank/LLQ; assess stool pattern changes; fecal occult blood testing in at-risk patients.',
  },
  {
    name: 'Left Ureter',
    quadrant: 'llq',
    description: 'Descends retroperitoneally from the left kidney through the LLQ to the bladder.',
    painReferral: 'Left ureteral colic: severe, colicky LLQ pain radiating to left groin and inner thigh.',
    examTechnique: 'Left CVA tenderness (when stone is near UPJ); urinalysis for hematuria is supportive but not confirmatory — CT KUB is the gold standard. Colicky onset/offset pattern distinguishes ureteral colic from the steady pain of diverticulitis.',
  },
  {
    name: 'Left Ovary / Fallopian Tube',
    quadrant: 'llq',
    description: 'Female reproductive structures in the LLQ; important differential for LLQ pain in females.',
    painReferral: 'Ovarian cyst rupture (left), ectopic pregnancy (left tube), or PID causing diffuse lower abdominal pain.',
    examTechnique: 'Bimanual pelvic exam for adnexal tenderness. Cervical motion tenderness (CMT): moving the cervix side-to-side on bimanual exam causes pain — a minimum diagnostic criterion for PID (informally called the Chandelier sign when severe). Serum hCG to rule out ectopic pregnancy.',
  },
  {
    name: 'Bladder (Distended)',
    quadrant: 'llq',
    description: 'Midline suprapubic organ; when distended rises above the pubic symphysis into the hypogastric region spanning both lower quadrants. Placed in LLQ here for reference — it is NOT a left-sided structure.',
    painReferral: 'Suprapubic pain and urgency with UTI or urinary retention; acute urinary retention causes severe lower abdominal/suprapubic pain and inability to void.',
    examTechnique: 'Suprapubic palpation and percussion: a distended bladder produces a smooth, midline, dull-to-percussion mass above the symphysis pubis. Assess for tenderness. Inability to void + palpable mass = urinary retention.',
  },
];
