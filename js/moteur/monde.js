/* ============================================================
   js/moteur/monde.js — Canevas, état global du jeu, joueur, caméra.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
// Taille du canevas du hub. La hauteur est fixe (480) ; la LARGEUR s'adapte au format de l'écran sur téléphone (voir fitView) :
// 640 (= 4:3) sur ordinateur, jusqu'à ~1150 sur un téléphone très allongé. Le CSS étire ensuite le canevas pour remplir l'écran.
let VIEW_W = 640;
const VIEW_H = 480;
// Zoom de la caméra du hub (promenade sur la carte) : 2.4 = tout est affiché 240 % plus gros.
// Pour changer le zoom, c'est CES DEUX lignes : HUB_ZOOM_PC (ordinateur) et HUB_ZOOM_TOUCH (téléphone / tablette, v20.32 : vue plus large,
// on voit plus de décor autour de Coco). HUB_ZOOM est la valeur en cours, choisie par fitView(). (Les mini-jeux ne sont pas concernés.)
const HUB_ZOOM_PC = 2.4;
const HUB_ZOOM_TOUCH = 1.6;
let HUB_ZOOM = HUB_ZOOM_PC;
let SEE_W = VIEW_W / HUB_ZOOM, SEE_H = VIEW_H / HUB_ZOOM;   // ce que la caméra voit du monde, en pixels du monde
// Format de la vue : 4:3 partout, SAUF sur téléphone/tablette (body.touch) où le canevas épouse l'écran (de 4:3 jusqu'à 2,4:1 maximum ;
// au-delà on garde des petites barres sur les côtés plutôt que d'étirer le monde). Appelée par ecran.js à chaque changement de taille.
const VIEW_ASPECT_MAX = 2.4;
function fitView() {
  let aspect = 4 / 3;
  const touch = document.body.classList.contains('touch');
  if (touch && window.innerHeight > 0) {
    aspect = Math.max(4 / 3, Math.min(VIEW_ASPECT_MAX, window.innerWidth / window.innerHeight));
  }
  const w = Math.round(VIEW_H * aspect / 2) * 2;
  document.documentElement.style.setProperty('--view-aspect', String(w / VIEW_H));
  const zoom = touch ? HUB_ZOOM_TOUCH : HUB_ZOOM_PC;
  if (w === VIEW_W && zoom === HUB_ZOOM) return;
  HUB_ZOOM = zoom;
  VIEW_W = w; SEE_W = VIEW_W / HUB_ZOOM; SEE_H = VIEW_H / HUB_ZOOM;
  canvas.width = VIEW_W;               // (redimensionner un canevas remet son contexte à zéro)
  ctx.imageSmoothingEnabled = false;
}
const WORLD_W = 3600, WORLD_H = 2700;
let gameState = 'loading'; // 'loading' | 'title' | 'playing' | ...
let keys = {};
// Facteur de temps du hub : 1 = une image à 60 Hz. Sur un écran 144 Hz il vaut ~0,42, donc le jeu
// va à la même vitesse partout (avant, il allait 2,4× plus vite sur un écran 144 Hz).
let frameK = 1;
// Éléments du DOM lus à chaque image : on les récupère une seule fois (getElementById à 60 fps = gaspillage).
const elInteractPrompt = document.getElementById('interactPrompt');
const elMiniMap = document.getElementById('miniMapCanvas');
const miniMapCtx = elMiniMap ? elMiniMap.getContext('2d') : null;
const camera = { x: 0, y: 0 };
fitView();   // (au cas où la page est déjà en mode tactile au chargement)
const HUB_X = WORLD_W / 2;
const HUB_Y = WORLD_H / 2;
const HUB_RADIUS = 220;

const player = {
  // Spawn au nord du feu de camp : attention, un spawn DANS une zone de
  // collision (feu, fontaine) enfermerait le joueur — on reste à distance.
  x: HUB_X - 12, y: HUB_Y + 40,
  w: 24, h: 30, speed: 2.8,   // v20.27 : 2.2 -> 2.8 (un peu plus rapide)
  dir: 'down', moving: false,
  animFrame: 0, animTimer: 0
};
