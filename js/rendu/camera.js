/* ============================================================
   js/rendu/camera.js — Conversion monde → écran, test « est-ce visible ? ».
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

function worldToScreen(wx, wy) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / SEE_W;
  const scaleY = rect.height / SEE_H;
  return { x: rect.left + (wx - camera.x) * scaleX, y: rect.top + (wy - camera.y) * scaleY };
}

// Vrai si le point (x, y) du monde est visible à l'écran (avec une marge m pour les grands objets).
// Sert à ne pas dessiner les ~1 900 touffes/ellipses/arbres qui sont hors champ : le monde fait
// 3 600 × 2 700 px mais l'écran n'en montre que 640 × 480 (environ 3 % du monde).
function inView(x, y, m) {
  return x > camera.x - m && x < camera.x + SEE_W + m &&
         y > camera.y - m && y < camera.y + SEE_H + m;
}
