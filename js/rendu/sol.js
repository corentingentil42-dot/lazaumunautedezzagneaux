/* ============================================================
   js/rendu/sol.js — Sol : herbe, chemins de terre, place pavée (rendu par morceaux de 256 px, mis en cache).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   SOL : herbe, chemins de terre, place pavée — rendu par morceaux de 256 px, mis en cache
   ===================================================================== */
const CH = 256, CHN = CH / PX;
const GRASS = ['#5a9a42', '#66a74b', '#72b255', '#7fbf60'].map(cHex);
const TUFT_D = cHex('#47883a'), TUFT_L = cHex('#98d576');
const FLOWER_COLS = ['#ff7aa8', '#ffd76b', '#8fd3ff', '#d29bff', '#ffffff'].map(cHex);
const DIRT = { edge: cHex('#9a7843'), rim: cHex('#c3a46b'), base: cHex('#dcc18b'), dark: cHex('#cdb078'), light: cHex('#ebd6a6') };
const STONE = ['#d6c49d', '#cdb98f', '#dccba6'].map(cHex);
const MORTAR = cHex('#a58e66'), STONE_RING = cHex('#bfa475'), CURB = ['#e8dab6', '#dac9a2'].map(cHex), CURB_IN = cHex('#b6a078');
const OUT_RGB = cHex(OUT), GRASS_SHADOW = cHex('#4a8a3a');

const PATHS = [];
for (const z of zones) {
  if (z.isHome) PATHS.push({ x0: HUB_X, y0: HUB_Y, x1: z.x + z.w / 2, y1: z.y + z.h + 6, hw: 21 });
  else PATHS.push({ x0: HUB_X, y0: HUB_Y, x1: z.x + z.w / 2, y1: z.y + z.h / 2, hw: 25 });
}
for (const s of PATHS) {
  s.dx = s.x1 - s.x0; s.dy = s.y1 - s.y0; s.len2 = s.dx * s.dx + s.dy * s.dy;
  s.minx = Math.min(s.x0, s.x1) - s.hw - 8; s.maxx = Math.max(s.x0, s.x1) + s.hw + 8;
  s.miny = Math.min(s.y0, s.y1) - s.hw - 8; s.maxy = Math.max(s.y0, s.y1) + s.hw + 8;
}

function shadeRGB(c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }

function groundPixel(ax, ay, wx, wy, segs) {
  const dxh = wx - HUB_X, dyh = wy - HUB_Y;
  const dh = Math.sqrt(dxh * dxh + dyh * dyh);
  // ----- la place -----
  if (dh < HUB_RADIUS + 5) {
    if (dh >= HUB_RADIUS + 1) return GRASS_SHADOW;
    if (dh >= HUB_RADIUS - 2) return OUT_RGB;
    if (dh >= HUB_RADIUS - 9) {
      if (dh >= HUB_RADIUS - 4) return CURB_IN;
      const seg = Math.floor(Math.atan2(dyh, dxh) * 46);
      return CURB[(seg & 1)];
    }
    const row = Math.floor(ay / 4), off = (row & 1) ? 3 : 0, sx = ax + off;
    const cell = Math.floor(sx / 6), lx = ((sx % 6) + 6) % 6, ly = ((ay % 4) + 4) % 4;
    if (lx === 0 || ly === 0) return MORTAR;
    const ring = (dh > 92 && dh < 98) || (dh > 176 && dh < 182) || (dh > 56 && dh < 62);
    const n = hash2(cell, row, 5);
    let col = ring ? STONE_RING : (n < 0.33 ? STONE[0] : n < 0.66 ? STONE[1] : STONE[2]);
    if (lx === 1 && ly === 1) col = [col[0] + 14, col[1] + 14, col[2] + 12];
    else if (lx === 5 || ly === 3) col = shadeRGB(col, 0.93);
    return col;
  }
  // ----- les chemins -----
  let dp = 1e9;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (wx < s.minx || wx > s.maxx || wy < s.miny || wy > s.maxy) continue;
    let t = ((wx - s.x0) * s.dx + (wy - s.y0) * s.dy) / s.len2;
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    const px = s.x0 + s.dx * t - wx, py = s.y0 + s.dy * t - wy;
    const d = Math.sqrt(px * px + py * py) - s.hw;
    if (d < dp) dp = d;
  }
  if (dp < 3) {
    dp += (vnoise(wx, wy, 14, 11) - 0.5) * 6;   // bord irrégulier
    if (dp < 3) {
      if (dp > 0.5) return DIRT.edge;
      if (dp > -3.5) return DIRT.rim;
      const h = hash2(ax, ay, 12);
      if (h < 0.05) return DIRT.dark;
      if (h > 0.965) return DIRT.light;
      return DIRT.base;
    }
  }
  // ----- l'herbe -----
  const nv = vnoise(wx, wy, 110, 3) * 0.5 + vnoise(wx, wy, 40, 4) * 0.34 + vnoise(wx, wy, 14, 5) * 0.16 + (hash2(ax, ay, 6) - 0.5) * 0.12;
  let col = nv < 0.41 ? GRASS[0] : nv < 0.51 ? GRASS[1] : nv < 0.60 ? GRASS[2] : GRASS[3];
  // touffes : origine (ax,ay) = pixel sombre, le pixel au-dessus = clair, un en biais
  const tuft = (ox, oy) => hash2(ox, oy, 7) < 0.012;
  if (tuft(ax, ay)) return TUFT_D;
  if (tuft(ax, ay + 1)) return TUFT_L;
  if (tuft(ax - 1, ay + 1) || tuft(ax + 1, ay + 1)) return TUFT_D;
  // fleurs : croix de 3×3 pixels (centre jaune)
  const fl = (ox, oy) => hash2(ox, oy, 9) < 0.0016;
  if (fl(ax, ay)) return FLOWER_COLS[1];
  if (fl(ax - 1, ay) || fl(ax + 1, ay) || fl(ax, ay - 1) || fl(ax, ay + 1)) {
    const o = fl(ax - 1, ay) ? [ax - 1, ay] : fl(ax + 1, ay) ? [ax + 1, ay] : fl(ax, ay - 1) ? [ax, ay - 1] : [ax, ay + 1];
    const pi = Math.floor(hash2(o[0], o[1], 10) * 5) % 5;
    return FLOWER_COLS[pi === 1 ? 0 : pi];
  }
  return col;
}

const groundCache = new Map();
function buildChunk(cx, cy) {
  const cv = document.createElement('canvas'); cv.width = cv.height = CH;
  const g = cv.getContext('2d');
  const img = g.createImageData(CH, CH), d = img.data;
  const x0 = cx * CH, y0 = cy * CH;
  const segs = PATHS.filter(s => !(s.maxx < x0 - 4 || s.minx > x0 + CH + 4 || s.maxy < y0 - 4 || s.miny > y0 + CH + 4));
  for (let ay = 0; ay < CHN; ay++) {
    for (let ax = 0; ax < CHN; ax++) {
      const gax = cx * CHN + ax, gay = cy * CHN + ay;
      const c = groundPixel(gax, gay, x0 + ax * PX + PX / 2, y0 + ay * PX + PX / 2, segs);
      const r = c[0] | 0, gg = c[1] | 0, b = c[2] | 0;
      for (let j = 0; j < PX; j++) {
        let o = ((ay * PX + j) * CH + ax * PX) * 4;
        for (let i = 0; i < PX; i++) { d[o++] = r; d[o++] = gg; d[o++] = b; d[o++] = 255; }
      }
    }
  }
  g.putImageData(img, 0, 0);
  return cv;
}
function getChunk(cx, cy) {
  const k = cx + ',' + cy;
  let c = groundCache.get(k);
  if (c) { groundCache.delete(k); groundCache.set(k, c); return c; }
  c = buildChunk(cx, cy);
  groundCache.set(k, c);
  if (groundCache.size > 64) groundCache.delete(groundCache.keys().next().value);
  return c;
}
const CHX = Math.ceil(WORLD_W / CH), CHY = Math.ceil(WORLD_H / CH);
function drawGround(camX, camY) {
  const x0 = Math.max(0, Math.floor(camX / CH)), x1 = Math.min(CHX - 1, Math.floor((camX + SEE_W) / CH));
  const y0 = Math.max(0, Math.floor(camY / CH)), y1 = Math.min(CHY - 1, Math.floor((camY + SEE_H) / CH));
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) ctx.drawImage(getChunk(cx, cy), cx * CH, cy * CH);
  // Pré-calcul des morceaux voisins, un seul par image, pour ne jamais saccader en marchant.
  for (let cy = Math.max(0, y0 - 1); cy <= Math.min(CHY - 1, y1 + 1); cy++) {
    for (let cx = Math.max(0, x0 - 1); cx <= Math.min(CHX - 1, x1 + 1); cx++) {
      if (!groundCache.has(cx + ',' + cy)) { getChunk(cx, cy); return; }
    }
  }
}
