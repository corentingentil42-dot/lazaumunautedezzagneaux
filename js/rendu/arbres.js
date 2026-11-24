/* ============================================================
   js/rendu/arbres.js — Arbres, buissons, rochers.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   ARBRES, BUISSONS, ROCHERS
   ===================================================================== */
const TREE_LAYOUTS = [
  [[17, 16, 12], [8, 21, 8], [26, 21, 8], [12, 8, 8], [23, 8, 8], [17, 25, 8]],
  [[17, 17, 12], [7, 19, 7], [27, 19, 7], [17, 7, 9], [11, 26, 7], [24, 26, 7]],
  [[16, 16, 11], [26, 14, 8], [8, 20, 8], [19, 6, 8], [17, 26, 8], [28, 24, 6]]
];
const TREE_PAL = [
  { d: '#2b6832', m: '#3b8a3f', l: '#58ac4b', h: '#8dd16d', k: '#1f4f27' },
  { d: '#336f2f', m: '#4a9140', l: '#6cb552', h: '#a3d977', k: '#25561f' },
  { d: '#2a6638', m: '#3b8643', l: '#56a756', h: '#86cc72', k: '#1f5030' }
];
function buildRoundTree(v) {
  // Les boules de feuillage + leur contour dépassent de la zone 34×44 d'origine (d'où l'arbre « rogné » sur les bords) :
  // on agrandit le canevas de 3 px sur les côtés et 4 px en haut, et on décale le dessin d'autant.
  const PADX = 3, PADY = 4, W = 34 + PADX * 2, H = 44 + PADY, { c, g } = artCanvas(W, H), pal = TREE_PAL[v % 3], lay = TREE_LAYOUTS[v % 3];
  g.translate(PADX, PADY);
  artShadow(g, 17, 40, 14, 3);
  // tronc
  aR(g, 13, 27, 9, 14, OUT); aR(g, 14, 27, 7, 13, '#7a4b26'); aR(g, 14, 27, 2, 13, '#9c6434'); aR(g, 18, 27, 3, 13, '#5c3519');
  aR(g, 12, 38, 11, 3, OUT); aR(g, 13, 38, 9, 2, '#6a4120'); aP(g, 13, 38, '#9c6434');
  // couronne : contour, puis 3 couches de lumière
  lay.forEach(([x, y, r]) => aDisc(g, x, y, r + 1, OUT));
  lay.forEach(([x, y, r]) => aDisc(g, x, y, r, pal.d));
  lay.forEach(([x, y, r]) => aDisc(g, x - 1, y - 2, Math.max(2, r - 2), pal.m));
  lay.forEach(([x, y, r]) => aDisc(g, x - 2, y - 4, Math.max(1, r - 5), pal.l));
  // texture de feuilles
  lay.forEach(([x, y, r], i) => {
    for (let k = 0; k < 4; k++) {
      const a = (200 + k * 24 + i * 7) * Math.PI / 180;
      aR(g, Math.round(x + Math.cos(a) * r * 0.62), Math.round(y + Math.sin(a) * r * 0.62), 2, 1, pal.h);
      const b = (25 + k * 26 + i * 5) * Math.PI / 180;
      aR(g, Math.round(x + Math.cos(b) * r * 0.66), Math.round(y + Math.sin(b) * r * 0.66), 2, 1, pal.k);
    }
  });
  return artUp(c);
}
function buildPineTree(v) {
  const W = 32, H = 51, { c, g } = artCanvas(W, H), cx = 15;   // +1 ligne en haut (contour de la pointe) et +1 colonne de chaque côté : le dernier étage touchait le bord
  g.translate(1, 1);
  const pal = v ? { l: '#4aa65a', m: '#35874a', d: '#276a3a' } : { l: '#3f9a52', m: '#2f7d44', d: '#245f36' };
  artShadow(g, 15, 46, 12, 3);
  aR(g, 13, 38, 5, 9, OUT); aR(g, 14, 38, 3, 8, '#7a4b26'); aR(g, 14, 38, 1, 8, '#9c6434');
  const tiers = [{ top: 24, bot: 41, hw: 13 }, { top: 14, bot: 31, hw: 11 }, { top: 5, bot: 21, hw: 8 }, { top: 0, bot: 11, hw: 5 }];
  for (const t of tiers) {
    for (let y = t.top; y <= t.bot; y++) {
      const k = (y - t.top) / (t.bot - t.top), hw = Math.round(1 + k * (t.hw - 1));
      aR(g, cx - hw - 1, y, hw * 2 + 3, 1, OUT);
    }
    aR(g, cx - t.hw - 1, t.bot + 1, t.hw * 2 + 3, 1, OUT);
    if (t.top === 0) aR(g, cx - 1, -1, 3, 1, OUT);   // contour au-dessus de la pointe
    for (let y = t.top; y <= t.bot; y++) {
      const k = (y - t.top) / (t.bot - t.top), hw = Math.round(1 + k * (t.hw - 1));
      const l = cx - hw, w = hw * 2 + 1;
      if (y === t.bot) {   // lisière dentelée
        for (let x = l; x < l + w; x++) if ((x + t.top) % 3 !== 0) aP(g, x, y, pal.m);
        continue;
      }
      aR(g, l, y, w, 1, pal.m);
      aR(g, l, y, Math.max(1, Math.round(w * 0.34)), 1, pal.l);
      aR(g, l + w - Math.max(1, Math.round(w * 0.30)), y, Math.max(1, Math.round(w * 0.30)), 1, pal.d);
    }
  }
  return artUp(c);
}
function buildBush(v) {
  const W = 30, H = 20, { c, g } = artCanvas(W, H);
  const lay = [[8, 12, 6], [15, 9, 8], [22, 12, 6], [15, 13, 6]];
  artShadow(g, 15, 18, 13, 2);
  lay.forEach(([x, y, r]) => aDisc(g, x, y, r + 1, OUT));
  lay.forEach(([x, y, r]) => aDisc(g, x, y, r, '#2f7a38'));
  lay.forEach(([x, y, r]) => aDisc(g, x - 1, y - 1, Math.max(2, r - 2), '#46a049'));
  lay.forEach(([x, y, r]) => aDisc(g, x - 2, y - 3, Math.max(1, r - 5), '#6cc35a'));
  aR(g, 10, 5, 2, 1, '#9be07c'); aR(g, 17, 3, 2, 1, '#9be07c'); aR(g, 5, 9, 2, 1, '#9be07c');
  if (v === 1) [[9, 11], [16, 8], [21, 12], [13, 14]].forEach(([x, y]) => { aR(g, x, y, 2, 2, OUT); aP(g, x, y, '#ff6b87'); aP(g, x + 1, y + 1, '#c93b5c'); });
  return artUp(c);
}
function buildRock(v) {
  const W = 20, H = 14, { c, g } = artCanvas(W, H);
  artShadow(g, 10, 12, 9, 2);
  const shape = v ? [[9, 7, 8, 5], [5, 8, 4, 3]] : [[10, 7, 8, 5], [14, 8, 4, 3]];
  shape.forEach(([x, y, rx, ry]) => aEll(g, x, y, rx + 1, ry + 1, OUT));
  shape.forEach(([x, y, rx, ry]) => aEll(g, x, y, rx, ry, '#8c8c94'));
  shape.forEach(([x, y, rx, ry]) => aEll(g, x - 1, y - 1, Math.max(1, rx - 2), Math.max(1, ry - 1), '#aeaeb6'));
  aR(g, 6, 4, 3, 1, '#d4d4dc'); aR(g, 7, 5, 1, 1, '#d4d4dc');
  aR(g, 13, 9, 3, 1, '#6a6a72'); aR(g, 11, 10, 3, 1, '#6a6a72');
  aLine(g, 10, 5, 11, 8, 1, '#6a6a72');
  return artUp(c);
}
const treeSpr = [buildRoundTree(0), buildRoundTree(1), buildRoundTree(2), buildPineTree(0), buildPineTree(1)];
const bushSpr = [buildBush(0), buildBush(1)], rockSpr = [buildRock(0), buildRock(1)];
function treeSprite(t) { const k = Math.floor(hash2(t.x, t.y, 21) * 3); return t.variant === 'pine' ? treeSpr[3 + (k % 2)] : treeSpr[k % 3]; }
// Les anciennes coordonnées (x, y) étaient le coin haut-gauche d'une zone de 32 px : on ancre sur le pied du tronc.
// (le bas du sprite reste calé à t.y + 54 pour l'arbre rond, t.y + 52 pour le sapin, quelle que soit la marge ajoutée autour)
function drawTree(t) { const s = treeSprite(t); ctx.drawImage(s, Math.round(t.x + 16 - s.width / 2), Math.round(t.y + (t.variant === 'pine' ? 52 : 54) - s.height)); }
function drawBush(b) { const s = bushSpr[Math.floor(hash2(b.x, b.y, 22) * 5) === 0 ? 1 : 0]; ctx.drawImage(s, Math.round(b.x + 14 - s.width / 2), Math.round(b.y + 20 - 34)); }
function drawRock(r) { const s = rockSpr[Math.floor(hash2(r.x, r.y, 23) * 2)]; ctx.drawImage(s, Math.round(r.x + 10 - s.width / 2), Math.round(r.y + 13 - 24)); }
