/* ============================================================
   js/moteur/effets.js — Effets : confettis, éclats, secousses d'écran.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ---------- EFFETS : confettis, éclats, secousses ---------- */
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas.getContext('2d');
let fxParts = [], fxLast = 0, fxAnim = null;
function fxResize() { fxCanvas.width = window.innerWidth; fxCanvas.height = window.innerHeight; }
window.addEventListener('resize', fxResize); fxResize();
function fxSpawn(x, y, n, o) {
  const cols = o.colors || ['#ffd76b', '#ffffff', '#7bc8ff', '#ff6b9d', '#7be07b'];
  for (let i = 0; i < n; i++) {
    const a = (o.angle != null ? o.angle : Math.random() * Math.PI * 2) + (Math.random() - 0.5) * (o.spread != null ? o.spread : Math.PI * 2);
    const sp = (o.speed || 200) * (0.4 + Math.random() * 0.8);
    fxParts.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0) * Math.random(),
      g: o.gravity == null ? 520 : o.gravity, life: 0, max: (o.life || 0.9) * (0.7 + Math.random() * 0.6),
      size: o.size || (3 + Math.random() * 4), color: cols[(Math.random() * cols.length) | 0], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12
    });
  }
}
function fxStart() { if (!fxAnim) { fxLast = performance.now(); fxAnim = requestAnimationFrame(fxStep); } }
function fxStep(t) {
  const dt = Math.min(0.05, (t - fxLast) / 1000); fxLast = t;
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  for (const p of fxParts) {
    p.life += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    const a = Math.max(0, 1 - p.life / p.max);
    fxCtx.globalAlpha = a; fxCtx.fillStyle = p.color;
    fxCtx.save(); fxCtx.translate(p.x, p.y); fxCtx.rotate(p.rot);
    fxCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    fxCtx.restore();
  }
  fxCtx.globalAlpha = 1;
  fxParts = fxParts.filter(p => p.life < p.max);
  if (fxParts.length) fxAnim = requestAnimationFrame(fxStep);
  else { fxAnim = null; fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height); }
}
function fxBurst(x, y, color) { fxSpawn(x, y, 16, { colors: color ? [color, '#ffffff'] : null, speed: 240, gravity: 380, life: 0.7 }); fxStart(); }
function fxBurstAtEl(el, color) { const r = el.getBoundingClientRect(); fxBurst(r.left + r.width / 2, r.top + r.height / 2, color); }
function fxConfetti(big) {
  const w = fxCanvas.width, h = fxCanvas.height, n = big ? 90 : 55;
  fxSpawn(w * 0.15, h * 0.55, n, { angle: -Math.PI / 3, spread: 0.9, speed: 620, up: 120, life: 1.8 });
  fxSpawn(w * 0.85, h * 0.55, n, { angle: -Math.PI * 2 / 3, spread: 0.9, speed: 620, up: 120, life: 1.8 });
  fxStart();
}
function shakeEl(el) {
  if (!el) return;
  el.classList.remove('fxShake'); void el.offsetWidth; el.classList.add('fxShake');
  setTimeout(() => el.classList.remove('fxShake'), 460);
}
// Mini-jeux en HTML (quiz, énigmes, avis…) : une bonne / mauvaise réponse déclenche son + effet automatiquement.
(function () {
  const dom = document.getElementById('mgDOM'); if (!dom) return;
  new MutationObserver(muts => {
    for (const m of muts) {
      const el = m.target; if (!el || !el.classList || el._fxDone) continue;
      if (el.classList.contains('correct')) { el._fxDone = true; Snd.play('coin'); fxBurstAtEl(el, '#7be07b'); }
      else if (el.classList.contains('wrong')) { el._fxDone = true; Snd.play('wrong'); shakeEl(document.getElementById('mgBody')); }
    }
  }).observe(dom, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();
