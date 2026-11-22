/* ============================================================
   js/rendu/maisons.js — Maisons des persos (verrouillée = volets clos et cadenas ; recrutée = fenêtres allumées).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   MAISONS (une par pote) — verrouillée : volets clos et cadenas ; recrutée : fenêtres allumées, fleurs, cheminée qui fume
   ===================================================================== */
const houseCache = {};
function houseSprite(zone, unlocked) {
  const key = zone.id + (unlocked ? ':1' : ':0');
  if (houseCache[key]) return houseCache[key];
  const W = 76, H = 70, { c, g } = artCanvas(W, H);
  const perso = PERSONNAGES.find(p => p.id === zone.id);
  const base = zone.isHome ? '#3a7fb0' : ((perso && perso.couleur) || '#a06b34');
  const lit = unlocked || zone.isHome;
  const roof = lit ? cMix(base, '#b4562f', zone.isHome ? 0.0 : 0.30) : '#5a687b';
  const roofL = cLight(roof, 0.26), roofD = cDark(roof, 0.34);
  const wall = lit ? cMix('#ecd3a0', base, 0.09) : '#909ba8';
  const wallL = cLight(wall, 0.18), wallD = cDark(wall, 0.14), wallDD = cDark(wall, 0.26);

  // ombre portée au sol
  aEll(g, 40, 66, 37, 4, 'rgba(0,0,0,0.24)');
  // murs
  aR(g, 3, 17, 70, 47, OUT); aR(g, 4, 17, 68, 46, wall);
  for (let y = 22, k = 0; y < 57; y += 5, k++) {
    aR(g, 4, y, 68, 1, wallD);
    for (let x = 4 + ((k * 7) % 14); x < 72; x += 14) aR(g, x, y + 1, 1, 4, wallD);
  }
  aR(g, 4, 17, 2, 46, wallL); aR(g, 69, 17, 3, 46, wallDD);
  // soubassement en pierre
  aR(g, 4, 57, 68, 6, '#8b8478'); aR(g, 4, 57, 68, 1, '#aaa396');
  for (let x = 4; x < 72; x += 7) { aR(g, x, 58, 1, 3, '#6f695e'); aR(g, x + 3, 61, 1, 2, '#6f695e'); }
  aR(g, 4, 60, 68, 1, '#6f695e');
  // toit
  for (let y = 1; y <= 17; y++) {
    const l = Math.round(20 - 20 * (y - 1) / 16), r = Math.round(55 + 20 * (y - 1) / 16);
    aR(g, l - 1, y, r - l + 3, 1, OUT);
  }
  aR(g, 19, 0, 38, 1, OUT);
  aR(g, 0, 18, 76, 1, OUT);
  for (let y = 1; y <= 17; y++) {
    const l = Math.round(20 - 20 * (y - 1) / 16), r = Math.round(55 + 20 * (y - 1) / 16), w = r - l + 1, band = Math.floor((y - 1) / 4), ph = (y - 1) % 4;
    aR(g, l, y, w, 1, ph === 0 ? roofL : ph === 3 ? roofD : roof);
    if (ph > 0 && ph < 3) for (let x = l + ((band & 1) ? 3 : 0); x < r; x += 6) aP(g, x, y, roofD);
    aR(g, 39, y, r - 38, 1, 'rgba(0,0,0,0.10)');
  }
  aR(g, 0, 17, 76, 1, roofD);
  aR(g, 19, 1, 38, 1, roofL);
  // ombre du toit sur le mur
  aR(g, 4, 19, 68, 2, 'rgba(0,0,0,0.24)'); aR(g, 4, 21, 68, 1, 'rgba(0,0,0,0.10)');
  // cheminée
  aR(g, 51, 0, 10, 12, OUT); aR(g, 52, 2, 8, 9, '#b0603c');
  for (let y = 3; y < 11; y += 3) aR(g, 52, y, 8, 1, '#8a4a2e');
  aR(g, 55, 2, 1, 3, '#8a4a2e'); aR(g, 57, 6, 1, 3, '#8a4a2e');
  aR(g, 50, 0, 12, 2, OUT); aR(g, 51, 0, 10, 1, '#6a4a34');
  // lucarne
  aDisc(g, 38, 10, 4, OUT); aDisc(g, 38, 10, 3, lit ? '#ffe9a6' : '#2a3442');
  aR(g, 38, 7, 1, 7, OUT); aR(g, 35, 10, 7, 1, OUT);
  if (lit) aR(g, 36, 8, 1, 1, '#fff8d6');
  // fenêtres
  for (const wx of [10, 52]) {
    const wy = 31, ww = 14, wh = 13;
    aR(g, wx - 1, wy - 1, ww + 2, wh + 2, OUT);
    if (lit) {
      aR(g, wx, wy, ww, wh, '#ffe9a6'); aR(g, wx, wy + 7, ww, 6, '#ffd57a');
      aR(g, wx + 6, wy, 2, wh, '#7a4a26'); aR(g, wx, wy + 6, ww, 2, '#7a4a26');
      aR(g, wx + 1, wy + 1, 3, 1, '#fff8d6');
      const sh = cLight(base, 0.10);
      aR(g, wx - 4, wy - 1, 3, wh + 2, OUT); aR(g, wx - 3, wy, 1, wh, sh); aR(g, wx - 2, wy, 1, wh, cDark(sh, 0.22));
      aR(g, wx + ww + 1, wy - 1, 3, wh + 2, OUT); aR(g, wx + ww + 1, wy, 1, wh, sh); aR(g, wx + ww + 2, wy, 1, wh, cDark(sh, 0.22));
      aR(g, wx - 2, wy + wh + 1, ww + 4, 4, OUT); aR(g, wx - 1, wy + wh + 2, ww + 2, 2, '#7a4a26');
      ['#ff7aa8', '#ffd76b', '#d29bff', '#ff7aa8'].forEach((cl, i) => { aP(g, wx + 1 + i * 3, wy + wh, cl); aP(g, wx + 1 + i * 3, wy + wh + 1, '#3f9a3f'); });
    } else {
      aR(g, wx, wy, ww, wh, '#6b5a48');
      for (let y = wy + 1; y < wy + wh; y += 3) { aR(g, wx, y, ww, 1, '#4a3b2c'); aR(g, wx, y + 1, ww, 1, '#7d6a55'); }
      aR(g, wx - 2, wy + wh + 1, ww + 4, 2, OUT); aR(g, wx - 1, wy + wh + 1, ww + 2, 1, '#a39c8d');
    }
  }
  // porte
  const dx = 33, dy = 45, dw = 10, dh = 18;
  aR(g, dx - 2, dy - 2, dw + 4, dh + 2, OUT);
  aR(g, dx - 1, dy - 1, dw + 2, 2, '#5c3a1e');
  aR(g, dx, dy + 1, dw, dh - 1, lit ? '#8a5530' : '#6a4a2e');
  aR(g, dx + 3, dy + 1, 1, dh - 1, '#6a3f1f'); aR(g, dx + 6, dy + 1, 1, dh - 1, '#6a3f1f');
  aR(g, dx, dy + 1, 1, dh - 1, '#a86a3a');
  if (lit) { aR(g, dx + 2, dy + 3, 6, 4, '#ffe9a6'); aR(g, dx + 5, dy + 3, 1, 4, '#7a4a26'); aP(g, dx + 8, dy + 11, '#f3c24a'); }
  else {
    aR(g, dx - 1, dy + 4, dw + 2, 3, OUT); aR(g, dx, dy + 5, dw, 1, '#8a6a42');
    aR(g, dx - 1, dy + 12, dw + 2, 3, OUT); aR(g, dx, dy + 13, dw, 1, '#8a6a42');
    aR(g, dx + 2, dy + 7, 6, 6, OUT); aR(g, dx + 3, dy + 8, 4, 4, '#e0ac2c'); aP(g, dx + 4, dy + 9, '#fff0a0');
    aR(g, dx + 3, dy + 5, 1, 3, OUT); aR(g, dx + 6, dy + 5, 1, 3, OUT);
  }
  aR(g, dx - 3, 63, dw + 6, 2, OUT); aR(g, dx - 2, 63, dw + 4, 1, '#cfc7b4');
  if (zone.isHome) { aR(g, dx - 4, 61, dw + 8, 2, OUT); aR(g, dx - 3, 61, dw + 6, 1, '#d6453d'); }
  // pastille « recruté »
  if (unlocked) {
    aDisc(g, 66, 25, 6, OUT); aDisc(g, 66, 25, 5, '#3fae52'); aR(g, 63, 22, 3, 1, '#7fd68b');
    [[-2, 0], [-1, 1], [0, 0], [1, -1], [2, -2]].forEach(([x, y]) => aP(g, 66 + x, 26 + y, '#ffffff'));
  }
  return (houseCache[key] = artUp(c));
}
function drawHouse(zone) {
  const u = state.persosDebloques.includes(zone.id), s = houseSprite(zone, u);
  ctx.drawImage(s, zone.x - 6, zone.y - 12);
  if (u || zone.isHome) {   // fumée de cheminée
    const t = Date.now() / 1000, cx = zone.x - 6 + 112, cy = zone.y - 14;
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.35 + i / 3 + (zone.id.length % 5) * 0.13) % 1);
      ctx.fillStyle = `rgba(240,240,240,${0.55 * (1 - k)})`;
      const sz = k < 0.35 ? 4 : 6;
      ctx.fillRect(Math.round(cx + Math.sin(k * 7 + i) * 3 + k * 10), Math.round(cy - k * 34), sz, sz);
    }
  }
}
const labelW = {};
function drawZoneLabel(z) {
  const cx = Math.round(z.x + z.w / 2), em = pixEmoji(z.emoji, 14, 3);
  ctx.drawImage(em, Math.round(cx - em.width / 2), Math.round(z.y - 36 - em.height / 2));
  ctx.font = 'bold 12px "Trebuchet MS", "Segoe UI", sans-serif';
  const tw = labelW[z.zone] || (labelW[z.zone] = Math.ceil(ctx.measureText(z.zone).width));
  const pw = tw + 18, ph = 18, px = Math.round(cx - pw / 2), py = Math.round(z.y - 72 - ph / 2);
  ctx.fillStyle = OUT; ctx.fillRect(px - 2, py - 2, pw + 4, ph + 4);
  ctx.fillStyle = '#b07a42'; ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#d6a05f'; ctx.fillRect(px, py, pw, 2);
  ctx.fillStyle = '#8a5a2c'; ctx.fillRect(px, py + ph - 2, pw, 2);
  ctx.fillStyle = '#3a2410'; ctx.fillRect(px + 2, py + 2, 2, 2); ctx.fillRect(px + pw - 4, py + 2, 2, 2);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = OUT;
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.fillText(z.zone, cx + ox, py + ph / 2 + 1 + oy);
  ctx.fillStyle = '#fff3d2'; ctx.fillText(z.zone, cx, py + ph / 2 + 1);
}
