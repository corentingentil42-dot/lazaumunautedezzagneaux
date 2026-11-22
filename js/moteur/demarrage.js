/* ============================================================
   js/moteur/demarrage.js — Démarrage : version du jeu, diagnostic des images (touche D), init() et écran-titre vivant. Chargé EN DERNIER.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ INITIALISATION ============ */
const GAME_VERSION = 'v20.26';
// Diagnostic (touche D) : teste en direct les fichiers de Coco pour voir
// ce qui se charge et ce qui manque, et affiche d'où le jeu est ouvert.
function runDiagnostics() {
  const box = document.getElementById('debugOverlay');
  const tests = [
    'assets/tuto-coco/hello.png',
    'assets/tuto-coco/explain.png',
    'assets/tuto-coco/determined.png',
    'assets/tuto-coco/happy.png',
    'assets/portraits/coco.png',
    'assets/portraits/coco.jpg',
    'assets/portraits/coco.jpeg',
    'assets/sprites/coco.png'
  ];
  const etats = new Array(tests.length).fill('pending');
  const render = () => {
    box.innerHTML = `
      <h3>🔍 Diagnostic des images — ${GAME_VERSION}</h3>
      <p><b>Tu joues la version ${GAME_VERSION}.</b> Si tu ne vois PAS ce numéro quand tu appuies sur D, tu joues un vieux fichier du jeu.</p>
      <p><b>Fichier ouvert depuis :</b> <span class="chemin">${location.href}</span></p>
      <p>Le dossier « assets » doit être <b>dans le même dossier que ce fichier-ci</b> (pas à côté du dossier, DANS le même dossier).</p>
      <p style="margin-top:12px;"><b>Sprites de persos :</b> ${spritesLoaded}/${spritesTotal} chargés.</p>
      <p style="margin-top:12px;"><b>Fichiers de Coco :</b></p>
      ${tests.map((t, i) => `<div>${etats[i] === 'ok' ? '<span class="ok">✅ trouvé</span>' : etats[i] === 'ko' ? '<span class="ko">❌ introuvable</span>' : '⏳ test en cours…'} <span class="chemin">${t}</span></div>`).join('')}
      <button onclick="document.getElementById('debugOverlay').style.display='none'">Fermer</button>
    `;
  };
  render();
  box.style.display = 'block';
  tests.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { etats[i] = 'ok'; render(); };
    img.onerror = () => { etats[i] = 'ko'; render(); };
    img.src = src;
  });
}
// Diagnostic assets : si AUCUNE image de Coco ne se charge (ni expressions
// du tuto, ni portrait), le dossier assets est absent ou mal placé — on le
// dit clairement au joueur au lieu de rester silencieux en mode dégradé.
function checkAssetsPresence() {
  const tests = [
    'assets/tuto-coco/hello.png',
    'assets/portraits/coco.png',
    'assets/portraits/coco.jpg',
    'assets/portraits/coco.jpeg'
  ];
  let restant = tests.length, reussis = 0;
  const fini = () => {
    if (restant === 0 && reussis === 0) {
      const w = document.getElementById('assetsWarning');
      if (w) w.style.display = 'block';
    }
  };
  tests.forEach(src => {
    const img = new Image();
    img.onload = () => { reussis++; restant--; fini(); };
    img.onerror = () => { restant--; fini(); };
    img.src = src;
  });
}
(async function init() {
  loadGame();
  checkAssetsPresence();
  document.getElementById('assetsWarningOk').addEventListener('click', () => { document.getElementById('assetsWarning').style.display = 'none'; });
  preloadTutoImages();
  document.getElementById('titleVersion').textContent =
    GAME_VERSION + ' · Appuie sur D (ou F2) pour le diagnostic des images';
  const result = await loadAllSprites();
  console.log(`✅ ${result.loaded} sprites chargés, ${result.failed} manquants.`);
  // Cache l'écran de chargement et montre l'écran-titre
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('titleScreen').style.display = 'flex';
  document.body.classList.add('onTitle');
  gameState = 'title';
  const hs = hasSave();
  document.getElementById('btnTitleStart').textContent = hs ? '▶ Continuer' : '▶ Commencer';
  document.getElementById('btnTitleNew').style.display = hs ? 'inline-block' : 'none';
  document.getElementById('titlePrompt').textContent = hs ? 'Entrée : continuer · N : nouvelle partie' : 'Appuie sur Entrée pour commencer';
  document.getElementById('btnTitleStart').addEventListener('click', () => startGame(false));
  document.getElementById('btnTitleNew').addEventListener('click', newGameFromTitle);
  // Écran-titre vivant : la caméra dérive tout doucement autour de la place, tant qu'on n'a pas lancé la partie.
  const titleLoop = (ts) => {
    if (gameState !== 'title') return;
    const t = (ts || 0) / 1000;
    camera.x = HUB_X - VIEW_W / 2 + Math.sin(t * 0.25) * 90;
    camera.y = HUB_Y - VIEW_H / 2 + 40 + Math.cos(t * 0.19) * 50;
    draw();
    requestAnimationFrame(titleLoop);
  };
  requestAnimationFrame(titleLoop);
})();
