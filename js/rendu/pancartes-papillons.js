/* ============================================================
   js/rendu/pancartes-papillons.js — Pancartes (rejouer un mini-jeu), poussière, bulle « ! », papillons.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   PANCARTE, POUSSIÈRE, BULLE « ! », PAPILLONS
   ===================================================================== */
let signSpriteCache2 = null;
function signSprite2() {
  if (signSpriteCache2) return signSpriteCache2;
  return (signSpriteCache2 = pxSprite([
    '.KKKKKKKKKKKKKK.',
    'KhhhhhhhhhhhhhhK',
    'KhbbbbbbbbbbbbdK',
    'KhbbbbbbbbbbbbdK',
    'KhbbbbbbbbbbbbdK',
    'KhbbbbbbbbbbbbdK',
    'KhbbbbbbbbbbbbdK',
    'KddddddddddddddK',
    '.KKKKKKKKKKKKKK.',
    '......KlpK......',
    '......KlpK......',
    '......KlpK......',
    '......KlpK......',
    '......KlpK......',
    '......KlpK......',
    '.....KKKKKK.....'
  ], { K: OUT, h: '#f3c985', b: '#d39b55', d: '#a8723a', p: '#7a4f28', l: '#b8884c' }, 3));
}
function drawSign(zone) {
  const spr = signSprite2();
  const cx = Math.round(zone.pnjHome.x + 12), x = cx - spr.width / 2, y = Math.round(zone.pnjHome.y + 36 - spr.height);
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.fillRect(cx - 16, y + spr.height - 6, 32, 4); ctx.fillRect(cx - 12, y + spr.height - 2, 24, 2);
  ctx.drawImage(spr, x, y);
  const em = pixEmoji(zone.emoji, 9, 2);
  ctx.drawImage(em, Math.round(cx - em.width / 2), Math.round(y + 14 - em.height / 2));
  const rec = state.records[zone.id];
  if (rec && rec.stars) {
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.fillStyle = '#ffd76b';
    const t = '★'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars);
    ctx.strokeText(t, cx, y - 6); ctx.fillText(t, cx, y - 6);
  }
  if (nearbyTarget && nearbyTarget.type === 'zone' && nearbyTarget.ref === zone) {
    const tw = (Math.sin(Date.now() / 160) + 1) / 2;
    ctx.fillStyle = `rgba(255,240,170,${0.35 + tw * 0.5})`;
    ctx.fillRect(x - 4, y + 2, 2, 2); ctx.fillRect(x + spr.width + 2, y + 6, 2, 2); ctx.fillRect(cx - 1, y - 2, 2, 2);
  }
}
function drawHubFx() {
  for (const p of hubFx) {
    const k = p.life / p.max, s = Math.max(2, Math.round(p.r * (1 + k) * 1.5 / 2) * 2);
    ctx.fillStyle = `rgba(232,222,190,${0.6 * (1 - k)})`;
    ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
  }
}
function drawNpcAtZone(zone) {
  if (zone.id === 'coco') { if (state.persosDebloques.includes('coco')) drawSign(zone); return; }
  if (state.persosDebloques.includes(zone.id)) { drawSign(zone); return; }
  const c = { x: zone.pnjHome.x, y: zone.pnjHome.y, w: 24, h: 30 };
  c.y += Math.sin(Date.now() / 600 + zone.id.length) * 0.3;
  const perso = PERSONNAGES.find(p => p.id === zone.id);
  drawCharacterSprite(c, perso, 0, false, 'down');
  // bulle « ! » en pixels
  const bob = Math.round(Math.sin(Date.now() / 400) * 2), bx = Math.round(c.x + c.w / 2 + 12), by = Math.round(c.y - 22 + bob);
  ctx.fillStyle = OUT; ctx.fillRect(bx - 1, by - 1, 16, 18); ctx.fillRect(bx + 3, by + 16, 4, 3);
  ctx.fillStyle = '#ffd76b'; ctx.fillRect(bx, by, 14, 16); ctx.fillRect(bx + 4, by + 16, 2, 2);
  ctx.fillStyle = '#fff0a8'; ctx.fillRect(bx + 1, by + 1, 12, 2);
  ctx.fillStyle = OUT; ctx.fillRect(bx + 6, by + 3, 3, 7); ctx.fillRect(bx + 6, by + 12, 3, 2);
}
const BFLY = [];
for (let i = 0; i < 14; i++) BFLY.push({ bx: HUB_X + (hash2(i, 1, 41) - 0.5) * 2200, by: HUB_Y + (hash2(i, 2, 41) - 0.5) * 1700, sp: 0.25 + hash2(i, 3, 41) * 0.3, col: ['#ffd76b', '#ff8fb1', '#8fd3ff', '#ffffff'][i % 4], s: i });
function drawButterflies() {
  const t = Date.now() / 1000;
  for (const b of BFLY) {
    const x = b.bx + Math.sin(t * b.sp + b.s) * 150 + Math.sin(t * b.sp * 2.3) * 40, y = b.by + Math.cos(t * b.sp * 0.8 + b.s * 1.7) * 100 - Math.abs(Math.sin(t * 6 + b.s)) * 4;
    if (!inView(x, y, 20)) continue;
    const w = Math.floor(t * 9 + b.s) % 2 ? 6 : 4;
    ctx.fillStyle = OUT; ctx.fillRect(Math.round(x - w - 1), Math.round(y - 3), w * 2 + 2, 6);
    ctx.fillStyle = b.col; ctx.fillRect(Math.round(x - w), Math.round(y - 2), w - 1, 4); ctx.fillRect(Math.round(x + 1), Math.round(y - 2), w - 1, 4);
    ctx.fillStyle = OUT; ctx.fillRect(Math.round(x - 1), Math.round(y - 2), 2, 4);
  }
}
