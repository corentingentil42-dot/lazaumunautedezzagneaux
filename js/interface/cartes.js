/* ============================================================
   js/interface/cartes.js — Grande carte (M) et mini-carte en coin.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

function toggleBigMap() {
  const bm = document.getElementById('bigMap');
  if (bm.classList.contains('active')) {
    bm.classList.remove('active');
    if (gameState === 'bigMap') gameState = 'playing';
  } else {
    bm.classList.add('active');
    gameState = 'bigMap';
    drawBigMap();
  }
}

function drawBigMap() {
  const c = document.getElementById('bigMapCanvas');
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#2a3b2a';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let x = 0; x < c.width; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); }
  for (let y = 0; y < c.height; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
  const scale = Math.min(c.width / WORLD_W, c.height / WORLD_H) * 0.9;
  const offsetX = (c.width - WORLD_W * scale) / 2;
  const offsetY = (c.height - WORLD_H * scale) / 2;
  const w2m = (wx, wy) => ({ x: offsetX + wx * scale, y: offsetY + wy * scale });
  g.strokeStyle = '#d3b57f'; g.lineWidth = 8;
  const hubPos = w2m(HUB_X, HUB_Y);
  for (const z of zones) {
    if (z.isHome) continue;
    const zp = w2m(z.x + z.w/2, z.y + z.h/2);
    g.beginPath(); g.moveTo(hubPos.x, hubPos.y); g.lineTo(zp.x, zp.y); g.stroke();
  }
  g.fillStyle = '#c9a86a';
  g.beginPath(); g.arc(hubPos.x, hubPos.y, 20, 0, Math.PI*2); g.fill();
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#fff'; g.font = 'bold 12px sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('HUB', hubPos.x, hubPos.y);
  for (const z of zones) {
    const zp = w2m(z.x + z.w/2, z.y + z.h/2);
    const done = state.persosDebloques.includes(z.id);
    g.fillStyle = done ? '#ffd76b' : '#5a6b7a';
    g.beginPath(); g.arc(zp.x, zp.y, 14, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#1a120c'; g.lineWidth = 2; g.stroke();
    g.font = '14px sans-serif';
    g.fillText(z.emoji, zp.x, zp.y + 1);
    g.font = 'bold 10px sans-serif';
    g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 2;
    g.strokeText(z.surnom, zp.x, zp.y + 26);
    g.fillText(z.surnom, zp.x, zp.y + 26);
    if (done) {
      g.fillStyle = '#4caf50';
      g.beginPath(); g.arc(zp.x + 12, zp.y - 12, 7, 0, Math.PI*2); g.fill();
      g.fillStyle = '#fff'; g.font = 'bold 10px sans-serif';
      g.fillText('✓', zp.x + 12, zp.y - 11);
    }
  }
  const pp = w2m(player.x + player.w/2, player.y + player.h/2);
  g.fillStyle = '#7bc8ff';
  g.beginPath(); g.arc(pp.x, pp.y, 8, 0, Math.PI*2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#1b2735'; g.font = 'bold 8px sans-serif';
  g.fillText('M', pp.x, pp.y + 1);
}

function drawMiniMap() {
  const c = elMiniMap, g = miniMapCtx;
  if (!c || !g) return;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#2a3b2a';
  g.fillRect(0, 0, c.width, c.height);
  const scale = Math.min(c.width / WORLD_W, c.height / WORLD_H) * 0.92;
  const offsetX = (c.width - WORLD_W * scale) / 2;
  const offsetY = (c.height - WORLD_H * scale) / 2;
  const w2m = (wx, wy) => ({ x: offsetX + wx * scale, y: offsetY + wy * scale });
  g.strokeStyle = '#d3b57f'; g.lineWidth = 2;
  const hubPos = w2m(HUB_X, HUB_Y);
  for (const z of zones) {
    if (z.isHome) continue;
    const zp = w2m(z.x + z.w/2, z.y + z.h/2);
    g.beginPath(); g.moveTo(hubPos.x, hubPos.y); g.lineTo(zp.x, zp.y); g.stroke();
  }
  g.fillStyle = '#c9a86a';
  g.beginPath(); g.arc(hubPos.x, hubPos.y, 5, 0, Math.PI*2); g.fill();
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 1; g.stroke();
  for (const z of zones) {
    const zp = w2m(z.x + z.w/2, z.y + z.h/2);
    const done = state.persosDebloques.includes(z.id);
    g.fillStyle = done ? '#ffd76b' : '#5a6b7a';
    g.beginPath(); g.arc(zp.x, zp.y, 3.5, 0, Math.PI*2); g.fill();
    g.strokeStyle = '#1a120c'; g.lineWidth = 1; g.stroke();
  }
  // v20.23 : les potes qui se baladent dans le hub apparaissent aussi sur la minicarte
  for (const w of wanderingNpcs) {
    const wp = w2m(w.x + w.w/2, w.y + w.h/2);
    g.fillStyle = w.perso.couleur || '#fff';
    g.fillRect(wp.x - 1.5, wp.y - 1.5, 3, 3);
  }
  const pp = w2m(player.x + player.w/2, player.y + player.h/2);
  g.fillStyle = '#7bc8ff';
  g.beginPath(); g.arc(pp.x, pp.y, 3, 0, Math.PI*2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke();
}

let nearbyTarget = null;
// Dernier libellé de zone affiché dans le HUD (pour ne retoucher au DOM que
// quand il change vraiment, au lieu d'à chaque frame)
let lastZoneLabel = '';
