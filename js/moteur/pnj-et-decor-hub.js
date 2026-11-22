/* ============================================================
   js/moteur/pnj-et-decor-hub.js — PNJ qui se promènent sur la place + positions du décor du hub (arbres, fleurs, rochers…).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

const wanderingNpcs = [];
function spawnWanderer(perso) {
  const angle = Math.random() * Math.PI * 2;
  const dist = 60 + Math.random() * (HUB_RADIUS - 100);
  wanderingNpcs.push({
    id: perso.id,
    perso: perso,
    x: HUB_X + Math.cos(angle) * dist - 12,
    y: HUB_Y + Math.sin(angle) * dist - 15,
    w: 24, h: 30,
    dir: 'down', moving: false,
    animFrame: 0, animTimer: 0,
    speed: 0.85, // plus lents que le joueur (2.2) pour une balade posée sur le hub
    targetX: HUB_X + (Math.random() - 0.5) * HUB_RADIUS,
    targetY: HUB_Y + (Math.random() - 0.5) * HUB_RADIUS,
    pauseTimer: 0,
    pauseDuration: 1 + Math.random() * 3
  });
}
function refreshWanderers() {
  wanderingNpcs.length = 0;
  for (const perso of PERSONNAGES) {
    if (state.persosDebloques.includes(perso.id) && perso.id !== state.persoActif) {
      spawnWanderer(perso);
    }
  }
}

const hubDecor = {
  fountain: { x: HUB_X, y: HUB_Y - 20, r: 40 },
  // Le Grand Feu de la Z'aumunauté : il ne s'allume qu'à la toute vraie fin,
  // quand la bande est réunie au complet et que les préparatifs sont faits.
  campfire: { x: HUB_X, y: HUB_Y + 140, r: 26 },
  benches: [
    { x: HUB_X - 130, y: HUB_Y + 60, angle: 0 },
    { x: HUB_X + 130, y: HUB_Y + 60, angle: Math.PI },
    { x: HUB_X - 130, y: HUB_Y - 100, angle: 0 },
    { x: HUB_X + 130, y: HUB_Y - 100, angle: Math.PI }
  ],
  lamps: [
    { x: HUB_X - 170, y: HUB_Y - 170 },
    { x: HUB_X + 170, y: HUB_Y - 170 },
    { x: HUB_X - 170, y: HUB_Y + 170 },
    { x: HUB_X + 170, y: HUB_Y + 170 }
  ],
  flowers: []
};
for (let i = 0; i < 30; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 100 + Math.random() * 90;
  hubDecor.flowers.push({
    x: HUB_X + Math.cos(a) * r,
    y: HUB_Y + Math.sin(a) * r,
    color: ['#ff6b9d', '#ffd76b', '#7bc8ff', '#c98cff'][i % 4]
  });
}

const trees = [];
for (let i = 0; i < 220; i++) {
  const gx = (i * 197 + 37) % WORLD_W;
  const gy = (i * 233 + 71) % WORLD_H;
  if (Math.hypot(gx - HUB_X, gy - HUB_Y) < HUB_RADIUS + 80) continue;
  let tooClose = false;
  for (const z of zones) {
    if (Math.hypot(gx - (z.x + z.w/2), gy - (z.y + z.h/2)) < 160) { tooClose = true; break; }
  }
  if (tooClose) continue;
  trees.push({ x: gx, y: gy, variant: i % 3 === 0 ? 'pine' : 'round' });
}
const flowers = [];
for (let i = 0; i < 300; i++) {
  flowers.push({
    x: (i * 173 + 40) % WORLD_W,
    y: (i * 89 + 30) % WORLD_H,
    color: ['#ff6b9d', '#ffd76b', '#7bc8ff', '#c98cff'][i % 4]
  });
}
const rocks = [];
for (let i = 0; i < 70; i++) {
  const gx = (i * 251 + 90) % WORLD_W;
  const gy = (i * 173 + 200) % WORLD_H;
  if (Math.hypot(gx - HUB_X, gy - HUB_Y) < HUB_RADIUS + 80) continue;
  let tooClose = false;
  for (const z of zones) {
    if (Math.hypot(gx - (z.x + z.w/2), gy - (z.y + z.h/2)) < 160) { tooClose = true; break; }
  }
  if (tooClose) continue;
  rocks.push({ x: gx, y: gy });
}
const bushes = [];
for (let i = 0; i < 90; i++) {
  const gx = (i * 197 + 60) % WORLD_W;
  const gy = (i * 233 + 150) % WORLD_H;
  if (Math.hypot(gx - HUB_X, gy - HUB_Y) < HUB_RADIUS + 80) continue;
  let tooClose = false;
  for (const z of zones) {
    if (Math.hypot(gx - (z.x + z.w/2), gy - (z.y + z.h/2)) < 150) { tooClose = true; break; }
  }
  if (tooClose) continue;
  bushes.push({ x: gx, y: gy });
}
