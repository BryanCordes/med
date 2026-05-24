// CCMA Practice Exam — Application Engine

const STORAGE_KEY = 'ccma_session';
const TIMER_TOTAL = 7200; // 2 hours in seconds
const SAVE_INTERVAL_MS = 10000;

let saveTimer = null;
let tickTimer = null;

// ─── STATE ──────────────────────────────────────────────────────────────────

function createSession(mode) {
  // Build per-domain pools
  const domainMap = {};
  DOMAINS.forEach(d => { domainMap[d.id] = []; });
  QUESTIONS.forEach(q => { if (domainMap[q.domain]) domainMap[q.domain].push(q.id); });

  // Stratified sample: pick targetCount from each domain pool
  const selected = [];
  DOMAINS.forEach(d => {
    const pool = fisherYates([...domainMap[d.id]]);
    selected.push(...pool.slice(0, d.targetCount));
  });

  const shuffled = fisherYates(selected);
  return {
    mode,
    questionIds: shuffled,
    currentIndex: 0,
    answers: {},
    startedAt: Date.now(),
    remainingSeconds: TIMER_TOTAL,
    lastTickAt: Date.now(),
    completed: false,
  };
}

function saveSession(session) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch (_) {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.questionIds || !Array.isArray(s.questionIds)) return null;
    return s;
  } catch (_) { return null; }
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getQuestion(id) {
  return QUESTIONS.find(q => q.id === id);
}

function getDomain(id) {
  return DOMAINS.find(d => d.id === id);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function computeResult(session) {
  const domainScores = {};
  DOMAINS.forEach(d => { domainScores[d.id] = { correct: 0, total: 0 }; });

  const questionResults = session.questionIds.map(id => {
    const q = getQuestion(id);
    const selected = session.answers[id] || null;
    const isCorrect = selected === q.correctAnswer;
    domainScores[q.domain].total++;
    if (isCorrect) domainScores[q.domain].correct++;
    return { id, selected, correctAnswer: q.correctAnswer, isCorrect };
  });

  const totalCorrect = questionResults.filter(r => r.isCorrect).length;
  const totalQuestions = questionResults.length;
  const pct = Math.round((totalCorrect / totalQuestions) * 100);

  const timeSpent = session.mode === 'timed'
    ? TIMER_TOTAL - Math.round(session.remainingSeconds)
    : Math.round((Date.now() - session.startedAt) / 1000);

  return { totalCorrect, totalQuestions, pct, domainScores, questionResults, timeSpent };
}

// ─── ROUTING ────────────────────────────────────────────────────────────────

let currentSession = null;
let currentResult = null;

function showScreen(id) {
  ['screen-landing', 'screen-exam', 'screen-results', 'screen-review', 'screen-quadrant'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ─── LANDING SCREEN ──────────────────────────────────────────────────────────

function renderLanding() {
  showScreen('screen-landing');

  // Domain table
  const tbody = document.getElementById('domain-tbody');
  tbody.innerHTML = DOMAINS.map(d =>
    `<tr>
      <td>${d.name}</td>
      <td class="hide-mobile">${Math.round(d.weight * 100)}%</td>
      <td>${d.targetCount} questions</td>
    </tr>`
  ).join('');

  // Resume banner
  const saved = loadSession();
  const banner = document.getElementById('resume-banner');
  if (saved && !saved.completed) {
    const answered = Object.keys(saved.answers).length;
    const total = saved.questionIds.length;
    const pctDone = Math.round((answered / total) * 100);
    const modeLabel = saved.mode === 'timed' ? 'Timed Exam' : 'Practice Mode';

    let timeStr = '';
    if (saved.mode === 'timed') {
      // Recompute remaining time
      const elapsed = (Date.now() - saved.lastTickAt) / 1000;
      const rem = Math.max(0, saved.remainingSeconds - elapsed);
      timeStr = ` &bull; ${formatTime(rem)} remaining`;
    }

    banner.innerHTML = `
      <div>
        <div class="resume-info">&#128197; ${modeLabel} in progress — question ${saved.currentIndex + 1}/${total} (${pctDone}% complete)${timeStr}</div>
        <div class="resume-sub">Your progress is saved. Resume where you left off.</div>
      </div>
      <div class="resume-actions">
        <button class="btn btn-primary" id="btn-resume">Resume</button>
        <button class="btn btn-ghost" id="btn-discard">Start Over</button>
      </div>`;
    banner.classList.remove('hidden');

    document.getElementById('btn-resume').addEventListener('click', () => {
      currentSession = saved;
      if (saved.mode === 'timed') {
        const elapsed = (Date.now() - saved.lastTickAt) / 1000;
        currentSession.remainingSeconds = Math.max(0, saved.remainingSeconds - elapsed);
        currentSession.lastTickAt = Date.now();
      }
      startExamLoop();
    });
    document.getElementById('btn-discard').addEventListener('click', () => {
      clearSession();
      banner.classList.add('hidden');
      banner.innerHTML = '';
    });
  } else {
    banner.classList.add('hidden');
    banner.innerHTML = '';
  }
}

function startExam(mode) {
  clearSession();
  currentSession = createSession(mode);
  saveSession(currentSession);
  startExamLoop();
}

// ─── EXAM SCREEN ─────────────────────────────────────────────────────────────

function startExamLoop() {
  stopTimers();
  showScreen('screen-exam');

  if (currentSession.mode === 'timed') {
    startTicker();
  }

  scheduleSave();
  renderQuestion();
}

function renderQuestion() {
  const session = currentSession;
  const qId = session.questionIds[session.currentIndex];
  const q = getQuestion(qId);
  const domain = getDomain(q.domain);
  const total = session.questionIds.length;
  const idx = session.currentIndex;

  // Header
  document.getElementById('progress-text').textContent = `Question ${idx + 1} of ${total}`;
  document.getElementById('domain-badge').textContent = domain.name;
  document.getElementById('domain-badge').className = 'badge badge-blue';

  const pct = Math.round((idx / total) * 100);
  document.getElementById('progress-bar-fill').style.width = pct + '%';

  // Timer
  const timerEl = document.getElementById('timer-display');
  if (session.mode === 'timed') {
    timerEl.classList.remove('hidden');
    updateTimerDisplay(session.remainingSeconds);
  } else {
    timerEl.classList.add('hidden');
  }

  // Question
  document.getElementById('q-number').textContent = `#${idx + 1}`;
  document.getElementById('q-diff').className = `badge badge-${diffColor(q.difficulty)}`;
  document.getElementById('q-diff').textContent = capitalize(q.difficulty);
  document.getElementById('question-stem').textContent = q.content;

  // Options
  const list = document.getElementById('options-list');
  list.innerHTML = ['A', 'B', 'C', 'D'].map(key =>
    `<li class="option-item" data-key="${key}" role="radio" aria-checked="false" tabindex="0">
      <span class="option-key">${key}</span>
      <span class="option-label">${q.options[key]}</span>
      <span class="option-status" aria-hidden="true"></span>
    </li>`
  ).join('');

  // Bind option clicks
  list.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => selectOption(item.dataset.key));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOption(item.dataset.key); }
    });
  });

  // Feedback & next button
  document.getElementById('feedback-block').classList.add('hidden');
  document.getElementById('feedback-block').innerHTML = '';

  const btnCheck = document.getElementById('btn-check');
  btnCheck.textContent = 'Check Answer';
  btnCheck.disabled = true;
  btnCheck.classList.remove('hidden');
  btnCheck.onclick = () => submitAnswer();

  const btnNext = document.getElementById('btn-next');
  btnNext.classList.add('hidden');
  btnNext.textContent = idx < total - 1 ? 'Next Question →' : 'View Results →';
  btnNext.onclick = idx < total - 1 ? advanceQuestion : completeExam;
}

function selectOption(key) {
  // Ignore if already answered
  if (document.getElementById('feedback-block').innerHTML !== '') return;

  document.querySelectorAll('.option-item').forEach(el => {
    el.classList.remove('selected');
    el.setAttribute('aria-checked', 'false');
  });
  const selected = document.querySelector(`.option-item[data-key="${key}"]`);
  selected.classList.add('selected');
  selected.setAttribute('aria-checked', 'true');
  document.getElementById('btn-check').disabled = false;
}

function submitAnswer() {
  const session = currentSession;
  const qId = session.questionIds[session.currentIndex];
  const q = getQuestion(qId);

  const selectedEl = document.querySelector('.option-item.selected');
  if (!selectedEl) return;
  const selectedKey = selectedEl.dataset.key;

  // Record answer
  session.answers[qId] = selectedKey;
  saveSession(session);

  const isCorrect = selectedKey === q.correctAnswer;

  // Style all options
  document.querySelectorAll('.option-item').forEach(el => {
    const key = el.dataset.key;
    el.classList.add('disabled');
    const statusSpan = el.querySelector('.option-status');
    if (key === q.correctAnswer) {
      el.classList.remove('selected');
      el.classList.add('correct');
      statusSpan.textContent = '✓';
    } else if (key === selectedKey && !isCorrect) {
      el.classList.remove('selected');
      el.classList.add('incorrect');
      statusSpan.textContent = '✗';
    }
  });

  // Feedback
  const fb = document.getElementById('feedback-block');
  fb.className = `feedback-block ${isCorrect ? 'correct' : 'incorrect'}`;
  fb.innerHTML = `
    <div class="feedback-label">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
    <div>${escapeHtml(q.explanation)}</div>`;
  fb.classList.remove('hidden');
  fb.setAttribute('aria-live', 'polite');

  // Swap buttons
  document.getElementById('btn-check').classList.add('hidden');
  document.getElementById('btn-next').classList.remove('hidden');
}

function advanceQuestion() {
  currentSession.currentIndex++;
  saveSession(currentSession);
  renderQuestion();
}

function completeExam() {
  stopTimers();
  currentSession.completed = true;
  saveSession(currentSession);
  currentResult = computeResult(currentSession);
  renderResults();
}

// ─── TIMER ──────────────────────────────────────────────────────────────────

function startTicker() {
  tickTimer = setInterval(() => {
    const now = Date.now();
    const elapsed = (now - currentSession.lastTickAt) / 1000;
    currentSession.lastTickAt = now;
    currentSession.remainingSeconds = Math.max(0, currentSession.remainingSeconds - elapsed);
    updateTimerDisplay(currentSession.remainingSeconds);
    if (currentSession.remainingSeconds <= 0) {
      stopTimers();
      completeExam();
    }
  }, 500);
}

function updateTimerDisplay(seconds) {
  const el = document.getElementById('timer-display');
  if (!el) return;
  el.textContent = formatTime(seconds);
  el.classList.remove('warn', 'alert');
  if (seconds <= 60)       el.classList.add('alert');
  else if (seconds <= 300) el.classList.add('warn');
}

function scheduleSave() {
  saveTimer = setInterval(() => saveSession(currentSession), SAVE_INTERVAL_MS);
}

function stopTimers() {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  if (saveTimer) { clearInterval(saveTimer); saveTimer = null; }
}

// ─── RESULTS SCREEN ──────────────────────────────────────────────────────────

function renderResults() {
  showScreen('screen-results');
  const r = currentResult;

  document.getElementById('score-raw').textContent = `${r.totalCorrect}`;
  document.getElementById('score-total').textContent = `/ ${r.totalQuestions}`;
  document.getElementById('score-pct').textContent = `${r.pct}%`;

  const indicator = document.getElementById('score-indicator');
  if (r.pct >= 70) {
    indicator.textContent = '✓ Pass (Estimated)';
    indicator.className = 'score-indicator pass';
  } else {
    indicator.textContent = '⚠ Needs More Practice';
    indicator.className = 'score-indicator needs-work';
  }

  if (currentSession.mode === 'timed') {
    document.getElementById('time-spent').textContent =
      `Completed in ${formatTime(r.timeSpent)}`;
    document.getElementById('time-spent').classList.remove('hidden');
  } else {
    document.getElementById('time-spent').classList.add('hidden');
  }

  // Domain breakdown
  const tbody = document.getElementById('domain-results-tbody');
  tbody.innerHTML = DOMAINS.map(d => {
    const ds = r.domainScores[d.id];
    const dpct = ds.total > 0 ? Math.round((ds.correct / ds.total) * 100) : 0;
    const lowClass = dpct < 70 ? 'low-score' : '';
    return `<tr class="${lowClass}">
      <td>${d.name}</td>
      <td>${ds.correct}/${ds.total}</td>
      <td>
        <div class="pct-bar">
          <span style="min-width:2.5rem;font-weight:600">${dpct}%</span>
          <div class="mini-bar">
            <div class="mini-bar-fill" style="width:${dpct}%"></div>
          </div>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ─── REVIEW SCREEN ───────────────────────────────────────────────────────────

let reviewFilter = 'all';

function renderReview() {
  showScreen('screen-review');
  const r = currentResult;
  const container = document.getElementById('review-cards');
  container.innerHTML = '';

  r.questionResults.forEach((qr, i) => {
    const q = getQuestion(qr.id);
    const domain = getDomain(q.domain);
    const isCorrect = qr.isCorrect;

    const card = document.createElement('div');
    card.className = `review-card ${isCorrect ? 'correct' : 'incorrect'}`;
    card.dataset.result = isCorrect ? 'correct' : 'incorrect';

    const optionRows = ['A', 'B', 'C', 'D'].map(key => {
      const isUserAnswer = qr.selected === key;
      const isCorrectAnswer = qr.correctAnswer === key;
      let cls = 'review-option';
      let icon = '';
      if (isUserAnswer && isCorrect)  { cls += ' user-correct';    icon = ' ✓'; }
      else if (isUserAnswer && !isCorrect) { cls += ' user-answer'; icon = ' ✗'; }
      else if (isCorrectAnswer && !isCorrect) { cls += ' correct-answer'; icon = ' ✓ (correct)'; }
      return `<li class="${cls}">
        <span class="opt-key">${key}.</span>
        <span>${escapeHtml(q.options[key])}</span>
        <span class="opt-icon">${icon}</span>
      </li>`;
    }).join('');

    card.innerHTML = `
      <div class="review-card-meta">
        <span class="review-q-number">Q${i + 1}</span>
        <span class="badge badge-blue" style="font-size:0.72rem">${domain.name}</span>
        <span class="badge badge-${diffColor(q.difficulty)}" style="font-size:0.72rem">${capitalize(q.difficulty)}</span>
        <span class="review-result-label ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
      </div>
      <div class="review-stem">${escapeHtml(q.content)}</div>
      <ul class="review-options">${optionRows}</ul>
      <div class="review-explanation">
        <div class="expl-label">Explanation</div>
        <div>${escapeHtml(q.explanation)}</div>
      </div>`;

    container.appendChild(card);
  });

  applyReviewFilter(reviewFilter);
}

function applyReviewFilter(filter) {
  reviewFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  document.querySelectorAll('.review-card').forEach(card => {
    if (filter === 'all') {
      card.classList.remove('hidden');
    } else {
      card.classList.toggle('hidden', card.dataset.result !== filter);
    }
  });
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function diffColor(d) { return { easy: 'green', medium: 'warn', hard: 'red' }[d] || 'gray'; }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── QUADRANT SCREEN ─────────────────────────────────────────────────────────

let deckIndex = 0;
let deckFlipped = false;

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

  // Build color map for hit-area fills
  const colorMap = {};
  QUADRANT_REGIONS.forEach(r => { colorMap[r.id] = r.color; });

  // Quadrant hit-area coordinates: [x, y, width, height]
  const hitAreas = {
    ruq: [66, 38, 48, 115],
    luq: [118, 38, 56, 115],
    rlq: [63, 158, 51, 118],
    llq: [118, 158, 56, 118],
  };

  const hitRects = QUADRANT_REGIONS.map(q => {
    const [x, y, w, h] = hitAreas[q.id];
    return `<rect class="q-hit" data-quadrant="${q.id}"
      x="${x}" y="${y}" width="${w}" height="${h}"
      fill="${colorMap[q.id]}" fill-opacity="0.45"
      stroke="transparent" stroke-width="2"
      rx="4" style="cursor:pointer"
      role="button" tabindex="0"
      aria-label="${q.label}"/>`;
  }).join('\n    ');

  container.innerHTML = `
<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg"
     class="body-svg" role="img" aria-label="Abdominal quadrant diagram">
  <!-- Torso silhouette -->
  <path d="M62,22 Q82,10 120,10 Q158,10 178,22 L188,82 Q193,142 178,202 L168,298 Q150,313 120,313 Q90,313 72,298 L62,202 Q47,142 52,82 Z"
        fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
  <!-- Quadrant color fills -->
  ${hitRects}
  <!-- Divider lines -->
  <line x1="62" y1="158" x2="178" y2="158" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,3"/>
  <line x1="120" y1="32" x2="120" y2="295" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- Quadrant labels -->
  <text x="90"  y="100" text-anchor="middle" class="q-label">RUQ</text>
  <text x="148" y="100" text-anchor="middle" class="q-label">LUQ</text>
  <text x="88"  y="218" text-anchor="middle" class="q-label">RLQ</text>
  <text x="148" y="218" text-anchor="middle" class="q-label">LLQ</text>
  <!-- Midline label -->
  <text x="120" y="8" text-anchor="middle" style="font-size:5.5px;fill:#94a3b8">Midline</text>
</svg>`;

  container.querySelectorAll('.q-hit').forEach(rect => {
    rect.addEventListener('click', () => selectQuadrant(rect.dataset.quadrant));
    rect.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectQuadrant(rect.dataset.quadrant); }
    });
  });
}

function selectQuadrant(qId) {
  document.querySelectorAll('.q-hit').forEach(rect => {
    const isActive = rect.dataset.quadrant === qId;
    rect.setAttribute('fill-opacity', isActive ? '0.8' : '0.3');
    rect.setAttribute('stroke', isActive ? '#1d4ed8' : 'transparent');
  });
  renderQuadrantInfo(qId);
}

function renderQuadrantInfo(qId) {
  const region = QUADRANT_REGIONS.find(r => r.id === qId);
  const organs = QUADRANT_ORGANS.filter(o => o.quadrant === qId);
  const panel = document.getElementById('quadrant-info-panel');

  panel.innerHTML = `
    <h3 style="margin-bottom:1rem">${escapeHtml(region.label)}</h3>
    ${organs.map(o => `
      <div class="organ-card">
        <div class="organ-name">${escapeHtml(o.name)}</div>
        <div class="organ-fact"><strong>Location:</strong> ${escapeHtml(o.description)}</div>
        ${o.painReferral  ? `<div class="organ-fact"><strong>Pain / Referral:</strong> ${escapeHtml(o.painReferral)}</div>` : ''}
        ${o.examTechnique ? `<div class="organ-fact"><strong>Exam Technique:</strong> ${escapeHtml(o.examTechnique)}</div>` : ''}
      </div>`).join('')}`;
}

function renderCard() {
  const organ  = QUADRANT_ORGANS[deckIndex];
  const region = QUADRANT_REGIONS.find(r => r.id === organ.quadrant);
  const fc     = document.getElementById('flashcard');

  fc.classList.toggle('flipped', deckFlipped);

  document.getElementById('flashcard-front').innerHTML = `
    <div class="fc-quadrant-badge" style="background:${region.color}">${escapeHtml(region.label)}</div>
    <div class="fc-organ-name">${escapeHtml(organ.name)}</div>
    <div class="fc-hint">Click to reveal</div>`;

  document.getElementById('flashcard-back').innerHTML = `
    <div class="fc-quadrant-badge" style="background:${region.color}">${escapeHtml(region.label)}</div>
    <div class="fc-organ-name" style="font-size:1.05rem;margin-bottom:0.75rem">${escapeHtml(organ.name)}</div>
    <div class="fc-fact"><strong>Location:</strong> ${escapeHtml(organ.description)}</div>
    ${organ.painReferral  ? `<div class="fc-fact"><strong>Pain / Referral:</strong> ${escapeHtml(organ.painReferral)}</div>` : ''}
    ${organ.examTechnique ? `<div class="fc-fact"><strong>Exam Technique:</strong> ${escapeHtml(organ.examTechnique)}</div>` : ''}`;

  document.getElementById('deck-progress').textContent = `${deckIndex + 1} of ${QUADRANT_ORGANS.length}`;
  document.getElementById('btn-prev-card').disabled = deckIndex === 0;
  document.getElementById('btn-next-card').textContent =
    deckIndex < QUADRANT_ORGANS.length - 1 ? 'Next →' : 'Restart';
}

function flipCard() {
  deckFlipped = !deckFlipped;
  document.getElementById('flashcard').classList.toggle('flipped', deckFlipped);
}

function nextCard() {
  deckIndex = deckIndex < QUADRANT_ORGANS.length - 1 ? deckIndex + 1 : 0;
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

// ─── INIT ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Mode buttons
  document.getElementById('btn-timed').addEventListener('click', () => startExam('timed'));
  document.getElementById('btn-practice').addEventListener('click', () => startExam('practice'));
  document.getElementById('btn-quadrant').addEventListener('click', () => showQuadrantScreen());

  // Quadrant screen
  document.getElementById('btn-quadrant-back').addEventListener('click', () => renderLanding());
  document.getElementById('btn-start-deck').addEventListener('click', () => showDeckView());
  document.getElementById('btn-view-diagram').addEventListener('click', () => showDiagramView());
  document.getElementById('btn-view-deck').addEventListener('click', () => showDeckView());
  document.getElementById('btn-prev-card').addEventListener('click', () => prevCard());
  document.getElementById('btn-next-card').addEventListener('click', () => nextCard());
  const fc = document.getElementById('flashcard-container');
  fc.addEventListener('click', () => flipCard());
  fc.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
  });

  // Results actions
  document.getElementById('btn-review').addEventListener('click', () => renderReview());
  document.getElementById('btn-new-exam').addEventListener('click', () => {
    clearSession();
    currentSession = null;
    currentResult = null;
    renderLanding();
  });

  // Review back links
  document.querySelectorAll('.btn-back-results').forEach(b =>
    b.addEventListener('click', () => renderResults())
  );
  document.getElementById('btn-new-exam-2').addEventListener('click', () => {
    clearSession();
    currentSession = null;
    currentResult = null;
    renderLanding();
  });

  // Review filters
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click', () => applyReviewFilter(btn.dataset.filter))
  );

  // Back-to-top
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  renderLanding();
});
