/* ============================================================
   js/moteur/tactile.js — Commandes tactiles : joystick, boutons, détection du téléphone.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ---------- ÉCRAN TACTILE (téléphone / tablette) ---------- */
let IS_TOUCH = false;
function enableTouch() { if (IS_TOUCH) return; IS_TOUCH = true; document.body.classList.add('touch'); touchLastMode = ''; fitView(); }
try { if ((window.matchMedia && matchMedia('(pointer: coarse)').matches) || /[?&]touch=1/.test(location.search)) IS_TOUCH = true; } catch (e) {}
window.addEventListener('touchstart', enableTouch, { once: true, passive: true });
if (IS_TOUCH) { document.body.classList.add('touch'); fitView(); }
let touchLastMode = '';
const KEYCODES = { ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', ' ': 'Space', Enter: 'Enter' };
function pressKey(key, down) {
  const code = KEYCODES[key] || ('Key' + key.toUpperCase());
  window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key, code, bubbles: true }));
}
// Quel jeu de boutons afficher ? (cache : on ne touche au DOM que si ça change)
const elTutoOverlay = document.getElementById('tutorialOverlay');
const TOUCH_ARROWS = new Set(['course', 'moto', 'volley', 'collecte', 'esquive']);
function touchModeNow() {
  if (gameState === 'playing') return 'hub';
  if (gameState === 'dialogue') return 'dialogue';
  // (pendant le tutoriel du mini-jeu on cache les commandes : elles ne servent pas encore et cachaient le texte)
  if (gameState === 'miniGame' && mgState && mgState.zone && !mgState.over && !elTutoOverlay.classList.contains('active')) {
    const t = mgState.zone.quete.type;
    if (TOUCH_ARROWS.has(t)) return 'arrows';
    if (t === 'endurance') return 'jump';
    if (t === 'rythme') return 'asdf';
  }
  return 'none';
}
function updateTouchUI() {
  if (!IS_TOUCH) return;
  const mode = touchModeNow();
  if (mode === touchLastMode) return;
  touchLastMode = mode;
  const cl = document.body.classList;
  ['t-hub', 't-dialogue', 't-arrows', 't-jump', 't-asdf'].forEach(c => cl.remove(c));
  if (mode !== 'none') cl.add('t-' + mode);
  const main = document.getElementById('touchMain');
  if (main) main.textContent = mode === 'jump' ? '⤒' : (mode === 'dialogue' ? '▶' : 'E');
}
(function () {
  const pad = document.getElementById('touchPad'), knob = document.getElementById('touchKnob');
  if (!pad) return;
  let ptr = null, dir = null;
  function upd(ev) {
    const r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = ev.clientX - cx, dy = ev.clientY - cy, dist = Math.hypot(dx, dy);
    let nd = null;
    if (dist > r.width * 0.14) nd = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    const k = Math.min(dist, r.width * 0.3) / (dist || 1);
    knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    if (nd !== dir) { if (dir) pressKey(dir, false); if (nd) pressKey(nd, true); dir = nd; }
  }
  pad.addEventListener('pointerdown', e => { ptr = e.pointerId; try { pad.setPointerCapture(ptr); } catch (er) {} upd(e); e.preventDefault(); });
  pad.addEventListener('pointermove', e => { if (e.pointerId === ptr) upd(e); });
  const end = e => {
    if (e.pointerId !== ptr) return;
    ptr = null; knob.style.transform = '';
    if (dir) pressKey(dir, false); dir = null;
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => pad.addEventListener(ev, end));
  // Le pad se cache quand le mode change : on relâche tout pour ne pas laisser une flèche bloquée.
  window.addEventListener('blur', () => { if (dir) pressKey(dir, false); dir = null; });
})();
(function () {
  // Boutons A S D F du rythme : appui = keydown, relâche = keyup.
  document.querySelectorAll('#touchRhythm .tb').forEach(b => {
    const key = b.dataset.key;
    b.addEventListener('pointerdown', e => { e.preventDefault(); pressKey(key, true); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, () => pressKey(key, false)));
  });
  // Gros bouton : E dans le hub, ▶ dans un dialogue, saut dans l'endurance.
  const main = document.getElementById('touchMain');
  if (main) {
    main.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (gameState === 'playing') tryInteract();
      else if (gameState === 'dialogue') advanceDialogue();
      else if (gameState === 'miniGame') pressKey(' ', true);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => main.addEventListener(ev, () => { if (gameState === 'miniGame') pressKey(' ', false); }));
  }
  document.querySelectorAll('#touchBtns .tb.small').forEach(b => {
    b.addEventListener('click', () => {
      const a = b.dataset.act;
      if (a === 'team') { if (gameState === 'playing') openTeamMenu(); else if (gameState === 'teamMenu') closeTeamMenu(); }
      else if (a === 'map') { if (gameState === 'playing' || gameState === 'bigMap') toggleBigMap(); }
      else if (a === 'journal') { if (gameState === 'playing' || gameState === 'caseJournal') toggleCaseJournal(); }
      else if (a === 'todo') toggleTodo();
    });
  });
  // Dialogue : toucher n'importe où (pas sur un bouton) = réplique suivante ; le bouton « Passer ⏭ » saute toute la discussion.
  // (le délai de 300 ms ignore le toucher qui vient d'ouvrir la discussion)
  document.getElementById('gameContainer').addEventListener('click', e => {
    if (gameState !== 'dialogue') return;
    if (e.target.closest && e.target.closest('button, #touchUI, #sysBtns')) return;
    if (performance.now() - dialogueOpenedAt < 300) return;
    advanceDialogue();
  });
  document.getElementById('dialogueSkip').addEventListener('click', e => { e.stopPropagation(); skipDialogue(); });
  document.getElementById('bigMap').addEventListener('click', () => { if (gameState === 'bigMap') toggleBigMap(); });
})();
