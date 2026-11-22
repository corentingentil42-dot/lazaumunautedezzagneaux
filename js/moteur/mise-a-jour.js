/* ============================================================
   js/moteur/mise-a-jour.js — update() : déplacement du joueur, collisions, PNJ, détection de ce qui est à portée, HUD.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

function update() {
  if (gameState !== 'playing') return;
  let dx = 0, dy = 0;
  if (keys['arrowup'] || keys['z'] || keys['w']) { dy = -1; player.dir = 'up'; }
  else if (keys['arrowdown'] || keys['s']) { dy = 1; player.dir = 'down'; }
  else if (keys['arrowleft'] || keys['q'] || keys['a']) { dx = -1; player.dir = 'left'; }
  else if (keys['arrowright'] || keys['d']) { dx = 1; player.dir = 'right'; }
  player.moving = (dx !== 0 || dy !== 0);
  let nx = player.x + dx * player.speed * frameK;
  let ny = player.y + dy * player.speed * frameK;
  // Toutes les maisons sont solides, y compris celle de Coco (elle était exemptée : on la traversait).
  for (const z of zones) {
    if (nx + player.w > z.x && nx < z.x + z.w &&
        ny + player.h > z.y && ny < z.y + z.h) {
      if (dx !== 0) nx = player.x;
      if (dy !== 0) ny = player.y;
    }
  }
  if (Math.hypot(nx + player.w/2 - hubDecor.fountain.x, ny + player.h/2 - hubDecor.fountain.y) < hubDecor.fountain.r + 10) {
    if (dx !== 0) nx = player.x;
    if (dy !== 0) ny = player.y;
  }
  // Même chose pour le Grand Feu de camp : on ne marche pas dedans.
  // On ne bloque que si on ENTRE dans le cercle depuis l'extérieur : si le
  // joueur est déjà dedans (cas impossible en jeu normal, mais jamais on ne
  // sait), il peut toujours en sortir — sinon il serait enfermé sur place.
  const inFire = (px, py) => Math.hypot(px - hubDecor.campfire.x, py - hubDecor.campfire.y) < hubDecor.campfire.r + 6;
  if (!inFire(player.x, player.y)) {
    if (inFire(nx, player.y)) nx = player.x;
    if (inFire(player.x, ny)) ny = player.y;
  }
  nx = Math.max(20, Math.min(WORLD_W - player.w - 20, nx));
  ny = Math.max(60, Math.min(WORLD_H - player.h - 20, ny));
  player.x = nx; player.y = ny;

  if (player.moving) {
    player.animTimer += frameK;
    if (player.animTimer > 10) {
      player.animFrame = (player.animFrame + 1) % SPRITE_COLS;
      player.animTimer = 0;
      if (player.animFrame % 2 === 1) { Snd.play('step'); hubDust(player.x + player.w / 2, player.y + player.h); }
    }
  } else player.animFrame = 0;
  updateHubFx();

  for (const w of wanderingNpcs) {
    if (w.pauseTimer > 0) {
      w.pauseTimer -= frameK / 60;
      w.moving = false;
    } else {
      const tdx = w.targetX - w.x;
      const tdy = w.targetY - w.y;
      const dist = Math.hypot(tdx, tdy);
      if (dist < 8) {
        w.pauseTimer = w.pauseDuration;
        w.pauseDuration = 1 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * (HUB_RADIUS - 80);
        w.targetX = HUB_X + Math.cos(angle) * r;
        w.targetY = HUB_Y + Math.sin(angle) * r;
      } else {
        const nwx = w.x + (tdx / dist) * w.speed * frameK;
        const nwy = w.y + (tdy / dist) * w.speed * frameK;
        // Même collision que le joueur avec la fontaine : au lieu de foncer
        // dedans, le PNJ se choisit une nouvelle destination et la contourne.
        if (Math.hypot(nwx + w.w/2 - hubDecor.fountain.x, nwy + w.h/2 - hubDecor.fountain.y) < hubDecor.fountain.r + 10
          || Math.hypot(nwx + w.w/2 - hubDecor.campfire.x, nwy + w.h/2 - hubDecor.campfire.y) < hubDecor.campfire.r + 8) {
          w.pauseTimer = 0.15;
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * (HUB_RADIUS - 80);
          w.targetX = HUB_X + Math.cos(angle) * r;
          w.targetY = HUB_Y + Math.sin(angle) * r;
          w.moving = false;
        } else {
          w.x = nwx; w.y = nwy;
          if (Math.abs(tdx) > Math.abs(tdy)) {
            w.dir = tdx > 0 ? 'right' : 'left';
          } else {
            w.dir = tdy > 0 ? 'down' : 'up';
          }
          w.moving = true;
          w.animTimer += frameK;
          if (w.animTimer > 10) {
            w.animFrame = (w.animFrame + 1) % SPRITE_COLS;
            w.animTimer = 0;
          }
        }
      }
    }
  }

  camera.x = Math.max(0, Math.min(WORLD_W - VIEW_W, player.x + player.w/2 - VIEW_W/2));
  camera.y = Math.max(0, Math.min(WORLD_H - VIEW_H, player.y + player.h/2 - VIEW_H/2));

  // Zone affichée dans le HUD : le hub si on est près du centre, sinon la
  // maison la plus proche (le libellé ne change que si nécessaire)
  let zoneLabel = 'Hub central';
  if (Math.hypot(player.x + player.w/2 - HUB_X, player.y + player.h/2 - HUB_Y) > HUB_RADIUS) {
    let bestZone = null, bestD = Infinity;
    for (const z of zones) {
      const d = Math.hypot(player.x + player.w/2 - (z.x + z.w/2), player.y + player.h/2 - (z.y + z.h/2));
      if (d < bestD) { bestD = d; bestZone = z; }
    }
    zoneLabel = (bestZone && bestD < 350) ? bestZone.zone : 'Les Prairies';
  }
  if (zoneLabel !== lastZoneLabel) {
    lastZoneLabel = zoneLabel;
    document.getElementById('hudZone').textContent = zoneLabel;
  }

  nearbyTarget = null;
  let bestDist = 80;

  for (const z of zones) {
    const pnjPos = z.pnjHome;
    const d = Math.hypot(
      (player.x + player.w/2) - (pnjPos.x + 12),
      (player.y + player.h/2) - (pnjPos.y + 15)
    );
    if (d < bestDist) {
      bestDist = d;
      nearbyTarget = { type: 'zone', ref: z };
    }
  }

  for (const w of wanderingNpcs) {
    const d = Math.hypot(
      (player.x + player.w/2) - (w.x + w.w/2),
      (player.y + player.h/2) - (w.y + w.h/2)
    );
    if (d < bestDist) {
      bestDist = d;
      nearbyTarget = { type: 'wanderer', ref: w };
    }
  }

  // Le Grand Feu : point d'interaction de la quête finale
  {
    const d = Math.hypot(
      (player.x + player.w/2) - hubDecor.campfire.x,
      (player.y + player.h/2) - hubDecor.campfire.y
    );
    if (d < bestDist) {
      bestDist = d;
      nearbyTarget = { type: 'campfire' };
    }
  }

  const prompt = elInteractPrompt;
  if (nearbyTarget) {
    if (prompt.style.display !== 'block') prompt.style.display = 'block';
    let tx, ty, label;
    // Le sprite (64px de haut) dépasse largement au-dessus de la hitbox
    // (24×30) : on ancre donc le label au-dessus du sprite réel, centré
    // horizontalement, pour qu'il ne retombe plus sur la tête du perso.
    const SPRITE_TOP_OFFSET = 26; // sommet visuel du sprite au-dessus de la hitbox
    const LABEL_GAP = 8;          // petite marge supplémentaire
    if (nearbyTarget.type === 'zone') {
      tx = nearbyTarget.ref.pnjHome.x + 12;
      ty = nearbyTarget.ref.pnjHome.y - SPRITE_TOP_OFFSET - LABEL_GAP;
      // Coco ne se parle pas à lui-même : sa zone est son terrain
      // d'entraînement (sauf si on joue un autre perso : là on discute)
      const zr = nearbyTarget.ref;
      label = zr.id === 'coco' ? "S'entraîner au Circuit 🚴"
        : (state.persosDebloques.includes(zr.id) ? `📋 Pancarte de ${zr.surnom} : rejouer` : `Parler à ${zr.surnom}`);
    } else if (nearbyTarget.type === 'campfire') {
      tx = hubDecor.campfire.x;
      ty = hubDecor.campfire.y - 42;
      label = state.feuAllume ? '🔥 Le Grand Feu' : "🔥 Le Grand Feu (éteint)";
    } else {
      tx = nearbyTarget.ref.x + 12;
      ty = nearbyTarget.ref.y - SPRITE_TOP_OFFSET - LABEL_GAP;
      label = `Parler à ${nearbyTarget.ref.perso.surnom}`;
    }
    const sp = worldToScreen(tx, ty);
    prompt.style.left = sp.x + 'px';
    prompt.style.top = sp.y + 'px';
    if (prompt.textContent !== label) prompt.textContent = label; // évite de reconstruire le texte à chaque image
  } else if (prompt.style.display !== 'none') {
    prompt.style.display = 'none';
  }
}
