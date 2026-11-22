/* ============================================================
   js/rendu/place.js — La place centrale : fontaine, Grand Feu, bancs, lampadaires.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   LA PLACE : fontaine, Grand Feu, bancs, lampadaires
   ===================================================================== */
function buildFountain() {
  const W = 60, H = 52, { c, g } = artCanvas(W, H);
  artShadow(g, 30, 43, 28, 6);
  for (let dy = 0; dy <= 7; dy++) aEll(g, 30, 31 + dy, 22, 13, OUT);
  for (let dy = 0; dy <= 6; dy++) aEll(g, 30, 31 + dy, 21, 12, dy > 4 ? '#7d7f7c' : '#9a9c98');
  for (let a = 0; a < 6.28; a += 0.42) aP(g, Math.round(30 + Math.cos(a) * 20), Math.round(37 + Math.sin(a) * 11 + 3), '#6c6e6b');
  aEll(g, 30, 31, 21, 12, '#c3c5bf');
  aEll(g, 30, 31, 18, 10, OUT);
  aEll(g, 30, 32, 17, 9, '#4a8fc7');
  aEll(g, 30, 33, 14, 6, '#5da6dc');
  for (let a = 0; a < 6.28; a += 0.5) { aP(g, Math.round(30 + Math.cos(a) * 19.5), Math.round(31 + Math.sin(a) * 11), '#a2a49f'); }
  // colonne
  aR(g, 26, 13, 9, 19, OUT); aR(g, 27, 13, 7, 18, '#cbc6b4'); aR(g, 27, 13, 2, 18, '#e4dfcd'); aR(g, 32, 13, 2, 18, '#a8a391');
  aR(g, 25, 29, 11, 3, OUT); aR(g, 26, 29, 9, 2, '#b9b4a2');
  // vasque haute
  aEll(g, 30, 14, 11, 5, OUT); aEll(g, 30, 14, 10, 4, '#d4cfbc'); aEll(g, 30, 14, 7, 3, '#5da6dc'); aEll(g, 30, 14, 5, 1, '#8cc8ee');
  // jet
  aR(g, 29, 5, 3, 10, OUT); aR(g, 30, 6, 1, 8, '#9ed4f2'); aDisc(g, 30, 5, 2, OUT); aP(g, 30, 5, '#cfeaff');
  return artUp(c);
}
let fountainSpr = null;
function drawFountain() {
  const f = hubDecor.fountain; if (!fountainSpr) fountainSpr = buildFountain();
  const ox = f.x - 60, oy = f.y - 62;
  ctx.drawImage(fountainSpr, ox, oy);
  const t = Date.now();
  // ondulations sur l'eau
  for (let k = 0; k < 2; k++) {
    const ph = ((t / 1700) + k * 0.5) % 1, rx = 12 + ph * 22, ry = 6 + ph * 11;
    ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - ph)})`;
    for (let a = 0; a < 6.283; a += 0.36) ctx.fillRect(Math.round(f.x + Math.cos(a) * rx), Math.round(f.y + 2 + Math.sin(a) * ry), 2, 2);
  }
  // gouttes qui retombent
  for (let i = 0; i < 8; i++) {
    const k = ((t / 720) + i / 8) % 1, dir = [-1, -0.6, -0.3, 0.3, 0.6, 1, -0.8, 0.8][i];
    const x = f.x + dir * 26 * k, y = f.y - 50 - 40 * k + 94 * k * k;
    ctx.fillStyle = k > 0.88 ? 'rgba(255,255,255,0.85)' : '#bfe6ff';
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
}
function buildCampfireBase() {
  const W = 44, H = 30, { c, g } = artCanvas(W, H);
  artShadow(g, 22, 22, 19, 5);
  aEll(g, 22, 15, 14, 8, '#2d2521');
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 6.283, x = Math.round(22 + Math.cos(a) * 15), y = Math.round(15 + Math.sin(a) * 8.5);
    aR(g, x - 3, y - 2, 7, 5, OUT);
    aR(g, x - 2, y - 1, 5, 3, i % 2 ? '#9a9a9f' : '#808086');
    aR(g, x - 2, y - 1, 2, 1, '#c4c4ca');
  }
  aEll(g, 22, 15, 9, 5, '#241c18');
  aLine(g, 13, 17, 30, 11, 3, OUT); aLine(g, 14, 17, 29, 11, 2, '#6b4226');
  aLine(g, 14, 12, 31, 18, 3, OUT); aLine(g, 15, 12, 30, 18, 2, '#7d4f2c');
  aP(g, 14, 12, '#d9a870'); aP(g, 30, 17, '#d9a870'); aP(g, 13, 17, '#d9a870');
  return artUp(c);
}
let campfireSpr = null;
function drawCampfire() {
  const cf = hubDecor.campfire; if (!campfireSpr) campfireSpr = buildCampfireBase();
  ctx.drawImage(campfireSpr, cf.x - 44, cf.y - 30);
  const t = Date.now() / 1000;
  if (state.feuAllume) {
    const glow = ctx.createRadialGradient(cf.x, cf.y - 6, 4, cf.x, cf.y - 6, 100);
    glow.addColorStop(0, 'rgba(255,170,60,0.38)'); glow.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = glow; ctx.fillRect(cf.x - 100, cf.y - 106, 200, 200);
    const tongues = [[-10, 22, 7], [-5, 32, 8], [0, 40, 9], [5, 30, 8], [10, 20, 6]];
    tongues.forEach(([ox, hh, ww], i) => {
      const h = hh + Math.sin(t * 7 + i * 1.9) * 5, base = cf.y + 4;
      for (let r = 0; r < h; r += PX) {
        const k = r / h, w = Math.max(1, Math.round(ww * (1 - Math.pow(k, 1.4)) * 0.5));
        const sway = Math.round(Math.sin(t * 4 + i + k * 3) * 2 * k) * PX / 2;
        const x = Math.round(cf.x + ox + sway);
        ctx.fillStyle = '#d9531e'; ctx.fillRect(x - w * PX, Math.round(base - r), w * PX * 2, PX);
        if (w > 1) { ctx.fillStyle = '#ff9e2c'; ctx.fillRect(x - (w - 1) * PX, Math.round(base - r), (w - 1) * PX * 2, PX); }
        if (w > 2 && k < 0.75) { ctx.fillStyle = '#ffd76b'; ctx.fillRect(x - (w - 2) * PX, Math.round(base - r), (w - 2) * PX * 2, PX); }
        if (w > 3 && k < 0.45) { ctx.fillStyle = '#fff3b0'; ctx.fillRect(x - (w - 3) * PX, Math.round(base - r), (w - 3) * PX * 2, PX); }
      }
    });
    for (let i = 0; i < 9; i++) {   // étincelles
      const k = ((t * 0.8 + i * 0.27) % 1), x = cf.x + Math.sin(t * 3 + i * 2.3) * (8 + k * 24), y = cf.y - 14 - k * 70;
      ctx.fillStyle = k < 0.6 ? `rgba(255,226,143,${1 - k})` : `rgba(255,150,60,${1 - k})`;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  } else {
    for (let i = 0; i < 5; i++) {   // braises et mince fumée
      const k = ((t * 0.3 + i / 5) % 1);
      ctx.fillStyle = `rgba(200,200,200,${0.4 * (1 - k)})`;
      const s = k < 0.4 ? 4 : 6;
      ctx.fillRect(Math.round(cf.x + Math.sin(k * 6 + i) * 4), Math.round(cf.y - 8 - k * 46), s, s);
    }
    if (Math.floor(t * 2) % 2) { ctx.fillStyle = '#ff7a2c'; ctx.fillRect(cf.x - 6, cf.y + 2, 2, 2); ctx.fillRect(cf.x + 4, cf.y, 2, 2); }
  }
}
function buildBench() {
  const W = 34, H = 20, { c, g } = artCanvas(W, H);
  artShadow(g, 17, 18, 16, 2);
  aR(g, 1, 0, 32, 7, OUT); aR(g, 2, 1, 30, 2, '#c58a4c'); aR(g, 2, 3, 30, 2, '#9c6a38'); aR(g, 2, 5, 30, 1, '#7a4f28');
  aR(g, 0, 8, 34, 6, OUT); aR(g, 1, 9, 32, 3, '#d29a58'); aR(g, 1, 12, 32, 1, '#8f5f30'); aR(g, 1, 9, 32, 1, '#e8b574');
  aR(g, 2, 14, 5, 5, OUT); aR(g, 3, 14, 3, 4, '#5c3a1e'); aR(g, 27, 14, 5, 5, OUT); aR(g, 28, 14, 3, 4, '#5c3a1e');
  aR(g, 0, 4, 3, 8, OUT); aR(g, 31, 4, 3, 8, OUT); aR(g, 1, 5, 1, 6, '#9c6a38'); aR(g, 32, 5, 1, 6, '#7a4f28');
  return artUp(c);
}
function buildLamp() {
  const W = 14, H = 36, { c, g } = artCanvas(W, H);
  artShadow(g, 7, 34, 5, 1);
  aR(g, 3, 31, 8, 4, OUT); aR(g, 4, 31, 6, 3, '#4a4a52'); aR(g, 4, 31, 6, 1, '#6a6a74');
  aR(g, 6, 12, 3, 20, OUT); aR(g, 7, 12, 1, 19, '#3b3b44'); aR(g, 6, 12, 1, 19, '#585862');
  aR(g, 2, 2, 11, 12, OUT); aR(g, 3, 3, 9, 10, '#ffd76b'); aR(g, 4, 4, 3, 6, '#fff3b0'); aR(g, 7, 3, 1, 10, OUT);
  aR(g, 1, 0, 13, 3, OUT); aR(g, 2, 1, 11, 1, '#6a6a74'); aR(g, 5, 13, 5, 2, OUT);
  return artUp(c);
}
let benchSpr = null, lampSpr = null;
function drawBench(b) { if (!benchSpr) benchSpr = buildBench(); ctx.drawImage(benchSpr, Math.round(b.x - 34), Math.round(b.y - 14)); }
function drawLamp(l) {
  if (!lampSpr) lampSpr = buildLamp();
  const x = Math.round(l.x - 14), y = Math.round(l.y + 8 - 72);
  const gl = ctx.createRadialGradient(l.x, l.y - 50, 2, l.x, l.y - 50, 40);
  const fl = 0.2 + Math.sin(Date.now() / 420 + l.x) * 0.03;
  gl.addColorStop(0, `rgba(255,215,107,${fl})`); gl.addColorStop(1, 'rgba(255,215,107,0)');
  ctx.fillStyle = gl; ctx.fillRect(l.x - 40, l.y - 90, 80, 80);
  ctx.drawImage(lampSpr, x, y);
}
