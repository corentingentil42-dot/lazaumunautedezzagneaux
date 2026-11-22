/* ============================================================
   js/rendu/personnages.js — Dessin des persos (sprite PNG) et petits utilitaires de sprites en pixels.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ===== DESSIN DE PERSONNAGE (sprite PNG grille 4×5) ===== */
function drawCharacterSprite(c, perso, animFrame, moving, dir) {
  const entry = SPRITES[perso.id];

  // Ombre au sol (toujours)
  const shx = Math.round(c.x + c.w/2), shy = Math.round(c.y + c.h);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(shx - 10, shy - 1, 20, 4); ctx.fillRect(shx - 7, shy - 3, 14, 2); ctx.fillRect(shx - 7, shy + 3, 14, 2);

  if (entry && entry.img.complete && entry.img.naturalWidth > 0) {
    const img = entry.img;
    const row = SPRITE_ROW_INDEX[dir] ?? 0;
    // Colonne : cycle sur les frames, colonne 0 quand immobile
    const col = moving ? (animFrame % entry.cols) : 0;
    // Case calibrée individuellement : plus de cheveux du sprite d'en dessous
    const cell = mgSpriteCell(entry, row, col);

    // Taille d'affichage : hauteur ~64px
    const displayH = 64;
    const displayW = Math.round(displayH * (cell.w / cell.h));
    const dx = Math.round(c.x + c.w/2 - displayW/2);
    const dy = Math.round(c.y + c.h - displayH + 8);
    // réduction douce (les sprites sont grands) puis pixels nets : plus de scintillement en marchant
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h, dx, dy, displayW, displayH);
    ctx.imageSmoothingEnabled = false;
  } else {
    // Fallback : petit rectangle coloré
    const bx = c.x, by = c.y;
    ctx.fillStyle = perso.couleur;
    ctx.fillRect(bx+3, by+10, 18, 12);
    ctx.fillStyle = '#f0c39a';
    ctx.fillRect(bx+3, by, 18, 12);
    ctx.fillStyle = '#a06b34';
    ctx.fillRect(bx+2, by-3, 20, 6);
    if (dir !== 'up') {
      ctx.fillStyle = '#1a1a1a';
      if (dir === 'left') ctx.fillRect(bx+6, by+5, 2, 2);
      else if (dir === 'right') ctx.fillRect(bx+16, by+5, 2, 2);
      else { ctx.fillRect(bx+7, by+5, 2, 2); ctx.fillRect(bx+15, by+5, 2, 2); }
    }
  }
}

function drawPlayer() {
  const perso = PERSONNAGES.find(p => p.id === state.persoActif) || PERSONNAGES[0];
  drawCharacterSprite(player, perso, player.animFrame, player.moving, player.dir);
}

/* ---- v20.23 : petit helper pixel-art (une grille de lettres -> un sprite mis à l'échelle sans flou) ---- */
function pxSprite(rows, pal, scale) {
  const h = rows.length, w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w * scale; c.height = h * scale;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x * scale, y * scale, scale, scale); }
  }
  return c;
}
// La pancarte qui remplace le pote devant sa maison une fois recruté.
// Poussière sous les pieds quand on marche dans le hub.
const hubFx = [];
function hubDust(x, y) {
  for (let i = 0; i < 2; i++) hubFx.push({ x: x + (Math.random() - 0.5) * 8, y: y - 2, vx: (Math.random() - 0.5) * 0.6, vy: -0.25 - Math.random() * 0.3, life: 0, max: 26 + Math.random() * 10, r: 1.5 + Math.random() * 1.5 });
  if (hubFx.length > 60) hubFx.splice(0, hubFx.length - 60);
}
function updateHubFx() {
  for (let i = hubFx.length - 1; i >= 0; i--) {
    const p = hubFx[i];
    p.life += frameK; p.x += p.vx * frameK; p.y += p.vy * frameK;
    if (p.life >= p.max) hubFx.splice(i, 1);
  }
}

function drawWanderer(w) {
  drawCharacterSprite(w, w.perso, w.animFrame, w.moving, w.dir);
}
