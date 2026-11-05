'use strict';
/* Alles rund um Sticker: Namen (Englisch/Deutsch), Sammlung, Begleiter und Stickeralbum mit Seiten.
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
    <h1>📒 Meine Sticker</h1>
    <p class="muted">Für je ${STARS_PER_STICKER} ⭐ bekommst du einen neuen Sticker. Du hast schon ${S.stars} ⭐ gesammelt!
      ${have ? 'Tippe auf einen Sticker – er sagt dir, wie er auf Englisch heißt.' : ''}</p>
    <div class="st-detail" id="stDetail" hidden></div>
    ${have ? `<a class="btn primary" href="#/board">📖 Ins Stickeralbum kleben</a>` : ''}
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

/* ---------- Stickeralbum (mehrere Seiten zum Bekleben) ---------- */
const BOARD_BGS = [
  ['meadow', '🌳', 'Wiese'], ['sea', '🌊', 'Meer'], ['space', '🚀', 'Weltraum'], ['room', '🛋️', 'Zimmer'],
];
const MAX_BOARD_ITEMS = 80;
const MAX_PAGES = 30;
let boardSel = -1;

function albumPages() {
  if (!Array.isArray(S.pages) || !S.pages.length) S.pages = [{ bg: 'meadow', items: [] }];
  S.page = Math.max(0, Math.min(S.pages.length - 1, S.page | 0));
  return S.pages;
}
const curPage = () => albumPages()[S.page];
const itemsHTML = (items, sel = -1) => items.map((it, i) => `<div class="bitem ${i === sel ? 'sel' : ''}" data-i="${i}"
    style="left:${it.x}%;top:${it.y}%;font-size:${it.s}em;--r:${it.r}deg">${it.e}</div>`).join('');

function goPage(i, dir) {
  if (i < 0 || i >= albumPages().length || i === S.page) return;
  S.page = i; save();
  renderBoard(dir ?? 0);
}

function renderBoard(flip = 0) {
  if (!S.stickers.length) {
    app.innerHTML = `<h1>📖 Mein Stickeralbum</h1>
      <p class="muted">Du hast noch keine Sticker. Für je ${STARS_PER_STICKER} ⭐ gibt es einen – spiel ein paar Runden!</p>
      <a class="btn primary" href="#/">Los geht's!</a>`;
    return;
  }
  const pages = albumPages();
  const B = curPage();
  boardSel = -1;
  app.innerHTML = `
    <h1>📖 Mein Stickeralbum</h1>
    <div class="album-nav">
      <button class="icon-btn" id="prevPage" aria-label="Vorherige Seite" ${S.page === 0 ? 'disabled' : ''}>◀</button>
      <div class="page-label">Seite <b>${S.page + 1}</b> von ${pages.length}</div>
      <button class="icon-btn" id="nextPage" aria-label="Nächste Seite" ${S.page === pages.length - 1 ? 'disabled' : ''}>▶</button>
    </div>
    <div class="bg-pick">${BOARD_BGS.map(([id, ic, name]) => `<button class="chip ${B.bg === id ? 'on' : ''}" data-bg="${id}"><span>${ic}</span>${name}</button>`).join('')}</div>
    <div class="board bg-${B.bg} ${flip > 0 ? 'turn-next' : flip < 0 ? 'turn-prev' : ''}" id="board"></div>
    <div class="board-tools" id="tools">
      <button class="btn ghost" data-tool="smaller" aria-label="Kleiner">➖</button>
      <button class="btn ghost" data-tool="bigger" aria-label="Größer">➕</button>
      <button class="btn ghost" data-tool="rotate" aria-label="Drehen">↻</button>
      <button class="btn ghost" data-tool="front" aria-label="Nach vorne">⬆️</button>
      <button class="btn bad" data-tool="delete" aria-label="Entfernen">🗑️</button>
    </div>
    <p class="muted board-help" id="boardHelp"></p>
    <div class="tray">${S.stickers.map((st) => `<button data-add="${st}" aria-label="${esc(stickerInfo(st)[2])} einkleben">${st}</button>`).join('')}</div>
    <h2>Alle Seiten</h2>
    <div class="pages-strip" id="pagesStrip">
      ${pages.map((pg, i) => `<button class="thumb ${i === S.page ? 'on' : ''}" data-page="${i}" aria-label="Seite ${i + 1}">
        <span class="thumb-board bg-${pg.bg}">${itemsHTML(pg.items)}</span><small>${i + 1}</small></button>`).join('')}
      ${pages.length < MAX_PAGES ? `<button class="thumb add" id="addPage" aria-label="Neue Seite"><span class="thumb-board">＋</span><small>Neue Seite</small></button>` : ''}
    </div>
    <div class="row">
      <button class="btn ghost" id="delPage">🗑️ Seite löschen</button>
      <a class="btn ghost" href="#/album">📒 Meine Sticker</a>
    </div>`;
  const board = $('#board');
  const fit = () => { board.style.fontSize = board.clientWidth / 7 + 'px'; };
  fit();
  window.onresize = () => { if ($('#board')) fit(); };
  drawBoard();
  $('#pagesStrip .thumb.on')?.scrollIntoView({ block: 'nearest', inline: 'center' });

  $('#prevPage').onclick = () => goPage(S.page - 1, -1);
  $('#nextPage').onclick = () => goPage(S.page + 1, 1);
  app.querySelectorAll('[data-page]').forEach((b) => (b.onclick = () => goPage(Number(b.dataset.page), Math.sign(Number(b.dataset.page) - S.page))));
  if ($('#addPage')) $('#addPage').onclick = () => {
    const bg = BOARD_BGS[pages.length % BOARD_BGS.length][0]; // jede neue Seite mit anderem Hintergrund
    pages.push({ bg, items: [] });
    S.page = pages.length - 1; save(); sfx.right();
    renderBoard(1);
  };
  $('#delPage').onclick = () => {
    const msg = pages.length > 1
      ? `Seite ${S.page + 1} wirklich löschen?${B.items.length ? ' Die Sticker darauf werden abgelöst.' : ''} (Deine Sticker-Sammlung bleibt.)`
      : 'Alle Sticker von dieser Seite ablösen? (Deine Sticker-Sammlung bleibt.)';
    if (!confirm(msg)) return;
    if (pages.length > 1) { pages.splice(S.page, 1); S.page = Math.max(0, S.page - 1); } else B.items = [];
    save(); renderBoard();
  };

  app.querySelectorAll('[data-bg]').forEach((b) => (b.onclick = () => {
    B.bg = b.dataset.bg; save();
    board.className = 'board bg-' + B.bg;
    app.querySelectorAll('[data-bg]').forEach((x) => x.classList.toggle('on', x === b));
    updateThumb();
  }));
  app.querySelectorAll('[data-add]').forEach((b) => (b.onclick = () => {
    if (B.items.length >= MAX_BOARD_ITEMS) { buddyBubble('Die Seite ist voll! Mach eine neue Seite.'); return; }
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

  // Sticker mit dem Finger verschieben – oder auf freier Fläche wischen zum Blättern
  let drag = null, swipe = null;
  board.onpointerdown = (e) => {
    const el = e.target.closest('.bitem');
    board.setPointerCapture(e.pointerId);
    e.preventDefault();
    if (!el) { swipe = { x: e.clientX, y: e.clientY }; return; }
    const i = Number(el.dataset.i);
    const r = el.getBoundingClientRect();
    drag = { i, el, dx: r.left + r.width / 2 - e.clientX, dy: r.top + r.height / 2 - e.clientY, sx: e.clientX, sy: e.clientY, moved: false };
    if (boardSel !== i) { boardSel = i; drawBoard(); drag.el = board.querySelector(`[data-i="${i}"]`); }
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
  const end = (e) => {
    if (swipe) {
      const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
      swipe = null;
      if (e.type === 'pointerup' && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        goPage(S.page + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      } else if (boardSel !== -1) { boardSel = -1; drawBoard(); }
      return;
    }
    if (!drag) return;
    const it = B.items[drag.i];
    if (!drag.moved && it) { // nur angetippt → Sticker sagt seinen Namen
      say(stickerInfo(it.e)[1]);
      drag.el.classList.remove('hop'); void drag.el.offsetWidth; drag.el.classList.add('hop');
    }
    drag = null;
    save(); updateThumb();
  };
  board.onpointerup = end;
  board.onpointercancel = end;
}

function updateThumb() {
  const t = document.querySelector(`.thumb[data-page="${S.page}"] .thumb-board`);
  if (t) { t.className = 'thumb-board bg-' + curPage().bg; t.innerHTML = itemsHTML(curPage().items); }
}

function drawBoard() {
  const board = $('#board');
  if (!board) return;
  const B = curPage();
  board.innerHTML = itemsHTML(B.items, boardSel)
    || `<div class="board-empty">Tippe unten auf einen Sticker,<br>um ihn hier einzukleben 👇${albumPages().length > 1 ? '<br><small>Wischen ↔ blättert um</small>' : ''}</div>`;
  $('#tools').classList.toggle('active', boardSel >= 0);
  $('#boardHelp').textContent = boardSel >= 0
    ? 'Ziehe den Sticker mit dem Finger. Mit den Knöpfen unter dem Bild: kleiner, größer, drehen, nach vorne oder entfernen.'
    : B.items.length ? 'Tippe einen Sticker an, um ihn zu verschieben oder zu ändern. Auf freier Fläche wischen blättert um.' : '';
  updateThumb();
}
