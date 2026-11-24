/* ============================================================
   js/rendu/scene.js — draw() : toute la scène triée par profondeur (devant / derrière).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   LA SCÈNE : tout est trié par la hauteur des pieds (devant / derrière), comme dans un jeu Pokémon
   ===================================================================== */
const drawList = [];
function draw() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  // Caméra zoomée (HUB_ZOOM) ; on cale la position sur un pixel d'écran entier pour éviter le « tremblement » du décor.
  const camX = Math.round(camera.x * HUB_ZOOM) / HUB_ZOOM, camY = Math.round(camera.y * HUB_ZOOM) / HUB_ZOOM;
  ctx.save();
  ctx.scale(HUB_ZOOM, HUB_ZOOM);
  ctx.translate(-camX, -camY);
  drawGround(camX, camY);
  const L = drawList; L.length = 0;
  for (const t of trees) if (inView(t.x + 16, t.y + 46, 110)) L.push({ y: t.y + 46, k: 0, o: t });
  for (const b of bushes) if (inView(b.x + 14, b.y + 20, 50)) L.push({ y: b.y + 20, k: 1, o: b });
  for (const r of rocks) if (inView(r.x + 10, r.y + 13, 40)) L.push({ y: r.y + 13, k: 2, o: r });
  if (inView(HUB_X, HUB_Y, HUB_RADIUS + 140)) {
    for (const b of hubDecor.benches) L.push({ y: b.y + 16, k: 3, o: b });
    for (const l of hubDecor.lamps) L.push({ y: l.y + 8, k: 4, o: l });
    L.push({ y: hubDecor.fountain.y + 30, k: 5 });
    L.push({ y: hubDecor.campfire.y + 14, k: 6 });
  }
  for (const z of zones) {
    if (!inView(z.x + z.w / 2, z.y + z.h / 2, 260)) continue;
    L.push({ y: z.y + z.h, k: 7, o: z });
    L.push({ y: z.pnjHome.y + 34, k: 8, o: z });
  }
  for (const w of wanderingNpcs) if (inView(w.x, w.y, 80)) L.push({ y: w.y + w.h, k: 9, o: w });
  L.push({ y: player.y + player.h, k: 10 });
  L.sort((a, b) => a.y - b.y);
  for (let i = 0; i < L.length; i++) {
    const it = L[i];
    switch (it.k) {
      case 0: drawTree(it.o); break;
      case 1: drawBush(it.o); break;
      case 2: drawRock(it.o); break;
      case 3: drawBench(it.o); break;
      case 4: drawLamp(it.o); break;
      case 5: drawFountain(); break;
      case 6: drawCampfire(); break;
      case 7: drawHouse(it.o); break;
      case 8: drawNpcAtZone(it.o); break;
      case 9: drawWanderer(it.o); break;
      default: drawHubFx(); drawPlayer();
    }
  }
  drawButterflies();
  for (const z of zones) if (inView(z.x + z.w / 2, z.y + z.h / 2, 260)) drawZoneLabel(z);
  ctx.restore();
}
