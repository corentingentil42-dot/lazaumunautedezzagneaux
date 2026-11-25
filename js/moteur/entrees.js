/* ============================================================
   js/moteur/entrees.js — Clavier (flèches, E, R, M, J, N…) et clics sur les boutons de l'interface.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

window.addEventListener('keydown', (e) => {
  if (!e.key) return; // certains événements (autofill du navigateur) n'ont pas de touche
  const k = e.key.toLowerCase();
  const isR = k === 'r' || e.code === 'KeyR';
  keys[k] = true;
  // Ignore les répétitions auto du clavier (touche maintenue) : sans ça, une
  // pression un peu longue sur R déclenchait un 2e "keydown" qui rouvrait
  // puis refermait aussitôt le menu équipe (ou le rouvrait sans arrêt).
  if (e.repeat) return;
  // Diagnostic des images : F2 partout, ou D UNIQUEMENT sur l'écran-titre.
  // (Avant, D l'ouvrait aussi en jeu... alors que D sert à aller à droite !)
  const dbgEl = document.getElementById('debugOverlay');
  if (k === 'escape' && dbgEl.style.display === 'block') { dbgEl.style.display = 'none'; return; }
  if ((k === 'f2' || (k === 'd' && gameState === 'title')) && gameState !== 'miniGame' && gameState !== 'endScreen') {
    e.preventDefault();
    const dbg = document.getElementById('debugOverlay');
    if (dbg.style.display === 'block') { dbg.style.display = 'none'; }
    else runDiagnostics();
    return;
  }
  if (gameState === 'title') {
    if (e.key === 'Enter') { startGame(false); return; }
    if (k === 'n' && hasSave()) { newGameFromTitle(); return; }
  }
  // v20.23 : R = rejouer quand un mini-jeu vient d'être perdu
  if (gameState === 'miniGame' && isR && mgRetryVisible()) { e.preventDefault(); document.getElementById('mgRetryBtn').click(); return; }
  if (gameState === 'endScreen' && (e.key === 'Enter' || k === 'escape')) { closeEndScreen(); return; }
  if (gameState === 'dialogue' && (e.key === 'Enter' || e.key === ' ')) { advanceDialogue(); return; }
  if (gameState === 'dialogue' && k === 'escape') { skipDialogue(); return; }
  if (gameState === 'playing') {
    if (k === 'e') { tryInteract(); return; }
    if (k === 'n') { Snd.toggleMute(); return; }
    if (k === 't') { toggleTodo(); return; }
    if (isR) { e.preventDefault(); openTeamMenu(); return; }
    if (k === 'm') { e.preventDefault(); toggleBigMap(); return; }
    if (k === 'j') { e.preventDefault(); toggleCaseJournal(); return; }
  }
  if (gameState === 'teamMenu' && (isR || k === 'escape')) { closeTeamMenu(); return; }
  if (gameState === 'zoneOverlay' && k === 'escape') { closeZoneOverlay(); return; }
  if (gameState === 'bigMap' && (k === 'm' || k === 'escape')) { toggleBigMap(); return; }
  if (gameState === 'caseJournal' && (k === 'j' || k === 'escape')) { toggleCaseJournal(); return; }
});
window.addEventListener('keyup', (e) => { if (e.key) keys[e.key.toLowerCase()] = false; });
// Si la fenêtre perd le focus (Alt+Tab, clic ailleurs) pendant qu'une touche est enfoncée,
// le keyup n'arrive jamais : le perso continuait à marcher tout seul. On relâche tout.
window.addEventListener('blur', () => {
  keys = {};
  if (mgState && mgState.keys) mgState.keys = {};
});

document.getElementById('btnOpenTeam').addEventListener('click', () => {
  if (gameState === 'playing') openTeamMenu();
  else if (gameState === 'teamMenu') closeTeamMenu();
});
// Filet de sécurité 100% souris : bouton fermer dédié, et clic en dehors
// des cartes (sur le fond du panneau) pour fermer aussi.
document.getElementById('btnCloseTeam').addEventListener('click', () => {
  if (gameState === 'teamMenu') closeTeamMenu();
});
document.getElementById('teamMenu').addEventListener('click', (e) => {
  if (e.target.id === 'teamMenu' && gameState === 'teamMenu') closeTeamMenu();
});
