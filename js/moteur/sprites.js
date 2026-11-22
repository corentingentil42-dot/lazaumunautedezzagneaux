/* ============================================================
   js/moteur/sprites.js — Chargement des sprites PNG des persos (grille 4×5) et calibrage.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   GESTION DES SPRITES
   - Chemin : assets/sprites/{id}.png
   - Format : grille 4 lignes × 5 colonnes
   - Ligne 0 = Face (bas), 1 = Gauche, 2 = Droite, 3 = Dos (haut)
   ===================================================================== */
const SPRITE_PATH = 'assets/sprites/';
const SPRITE_COLS = 5;
const SPRITE_ROWS = 4;
const SPRITES = {}; // id -> { img, cols, cellW, cellH }
let spritesLoaded = 0;
let spritesTotal = 0;

const SPRITE_ROW_INDEX = { down: 0, left: 1, right: 2, up: 3 };

// Certains sprites générés par IA arrivent mal cadrés : personnages compressés,
// décalés, ou à cheval sur deux lignes de la grille — on voyait les cheveux
// de la ligne du dessous au bas de chaque case. La calibration se fait donc
// CASE PAR CASE : pour chacune des 20 cases, on isole le bloc continu du
// personnage qu'elle contient et on en déduit son rectangle exact. Même les
// grilles enchevêtrées sont corrigées ; pour un sprite bien cadré, ça ne
// change rien.
function mgCalibrateSpriteGrid(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  let data = null;
  try {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c2 = cv.getContext('2d', { willReadFrequently: true });
    c2.drawImage(img, 0, 0);
    data = c2.getImageData(0, 0, w, h).data;
  } catch (e) { return null; } // canvas illisible : grille théorique
  // Carte des pixels opaques (une seule lecture pour tous les calculs)
  const op = new Uint8Array(w * h);
  let gx0 = w, gy0 = h, gx1 = -1, gy1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        op[y * w + x] = 1;
        if (x < gx0) gx0 = x;
        if (x > gx1) gx1 = x;
        if (y < gy0) gy0 = y;
        if (y > gy1) gy1 = y;
      }
    }
  }
  if (gx1 < gx0 || gy1 < gy0) return null; // image vide ou illisible
  const gw = gx1 - gx0 + 1, gh = gy1 - gy0 + 1;
  const cellW = gw / SPRITE_COLS, cellH = gh / SPRITE_ROWS;

  const cells = [];
  for (let r = 0; r < SPRITE_ROWS; r++) {
    cells[r] = [];
    for (let c = 0; c < SPRITE_COLS; c++) {
      // Colonne stricte de la case, mais bande verticale ÉLARGIE : le
      // personnage peut déborder au-dessus ou en dessous de sa ligne.
      const x0 = Math.round(gx0 + c * cellW);
      const x1 = Math.round(gx0 + (c + 1) * cellW) - 1;
      const yLo = Math.max(0, Math.round(gy0 + r * cellH - cellH * 0.6));
      const yHi = Math.min(h - 1, Math.round(gy0 + (r + 1) * cellH + cellH * 0.6) - 1);
      // Profil vertical de la colonne : bandes continues de contenu
      const runs = [];
      let runStart = -1;
      for (let y = yLo; y <= yHi + 1; y++) {
        let count = 0;
        if (y <= yHi) for (let x = x0; x <= x1; x++) if (op[y * w + x]) count++;
        if (count > 0 && runStart === -1) runStart = y;
        if (count === 0 && runStart !== -1) { runs.push([runStart, y - 1]); runStart = -1; }
      }
      // Le personnage = la bande continue la plus proche du centre de la
      // case : les cheveux du sprite d'en dessous, plus bas, sont écartés.
      const bandMid = (yLo + yHi) / 2;
      let best = null, bestScore = Infinity;
      for (const [a, b] of runs) {
        const score = Math.abs((a + b) / 2 - bandMid) - (b - a) * 0.02;
        if (score < bestScore) { bestScore = score; best = [a, b]; }
      }
      let sy, sh;
      if (best && (best[1] - best[0]) >= cellH * 0.3) {
        sy = best[0]; sh = best[1] - best[0] + 1;
      } else {
        // Case vide ou illisible : grille calibrée globale
        sy = Math.round(gy0 + r * cellH);
        sh = Math.max(1, Math.round(cellH));
      }
      // Cadrage horizontal du personnage dans sa colonne
      let cx0 = x1, cx1 = x0;
      for (let x = x0; x <= x1; x++) {
        for (let y = sy; y < sy + sh && y < h; y++) {
          if (op[y * w + x]) { if (x < cx0) cx0 = x; if (x > cx1) cx1 = x; break; }
        }
      }
      cells[r][c] = (cx1 >= cx0)
        ? { x: cx0, y: sy, w: cx1 - cx0 + 1, h: sh }
        : { x: x0, y: sy, w: x1 - x0 + 1, h: sh };
    }
  }
  return { ox: gx0, oy: gy0, cellW, cellH, cells };
}

// Rectangle source de la case (row, col) d'un sprite : case calibrée si
// possible, grille calibrée globale en repli, grille théorique en dernier
// recours.
function mgSpriteCell(entry, row, col) {
  const c = entry.cells && entry.cells[row] && entry.cells[row][col];
  if (c) return c;
  const cw = entry.cellW || entry.img.naturalWidth / SPRITE_COLS;
  const ch = entry.cellH || entry.img.naturalHeight / SPRITE_ROWS;
  return { x: (entry.ox || 0) + col * cw, y: (entry.oy || 0) + row * ch, w: cw, h: ch };
}

function loadAllSprites() {
  return new Promise((resolve) => {
    const total = PERSONNAGES.length;
    spritesTotal = total;
    let loaded = 0;
    let failed = 0;
    const loadingFill = document.getElementById('loadingFill');
    const loadingText = document.getElementById('loadingText');

    // Filet de sécurité : si un sprite ne répond jamais (ni chargé ni en erreur),
    // on ne reste pas bloqué sur l'écran de chargement : on démarre après 15 s.
    setTimeout(() => resolve({ loaded, failed }), 15000);

    PERSONNAGES.forEach(perso => {
      const img = new Image();
      img.src = `${SPRITE_PATH}${perso.id}.png`;
      img.onload = () => {
        // Calibration case par case : corrige automatiquement les sprites
        // mal cadrés (berline, camille, futurs sprites IA) et ne change
        // rien pour ceux qui sont déjà parfaits.
        const cal = mgCalibrateSpriteGrid(img);
        SPRITES[perso.id] = {
          img, cols: SPRITE_COLS, cells: cal ? cal.cells : null,
          cellW: cal ? cal.cellW : img.naturalWidth / SPRITE_COLS,
          cellH: cal ? cal.cellH : img.naturalHeight / SPRITE_ROWS,
          ox: cal ? cal.ox : 0, oy: cal ? cal.oy : 0
        };
        loaded++;
        spritesLoaded = loaded;
        if (loadingFill) loadingFill.style.width = ((loaded + failed) / total * 100) + '%';
        if (loadingText) loadingText.textContent = `${loaded + failed} / ${total} (${loaded} OK, ${failed} erreurs)`;
        if (loaded + failed === total) resolve({ loaded, failed });
      };
      img.onerror = () => {
        console.warn(`⚠️ Sprite manquant : ${perso.id}.png (fallback activé)`);
        failed++;
        if (loadingFill) loadingFill.style.width = ((loaded + failed) / total * 100) + '%';
        if (loadingText) loadingText.textContent = `${loaded + failed} / ${total} (${loaded} OK, ${failed} erreurs)`;
        if (loaded + failed === total) resolve({ loaded, failed });
      };
    });
  });
}
