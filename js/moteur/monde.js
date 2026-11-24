/* ============================================================
   js/moteur/monde.js — Canevas, état global du jeu, joueur, caméra.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const VIEW_W = 640, VIEW_H = 480;   // taille du canevas (le CSS l'agrandit pour remplir la fenêtre)
// Zoom de la caméra du hub (promenade sur la carte) : 2.4 = tout est affiché 240 % plus gros.
// Pour changer le zoom, c'est CETTE ligne. (Les mini-jeux ne sont pas concernés.)
const HUB_ZOOM = 2.4;
const SEE_W = VIEW_W / HUB_ZOOM, SEE_H = VIEW_H / HUB_ZOOM;   // ce que la caméra voit du monde, en pixels du monde
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
