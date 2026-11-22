/* ============================================================
   js/rendu/art-pixel.js — Boîte à outils pixel art : couleurs, bruit déterministe, mini-canevas, contours.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   v20.24 — DIRECTION ARTISTIQUE PIXEL ART
   Même esprit que les sprites des persos : contour sombre, tons chauds, lumière en haut à gauche.
   TOUT est dessiné dans le code (aucun fichier à ajouter) puis mis en cache :
   - le sol est rendu par morceaux de 256 px (herbe, chemins, place pavée, fleurs, touffes) ;
   - chaque objet (arbre, maison, banc...) est dessiné UNE fois dans un petit canevas.
   1 pixel d'art = 2 pixels du monde (PX).
   ===================================================================== */
const PX = 2;
const OUT = '#1e1612';

/* ---- couleurs ---- */
function cHex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function cStr(r, g, b) { const f = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); return '#' + f(r) + f(g) + f(b); }
function cMix(a, b, t) { const A = cHex(a), B = cHex(b); return cStr(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function cLight(h, t) { return cMix(h, '#ffffff', t); }
function cDark(h, t) { return cMix(h, '#000000', t); }

/* ---- hasard déterministe : le décor est identique à chaque partie ---- */
function hash2(x, y, s) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, sc, seed) {
  const gx = Math.floor(x / sc), gy = Math.floor(y / sc), fx = x / sc - gx, fy = y / sc - gy;
  const a = hash2(gx, gy, seed), b = hash2(gx + 1, gy, seed), c = hash2(gx, gy + 1, seed), d = hash2(gx + 1, gy + 1, seed);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/* ---- petits outils de dessin « pixel » (coordonnées en pixels d'art) ---- */
function artCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  return { c, g };
}
function aR(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x, y, w, h); }
function aP(g, x, y, col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
function aDisc(g, cx, cy, r, col) {
  g.fillStyle = col;
  for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y) + r * 0.5)); g.fillRect(cx - w, cy + y, 2 * w + 1, 1); }
}
function aEll(g, cx, cy, rx, ry, col) {
  g.fillStyle = col;
  for (let y = -ry; y <= ry; y++) {
    const k = 1 - (y * y) / ((ry + 0.5) * (ry + 0.5));
    const w = Math.floor(rx * Math.sqrt(Math.max(0, k)) + 0.5);
    g.fillRect(cx - w, cy + y, 2 * w + 1, 1);
  }
}
function aLine(g, x0, y0, x1, y1, th, col) {
  g.fillStyle = col;
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const t = n ? i / n : 0;
    g.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), th, th);
  }
}
function artUp(c) {
  const o = document.createElement('canvas'); o.width = c.width * PX; o.height = c.height * PX;
  const g = o.getContext('2d'); g.imageSmoothingEnabled = false;
  g.drawImage(c, 0, 0, o.width, o.height);
  return o;
}
function artShadow(g, cx, cy, rx, ry) { aEll(g, cx, cy, rx, ry, 'rgba(0,0,0,0.22)'); }
