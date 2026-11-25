/* ============================================================
   js/moteur/ecran.js — Taille réelle de l'écran, plein écran et orientation (surtout pour le téléphone).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// POURQUOI CE FICHIER : sur téléphone, « 100vh » = la hauteur SANS la barre d'adresse du navigateur, donc plus grande que
// la zone réellement visible → le bas du jeu (dialogue, boutons, mini-carte) était coupé. On mesure donc la vraie taille
// (window.innerWidth / innerHeight) et on la donne au CSS : --app-w, --app-h (taille visible) et --vh (1 % de la hauteur).
// Le CSS n'utilise donc plus « vh » directement : toujours calc(N * var(--vh)).
// Ce fichier est chargé EN PREMIER (avant monde.js) : fitView() (monde.js) est appelée dès qu'elle existe.

const ecranRoot = document.documentElement;
function appResize() {
  const w = window.innerWidth, h = window.innerHeight;
  ecranRoot.style.setProperty('--app-w', w + 'px');
  ecranRoot.style.setProperty('--app-h', h + 'px');
  ecranRoot.style.setProperty('--vh', (h / 100) + 'px');
  if (typeof fitView === 'function') fitView();     // monde.js : adapte la vue du hub au format de l'écran (téléphone)
}
window.addEventListener('resize', appResize);
window.addEventListener('orientationchange', () => { appResize(); setTimeout(appResize, 250); });
if (window.visualViewport) window.visualViewport.addEventListener('resize', appResize);
appResize();

/* ---------- PLEIN ÉCRAN ---------- */
const ecranDocEl = document.documentElement;
const ECRAN_FS_OK = !!(ecranDocEl.requestFullscreen || ecranDocEl.webkitRequestFullscreen);
function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
function lockLandscape() {
  try { const p = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}
// Demande le plein écran (doit venir d'un toucher / clic du joueur, sinon le navigateur refuse).
function enterFullscreen() {
  const rq = ecranDocEl.requestFullscreen || ecranDocEl.webkitRequestFullscreen;
  if (!rq) return Promise.resolve(false);
  try {
    return Promise.resolve(rq.call(ecranDocEl, { navigationUI: 'hide' })).then(() => { lockLandscape(); return true; }, () => false);
  } catch (e) { return Promise.resolve(false); }
}
function exitFullscreen() {
  const ex = document.exitFullscreen || document.webkitExitFullscreen;
  try { if (ex && isFullscreen()) ex.call(document); } catch (e) {}
}
function toggleFullscreen() { if (isFullscreen()) exitFullscreen(); else enterFullscreen(); }
function ecranMajClasses() {
  document.body.classList.toggle('fs', isFullscreen());
  document.body.classList.toggle('fs-ok', ECRAN_FS_OK);
  appResize(); setTimeout(appResize, 200);
}
document.addEventListener('fullscreenchange', ecranMajClasses);
document.addEventListener('webkitfullscreenchange', ecranMajClasses);
document.body.classList.toggle('fs-ok', ECRAN_FS_OK);
// iPhone : pas d'API plein écran dans Safari → on affiche l'astuce « Sur l'écran d'accueil » (le jeu a un manifest + les meta qui vont avec).
(function () {
  const ios = /iPhone|iPod|iPad/.test(navigator.userAgent);
  const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  if (ios && !standalone) document.body.classList.add('ios-browser');
  if (standalone) document.body.classList.add('app-mode');
})();
// Sur téléphone : le tout premier toucher (clic) passe le jeu en plein écran + paysage. Une seule fois par chargement :
// si le joueur en sort, on ne le lui impose pas de nouveau (le bouton ⛶ permet d'y retourner).
let ecranAutoFsFait = false;
document.addEventListener('click', e => {
  if (ecranAutoFsFait || !ECRAN_FS_OK || !document.body.classList.contains('touch') || isFullscreen()) return;
  if (e.target.closest && e.target.closest('#btnFullscreen')) return;     // le bouton ⛶ s'en occupe lui-même
  ecranAutoFsFait = true;
  enterFullscreen();
}, true);
(function () {
  const b = document.getElementById('btnFullscreen');
  if (b) b.addEventListener('click', e => { e.stopPropagation(); ecranAutoFsFait = true; toggleFullscreen(); });
})();

/* ---------- APPLI INSTALLABLE (manifest + petit « service worker » vide) ---------- */
// « Ajouter à l'écran d'accueil » / « Installer l'application » (menu de Chrome) lance alors le jeu en plein écran, sans barre d'adresse.
// Le service worker ne met RIEN en cache (le jeu reste toujours à jour) : il sert seulement à rendre l'appli « installable ».
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {} });
}
