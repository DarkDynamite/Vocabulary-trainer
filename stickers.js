'use strict';
/* Alles rund um Sticker: Namen (Englisch/Deutsch), Album-Details, Begleiter und Sticker-Bild.
   Wird vor app.js geladen; die Funktionen nutzen zur Laufzeit S, save, say, esc, app usw. aus app.js. */

// [Emoji, Englisch, Deutsch] – Reihenfolge = Reihenfolge, in der sie freigeschaltet werden
const STICKER_INFO = [
  ['🐶', 'dog', 'Hund'], ['🐱', 'cat', 'Katze'], ['🐰', 'rabbit', 'Hase'], ['🦊', 'fox', 'Fuchs'],
  ['🐼', 'panda', 'Panda'], ['🐨', 'koala', 'Koala'], ['🐯', 'tiger', 'Tiger'], ['🦁', 'lion', 'Löwe'],
  ['🐸', 'frog', 'Frosch'], ['🐵', 'monkey', 'Affe'], ['🐧', 'penguin', 'Pinguin'], ['🦉', 'owl', 'Eule'],
  ['🦄', 'unicorn', 'Einhorn'], ['🐝', 'bee', 'Biene'], ['🦋', 'butterfly', 'Schmetterling'], ['🐢', 'turtle', 'Schildkröte'],
  ['🐬', 'dolphin', 'Delfin'], ['🐳', 'whale', 'Wal'], ['🦒', 'giraffe', 'Giraffe'], ['🦓', 'zebra', 'Zebra'],
  ['🐘', 'elephant', 'Elefant'], ['🦔', 'hedgehog', 'Igel'], ['🦥', 'sloth', 'Faultier'], ['🦩', 'flamingo', 'Flamingo'],
  ['🐙', 'octopus', 'Krake'], ['🦖', 'dinosaur', 'Dinosaurier'], ['🐉', 'dragon', 'Drache'], ['🌈', 'rainbow', 'Regenbogen'],
  ['🍦', 'ice cream', 'Eis'], ['🎠', 'carousel', 'Karussell'],
];
const stickerInfo = (e) => STICKER_INFO.find((x) => x[0] === e) || [e, '', ''];

/* ---------- Begleiter ---------- */
const BUDDY_YAY = ['Yay!', 'Super!', 'Great!', 'Juhu!', 'Cool!', 'Wow!', 'Yes!', '❤️'];
const BUDDY_SAD = ['Oh nein!', 'Fast!', 'Nicht schlimm!', 'Weiter so!', 'Du schaffst das!'];

function renderBuddy() {
  const slot = document.getElementById('buddySlot');
  if (!slot) return;
  slot.innerHTML = S.buddy ? `<button class="buddy" id="buddy" data-buddy aria-label="Dein Begleiter">${S.buddy}</button>` : '';
}
function buddyBubble(text) {
  const b = document.getElementById('buddy');
  if (!b) return;
  document.querySelectorAll('.buddy-bubble').forEach((x) => x.remove());
  const r = b.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'buddy-bubble';
  el.textContent = text;
  el.style.left = r.left + 'px';
  el.style.top = r.bottom + 8 + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}
let buddyTimer;
function buddyReact(kind, text) {
  const b = document.getElementById('buddy');
  if (!b) return;
  b.classList.remove('cheer', 'sad', 'party');
  void b.offsetWidth; // Animation neu starten
  b.classList.add(kind);
  clearTimeout(buddyTimer);
  buddyTimer = setTimeout(() => b.classList.remove(kind), 1300);
  if (text !== null) buddyBubble(text || pick(kind === 'sad' ? BUDDY_SAD : BUDDY_YAY));
}

/* ---------- Album ---------- */
function renderAlbum() {
  const have = S.stickers.length;
  app.innerHTML = `
    <h1>📒 Sticker-Album</h1>
    <p class="muted">Für je ${STARS_PER_STICKER} ⭐ bekommst du einen neuen Sticker. Du hast schon ${S.stars} ⭐ gesammelt!
      ${have ? 'Tippe auf einen Sticker – er sagt dir, wie er auf Englisch heißt.' : ''}</p>
    <div class="st-detail" id="stDetail" hidden></div>
    ${have ? `<a class="btn primary" href="#/board">🎨 Sticker-Bild gestalten</a>` : ''}
    <div class="album">${STICKERS.map((st, i) => (i < have
      ? `<button class="sticker ${S.buddy === st ? 'is-buddy' : ''}" data-st="${st}" aria-label="${esc(stickerInfo(st)[2])}">${st}</button>`
      : `<button class="sticker locked" data-locked="${i}"><span>?</span><small>${(i + 1) * STARS_PER_STICKER} ⭐</small></button>`)).join('')}</div>
    <h2>Kronen 👑</h2>
    <p class="muted">Lerne alle Wörter eines Raums, um seine Krone zu bekommen.</p>
    <div class="crowns">${ROOMS.map((r) => {
      const on = S.crowns.includes(r.id);
      return `<div class="crown-item ${on ? 'on' : ''}" style="--rc:${r.color}"><span class="ce">${r.emoji}</span><small>${r.name}</small><span>${on ? '👑' : '🔒'}</span></div>`;
    }).join('')}</div>
    <a class="btn ghost" href="#/">← Zurück</a>`;

  app.querySelectorAll('[data-st]').forEach((b) => (b.onclick = () => showSticker(b.dataset.st, b)));
  app.querySelectorAll('[data-locked]').forEach((b) => (b.onclick = () => {
    const need = (Number(b.dataset.locked) + 1) * STARS_PER_STICKER - S.stars;
    const d = $('#stDetail');
    d.hidden = false;
    d.innerHTML = `<div class="st-big">❔</div><div><b>Noch geheim!</b><br><small>Noch ${need} ⭐, dann gehört dieser Sticker dir.</small></div>`;
  }));
}

function showSticker(st, tile) {
  const [, en, de] = stickerInfo(st);
  const d = $('#stDetail');
  d.hidden = false;
  const isBuddy = S.buddy === st;
  d.innerHTML = `
    <div class="st-big hop">${st}</div>
    <div class="st-names">
      <div class="st-en"><b>${esc(en)}</b> ${sayBtn(en, 'sm')}</div>
      <small>auf Deutsch: ${esc(de)}</small>
      <button class="btn ${isBuddy ? 'good' : 'ghost'} st-buddy" id="buddyBtn">${isBuddy ? '✓ Dein Begleiter' : '💛 Als Begleiter wählen'}</button>
    </div>`;
  say(en);
  tile.classList.remove('hop'); void tile.offsetWidth; tile.classList.add('hop');
  $('#buddyBtn').onclick = () => {
    S.buddy = S.buddy === st ? null : st;
    save(); renderBuddy();
    if (S.buddy) { buddyReact('party', `Hi! I'm a ${en}!`); sfx.right(); }
    app.querySelectorAll('.sticker').forEach((x) => x.classList.toggle('is-buddy', x.dataset.st === S.buddy));
    showSticker(st, tile);
  };
}

/* ---------- Sticker-Bild ---------- */
const BOARD_BGS = [
  ['meadow', '🌳', 'Wiese'], ['sea', '🌊', 'Meer'], ['space', '🚀', 'Weltraum'], ['room', '🛋️', 'Zimmer'],
];
const MAX_BOARD_ITEMS = 80;
let boardSel = -1;

function renderBoard() {
  S.board ||= { bg: 'meadow', items: [] };
  const B = S.board;
  if (!S.stickers.length) {
    app.innerHTML = `<h1>🎨 Sticker-Bild</h1>
      <p class="muted">Du hast noch keine Sticker. Für je ${STARS_PER_STICKER} ⭐ gibt es einen – spiel ein paar Runden!</p>
      <a class="btn primary" href="#/">Los geht's!</a>`;
    return;
  }
  boardSel = -1;
  app.innerHTML = `
    <h1>🎨 Sticker-Bild</h1>
    <div class="bg-pick">${BOARD_BGS.map(([id, ic, name]) => `<button class="chip ${B.bg === id ? 'on' : ''}" data-bg="${id}"><span>${ic}</span>${name}</button>`).join('')}</div>
    <div class="board bg-${B.bg}" id="board"></div>
    <div class="board-tools" id="tools">
      <button class="btn ghost" data-tool="smaller" aria-label="Kleiner">➖</button>
      <button class="btn ghost" data-tool="bigger" aria-label="Größer">➕</button>
      <button class="btn ghost" data-tool="rotate" aria-label="Drehen">↻</button>
      <button class="btn ghost" data-tool="front" aria-label="Nach vorne">⬆️</button>
      <button class="btn bad" data-tool="delete" aria-label="Entfernen">🗑️</button>
    </div>
    <p class="muted board-help" id="boardHelp"></p>
    <div class="tray">${S.stickers.map((st) => `<button data-add="${st}" aria-label="${esc(stickerInfo(st)[2])} einkleben">${st}</button>`).join('')}</div>
    <div class="row">
      <button class="btn ghost" id="clearBoard">🧹 Alles ablösen</button>
      <a class="btn ghost" href="#/album">← Album</a>
    </div>`;
  const board = $('#board');
  const fit = () => { board.style.fontSize = board.clientWidth / 7 + 'px'; };
  fit();
  window.onresize = () => { if ($('#board')) fit(); };
  drawBoard();

  app.querySelectorAll('[data-bg]').forEach((b) => (b.onclick = () => {
    B.bg = b.dataset.bg; save();
    board.className = 'board bg-' + B.bg;
    app.querySelectorAll('[data-bg]').forEach((x) => x.classList.toggle('on', x === b));
  }));
  app.querySelectorAll('[data-add]').forEach((b) => (b.onclick = () => {
    if (B.items.length >= MAX_BOARD_ITEMS) { buddyBubble('Das Bild ist voll!'); return; }
    const jitter = () => 50 + (Math.random() * 30 - 15);
    B.items.push({ e: b.dataset.add, x: jitter(), y: jitter(), s: 1, r: 0 });
    boardSel = B.items.length - 1;
    save(); drawBoard(); sfx.right();
    if (S.speak) say(stickerInfo(b.dataset.add)[1]);
  }));
  app.querySelectorAll('[data-tool]').forEach((b) => (b.onclick = () => {
    const it = B.items[boardSel];
    if (!it) return;
    const t = b.dataset.tool;
    if (t === 'bigger') it.s = Math.min(3, +(it.s * 1.25).toFixed(2));
    if (t === 'smaller') it.s = Math.max(0.4, +(it.s * 0.8).toFixed(2));
    if (t === 'rotate') it.r = (it.r + 30) % 360;
    if (t === 'front') { B.items.splice(boardSel, 1); B.items.push(it); boardSel = B.items.length - 1; }
    if (t === 'delete') { B.items.splice(boardSel, 1); boardSel = -1; }
    save(); drawBoard();
  }));
  $('#clearBoard').onclick = () => {
    if (B.items.length && confirm('Alle Sticker vom Bild ablösen? (Deine Sticker im Album bleiben.)')) { B.items = []; boardSel = -1; save(); drawBoard(); }
  };

  // Verschieben mit dem Finger
  let drag = null;
  board.onpointerdown = (e) => {
    const el = e.target.closest('.bitem');
    if (!el) { boardSel = -1; drawBoard(); return; }
    const i = Number(el.dataset.i);
    const r = el.getBoundingClientRect();
    drag = { i, el, dx: r.left + r.width / 2 - e.clientX, dy: r.top + r.height / 2 - e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
    board.setPointerCapture(e.pointerId);
    if (boardSel !== i) { boardSel = i; drawBoard(); drag.el = board.querySelector(`[data-i="${i}"]`); }
    e.preventDefault();
  };
  board.onpointermove = (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const br = board.getBoundingClientRect();
    const it = B.items[drag.i];
    it.x = Math.max(0, Math.min(100, ((e.clientX + drag.dx - br.left) / br.width) * 100));
    it.y = Math.max(0, Math.min(100, ((e.clientY + drag.dy - br.top) / br.height) * 100));
    drag.el.style.left = it.x + '%';
    drag.el.style.top = it.y + '%';
  };
  const end = () => {
    if (!drag) return;
    const it = B.items[drag.i];
    if (!drag.moved && it) { // nur angetippt → Sticker sagt seinen Namen
      say(stickerInfo(it.e)[1]);
      drag.el.classList.remove('hop'); void drag.el.offsetWidth; drag.el.classList.add('hop');
    }
    drag = null;
    save();
  };
  board.onpointerup = end;
  board.onpointercancel = end;
}

function drawBoard() {
  const board = $('#board');
  if (!board) return;
  const B = S.board;
  board.innerHTML = B.items.map((it, i) => `<div class="bitem ${i === boardSel ? 'sel' : ''}" data-i="${i}"
    style="left:${it.x}%;top:${it.y}%;font-size:${it.s}em;--r:${it.r}deg">${it.e}</div>`).join('')
    || '<div class="board-empty">Tippe unten auf einen Sticker,<br>um ihn hier einzukleben 👇</div>';
  $('#tools').classList.toggle('active', boardSel >= 0);
  $('#boardHelp').textContent = boardSel >= 0
    ? 'Ziehe den Sticker mit dem Finger. Mit den Knöpfen unter dem Bild: kleiner, größer, drehen, nach vorne oder entfernen.'
    : B.items.length ? 'Tippe einen Sticker im Bild an, um ihn zu verschieben oder zu ändern.' : '';
}
