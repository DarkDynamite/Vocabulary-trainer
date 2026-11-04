'use strict';

/* ---------- Helfer ---------- */
const $ = (s, el = document) => el.querySelector(s);
const app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Vergleich ohne Groß/Klein, Leerzeichen und Bindestriche ("floor lamp" = "floorlamp")
const norm = (s) => s.toLowerCase().replace(/[\s\-]+/g, '').trim();

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/* ---------- Daten ---------- */
const MASTER = 3;        // so oft hintereinander richtig = "gelernt"
const ROUND = 10;        // Fragen pro Quiz-Runde
const CARD_ROUND = 20;   // Karten pro Lernkarten-Runde
const STARS_PER_STICKER = 5;

const WORDS = ROOMS.flatMap((r) => r.words.map(([en, de, emoji]) => ({ id: `${r.id}|${en}`, en, de, emoji, room: r.id })));
const roomById = (id) => ROOMS.find((r) => r.id === id);

const STICKERS = ['🐶', '🐱', '🐰', '🦊', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐧', '🦉', '🦄', '🐝', '🦋', '🐢', '🐬', '🐳', '🦒', '🦓', '🐘', '🦔', '🦥', '🦩', '🐙', '🦖', '🐉', '🌈', '🍦', '🎠'];
const LEVELS = [
  [0, 'Vokabel-Küken', '🐣'],
  [100, 'Wort-Entdeckerin', '🔎'],
  [250, 'Fleißige Biene', '🐝'],
  [500, 'Englisch-Fuchs', '🦊'],
  [900, 'Vokabel-Profi', '🎓'],
  [1400, 'Sprach-Star', '🌟'],
  [2000, 'Wort-Zauberin', '🧙‍♀️'],
  [3000, 'Englisch-Heldin', '🦸‍♀️'],
  [4500, 'Vokabel-Königin', '👑'],
  [6500, 'Legende', '🏆'],
];
const PRAISE = ['Super!', 'Klasse!', 'Toll!', 'Genau!', 'Spitze!', 'Wow!', 'Perfekt!', 'Richtig gut!', 'Great!', 'Awesome!', 'Well done!', 'Yes!'];

/* ---------- Speicher ---------- */
const STORE = 'vokabeltrainer-v1';
const defaults = () => ({ name: '', points: 0, stars: 0, rounds: 0, words: {}, day: { last: null, count: 0 }, stickers: [], crowns: [], best: {}, sound: true, speak: true });
function load() { try { return { ...defaults(), ...JSON.parse(localStorage.getItem(STORE) || '{}') }; } catch { return defaults(); } }
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch { /* privat/voll */ } }
let S = load();

const stat = (w) => (S.words[w.id] ||= { c: 0, r: 0, w: 0 });
const learned = (w) => (S.words[w.id]?.c || 0) >= MASTER;

const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStr(d); };
function touchDay() {
  const t = dayStr();
  if (S.day.last === t) return;
  S.day.count = S.day.last === yesterday() ? S.day.count + 1 : 1;
  S.day.last = t;
}
const streakNow = () => (S.day.last === dayStr() || S.day.last === yesterday() ? S.day.count : 0);

function level(p = S.points) {
  let i = 0;
  while (i + 1 < LEVELS.length && p >= LEVELS[i + 1][0]) i++;
  const [min, title, icon] = LEVELS[i];
  return { i, title, icon, min, next: LEVELS[i + 1]?.[0] };
}

function updateBar() {
  $('#barPoints').textContent = S.points;
  $('#barStars').textContent = S.stars;
  $('#barStreak').textContent = streakNow();
}

/* ---------- Töne & Sprache ---------- */
let actx;
function tone(freqs, dur = 0.14, type = 'triangle', gap = 0.09, vol = 0.22) {
  if (!S.sound) return;
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      const st = t0 + i * gap;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(vol, st + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, st + dur);
      o.connect(g).connect(actx.destination);
      o.start(st); o.stop(st + dur + 0.02);
    });
  } catch { /* kein Audio */ }
}
const sfx = {
  right: () => tone([660, 990], 0.16),
  wrong: () => tone([260, 196], 0.22, 'sine', 0.13, 0.25),
  win: () => tone([523, 659, 784, 1047, 1319], 0.25, 'triangle', 0.11),
  combo: () => tone([784, 988, 1175, 1568], 0.12, 'triangle', 0.06),
};

const canSpeak = 'speechSynthesis' in window;
let voice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  voice = vs.find((v) => /en[-_]GB/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
}
if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function say(text) {
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang || 'en-GB';
  if (voice) u.voice = voice;
  u.rate = 0.85;
  speechSynthesis.speak(u);
}
const sayBtn = (text, cls = '') => (canSpeak ? `<button class="say ${cls}" data-say="${esc(text)}" aria-label="Vorlesen">🔊</button>` : '');

/* ---------- Effekte ---------- */
function confetti(n = 90) {
  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f1c'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
    c.style.animationDelay = Math.random() * 0.4 + 's';
    c.style.setProperty('--x', Math.random() * 200 - 100 + 'px');
    c.style.setProperty('--r', Math.random() * 720 + 'deg');
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}
function popText(txt, el) {
  const r = el.getBoundingClientRect();
  const p = document.createElement('div');
  p.className = 'pop';
  p.textContent = txt;
  p.style.left = r.left + r.width / 2 + 'px';
  p.style.top = r.top + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1000);
}

/* ---------- Auswahl ---------- */
function poolFor(target) {
  if (target === 'all') return WORDS;
  if (target === 'hard') return WORDS.filter((w) => { const s = S.words[w.id]; return s && s.w > 0 && s.c < MASTER; });
  return WORDS.filter((w) => w.room === target);
}
function targetInfo(target) {
  if (target === 'all') return { name: 'Alles gemischt', emoji: '🎲', color: '#ff9f1c' };
  if (target === 'hard') return { name: 'Schwierige Wörter', emoji: '💪', color: '#ef476f' };
  const r = roomById(target);
  return r && { name: r.name, emoji: r.emoji, color: r.color, sub: r.title };
}
const validTarget = (t) => t === 'all' || t === 'hard' || !!roomById(t);

// Wörter, die noch nicht so gut sitzen, kommen bevorzugt dran
function pickRound(pool, n) {
  return shuffle(pool.map((w) => ({ w, k: (S.words[w.id]?.c || 0) + Math.random() * 2 })).sort((a, b) => a.k - b.k).slice(0, n).map((x) => x.w));
}
// 3 falsche Antworten – bevorzugt aus demselben Raum, nie mit gleichem Text
function distractors(w, field) {
  const seen = new Set([norm(w[field])]);
  const out = [];
  const cands = [...shuffle(WORDS.filter((x) => x.room === w.room)), ...shuffle(WORDS.filter((x) => x.room !== w.room))];
  for (const x of cands) {
    const k = norm(x[field]);
    if (seen.has(k)) continue;
    seen.add(k); out.push(x);
    if (out.length === 3) break;
  }
  return out;
}

/* ---------- Runde ---------- */
let session = null;
const dirFor = (mode) => (mode === 'mix' ? (Math.random() < 0.5 ? 'de-en' : 'en-de') : mode);

function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

function startSession(target, mode, words) {
  const list = words ? shuffle(words) : pickRound(poolFor(target), mode === 'cards' ? CARD_ROUND : ROUND);
  session = {
    target, mode,
    queue: list.map((w) => ({ w, dir: dirFor(mode) })),
    i: 0, first: {}, points: 0, combo: 0, maxCombo: 0, retries: {},
    learnedBefore: WORDS.filter(learned).length,
  };
  go('#/play');
}

function next() { session.i++; session.answered = false; renderSession(); }

function renderSession() {
  const s = session;
  if (s.i >= s.queue.length) return finish();
  window.scrollTo(0, 0);
  if (s.mode === 'cards') renderCard();
  else if (s.mode === 'type') renderType();
  else renderQuiz();
}

function playHead() {
  const s = session;
  const pct = Math.min(100, (s.i / s.queue.length) * 100);
  return `<div class="play-head">
    <button class="icon-btn" data-quit aria-label="Abbrechen">✕</button>
    <div class="bar big"><div style="width:${pct}%"></div></div>
    <div class="combo ${s.combo >= 3 ? 'hot' : ''}" id="combo">🔥 ${s.combo}</div>
  </div>`;
}

function requeue(w) {
  const s = session;
  s.retries[w.id] = (s.retries[w.id] || 0) + 1;
  if (s.retries[w.id] <= 2) s.queue.push({ w, dir: dirFor(s.mode) });
}

function right(w, el, base = 10, countMastery = true) {
  const s = session;
  const st = stat(w);
  if (countMastery) st.c++;
  st.r++;
  s.combo++;
  s.maxCombo = Math.max(s.maxCombo, s.combo);
  const bonus = s.combo >= 3 ? Math.min(s.combo, 10) : 0;
  const pts = base + bonus;
  s.points += pts; S.points += pts;
  if (!(w.id in s.first)) s.first[w.id] = true;
  save(); updateBar();
  popText('+' + pts, el);
  const c = $('#combo'); if (c) { c.textContent = '🔥 ' + s.combo; c.classList.toggle('hot', s.combo >= 3); }
  const fb = $('#fb');
  fb.className = 'feedback ok';
  fb.innerHTML = `<div class="praise">${pick(PRAISE)} ${w.emoji}</div>` + (s.combo >= 3 ? `<div class="streak">🔥 ${s.combo}er-Serie! +${bonus} Bonus</div>` : '');
  if (s.combo > 0 && s.combo % 5 === 0) { sfx.combo(); confetti(45); } else sfx.right();
}

function wrong(w, html, withButton = true, note = '') {
  const s = session;
  const st = stat(w);
  st.c = 0; st.w++;
  s.combo = 0;
  if (!(w.id in s.first)) s.first[w.id] = false;
  requeue(w);
  save();
  sfx.wrong();
  navigator.vibrate?.(120);
  const c = $('#combo'); if (c) { c.textContent = '🔥 0'; c.classList.remove('hot'); }
  const fb = $('#fb');
  fb.className = 'feedback bad';
  fb.innerHTML = `<div class="praise">Nicht ganz! ${w.emoji}</div><div>${html} ${sayBtn(w.en, 'sm')}</div>${note ? `<small>${note}</small>` : ''}<small>Das Wort kommt gleich nochmal.</small>`
    + (withButton ? `<button class="btn primary" id="nextBtn">Weiter ➜</button>` : '');
  if (withButton) { $('#nextBtn').onclick = next; }
  if (S.speak) say(w.en);
}

/* Quiz (Multiple Choice) */
function renderQuiz() {
  const s = session;
  const { w, dir } = s.queue[s.i];
  const toEn = dir === 'de-en';
  const field = toEn ? 'en' : 'de';
  const opts = shuffle([w, ...distractors(w, field)]);
  app.innerHTML = playHead() + `
    <div class="qcard" style="--rc:${roomById(w.room).color}">
      <small>${toEn ? 'Was heißt auf Englisch …' : 'Was heißt auf Deutsch …'}</small>
      <div class="qword">${esc(toEn ? w.de : w.en)}</div>
      ${toEn ? '' : sayBtn(w.en)}
    </div>
    <div class="options">${opts.map((o) => `<button class="opt" data-ok="${norm(o[field]) === norm(w[field]) ? 1 : 0}">${esc(o[field])}</button>`).join('')}</div>
    <div class="feedback" id="fb"></div>`;
  if (!toEn && S.speak) say(w.en);
  app.querySelectorAll('.opt').forEach((b) => (b.onclick = () => {
    app.querySelectorAll('.opt').forEach((x) => (x.disabled = true));
    if (b.dataset.ok === '1') {
      b.classList.add('right');
      right(w, b);
      if (S.speak && toEn) say(w.en);
      setTimeout(next, 1200);
    } else {
      b.classList.add('wrong');
      app.querySelector('.opt[data-ok="1"]').classList.add('right');
      wrong(w, `${esc(w.de)} = <b>${esc(w.en)}</b>`);
    }
  }));
}

/* Schreiben */
function pattern(word, reveal) {
  let k = 0;
  return [...word].map((ch) => {
    if (ch === ' ') return '<span class="gap"></span>';
    if (ch === '-') return '<span class="ch dash">-</span>';
    return `<span class="ch">${k++ < reveal ? esc(ch) : ''}</span>`;
  }).join('');
}
function renderType() {
  const s = session;
  const { w } = s.queue[s.i];
  let hint = 0;
  const letters = w.en.replace(/[\s-]/g, '').length;
  app.innerHTML = playHead() + `
    <div class="qcard" style="--rc:${roomById(w.room).color}">
      <small>Schreibe auf Englisch …</small>
      <div class="qword">${esc(w.de)}</div>
      <div class="pattern" id="pattern">${pattern(w.en, 0)}</div>
    </div>
    <form id="typeForm" class="type-form" autocomplete="off">
      <input id="typeIn" type="text" autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go" placeholder="Englisches Wort …" aria-label="Antwort">
      <div class="row">
        <button type="button" class="btn ghost" id="hintBtn">💡 Tipp</button>
        <button class="btn primary" type="submit" id="checkBtn">Prüfen ✓</button>
      </div>
    </form>
    <div class="feedback" id="fb"></div>`;
  const inp = $('#typeIn');
  inp.focus();
  $('#hintBtn').onclick = () => {
    if (hint < letters - 1) { hint++; $('#pattern').innerHTML = pattern(w.en, hint); }
    inp.focus();
  };
  $('#typeForm').onsubmit = (e) => {
    e.preventDefault();
    if (s.answered) return next();
    const v = inp.value;
    if (!v.trim()) return;
    s.answered = true;
    inp.readOnly = true;
    $('#hintBtn').disabled = true;
    $('#checkBtn').textContent = 'Weiter ➜';
    $('#pattern').innerHTML = pattern(w.en, 99);
    const a = norm(v), b = norm(w.en);
    if (a === b) {
      inp.classList.add('right');
      right(w, inp, hint ? 5 : 10, hint === 0);
      if (hint) $('#fb').innerHTML += '<small>Mit Tipp gibt es halbe Punkte.</small>';
      if (S.speak) say(w.en);
    } else if (b.length >= 4 && lev(a, b) === 1) {
      inp.classList.add('almost');
      right(w, inp, 5, false);
      $('#fb').className = 'feedback almost';
      $('#fb').innerHTML = `<div class="praise">Fast perfekt! 🤏</div><div>Richtig geschrieben: <b>${esc(w.en)}</b> ${sayBtn(w.en, 'sm')}</div>`;
      if (S.speak) say(w.en);
    } else {
      inp.classList.add('wrong');
      wrong(w, `Richtig: <b>${esc(w.en)}</b>`, false, `Du hast geschrieben: ${esc(v)}`);
    }
  };
}

/* Lernkarten */
function renderCard() {
  const s = session;
  const { w } = s.queue[s.i];
  app.innerHTML = playHead() + `
    <div class="flip" id="flip" style="--rc:${roomById(w.room).color}">
      <div class="flip-inner">
        <div class="face front"><span class="fc-emoji">${w.emoji}</span><small>Deutsch</small><div class="qword">${esc(w.de)}</div><small class="tap">👆 Tippen zum Umdrehen</small></div>
        <div class="face back"><span class="fc-emoji">${w.emoji}</span><small>Englisch</small><div class="qword">${esc(w.en)}</div>${sayBtn(w.en)}</div>
      </div>
    </div>
    <div class="row card-btns" id="cardBtns" hidden>
      <button class="btn bad" id="again">😕 Nochmal</button>
      <button class="btn good" id="knew">😊 Gewusst!</button>
    </div>
    <div class="feedback" id="fb"></div>`;
  $('#flip').onclick = (e) => {
    if (e.target.closest('[data-say]')) return;
    const f = $('#flip');
    f.classList.toggle('flipped');
    if (f.classList.contains('flipped')) { $('#cardBtns').hidden = false; if (S.speak) say(w.en); }
  };
  $('#knew').onclick = () => {
    if (!(w.id in s.first)) s.first[w.id] = true;
    s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo);
    s.points += 2; S.points += 2;
    save(); updateBar(); sfx.right();
    next();
  };
  $('#again').onclick = () => {
    if (!(w.id in s.first)) s.first[w.id] = false;
    s.combo = 0;
    requeue(w);
    next();
  };
}

/* Ergebnis */
function finish() {
  const s = session;
  if (s.finished) return renderResult(false);
  s.finished = true;
  const ids = Object.keys(s.first);
  const good = ids.filter((id) => s.first[id]).length;
  const tot = ids.length;
  const ratio = tot ? good / tot : 0;
  // Lernkarten = Selbsteinschätzung, daher immer 1 Stern fürs Durcharbeiten
  const stars = s.mode === 'cards' ? 1 : ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.5 ? 1 : 0;
  S.stars += stars;
  S.rounds++;
  touchDay();
  if (s.target !== 'hard') { const k = `${s.target}:${s.mode}`; S.best[k] = Math.max(S.best[k] || 0, stars); }

  const earned = Math.min(STICKERS.length, Math.floor(S.stars / STARS_PER_STICKER));
  s.newStickers = [];
  while (S.stickers.length < earned) { const st = STICKERS[S.stickers.length]; S.stickers.push(st); s.newStickers.push(st); }
  s.newCrowns = ROOMS.filter((r) => !S.crowns.includes(r.id) && poolFor(r.id).every(learned));
  s.newCrowns.forEach((r) => S.crowns.push(r.id));

  s.result = { good, tot, stars, learnedNew: WORDS.filter(learned).length - s.learnedBefore };
  s.wrongWords = ids.filter((id) => !s.first[id]).map((id) => WORDS.find((w) => w.id === id));
  save(); updateBar();
  renderResult(true);
}

function renderResult(celebrate) {
  const s = session, r = s.result;
  const msg = r.stars === 3 ? 'Fantastisch! 🎉' : r.stars === 2 ? 'Sehr gut gemacht! 😊' : r.stars === 1 ? 'Gut! Weiter so! 💪' : 'Übung macht den Meister! 🍀';
  const allStickers = S.stickers.length >= STICKERS.length;
  app.innerHTML = `
  <div class="result">
    <div class="stars ${celebrate ? 'anim' : ''}">${[1, 2, 3].map((i) => `<span class="star ${i <= r.stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</span>`).join('')}</div>
    <h1>${msg}</h1>
    <p class="big">${s.mode === 'cards' ? `${r.good} von ${r.tot} Karten sofort gewusst` : `${r.good} von ${r.tot} beim ersten Versuch richtig`}</p>
    <div class="chips">
      <span>🏆 +${s.points} Punkte</span>
      <span>🔥 Beste Serie: ${s.maxCombo}</span>
      ${r.learnedNew > 0 ? `<span>🧠 ${r.learnedNew} neu gelernt</span>` : ''}
    </div>
    ${s.newStickers.length
      ? `<div class="reward"><div class="reward-st">${s.newStickers.join(' ')}</div><b>Neuer Sticker!</b> Schau in dein Album.</div>`
      : allStickers ? '' : `<p class="muted">Noch ${STARS_PER_STICKER - (S.stars % STARS_PER_STICKER)} ⭐ bis zum nächsten Sticker</p>`}
    ${s.newCrowns.map((c) => `<div class="reward crown">👑 <b>${c.name} gemeistert!</b><br>Du kannst alle Wörter aus diesem Raum!</div>`).join('')}
    ${s.wrongWords.length ? `<div class="review"><h3>Diese Wörter üben wir nochmal:</h3>${s.wrongWords.map((w) => `<div class="rv"><span>${w.emoji} ${esc(w.de)}</span><b>${esc(w.en)}</b>${sayBtn(w.en, 'sm')}</div>`).join('')}</div>` : ''}
    <div class="col">
      ${s.wrongWords.length ? `<button class="btn primary" id="practise">💪 Fehler üben</button>` : ''}
      <button class="btn ${s.wrongWords.length ? 'ghost' : 'primary'}" id="again">🔁 Neue Runde</button>
      <a class="btn ghost" href="#/room/${s.target}">← Zurück</a>
    </div>
  </div>`;
  $('#again').onclick = () => startSession(s.target, s.mode);
  if (s.wrongWords.length) $('#practise').onclick = () => startSession(s.target, s.mode, s.wrongWords);
  if (celebrate && (r.stars >= 2 || s.newStickers.length || s.newCrowns.length)) { confetti(); sfx.win(); }
}

/* ---------- Seiten ---------- */
function roomCard(r) {
  const ws = poolFor(r.id);
  const n = ws.filter(learned).length;
  return `<a class="room" href="#/room/${r.id}" style="--rc:${r.color}">
    <span class="room-emoji">${r.emoji}</span>
    <b>${r.name}</b>
    <small class="en">${r.title}</small>
    <div class="bar"><div style="width:${(n / ws.length) * 100}%"></div></div>
    <small>${n === ws.length ? '👑 Gemeistert!' : `${n}/${ws.length} gelernt`}</small>
  </a>`;
}

function renderHome() {
  const lv = level();
  const pct = lv.next ? Math.round(((S.points - lv.min) / (lv.next - lv.min)) * 100) : 100;
  const hard = poolFor('hard').length;
  app.innerHTML = `
    <section class="hello">
      <div class="lvl-icon">${lv.icon}</div>
      <div class="hello-text">
        <h1>Hallo${S.name ? ' ' + esc(S.name) : ''}! 👋</h1>
        <p>Level ${lv.i + 1} · <b>${lv.title}</b></p>
        <div class="bar"><div style="width:${pct}%"></div></div>
        <small>${lv.next ? `Noch ${lv.next - S.points} Punkte bis Level ${lv.i + 2}` : 'Höchstes Level erreicht! 🏆'}</small>
      </div>
    </section>
    <h2>Wähle einen Raum</h2>
    <div class="rooms">${ROOMS.map(roomCard).join('')}</div>
    <a class="big-card" href="#/room/all" style="--rc:#ff9f1c"><span>🎲</span><div><b>Alles gemischt</b><small>${WORDS.length} Wörter aus allen Räumen</small></div></a>
    ${hard ? `<a class="big-card" href="#/room/hard" style="--rc:#ef476f"><span>💪</span><div><b>Schwierige Wörter üben</b><small>${hard} ${hard === 1 ? 'Wort' : 'Wörter'}, die noch nicht sitzen</small></div></a>` : ''}
    <div class="row">
      <a class="btn ghost" href="#/album">📒 Sticker-Album <span class="pill">${S.stickers.length}/${STICKERS.length}</span></a>
      <a class="btn ghost square" href="#/settings" aria-label="Einstellungen">⚙️</a>
    </div>`;
}

const MODES = [
  ['cards', '🃏', 'Lernkarten', 'Karten umdrehen und merken'],
  ['de-en', '🇩🇪→🇬🇧', 'Quiz: Deutsch → Englisch', 'Tippe das richtige englische Wort an'],
  ['en-de', '🇬🇧→🇩🇪', 'Quiz: Englisch → Deutsch', 'Tippe das richtige deutsche Wort an'],
  ['mix', '🔀', 'Quiz: Gemischt', 'Mal so herum, mal anders herum'],
  ['type', '⌨️', 'Schreiben', 'Schreibe das englische Wort selbst'],
];

function renderRoom(target) {
  const info = targetInfo(target);
  const pool = poolFor(target);
  if (!info || !pool.length) return go('#/');
  app.innerHTML = `
    <div class="room-head" style="--rc:${info.color}">
      <span>${info.emoji}</span>
      <div><h1>${info.name}</h1>${info.sub ? `<small>„${info.sub}“ · ${pool.length} Wörter</small>` : `<small>${pool.length} Wörter</small>`}</div>
    </div>
    <div class="modes">${MODES.map(([id, ic, t, d]) => {
      const b = S.best[`${target}:${id}`] || 0;
      return `<button class="mode" data-start="${id}" style="--rc:${info.color}">
        <span class="mode-ic">${ic}</span>
        <span class="mode-txt"><b>${t}</b><small>${d}</small></span>
        ${target === 'hard' ? '' : `<span class="best" aria-label="${b} Sterne">${'★'.repeat(b)}<i>${'★'.repeat(3 - b)}</i></span>`}
      </button>`;
    }).join('')}</div>
    <a class="btn ghost" href="#/list/${target}">📋 Wörterliste ansehen</a>
    <a class="btn ghost" href="#/">← Zurück</a>`;
  app.querySelectorAll('[data-start]').forEach((b) => (b.onclick = () => startSession(target, b.dataset.start)));
}

function renderList(target) {
  const info = targetInfo(target);
  const pool = poolFor(target);
  if (!info || !pool.length) return go('#/');
  app.innerHTML = `
    <h1>${info.emoji} ${info.name}</h1>
    <p class="muted">●●● = gelernt (${MASTER}× hintereinander richtig)</p>
    <div class="wlist">${pool.map((w) => {
      const c = Math.min(S.words[w.id]?.c || 0, MASTER);
      return `<div class="wl ${c >= MASTER ? 'ok' : ''}">
        <span class="wl-e">${w.emoji}</span>
        <span class="wl-w"><b>${esc(w.en)}</b><small>${esc(w.de)}</small></span>
        <span class="wl-m">${'●'.repeat(c)}${'○'.repeat(MASTER - c)}</span>
        ${sayBtn(w.en, 'sm')}
      </div>`;
    }).join('')}</div>
    <a class="btn ghost" href="#/room/${target}">← Zurück</a>`;
}

function renderAlbum() {
  app.innerHTML = `
    <h1>📒 Sticker-Album</h1>
    <p class="muted">Für je ${STARS_PER_STICKER} ⭐ bekommst du einen neuen Sticker. Du hast schon ${S.stars} ⭐ gesammelt!</p>
    <div class="album">${STICKERS.map((st, i) => (i < S.stickers.length
      ? `<div class="sticker">${st}</div>`
      : `<div class="sticker locked"><span>?</span><small>${(i + 1) * STARS_PER_STICKER} ⭐</small></div>`)).join('')}</div>
    <h2>Kronen 👑</h2>
    <p class="muted">Lerne alle Wörter eines Raums, um seine Krone zu bekommen.</p>
    <div class="crowns">${ROOMS.map((r) => {
      const on = S.crowns.includes(r.id);
      return `<div class="crown-item ${on ? 'on' : ''}" style="--rc:${r.color}"><span class="ce">${r.emoji}</span><small>${r.name}</small><span>${on ? '👑' : '🔒'}</span></div>`;
    }).join('')}</div>
    <a class="btn ghost" href="#/">← Zurück</a>`;
}

function renderSettings() {
  app.innerHTML = `
    <h1>⚙️ Einstellungen</h1>
    <label class="field">Dein Name<input id="nameIn" maxlength="20" value="${esc(S.name)}" placeholder="z. B. Lena" autocomplete="off"></label>
    <label class="toggle"><span>🔔 Töne</span><input type="checkbox" id="sndIn" ${S.sound ? 'checked' : ''}></label>
    <label class="toggle"><span>🔊 Englische Wörter vorlesen</span><input type="checkbox" id="spkIn" ${S.speak ? 'checked' : ''}></label>
    <div class="statbox">
      <div><b>${S.rounds}</b><small>Runden</small></div>
      <div><b>${WORDS.filter(learned).length}/${WORDS.length}</b><small>Wörter gelernt</small></div>
      <div><b>${S.day.count}</b><small>Tage am Stück</small></div>
    </div>
    <button class="btn bad" id="resetBtn">Fortschritt zurücksetzen</button>
    <a class="btn primary" href="#/">✓ Fertig</a>`;
  $('#nameIn').oninput = (e) => { S.name = e.target.value.trim(); save(); };
  $('#sndIn').onchange = (e) => { S.sound = e.target.checked; save(); };
  $('#spkIn').onchange = (e) => { S.speak = e.target.checked; save(); };
  $('#resetBtn').onclick = () => {
    if (confirm('Wirklich alles zurücksetzen? Punkte, Sterne und Sticker gehen verloren.')) { S = defaults(); save(); updateBar(); go('#/'); }
  };
}

/* ---------- Router ---------- */
function route() {
  const [, page = '', arg] = (location.hash || '#/').split('/');
  if (canSpeak) speechSynthesis.cancel();
  if (page !== 'play') window.scrollTo(0, 0);
  switch (page) {
    case 'room': return validTarget(arg) ? renderRoom(arg) : go('#/');
    case 'list': return validTarget(arg) ? renderList(arg) : go('#/');
    case 'album': return renderAlbum();
    case 'settings': return renderSettings();
    case 'play':
      if (session) return session.finished ? renderResult(false) : renderSession();
      return go('#/');
    default: return renderHome();
  }
}

document.addEventListener('click', (e) => {
  const sb = e.target.closest('[data-say]');
  if (sb) { say(sb.dataset.say); return; }
  if (e.target.closest('[data-quit]') && session && confirm('Runde wirklich abbrechen?')) {
    const t = session.target;
    session = null;
    location.hash = '#/room/' + t;
  }
});
window.addEventListener('hashchange', route);

updateBar();
route();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
