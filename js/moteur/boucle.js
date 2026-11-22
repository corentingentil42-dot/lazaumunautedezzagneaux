/* ============================================================
   js/moteur/boucle.js — Boucle principale du jeu (requestAnimationFrame).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

let loopStarted = false;
let lastFrameTs = 0;
let loopTick = 0;
function loop(ts) {
  // Temps écoulé depuis l'image précédente, ramené à « 1 = 1/60 s ». Borné : après un changement
  // d'onglet (ts qui saute de plusieurs secondes) le jeu ne doit pas téléporter le joueur.
  const now = ts || performance.now();
  frameK = lastFrameTs ? Math.max(0.25, Math.min(3, (now - lastFrameTs) / (1000 / 60))) : 1;
  lastFrameTs = now;
  update();
  updateTouchUI();
  if ((++loopTick) % 20 === 0) updateTodo();
  // Pendant un mini-jeu ou l'écran de fin, un calque opaque recouvre tout : inutile de dessiner
  // le monde (3 600 × 2 700 px de décor) ni la minicarte derrière.
  if (gameState !== 'miniGame' && gameState !== 'endScreen') {
    draw();
    drawMiniMap();
  }
  requestAnimationFrame(loop);
}
