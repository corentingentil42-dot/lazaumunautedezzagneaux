/* ============================================================
   js/minijeux/coco-course.js — Mini-jeu de Coco : la course à vélo contre 5 concurrents, en pixel art (type 'course'). Podium obligatoire : 1er ★★★, 2ᵉ ★★, 3ᵉ ★.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ===== COURSE DE COCO : le Circuit (v20.27) =====
   Vraie course à vélo en vue de dessus : la route serpente vers le haut, Coco part avec 5 concurrents.
   ← → dirigent, ↑ pédale à fond, ↓ freine.
   • Percuter un concurrent ou un rocher = CHUTE (animation), puis on repart au ralenti.
   • L'herbe et la boue ralentissent ; les plaques ⚡ donnent un boost ; coller un concurrent = sillage (+10 %).
   • Il faut finir sur le podium : 1er ★★★, 2ᵉ ★★, 3ᵉ ★. Quatrième ou plus : on recommence.
   Tout est dessiné en pixel art dans le code (même style que le hub : contours sombres, herbe, chemin de terre).

   OÙ RÉGLER QUOI :
   - COURSE (juste en dessous)  : longueur du circuit, vitesse, durée des chutes, décompte…
   - COURSE_RIVALS              : les 5 concurrents (vitesse « skill », agressivité, adresse, risque de gaffe).
   - courseBuildTrack()         : où sont les rochers, la boue et les plaques ⚡.
   - STAR_RULES.course          : js/minijeux/etoiles.js (étoiles selon la place). */
const COURSE = {
  LEN: 11000,      // longueur du circuit en px (≈ 40 s de course)
  VMAX: 300,       // vitesse de pointe de Coco, pédale à fond (px/s)
  STEP: 1 / 120,   // pas de la simulation (fixe : même course quel que soit l'écran)
  PY: 385,         // hauteur du joueur à l'écran
  START_T: 3.0,    // durée du décompte avant le départ (s)
  FALL_T: 0.85,    // durée de la chute (s)
  SLOW_T: 1.4,     // durée du redémarrage « au ralenti » (s)
  INV_T: 1.5,      // invulnérabilité (clignotement) après être reparti (s)
  GRACE_T: 1.4,    // après le GO : les coureurs ne se percutent pas (sinon on tombait dès le départ en rentrant dans celui de devant)
  ROAD_HW: 116,    // demi-largeur de la route (px) : plus large = plus de place pour éviter rochers et concurrents
  GRASS_SLOW: 0.75,   // vitesse relative dans l'herbe (1 = pas de ralentissement)
  ROCK_X: 19, ROCK_Y: 20,   // « taille » d'un rocher pour la collision (plus petit = plus indulgent)
  ROCK_CORE: 9,    // en plein milieu du rocher (moins de 9 px d'écart) : CHUTE ; en l'effleurant : simple bosse (on est dévié et on ralentit)
  ELASTIC_D: 1000, ELASTIC_MAX_AHEAD: 0.12, ELASTIC_MAX_BEHIND: 0.07,   // élastique des rivaux (distance en px pour atteindre l'effet complet, bonus max de ralentissement / d'accélération)
  ASSIST: 1,       // téléphone : coup de pouce qui écarte doucement le vélo des rochers (0 = aucun aide)
  HIT_FALL_V: 100,  // on ne tombe en rentrant dans un coureur que si on le percute à plus de 45 px/s de vitesse relative ; sinon, simple bousculade
  PODIUM: 3,       // il faut finir dans les 3 premiers
  MAX_T: 150       // garde-fou : la course s'arrête après 150 s
};
const COURSE_RIVALS = [
  // skill : vitesse (Coco = 1) · aggr : tendance à te couper la route · steer : vitesse de braquage (px/s)
  // aware : chance de voir un rocher à temps · stumble : risque de faire une gaffe (chute) pendant la course
  { id: 'tristan',   skill: 0.88, aggr: 0.40, steer: 185, aware: 0.92, stumble: 0.60 },
  { id: 'maeva',     skill: 0.86, aggr: 0.10, steer: 165, aware: 0.94, stumble: 0.45 },
  { id: 'callipyge', skill: 0.84, aggr: 0.00, steer: 150, aware: 0.95, stumble: 0.40 },
  { id: 'horace',    skill: 0.82, aggr: 0.50, steer: 175, aware: 0.88, stumble: 0.65 },
  { id: 'camille',   skill: 0.80, aggr: 0.15, steer: 145, aware: 0.86, stumble: 0.60 }
];
const courseHash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const courseClamp = (v, a, b) => v < a ? a : (v > b ? b : v);
// La route serpente (droite au départ et à l'arrivée) : centre et demi-largeur en fonction de l'avancée
const courseAmp = (wy) => courseClamp(wy / 900, 0, 1) * courseClamp((COURSE.LEN + 250 - wy) / 800, 0, 1);
const coursePathX = (wy) => 400 + (Math.sin(wy * 0.0021) * 125 + Math.sin(wy * 0.00067 + 1.3) * 75) * courseAmp(wy);
const coursePathHW = (wy) => COURSE.ROAD_HW + Math.sin(wy * 0.0031 + 0.7) * 8;
const courseOrdinal = (n) => n === 1 ? '1er' : n + 'ᵉ';

/* ---------------------------------------------------------------
   LE CIRCUIT : rochers, boue, plaques ⚡, décor — identique à chaque partie
   --------------------------------------------------------------- */
function courseBuildTrack() {
  const T = { pads: [], rocks: [], muds: [], decor: [], signs: [] };
  const L = COURSE.LEN;
  // Plaques ⚡
  for (let wy = 950, i = 0; wy < L - 800; i++) {
    const hw = coursePathHW(wy);
    T.pads.push({ wy, x: coursePathX(wy) + (courseHash(i * 5.1) * 2 - 1) * (hw - 42), taken: {} });
    wy += 780 + courseHash(i * 3.3) * 520;
  }
  // Rochers : par groupes, jamais de quoi bloquer toute la route (il reste toujours un passage large)
  for (let wy = 780, i = 0; wy < L - 450; i++) {
    const hw = coursePathHW(wy), c = coursePathX(wy);
    if (courseHash(i * 2.9) < 0.28) {            // deux rochers, un de chaque côté
      T.rocks.push({ wy, x: c - hw * (0.25 + courseHash(i * 1.3) * 0.6), v: i % 2 });
      T.rocks.push({ wy: wy + 14, x: c + hw * (0.25 + courseHash(i * 6.1) * 0.6), v: (i + 1) % 2 });
    } else {
      T.rocks.push({ wy, x: c + (courseHash(i * 4.7) * 2 - 1) * (hw - 36), v: i % 2 });
    }
    wy += 380 + courseHash(i * 7.9) * 300;
  }
  // Flaques de boue
  for (let wy = 600, i = 0; wy < L - 500; i++) {
    const hw = coursePathHW(wy);
    T.muds.push({ wy, x: coursePathX(wy) + (courseHash(i * 8.3 + 2) * 2 - 1) * (hw - 38) });
    wy += 650 + courseHash(i * 2.2) * 700;
  }
  // Décor des bas-côtés : arbres, buissons, rochers (hors de la route, jamais gênant)
  for (let i = -6; i < L / 62 + 14; i++) {
    for (const side of [-1, 1]) {
      const h = courseHash(i * 9.7 + side * 3.9);
      if (h > 0.78) continue;   // des trous : ça respire
      const wy = i * 62 + courseHash(i * 2.1 + side) * 40;
      const x = coursePathX(wy) + side * (coursePathHW(wy) + 62 + courseHash(i * 5.3 + side * 7) * 190);
      if (x < 6 || x > 794) continue;
      const kind = h < 0.30 ? 'round' : (h < 0.46 ? 'pine' : (h < 0.64 ? 'bush' : 'rock'));
      T.decor.push({ wy, x, kind, v: Math.floor(courseHash(i * 1.9 + side * 2) * 3) });
    }
  }
  // Panneaux de distance avant l'arrivée
  for (const m of [500, 250, 100]) T.signs.push({ wy: L - m * 10, label: m + ' m' });   // 1 m affiché = 10 px
  return T;
}

/* ---------------------------------------------------------------
   IMAGES EN PIXEL ART (construites une seule fois, à la première partie)
   --------------------------------------------------------------- */
let courseAssetsCache = null;
function courseAssets() {
  if (courseAssetsCache) return courseAssetsCache;
  const A = { bikes: {} };
  const col = (c) => cStr(c[0], c[1], c[2]);
  // --- Herbe : tuile de 128×128 pixels d'art (256 px) qui se répète sans couture ---
  {
    const N = 128, { c, g } = artCanvas(N, N);
    const wn = (x, y, sc, seed) => {      // bruit de valeur périodique (sans couture)
      const P = N / sc, gx = Math.floor(x / sc), gy = Math.floor(y / sc), fx = x / sc - gx, fy = y / sc - gy;
      const h = (i, j) => hash2(((i % P) + P) % P, ((j % P) + P) % P, seed);
      const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      const a = h(gx, gy), b = h(gx + 1, gy), cc = h(gx, gy + 1), d = h(gx + 1, gy + 1);
      return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v;
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const n = wn(x, y, 16, 3) * 0.55 + wn(x, y, 8, 5) * 0.3 + wn(x, y, 4, 7) * 0.15;
      aP(g, x, y, col(GRASS[n < 0.34 ? 0 : (n < 0.52 ? 1 : (n < 0.7 ? 2 : 3))]));
    }
    for (let i = 0; i < 90; i++) {   // touffes
      const x = 2 + Math.floor(hash2(i, 1, 11) * (N - 4)), y = 2 + Math.floor(hash2(i, 2, 11) * (N - 5));
      aP(g, x, y, col(TUFT_D)); aP(g, x - 1, y - 1, col(TUFT_D)); aP(g, x + 1, y - 1, col(TUFT_D)); aP(g, x, y - 1, col(TUFT_L));
    }
    for (let i = 0; i < 12; i++) {   // fleurs
      const x = 3 + Math.floor(hash2(i, 3, 13) * (N - 6)), y = 3 + Math.floor(hash2(i, 4, 13) * (N - 6));
      const fc = col(FLOWER_COLS[Math.floor(hash2(i, 5, 13) * 5)]);
      aP(g, x, y, '#ffe27a'); aP(g, x - 1, y, fc); aP(g, x + 1, y, fc); aP(g, x, y - 1, fc); aP(g, x, y + 1, fc);
    }
    A.grass = artUp(c);
  }
  // --- Terre de la route : texture qui se répète en hauteur (400×256 pixels d'art = 800×512 px) ---
  {
    const { c, g } = artCanvas(400, 256);
    aR(g, 0, 0, 400, 256, col(DIRT.base));
    for (let y = 0; y < 256; y++) for (let x = 0; x < 400; x++) {
      const r = hash2(x, y, 91);
      if (r < 0.075) aP(g, x, y, col(DIRT.dark)); else if (r > 0.962) aP(g, x, y, col(DIRT.light));
    }
    for (let i = 0; i < 150; i++) {   // petits cailloux
      const x = Math.floor(hash2(i, 6, 17) * 396), y = Math.floor(hash2(i, 7, 17) * 252);
      aR(g, x, y, 2, 1, col(DIRT.edge)); aP(g, x, y - 1, col(DIRT.light));
    }
    A.road = artUp(c);
  }
  // --- Plaque ⚡ (2 images : claire / sombre, pour le clignotement) ---
  for (const lit of [true, false]) {
    const { c, g } = artCanvas(28, 15);
    aR(g, 1, 1, 26, 13, OUT);
    aR(g, 2, 2, 24, 11, lit ? '#ffd24a' : '#e0a72c'); aR(g, 2, 2, 24, 2, lit ? '#fff0a0' : '#f4cf63');
    for (let k = 0; k < 2; k++) { aLine(g, 6, 12 - k * 4, 14, 7 - k * 4, 2, '#8a4b00'); aLine(g, 14, 7 - k * 4, 22, 12 - k * 4, 2, '#8a4b00'); }   // 2 chevrons ^
    A[lit ? 'padOn' : 'padOff'] = artUp(c);
  }
  // --- Flaque de boue ---
  {
    const { c, g } = artCanvas(30, 12);
    aEll(g, 15, 6, 14, 5, '#4e3320'); aEll(g, 15, 6, 12, 4, '#6e4a2c'); aEll(g, 14, 5, 8, 2, '#85603a');
    aR(g, 9, 4, 3, 1, '#a9804f'); aR(g, 18, 7, 2, 1, '#4e3320');
    A.mud = artUp(c);
  }
  // --- Panneau de distance (bois, contour sombre) ---
  {
    const { c, g } = artCanvas(30, 22);
    artShadow(g, 15, 20, 10, 2);
    aR(g, 13, 12, 4, 9, OUT); aR(g, 14, 12, 2, 8, '#7a4b26');
    aR(g, 1, 1, 28, 13, OUT); aR(g, 2, 2, 26, 11, '#c9975a'); aR(g, 2, 2, 26, 2, '#e0b777'); aR(g, 2, 12, 26, 1, '#9a6b36');
    A.sign = artUp(c);
  }
  courseAssetsCache = A;
  return A;
}
// Vélo vu de derrière, dans la couleur de son pilote (mis en cache)
function courseBikeSprite(color) {
  const A = courseAssets();
  if (A.bikes[color]) return A.bikes[color];
  const { c, g } = artCanvas(20, 30);
  const light = cLight(color, 0.45), dark = cDark(color, 0.35);
  // roue avant (en haut), cadre, roue arrière (en bas), guidon
  aR(g, 8, 0, 4, 10, OUT); aR(g, 9, 1, 2, 8, '#3a3a44'); aP(g, 9, 2, '#7a7a88');
  aR(g, 7, 9, 6, 12, OUT); aR(g, 8, 10, 4, 10, color); aR(g, 8, 10, 1, 10, light); aR(g, 11, 10, 1, 10, dark);
  aR(g, 1, 8, 18, 4, OUT); aR(g, 2, 9, 16, 2, '#aab0ba'); aR(g, 1, 9, 2, 2, '#25252b'); aR(g, 17, 9, 2, 2, '#25252b');
  aR(g, 7, 20, 6, 10, OUT); aR(g, 8, 21, 4, 8, '#3a3a44'); aP(g, 9, 22, '#7a7a88'); aR(g, 8, 27, 4, 1, '#5a5a66');
  A.bikes[color] = artUp(c);
  return A.bikes[color];
}

/* ---------------------------------------------------------------
   LES COUREURS
   --------------------------------------------------------------- */
function courseMakeRacer(id, color, name, slot, isPlayer, cfg) {
  return {
    id, name, color, isPlayer, cfg: cfg || null, skill: cfg ? cfg.skill : 1,
    x: slot.x, wy: slot.wy, vx: 0, speed: 0,
    state: 'ride', stateT: 0, inv: 0, fallDir: 1,
    boostT: 0, mudT: 0, bumpT: 0, wobble: 0, draft: false, onRoad: true,
    pedal: Math.random() * 5, finished: false, finishT: 0, place: 0,
    lane: cfg ? (Math.random() * 1.2 - 0.6) : 0, goDelay: cfg ? Math.random() * 0.3 : 0,
    seen: {}, stumbles: [], nextStumble: 0
  };
}
function courseInit(s, zone) {
  s.zone = zone;
  s.t = 0; s.started = false; s.finishCount = 0; s.place = 0; s.endAt = 0; s.endKind = '';
  s.keys = {}; s.particles = []; s.shake = 0; s.falls = 0; s.padsTaken = 0; s.draftTime = 0; s.flash = null; s.winnerName = '';
  s.accum = 0;
  s.track = courseBuildTrack();
  // Grille de départ : 2 colonnes × 3 rangées ; Coco part au fond à gauche
  const slots = [{ x: 366, wy: -30 }, { x: 434, wy: -30 }, { x: 366, wy: -100 }, { x: 434, wy: -100 }, { x: 434, wy: -170 }, { x: 366, wy: -170 }];
  const order = [...COURSE_RIVALS];
  const R = [];
  const coco = PERSONNAGES.find(p => p.id === 'coco');
  R.push(courseMakeRacer('coco', '#e07b39', coco ? coco.surnom : 'Coco', slots[5], true, null));
  order.forEach((cfg, i) => {
    const p = PERSONNAGES.find(q => q.id === cfg.id);
    const r = courseMakeRacer(cfg.id, p ? p.couleur : '#888888', p ? p.surnom : cfg.id, slots[i], false, cfg);
    // gaffes prévues (chutes de rivaux), à des endroits tirés au hasard
    const n = (Math.random() < cfg.stumble ? 1 : 0) + (Math.random() < cfg.stumble * 0.35 ? 1 : 0);
    for (let k = 0; k < n; k++) r.stumbles.push(1800 + Math.random() * (COURSE.LEN - 3600));
    r.stumbles.sort((a, b) => a - b);
    R.push(r);
  });
  s.racers = R; s.player = R[0];
}

// Classement actuel : arrivés d'abord (dans l'ordre d'arrivée), puis selon l'avancée
function coursePlaces(s) {
  return [...s.racers].sort((a, b) => {
    if (a.finished && b.finished) return a.place - b.place;
    if (a.finished) return -1; if (b.finished) return 1;
    return b.wy - a.wy;
  });
}

function courseFall(s, r, dirx) {
  if (r.state === 'fall' || r.inv > 0 || r.finished) return;
  r.state = 'fall'; r.stateT = 0; r.fallDir = dirx || (Math.random() < 0.5 ? -1 : 1);
  r.vx = r.fallDir * 80; r.boostT = 0; r.mudT = 0; r.draft = false;
  if (r.isPlayer) { s.falls++; s.shake = 1; Snd.play('crash'); }
  for (let k = 0; k < 9; k++) s.particles.push({ x: r.x + (Math.random() * 20 - 10), wy: r.wy + (Math.random() * 14 - 7), vx: (Math.random() - 0.5) * 120, vy: 40 + Math.random() * 80, life: 0.5 + Math.random() * 0.3, sz: 4, c: '#d9c08a' });
}

// --- L'IA des concurrents : décide où aller (tx) et s'ils pédalent / freinent ---
function courseAI(s, r) {
  const T = s.track, P = s.player, cfg = r.cfg;
  const hw = coursePathHW(r.wy), look = 90 + r.speed * 0.45;
  let tx = coursePathX(r.wy + look * 0.6) + r.lane * (hw - 24);
  let brake = false;
  const lo = (w) => coursePathX(w) - coursePathHW(w) + 20, hi = (w) => coursePathX(w) + coursePathHW(w) - 20;
  // Plaques ⚡ à portée : on va les chercher (sauf si on a déjà roulé dessus)
  for (const pad of T.pads) {
    if (pad.wy > r.wy + 20 && pad.wy < r.wy + 230 && !pad.taken[r.id] && Math.abs(pad.x - tx) < 80) { tx = pad.x; break; }
  }
  // Rochers devant : on les contourne (une fois sur 10-20, on ne les a pas vus...)
  for (let i = 0; i < T.rocks.length; i++) {
    const k = T.rocks[i];
    if (k.wy < r.wy - 8 || k.wy > r.wy + look) continue;
    if (r.seen[i] === undefined) r.seen[i] = Math.random() < cfg.aware;
    if (!r.seen[i]) continue;
    if (Math.abs(k.x - tx) < 42 || Math.abs(k.x - r.x) < 34) {
      let dir = k.x > r.x ? -1 : 1;
      let nx = k.x + dir * 46;
      if (nx < lo(k.wy) || nx > hi(k.wy)) { dir = -dir; nx = k.x + dir * 46; }
      tx = nx;
    }
  }
  // Boue : on l'évite si on peut
  for (const m of T.muds) if (m.wy > r.wy && m.wy < r.wy + look && Math.abs(m.x - tx) < 36) tx = m.x + (m.x > r.x ? -44 : 44);
  // Autres coureurs devant : doubler par le côté libre, sinon ralentir
  for (const f of s.racers) {
    if (f === r || f.state === 'fall') continue;
    const dy = f.wy - r.wy, dx = f.x - r.x;
    if (dy > 0 && dy < 110 && Math.abs(dx) < 30) {
      const left = f.x - 46, right = f.x + 46;
      const okL = left > lo(f.wy), okR = right < hi(f.wy);
      if (okL || okR) tx = (okL && okR) ? (Math.abs(left - tx) < Math.abs(right - tx) ? left : right) : (okL ? left : right);
      else if (dy < 52) brake = true;
    }
  }
  // Le joueur à côté : poli (on s'écarte) ou agressif (on se rabat sur lui)
  const dyp = P.wy - r.wy, dxp = P.x - r.x;
  if (!P.finished && Math.abs(dyp) < 46 && Math.abs(dxp) < 80 && P.state !== 'fall') {
    if (cfg.aggr > 0.5 && Math.abs(dxp) > 24 && Math.random() < cfg.aggr * 0.6 * COURSE.STEP) r.cutT = 0.5;   // de temps en temps, il décide de te couper la route
  }
  if (r.cutT > 0 && Math.abs(dyp) < 50 && Math.abs(dxp) < 90) tx = P.x - Math.sign(dxp) * 12;   // se rabat sur toi : bousculade (ou chute si tu lui fonces dedans)
  else if (Math.abs(dyp) < 46 && Math.abs(dxp) < 34 && P.state !== 'fall') tx = r.x - Math.sign(dxp || 1) * 40;   // on s'écarte
  tx = courseClamp(tx, lo(r.wy), hi(r.wy));
  // Gaffe prévue : le coureur chute à l'endroit tiré au hasard
  if (r.nextStumble < r.stumbles.length && r.wy > r.stumbles[r.nextStumble]) { r.nextStumble++; courseFall(s, r, Math.random() < 0.5 ? -1 : 1); }
  return { vxT: courseClamp((tx - r.x) * 5, -cfg.steer, cfg.steer), gas: true, brake };
}

// --- Coup de pouce (téléphone) : un rocher pile devant ? le vélo est poussé doucement sur le côté (le joystick reste plus fort : on peut toujours foncer dessus) ---
function courseRockAssist(s, r) {
  if (!COURSE.ASSIST) return 0;
  let bias = 0, best = 1e9;
  for (const k of s.track.rocks) {
    const dy = k.wy - r.wy;
    if (dy < -12 || dy > 170 || dy >= best) continue;
    const dx = r.x - k.x;
    if (Math.abs(dx) > 34) continue;
    // du côté où il y a le plus de place (et si on est pile dessus : vers le centre de la route)
    let dir = Math.sign(dx) || (coursePathX(k.wy) > k.x ? 1 : -1);
    if (Math.abs(dx) < 6) dir = coursePathX(k.wy) > k.x ? 1 : -1;
    best = dy; bias = dir * 150 * courseClamp(1.15 - dy / 190, 0.25, 1);
  }
  return bias;
}

// --- Physique commune (joueur + concurrents) ---
function courseMove(s, r, dt, c) {
  let vmax = COURSE.VMAX * r.skill;
  if (!r.isPlayer && !r.finished) vmax *= 1 + courseClamp((s.player.wy - r.wy) / COURSE.ELASTIC_D, -COURSE.ELASTIC_MAX_AHEAD, COURSE.ELASTIC_MAX_BEHIND);   // élastique : un rival loin devant ralentit, un rival loin derrière accélère → la course reste serrée
  const road = coursePathX(r.wy), hw = coursePathHW(r.wy);
  r.onRoad = Math.abs(r.x - road) < hw - 3;
  let target, rate;
  if (r.state === 'fall') { target = 0; rate = 7; }
  else {
    target = vmax * (r.finished ? 0.5 : (c.gas ? 1 : 0.78));
    if (c.brake) target *= 0.45;
    if (!r.onRoad) target *= COURSE.GRASS_SLOW;
    if (r.mudT > 0) target *= 0.55;
    if (r.boostT > 0) target *= 1.45;
    if (r.draft) target *= 1.10;
    if (r.state === 'slow') target = Math.min(target, vmax * (0.25 + 0.75 * Math.min(1, r.stateT / COURSE.SLOW_T)));
    rate = target > r.speed ? 2.6 : 4.5;
  }
  r.speed += (target - r.speed) * Math.min(1, dt * rate);
  if (r.state === 'fall') r.vx *= Math.pow(0.05, dt);
  else r.vx += (c.vxT - r.vx) * Math.min(1, dt * 10);
  r.x = courseClamp(r.x + r.vx * dt * (0.5 + 0.5 * Math.min(1, r.speed / 120)), 30, 770);
  r.wy += r.speed * dt;
  r.pedal += r.speed * dt * 0.035;
  r.stateT += dt; r.boostT -= dt; r.mudT -= dt; r.bumpT -= dt; r.wobble = Math.max(0, r.wobble - dt * 2);
  if (r.cutT > 0) r.cutT -= dt;
  if (r.state !== 'fall') r.inv -= dt;
  if (r.state === 'fall' && r.stateT >= COURSE.FALL_T) { r.state = 'slow'; r.stateT = 0; r.inv = COURSE.INV_T + COURSE.SLOW_T; r.speed = 0; r.vx = 0; }
  else if (r.state === 'slow' && r.stateT >= COURSE.SLOW_T) { r.state = 'ride'; r.stateT = 0; }
}

// --- Un pas de simulation (1/120 s) ---
function courseStep(s, dt) {
  s.t += dt;
  s.shake = Math.max(0, s.shake - dt * 3);
  const T = s.track, P = s.player, R = s.racers;
  if (!s.started) {                       // décompte : 3 · 2 · 1 · GO
    const n = Math.floor(s.t);
    if (n !== s.lastBeep && n < 3) { s.lastBeep = n; Snd.play('beep'); }
    if (s.t >= COURSE.START_T) { s.started = true; s.raceT0 = s.t; s.lastBeep = 99; Snd.play('go'); }
    for (const r of R) r.pedal += dt * 0.4;
    return;
  }
  s.raceT = s.t - s.raceT0;
  // Sillage : être juste derrière un autre coureur donne +10 %
  for (const r of R) {
    r.draft = false;
    if (r.state === 'fall' || r.finished) continue;
    for (const f of R) {
      if (f === r || f.state === 'fall') continue;
      const dy = f.wy - r.wy;
      if (dy > 34 && dy < 125 && Math.abs(f.x - r.x) < 20) { r.draft = true; break; }
    }
  }
  if (P.draft) s.draftTime += dt;
  // Contrôles
  for (const r of R) {
    let c;
    if (r.isPlayer) {
      if (r.finished) c = { vxT: courseClamp((coursePathX(r.wy) - r.x) * 3, -120, 120), gas: false, brake: false };
      else {
        const k = s.keys;
        const steer = ((k['arrowright'] || k['d']) ? 1 : 0) - ((k['arrowleft'] || k['q'] || k['a']) ? 1 : 0);
        // Sur téléphone, le joystick ne donne qu'UNE direction à la fois (on ne peut pas tourner ET pédaler) : on pédale donc tout seul.
        c = { vxT: steer * 255 + (s.autoGas ? courseRockAssist(s, r) : 0), gas: s.autoGas || !!(k['arrowup'] || k['z'] || k['w']), brake: !!(k['arrowdown'] || k['s']) };
      }
    } else if (r.finished) c = { vxT: courseClamp((coursePathX(r.wy) - r.x) * 3, -100, 100), gas: false, brake: false };
    else if (s.raceT < r.goDelay) c = { vxT: 0, gas: false, brake: true };
    else c = courseAI(s, r);
    courseMove(s, r, dt, c);
  }
  // Collisions coureur ↔ coureur
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j];
    if (a.state === 'fall' || b.state === 'fall' || a.finished || b.finished || a.inv > 0 || b.inv > 0 || s.raceT < COURSE.GRACE_T) continue;
    const dx = b.x - a.x, dy = b.wy - a.wy;
    if (Math.abs(dx) < 21 && Math.abs(dy) < 36) {
      if (a.isPlayer || b.isPlayer) {
        // Qui est fautif ? Celui qui rentre dans le dos de l'autre tombe ; côte à côte, c'est une bousculade.
        const me = a.isPlayer ? a : b, other = a.isPlayer ? b : a, ahead = other.wy - me.wy, side = Math.sign(me.x - other.x) || 1;
        if (ahead > 16) {                       // je lui rentre dedans : JE tombe (si je le percute vraiment fort) ; sinon simple bousculade, je m'aligne sur sa vitesse
          if (me.speed - other.speed > COURSE.HIT_FALL_V) { courseFall(s, me, side); other.speed *= 0.7; other.wobble = 1; other.x -= side * 8; }
          else if (me.bumpT <= 0) { me.speed = Math.min(me.speed, other.speed * 0.95); me.vx += side * 120; me.bumpT = other.bumpT = 0.4; me.wobble = other.wobble = 0.8; me.x += side * 5; other.x -= side * 3; if (me.isPlayer) { s.shake = Math.max(s.shake, 0.3); Snd.play('pop'); } }
        } else if (ahead < -16) {               // il me percute par derrière : c'est LUI qui tombe, moi je tiens (un peu secoué)
          courseFall(s, other, -side);
          me.speed *= 0.92; me.wobble = 0.8;
        } else if (me.bumpT <= 0 && other.bumpT <= 0) {   // côte à côte : bousculade (on est poussé vers l'extérieur, on ralentit)
          me.vx += side * 150; other.vx -= side * 150; me.speed *= 0.82; other.speed *= 0.82;
          me.bumpT = other.bumpT = 0.4; me.wobble = other.wobble = 1; me.x += side * 5; other.x -= side * 5;
          if (me.isPlayer) { s.shake = Math.max(s.shake, 0.35); Snd.play('pop'); }
        }
      } else if (a.bumpT <= 0 && b.bumpT <= 0) {
        const rear = dy > 0 ? a : b;
        rear.speed *= 0.82; a.bumpT = b.bumpT = 0.35; a.wobble = b.wobble = 0.6;
        a.x -= Math.sign(dx || 1) * 6; b.x += Math.sign(dx || 1) * 6;
      }
    }
  }
  for (const r of R) {
    if (r.state === 'fall') continue;
    // Rochers : chute
    for (const k of T.rocks) {
      if (k.wy < r.wy - 40 || k.wy > r.wy + 40) continue;
      const dx = r.x - k.x;
      if (Math.abs(dx) < COURSE.ROCK_X && Math.abs(k.wy - r.wy) < COURSE.ROCK_Y) {
        if (Math.abs(dx) < COURSE.ROCK_CORE) courseFall(s, r, Math.sign(dx));
        else if (r.inv <= 0 && r.bumpT <= 0) {   // effleurement : on est repoussé sur le côté et on ralentit, sans tomber
          r.vx += Math.sign(dx) * 200; r.speed *= 0.78; r.bumpT = 0.35; r.wobble = 1;
          if (r.isPlayer) { s.shake = Math.max(s.shake, 0.3); Snd.play('pop'); }
        }
      }
    }
    // Boue : ralentit
    for (const m of T.muds) {
      if (Math.abs(m.wy - r.wy) < 14 && Math.abs(m.x - r.x) < 30) {
        if (r.mudT <= 0 && r.isPlayer) for (let q = 0; q < 6; q++) s.particles.push({ x: r.x + (Math.random() * 20 - 10), wy: r.wy - 10, vx: (Math.random() - 0.5) * 70, vy: -30 - Math.random() * 40, life: 0.4, sz: 4, c: '#6e4a2c' });
        r.mudT = 0.7;
      }
    }
    // Plaques ⚡ : boost
    for (const p of T.pads) {
      if (!p.taken[r.id] && Math.abs(p.wy - r.wy) < 24 && Math.abs(p.x - r.x) < 36) {
        p.taken[r.id] = true; r.boostT = 1.3;
        if (r.isPlayer) { s.padsTaken++; Snd.play('boost'); s.shake = Math.max(s.shake, 0.5); }
      }
    }
    // Poussière : herbe, boost
    if (r.state !== 'fall' && (!r.onRoad || r.boostT > 0) && r.speed > 60 && Math.random() < dt * 30) {
      s.particles.push({ x: r.x + (Math.random() * 14 - 7), wy: r.wy - 18, vx: (Math.random() - 0.5) * 30, vy: -20, life: 0.45, sz: 4, c: r.boostT > 0 ? '#ffd76b' : '#9bc46b' });
    }
    // Arrivée
    if (!r.finished && r.wy >= COURSE.LEN) {
      r.finished = true; r.finishT = s.t - (r.wy - COURSE.LEN) / Math.max(1, r.speed); r.place = ++s.finishCount;
      if (r.place === 1) s.winnerName = r.name;
      if (r.isPlayer) { s.place = r.place; s.endAt = s.t + 2.2; s.endKind = r.place <= COURSE.PODIUM ? 'win' : 'lose'; Snd.play(r.place <= COURSE.PODIUM ? 'win' : 'wrong'); }
    }
  }
  // Fin de course ratée : trois coureurs sont arrivés avant Coco, ou temps écoulé
  if (!P.finished && !s.endAt && (s.finishCount >= COURSE.PODIUM || s.raceT > COURSE.MAX_T)) { s.endAt = s.t + 1.5; s.endKind = 'out'; }
  // Particules
  for (let i = s.particles.length - 1; i >= 0; i--) {
    const p = s.particles[i]; p.life -= dt; p.wy += p.vy * dt; p.x += p.vx * dt;
    if (p.life <= 0) s.particles.splice(i, 1);
  }
}

/* ---------------------------------------------------------------
   LE JEU (branchement sur le moteur des mini-jeux)
   --------------------------------------------------------------- */
MINIGAMES['course'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    courseAssets();
    courseInit(s, zone);
    s.autoGas = document.body.classList.contains('touch');   // téléphone : pédalage automatique
    s._onKeyDown = (e) => { s.keys[e.key.toLowerCase()] = true; };
    s._onKeyUp = (e) => { s.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', s._onKeyDown);
    window.addEventListener('keyup', s._onKeyUp);
    s.lastT = performance.now();
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    s.accum += dt;
    while (s.accum >= COURSE.STEP) { courseStep(s, COURSE.STEP); s.accum -= COURSE.STEP; }
    courseDraw(ctx, canvas, s);
    // Fin de partie (après la petite pause d'arrivée)
    if (s.endAt && s.t >= s.endAt) {
      if (s.endKind === 'win') mgSuccess(s.zone);
      else if (s.endKind === 'lose') mgFail(s.zone, `Tu finis ${courseOrdinal(s.place)} : il faut une place sur le podium (top 3) !`);
      else mgFail(s.zone, 'Trois coureurs sont déjà arrivés : pas de podium cette fois !');
    }
  },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      window.removeEventListener('keyup', mgState._onKeyUp);
    }
  }
};

/* ---------------------------------------------------------------
   LE DESSIN
   --------------------------------------------------------------- */
function courseDraw(ctx, canvas, s) {
  const W = canvas.width, H = canvas.height, PY = COURSE.PY, A = courseAssets(), P = s.player;
  ctx.imageSmoothingEnabled = false;
  const cam = Math.round(P.wy / 2) * 2;                        // la caméra avance par pas de 2 px : l'herbe défile en vrais pixels d'art
  const sy = (wy) => PY - (wy - cam);                           // hauteur écran d'un point du circuit
  ctx.save();
  if (s.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 8 * s.shake), Math.round((Math.random() - 0.5) * 8 * s.shake));

  // 1. Herbe
  const gy = ((cam % 256) + 256) % 256;
  for (let ty = gy - 256; ty < H + 8; ty += 256) for (let tx = -8; tx < W + 8; tx += 256) ctx.drawImage(A.grass, tx, ty);

  // 2. Route, ligne par ligne (2 px de haut)
  for (let y = -8; y < H + 8; y += 2) {
    const wy = cam + (PY - y) - 1, c = coursePathX(wy), h = coursePathHW(wy), q = Math.floor(wy / 2);
    const L = Math.round((c - h) / 2) * 2 + (Math.floor(courseHash(q * 1.7) * 3) - 1) * 2;
    const R = Math.round((c + h) / 2) * 2 + (Math.floor(courseHash(q * 2.3 + 9) * 3) - 1) * 2;
    ctx.fillStyle = '#4a8a3a'; ctx.fillRect(L - 8, y, 4, 2); ctx.fillRect(R + 4, y, 4, 2);       // ombre de l'herbe
    ctx.fillStyle = '#9a7843'; ctx.fillRect(L - 4, y, 4, 2); ctx.fillRect(R, y, 4, 2);            // bord foncé
    ctx.fillStyle = '#c3a46b'; ctx.fillRect(L, y, 6, 2); ctx.fillRect(R - 6, y, 6, 2);            // bordure claire
    const ty = (((Math.floor(wy / 2) * 2) % 512) + 512) % 512;
    ctx.drawImage(A.road, L + 6, ty, R - L - 12, 2, L + 6, y, R - L - 12, 2);                      // terre
    if (Math.floor((wy + 4000) / 36) % 2 === 0) { ctx.fillStyle = '#ebd6a6'; ctx.fillRect(Math.round(c / 2) * 2 - 2, y, 4, 2); }   // pointillés du milieu
  }

  // 3. À plat sur la route : lignes de départ / d'arrivée, boue, plaques ⚡
  const checker = (wy) => {
    const y = sy(wy); if (y < -20 || y > H + 20) return;
    const c = coursePathX(wy), h = coursePathHW(wy);
    for (let i = -h + 2, k = 0; i < h - 2; i += 12, k++) for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (k + j) % 2 ? '#f4f1e8' : '#23262d'; ctx.fillRect(Math.round(c + i), y - 12 + j * 12 - 0, 12, 12);
    }
  };
  checker(0); checker(COURSE.LEN);
  for (const m of s.track.muds) { const y = sy(m.wy); if (y > -20 && y < H + 20) ctx.drawImage(A.mud, Math.round(m.x - 30), y - 12); }
  const blink = Math.floor(performance.now() / 160) % 2 === 0;
  for (const p of s.track.pads) {
    const y = sy(p.wy); if (y < -20 || y > H + 20) continue;
    const used = p.taken[P.id];
    ctx.globalAlpha = used ? 0.45 : 1;
    ctx.drawImage(used ? A.padOff : (blink ? A.padOn : A.padOff), Math.round(p.x - 28), y - 15);
    ctx.globalAlpha = 1;
  }

  // 4. Tout ce qui a de la hauteur (décor, rochers, coureurs, portiques), trié du plus loin au plus proche
  const items = [];
  for (const d of s.track.decor) { const y = sy(d.wy); if (y > -110 && y < H + 70) items.push({ wy: d.wy, kind: 'decor', o: d, y }); }
  for (const k of s.track.rocks) { const y = sy(k.wy); if (y > -40 && y < H + 40) items.push({ wy: k.wy, kind: 'rock', o: k, y }); }
  for (const g of s.track.signs) { const y = sy(g.wy); if (y > -60 && y < H + 40) items.push({ wy: g.wy, kind: 'sign', o: g, y }); }
  for (const r of s.racers) { const y = sy(r.wy); if (y > -70 && y < H + 70) items.push({ wy: r.wy + (r.state === 'fall' ? -20 : 0), kind: 'racer', o: r, y }); }
  items.push({ wy: 0, kind: 'gate', o: { label: 'DÉPART', wy: 0 }, y: sy(0) });
  items.push({ wy: COURSE.LEN, kind: 'gate', o: { label: 'ARRIVÉE', wy: COURSE.LEN }, y: sy(COURSE.LEN) });
  items.sort((a, b) => b.wy - a.wy);
  for (const it of items) {
    switch (it.kind) {
      case 'decor': courseDrawDecor(ctx, it.o, it.y); break;
      case 'rock': { const spr = rockSpr[it.o.v]; ctx.drawImage(spr, Math.round(it.o.x - spr.width / 2), it.y - spr.height + 12); break; }
      case 'sign': courseDrawSign(ctx, A, it.o, it.y, sy); break;
      case 'gate': courseDrawGate(ctx, it.o, it.y); break;
      default: courseDrawRacer(ctx, s, it.o, it.y);
    }
  }

  // 5. Particules (poussière, boue, éclats)
  for (const p of s.particles) {
    const y = sy(p.wy);
    ctx.globalAlpha = courseClamp(p.life * 2.2, 0, 1); ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x / 2) * 2, Math.round(y / 2) * 2, p.sz, p.sz);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  courseDrawHud(ctx, W, H, s);
}

function courseDrawDecor(ctx, d, y) {
  let spr, dy;
  if (d.kind === 'round') { spr = treeSpr[d.v % 3]; dy = 8; }
  else if (d.kind === 'pine') { spr = treeSpr[3 + (d.v % 2)]; dy = 8; }
  else if (d.kind === 'bush') { spr = bushSpr[d.v === 0 ? 1 : 0]; dy = 6; }
  else { spr = rockSpr[d.v % 2]; dy = 8; }
  ctx.drawImage(spr, Math.round(d.x - spr.width / 2), y - spr.height + dy);
}

function courseDrawSign(ctx, A, g, y, sy) {
  // un panneau de bois de chaque côté de la route
  const c = coursePathX(g.wy), h = coursePathHW(g.wy);
  for (const side of [-1, 1]) {
    const x = Math.round(c + side * (h + 36));
    ctx.drawImage(A.sign, x - 30, y - 42);
    ctx.font = "bold 13px 'Trebuchet MS', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3b230f'; ctx.fillText(g.label, x, y - 28);
  }
}

function courseDrawGate(ctx, g, y) {
  if (y < -80 || y > 560) return;
  const c = coursePathX(g.wy), h = coursePathHW(g.wy);
  const xl = Math.round(c - h - 14), xr = Math.round(c + h + 6);
  // poteaux en bois, contour sombre
  for (const x of [xl, xr]) {
    ctx.fillStyle = OUT; ctx.fillRect(x - 2, y - 78, 14, 84);
    ctx.fillStyle = '#7a4b26'; ctx.fillRect(x, y - 76, 10, 80);
    ctx.fillStyle = '#9c6434'; ctx.fillRect(x, y - 76, 3, 80);
  }
  // banderole à damier
  const bx = xl + 4, bw = xr - xl + 2;
  ctx.fillStyle = OUT; ctx.fillRect(bx - 2, y - 84, bw + 4, 30);
  ctx.fillStyle = '#f4f1e8'; ctx.fillRect(bx, y - 82, bw, 26);
  for (let i = 0; i < bw; i += 10) for (let j = 0; j < 2; j++) { if ((i / 10 + j) % 2 === 0) { ctx.fillStyle = '#23262d'; ctx.fillRect(bx + i, y - 82 + j * 6, 10, 6); } }
  ctx.fillStyle = '#ffd76b'; ctx.fillRect(bx, y - 70, bw, 14);
  ctx.font = "bold 12px 'Trebuchet MS', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3b230f'; ctx.fillText(g.label, Math.round(c), y - 63);
}

function courseDrawRacer(ctx, s, r, y) {
  const A = courseAssets(), x = Math.round(r.x);
  if (r.inv > 0 && r.state !== 'fall' && Math.floor(s.t * 14) % 2 === 0) ctx.globalAlpha = 0.45;
  const bike = courseBikeSprite(r.color);
  const entry = SPRITES[r.id];
  const hasSprite = entry && entry.img && entry.img.complete && entry.img.naturalWidth > 0;
  const drawRider = (cx, cy, rot, h) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    if (hasSprite) {
      const cell = mgSpriteCell(entry, SPRITE_ROW_INDEX.up, Math.floor(r.pedal) % entry.cols);
      const w = h * (cell.w / cell.h);
      ctx.drawImage(entry.img, cell.x, cell.y, cell.w, cell.h, -w / 2, -h * 0.55, w, h);
    } else {
      ctx.fillStyle = OUT; ctx.fillRect(-10, -20, 20, 30);
      ctx.fillStyle = r.color; ctx.fillRect(-8, -8, 16, 16); ctx.fillStyle = '#f0c39a'; ctx.fillRect(-6, -20, 12, 12);
    }
    ctx.restore();
  };
  if (r.state === 'fall') {
    const t = r.stateT / COURSE.FALL_T, tt = Math.min(1, t / 0.45), d = r.fallDir;
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(x + d * 20 * tt, y + 18, 24, 7, 0, 0, 6.3); ctx.fill();
    // vélo couché
    ctx.save(); ctx.translate(x - d * 6 * tt, y + 4); ctx.rotate(d * (0.25 + 1.15 * tt)); ctx.drawImage(bike, -bike.width / 2, -bike.height / 2); ctx.restore();
    // pilote qui valse puis reste au sol
    const arc = Math.sin(Math.PI * tt) * 34;
    drawRider(x + d * 44 * tt, y - 6 - arc + 10 * tt, d * (tt * Math.PI * 2.5 + (t > 0.45 ? Math.PI / 2 * 0.0 : 0)), 46);
    if (t > 0.35) {   // étoiles qui tournent
      for (let i = 0; i < 3; i++) {
        const a = s.t * 7 + i * 2.1, px = x + d * 44 + Math.cos(a) * 18, py = y - 34 + Math.sin(a) * 6;
        ctx.fillStyle = OUT; ctx.fillRect(Math.round(px) - 4, Math.round(py) - 1, 8, 4); ctx.fillRect(Math.round(px) - 1, Math.round(py) - 4, 4, 10);
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(Math.round(px) - 2, Math.round(py), 4, 2); ctx.fillRect(Math.round(px), Math.round(py) - 2, 2, 6);
      }
    }
  } else {
    const lean = courseClamp(r.vx / 255, -1, 1) * 0.16 + Math.sin(s.t * 38) * 0.06 * r.wobble;
    const bounce = Math.round(Math.sin(r.pedal * 3) * 1.5) + (r.state === 'slow' ? 0 : 0);
    ctx.fillStyle = 'rgba(0,0,0,0.24)'; ctx.beginPath(); ctx.ellipse(x, y + 20, 18, 6, 0, 0, 6.3); ctx.fill();
    if (r.boostT > 0) { ctx.fillStyle = 'rgba(255,190,60,0.28)'; ctx.beginPath(); ctx.arc(x, y - 4, 40, 0, 6.3); ctx.fill(); }
    ctx.save(); ctx.translate(x, y + bounce); ctx.rotate(lean);
    ctx.drawImage(bike, -bike.width / 2, -bike.height / 2 - 1);
    ctx.restore();
    drawRider(x, y - 4 + bounce, lean * 0.6, 48);
    if (r.draft) {   // traits de vitesse du sillage
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 3; i++) { const o = ((s.t * 140 + i * 37) % 60); ctx.fillRect(x - 16 + i * 16, y - 40 + o, 2, 10); }
    }
  }
  ctx.globalAlpha = 1;
  // Petit nom au-dessus des concurrents
  if (!r.isPlayer) {
    ctx.font = "bold 11px 'Trebuchet MS', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.strokeText(r.name, x, y - 48); ctx.fillStyle = '#fff'; ctx.fillText(r.name, x, y - 48);
  } else {
    // petite flèche dorée « c'est toi »
    ctx.fillStyle = OUT; ctx.fillRect(x - 8, y - 62, 16, 5); ctx.fillRect(x - 6, y - 58, 12, 5); ctx.fillRect(x - 4, y - 54, 8, 5); ctx.fillRect(x - 2, y - 50, 4, 3);
    ctx.fillStyle = '#ffd76b'; ctx.fillRect(x - 6, y - 61, 12, 3); ctx.fillRect(x - 4, y - 57, 8, 3); ctx.fillRect(x - 2, y - 53, 4, 3);
  }
}

function courseDrawHud(ctx, W, H, s) {
  const P = s.player, places = coursePlaces(s), myPlace = places.indexOf(P) + 1;
  const panel = (x, y, w, h) => {   // petit panneau pixel : contour sombre + fond
    ctx.fillStyle = OUT; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = 'rgba(30,40,52,0.88)'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x, y, w, 2);
  };
  const text = (str, x, y, size, col, align) => {
    ctx.font = `bold ${size}px 'Trebuchet MS', sans-serif`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 4; ctx.strokeStyle = OUT; ctx.strokeText(str, x, y); ctx.fillStyle = col; ctx.fillText(str, x, y);
  };
  // Place actuelle
  panel(14, 14, 112, 58);
  const shown = P.finished ? P.place : myPlace;
  text(courseOrdinal(shown), 26, 40, 34, shown === 1 ? '#ffd76b' : (shown <= COURSE.PODIUM ? '#cfe8d9' : '#ff8a65'), 'left');
  text('/ ' + s.racers.length, 82, 46, 16, '#9db3a8', 'left');
  if (!P.finished && s.started) text(shown <= COURSE.PODIUM ? 'sur le podium' : 'hors podium !', 70, 64, 10, shown <= COURSE.PODIUM ? '#9be07c' : '#ff8a65', 'center');
  // Barre de progression avec tous les coureurs
  const bw = 400, bx = Math.round((W - bw) / 2), by = 24;
  panel(bx - 10, by - 8, bw + 20, 26);
  ctx.fillStyle = '#5c4630'; ctx.fillRect(bx, by, bw, 10);
  ctx.fillStyle = '#7a5f3d'; ctx.fillRect(bx, by, bw, 3);
  for (let i = 1; i < 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx + bw * i / 4 - 1, by, 2, 10); }
  ctx.fillStyle = '#f4f1e8'; ctx.fillRect(bx + bw - 6, by - 4, 6, 18); ctx.fillStyle = '#23262d'; ctx.fillRect(bx + bw - 6, by - 4, 3, 9); ctx.fillRect(bx + bw - 3, by + 5, 3, 9);
  const dots = [...s.racers].sort((a, b) => (a.isPlayer ? 1 : 0) - (b.isPlayer ? 1 : 0));
  for (const r of dots) {
    const px = bx + bw * courseClamp(r.wy / COURSE.LEN, 0, 1), rad = r.isPlayer ? 7 : 5;
    ctx.fillStyle = OUT; ctx.fillRect(Math.round(px) - rad - 2, by + 5 - rad - 2, rad * 2 + 4, rad * 2 + 4);
    ctx.fillStyle = r.isPlayer ? '#ffd76b' : r.color; ctx.fillRect(Math.round(px) - rad, by + 5 - rad, rad * 2, rad * 2);
  }
  // État de Coco : boost / sillage / herbe / boue / chute
  let status = '', scol = '#ffd76b';
  if (P.state === 'fall') { status = '💥 TOMBÉ !'; scol = '#ff8a65'; }
  else if (P.state === 'slow') { status = '🐢 Il repart... au ralenti'; scol = '#ffcf7a'; }
  else if (P.boostT > 0) status = '⚡ BOOST !';
  else if (P.draft) { status = '💨 Sillage +10 %'; scol = '#cfe8d9'; }
  else if (P.mudT > 0) { status = '🟤 Dans la boue...'; scol = '#d9b48a'; }
  else if (!P.onRoad) { status = '🌱 Dans l\'herbe — ralenti !'; scol = '#ff8a65'; }
  if (status && s.started) text(status, W - 18, 40, 17, scol, 'right');
  // Distance restante + vitesse
  panel(14, H - 44, 168, 30);
  text('🏁 encore ' + Math.max(0, Math.ceil((COURSE.LEN - P.wy) / 10)) + ' m', 26, H - 29, 14, '#cfe8d9', 'left');
  panel(W - 120, H - 44, 106, 30);
  text(Math.round(P.speed * 0.135) + ' km/h', W - 106, H - 29, 14, '#cfe8d9', 'left');
  // Décompte / GO
  if (!s.started) {
    const n = 3 - Math.floor(s.t);
    // le chiffre est placé entre la barre de progression et le portique de départ, pour ne rien cacher
    text(String(Math.max(1, n)), W / 2, 104, 64, n === 1 ? '#ffd76b' : '#ffffff', 'center');
    text('Colle-toi derrière les autres : leur sillage te fait gagner du temps !', W / 2, H - 62, 13, '#cfe8d9', 'center');
  } else if (s.raceT < 0.9) text('GO !', W / 2, 104, 64, '#7be38b', 'center');
  // Arrivée
  if (s.endAt) {
    const place = P.finished ? P.place : 0;
    const msg = place ? (place <= COURSE.PODIUM ? (place === 1 ? '🏆 1er !!' : '🏁 ' + courseOrdinal(place) + ' !') : '🏁 ' + courseOrdinal(place)) : '⛔ Hors podium';
    text(msg, W / 2, H / 2 - 50, 64, place && place <= COURSE.PODIUM ? '#ffd76b' : '#ff8a65', 'center');
  }
}
