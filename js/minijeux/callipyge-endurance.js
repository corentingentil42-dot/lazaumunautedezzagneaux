/* ============================================================
   js/minijeux/callipyge-endurance.js — Mini-jeu de Callipyge : course d'endurance, sauts par-dessus les cailloux (type 'endurance', étoiles bonus).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

MINIGAMES['endurance'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;

    // --- Netteté : on suréchantillonne le buffer du canvas (repli si pixelisé/flou) ---
    // On garde toute la logique du jeu dans un repère "monde" fixe (s.worldW/s.worldH) ;
    // seul l'affichage final est mis à l'échelle vers le vrai buffer, plus net.
    const LOGICAL_W = 800, LOGICAL_H = 500;
    s.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LOGICAL_W * s.dpr;
    canvas.height = LOGICAL_H * s.dpr;

    // --- Vue zoomée : tout paraît plus grand, et on voit moins loin devant soi ---
    s.viewZoom = 1.5;
    s.worldW = LOGICAL_W / s.viewZoom;
    s.worldH = LOGICAL_H / s.viewZoom;

    s.groundY = s.worldH - 60;
    s.player = { x: 80, w: 40, h: 34, jumpH: 0, vy: 0, jumping: false, legPhase: 0 };
    s.target = 300;       // mètres à parcourir — seule condition de victoire
    s.distance = 0;
    s.elapsed = 0;
    // Vitesse réaliste de coureuse de trail : 3 km/h au départ, jusqu'à ~24 km/h en fin de course.
    // Le HUD affiche une vitesse "réaliste" qui monte doucement de 3 à 25 km/h (pur affichage).
    s.paceMinKmh = 3;
    s.paceMaxKmh = 25;
    s.paceMin = s.paceMinKmh / 3.6;   // m/s
    s.paceMax = s.paceMaxKmh / 3.6;   // m/s
    s.paceTau = 25;
    // La vraie vitesse de jeu (défilement des cailloux/du décor) est indépendante du HUD :
    // rapide et CONSTANTE, pour que ça reste un jeu de réflexe.
    s.scrollSpeedConstant = 620;  // px/s dans le repère "monde" (~x25 par rapport à l'ancien démarrage)
    s.distanceSpeed = 6;          // m/s "de jeu" (constant) — fait avancer la barre de progression
    s.pxPerMeter = 30;
    s.obstacles = [];
    bonusInit(s); s.bonusPlan = [90, 210]; s.bonusStars = []; // 2 étoiles bonus au-dessus d'un caillou, vers 90 m puis 210 m
    s.spawnTimer = 1.1;
    s.keys = {};
    const jump = () => {
      if (!s.player.jumping) { s.player.vy = 620; s.player.jumping = true; }
    };
    s._onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      s.keys[k] = true;
      if (k === ' ' || k === 'arrowup' || k === 'z' || k === 'w') jump();
    };
    s._onKeyUp = (e) => { s.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', s._onKeyDown);
    window.addEventListener('keyup', s._onKeyUp);
    s.lastT = performance.now();
    s.trailOffset = 0;
    // Sapins de fond (parallax léger) — deux tons de vert pour la profondeur
    s.pines = [];
    for (let i = 0; i < 8; i++) {
      s.pines.push({ x: i * (s.worldW/6) + Math.random()*40, h: 45 + Math.random()*32, tone: Math.random() < 0.5 });
    }
    // Nuages (parallax très lent) + poussière de pas
    s.clouds = [];
    for (let i = 0; i < 4; i++) {
      s.clouds.push({ x: i * (s.worldW / 4) + Math.random() * 60, y: 16 + Math.random() * 50, sc: 0.5 + Math.random() * 0.7, v: 12 + Math.random() * 16 });
    }
    s.dust = [];
    s.dustT = 0;
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    s.elapsed += dt;

    // Vitesse d'affichage (HUD uniquement) : monte doucement de 3 à 25 km/h
    const displayPace = s.paceMin + (s.paceMax - s.paceMin) * (1 - Math.exp(-s.elapsed / s.paceTau));

    // Vraie vitesse de jeu : rapide et constante (indépendante du HUD)
    const scrollSpeed = s.scrollSpeedConstant; // px/s

    // Progression automatique (rythme constant, indépendant de la vitesse d'affichage)
    s.distance += s.distanceSpeed * dt;
    if (s.distance >= s.target) { mgSuccess(s.zone); return; }

    // Physique du saut
    const p = s.player;
    if (p.jumping) {
      p.jumpH += p.vy * dt;
      p.vy -= 1700 * dt; // gravité
      if (p.jumpH <= 0) { p.jumpH = 0; p.vy = 0; p.jumping = false; }
    } else {
      p.legPhase += dt * 16;
    }

    // Défilement du décor
    s.trailOffset = (s.trailOffset + scrollSpeed * dt) % 40;
    s.pines.forEach(pi => {
      pi.x -= scrollSpeed * 0.4 * dt;
      if (pi.x < -40) pi.x += s.worldW + 80;
    });
    // Nuages : dérive très lente (ils sont loin)
    s.clouds.forEach(cl => { cl.x -= cl.v * dt; if (cl.x < -90) cl.x += s.worldW + 180; });
    // Poussière soulevée par les pas de Léonie (au sol uniquement)
    s.dustT -= dt;
    if (!p.jumping && s.dustT <= 0) {
      s.dustT = 0.06;
      s.dust.push({ x: p.x - 4 + Math.random() * 8, vx: -85 - Math.random() * 45, r: 1.8 + Math.random() * 2.4, life: 0.45 + Math.random() * 0.2 });
    }
    for (let i = s.dust.length - 1; i >= 0; i--) {
      const d = s.dust[i];
      d.life -= dt; d.x += d.vx * dt;
      if (d.life <= 0) s.dust.splice(i, 1);
    }

    // Cailloux : apparition + défilement — écart minimum garanti (jamais collés), qui varie ensuite
    const difficulty = Math.min(1, s.elapsed / 55); // 0 → 1 (variété des formes, pas l'espacement)
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const minGapTime = 0.95;               // jamais en dessous : le temps de sauter + atterrir sereinement
      const extraGapTime = 0.35 + Math.random() * 0.45; // variation aléatoire au-dessus du minimum
      s.spawnTimer = minGapTime + extraGapTime;
      spawnObstacleGroup(s, { width: s.worldW }, difficulty);
      // Étoile bonus flottant juste au-dessus de ce caillou : il faut bien sauter pour l'attraper
      if (s.bonusPlan.length && s.distance >= s.bonusPlan[0]) {
        s.bonusPlan.shift();
        const ob = s.obstacles[s.obstacles.length - 1];
        s.bonusStars.push({ x: ob.x, hs: 118, r: 12 }); // haut : il faut un saut bien centré (sommet du saut ≈ 113)
      }
    }
    for (let i = s.bonusStars.length - 1; i >= 0; i--) {
      const b = s.bonusStars[i];
      b.x -= scrollSpeed * dt;
      if (b.x < -30) { s.bonusStars.splice(i, 1); continue; }
      if (Math.abs(b.x - (p.x + p.w / 2)) < b.r + p.w / 2 - 6 && Math.abs(b.hs - (p.jumpH + p.h / 2)) < 22) {
        bonusCollect(s, b.x, s.groundY - b.hs); s.bonusStars.splice(i, 1);
      }
    }
    for (let i = s.obstacles.length - 1; i >= 0; i--) {
      const o = s.obstacles[i];
      o.x -= scrollSpeed * dt;
      if (o.x + o.w/2 < -20) { s.obstacles.splice(i, 1); continue; }
      const dx = Math.abs((p.x + p.w/2) - o.x);
      if (dx < (o.w/2 + p.w/2 - 8) && p.jumpH < o.h * 0.78) {
        mgFail(s.zone, 'Tu as trébuché sur un caillou !'); return;
      }
    }

    // ---- Dessin ---- (mise à l'échelle : vue zoomée + buffer suréchantillonné pour un rendu net)
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(s.dpr * s.viewZoom, s.dpr * s.viewZoom);

    const sky = ctx.createLinearGradient(0, 0, 0, s.groundY);
    sky.addColorStop(0, '#8fd0e8'); sky.addColorStop(0.6, '#c8e9dc'); sky.addColorStop(1, '#f2f8e9');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, s.worldW, s.groundY);

    // Soleil doux avec halo
    const sunX = s.worldW * 0.78, sunY = 46;
    const halo = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 60);
    halo.addColorStop(0, 'rgba(255,236,160,0.9)'); halo.addColorStop(1, 'rgba(255,236,160,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(sunX, sunY, 60, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe9a3'; ctx.beginPath(); ctx.arc(sunX, sunY, 17, 0, Math.PI * 2); ctx.fill();

    // Nuages (parallax lent, 3 lobes par nuage)
    s.clouds.forEach(cl => {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, 11 * cl.sc, 0, Math.PI * 2);
      ctx.arc(cl.x + 13 * cl.sc, cl.y + 3 * cl.sc, 8 * cl.sc, 0, Math.PI * 2);
      ctx.arc(cl.x - 12 * cl.sc, cl.y + 4 * cl.sc, 7 * cl.sc, 0, Math.PI * 2);
      ctx.fill();
    });
    // Oiseaux au loin (petits accents en V qui dérivent)
    ctx.strokeStyle = 'rgba(70,90,100,0.5)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    for (let b = 0; b < 3; b++) {
      const bx = (s.worldW * (0.2 + b * 0.3) + s.elapsed * (9 + b * 4)) % (s.worldW + 60) - 30;
      const by = 40 + b * 18 + Math.sin(s.elapsed * 2 + b) * 4;
      ctx.beginPath();
      ctx.moveTo(bx - 5, by); ctx.quadraticCurveTo(bx, by - 4, bx + 1, by);
      ctx.moveTo(bx + 1, by); ctx.quadraticCurveTo(bx + 6, by - 4, bx + 11, by);
      ctx.stroke();
    }

    // Deux couches de montagnes en arrière-plan (silhouettes)
    const mountains = (yBase, amp, freq, col) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (let mx = 0; mx <= s.worldW; mx += 10) {
        ctx.lineTo(mx, yBase - amp * (0.55 + 0.45 * Math.sin(mx * freq + 1.7)) * (0.6 + 0.4 * Math.sin(mx * freq * 2.7)));
      }
      ctx.lineTo(s.worldW, yBase); ctx.closePath(); ctx.fill();
    };
    mountains(s.groundY - 14, 46, 0.013, 'rgba(116,146,138,0.55)');
    mountains(s.groundY - 10, 26, 0.021, 'rgba(94,138,112,0.75)');

    // Sapins en arrière-plan (deux tons de vert + ombre au pied)
    s.pines.forEach(pi => {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath(); ctx.ellipse(pi.x, s.groundY - 6, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = pi.tone ? '#3f7f4e' : '#4c8a5e';
      ctx.beginPath();
      ctx.moveTo(pi.x, s.groundY - pi.h);
      ctx.lineTo(pi.x - 26, s.groundY - 10);
      ctx.lineTo(pi.x + 26, s.groundY - 10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = pi.tone ? '#5aa36b' : '#68b57a';
      ctx.beginPath();
      ctx.moveTo(pi.x, s.groundY - pi.h);
      ctx.lineTo(pi.x - 14, s.groundY - pi.h * 0.45);
      ctx.lineTo(pi.x + 14, s.groundY - pi.h * 0.45);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(pi.x - 4, s.groundY - 14, 8, 14);
    });

    // Sol (sentier de terre battue, dégradé + bord d'herbe + cailloux qui défilent)
    const trailGrad = ctx.createLinearGradient(0, s.groundY, 0, s.worldH);
    trailGrad.addColorStop(0, '#96714a'); trailGrad.addColorStop(1, '#6e4f33');
    ctx.fillStyle = trailGrad; ctx.fillRect(0, s.groundY, s.worldW, s.worldH - s.groundY);
    ctx.fillStyle = '#3e6b48'; ctx.fillRect(0, s.groundY - 7, s.worldW, 7);
    // touffes d'herbe le long du bord
    ctx.fillStyle = '#4d8a58';
    for (let x = -40 - s.trailOffset; x < s.worldW; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, s.groundY - 6); ctx.lineTo(x + 4, s.groundY - 13); ctx.lineTo(x + 8, s.groundY - 6);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 13, s.groundY + 1); ctx.lineTo(x + 17, s.groundY - 6); ctx.lineTo(x + 21, s.groundY + 1);
      ctx.closePath(); ctx.fill();
    }
    // cailloux et traces du sentier
    ctx.fillStyle = '#82603f';
    for (let x = -40 - s.trailOffset; x < s.worldW; x += 40) {
      ctx.fillRect(x, s.groundY + 12, 22, 6);
      ctx.beginPath(); ctx.ellipse(x + 30, s.groundY + 26, 3.4, 2.2, 0.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let x = -70 - s.trailOffset * 1.3; x < s.worldW; x += 55) {
      ctx.fillRect(x, s.groundY + 6, 16, 2);
    }

    // Cailloux (obstacles, plusieurs formes)
    s.obstacles.forEach(o => drawObstacle(ctx, o, s.groundY));
    s.bonusStars.forEach(b => bonusDraw(ctx, b.x, s.groundY - b.hs, b.r));

    // Bornes de distance tous les 50 m + ruban d'arrivée à 300 m
    for (let m = 50; m <= s.target; m += 50) {
      const mx = 110 + (m - s.distance) * 103;
      if (mx < -40 || mx > s.worldW + 40) continue;
      if (m === s.target) {
        // ARRIVÉE : deux poteaux + ruban damier
        ctx.fillStyle = '#6b4a2a';
        ctx.fillRect(mx - 4, s.groundY - 74, 7, 74);
        ctx.fillRect(mx + 34, s.groundY - 74, 7, 74);
        ctx.fillStyle = '#ffd76b';
        ctx.beginPath(); ctx.arc(mx - 0.5, s.groundY - 76, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(mx + 37.5, s.groundY - 76, 4, 0, Math.PI * 2); ctx.fill();
        for (let cy = 0; cy < 4; cy++) {
          for (let cxx = 0; cxx < 6; cxx++) {
            ctx.fillStyle = ((cy + cxx) % 2 === 0) ? '#1b2735' : '#f2f2f2';
            ctx.fillRect(mx + 3 + cxx * 6.5, s.groundY - 64 + cy * 9, 6.5, 9);
          }
        }
        ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#a87a2a';
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2.5;
        ctx.strokeText('🏁 ARRIVÉE', mx + 18, s.groundY - 68);
        ctx.fillText('🏁 ARRIVÉE', mx + 18, s.groundY - 68);
      } else {
        // Borne en bois : poteau + panneau avec la distance
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath(); ctx.ellipse(mx, s.groundY - 2, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7a5a3a'; ctx.fillRect(mx - 2.5, s.groundY - 30, 5, 30);
        ctx.fillStyle = '#a87a2a';
        ctx.fillRect(mx - 21, s.groundY - 44, 42, 16);
        ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 21, s.groundY - 44, 42, 16);
        ctx.fillStyle = '#2d1d0e'; ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${m} m`, mx, s.groundY - 36);
      }
    }

    // Léonie en mode trail — utilise son vrai sprite (vue de droite) si disponible
    const py = s.groundY - p.jumpH;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(p.x + p.w/2, s.groundY + 3, p.w*0.4, 5, 0, 0, Math.PI*2); ctx.fill();

    const leoEntry = SPRITES['callipyge'];
    if (leoEntry && leoEntry.img.complete && leoEntry.img.naturalWidth > 0) {
      const img = leoEntry.img;
      const row = SPRITE_ROW_INDEX.right;
      const col = p.jumping ? 0 : Math.floor(p.legPhase) % leoEntry.cols;
      const cell = mgSpriteCell(leoEntry, row, col);
      const displayH = 62;
      const displayW = displayH * (cell.w / cell.h);
      ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h,
        p.x + p.w/2 - displayW/2, py - displayH, displayW, displayH);
    } else {
      ctx.save();
      ctx.translate(p.x, py - p.h);
      // Corps
      ctx.fillStyle = '#5fae6e';
      ctx.beginPath();
      ctx.ellipse(p.w*0.5, p.h*0.55, p.w*0.42, p.h*0.42, 0, 0, Math.PI*2);
      ctx.fill();
      // Tête
      ctx.beginPath(); ctx.ellipse(p.w*0.82, p.h*0.32, p.w*0.28, p.h*0.26, 0, 0, Math.PI*2); ctx.fill();
      // Museau
      ctx.beginPath(); ctx.ellipse(p.w*1.05, p.h*0.38, p.w*0.14, p.h*0.12, 0, 0, Math.PI*2); ctx.fill();
      // Oeil
      ctx.fillStyle = '#1b2735';
      ctx.beginPath(); ctx.arc(p.w*0.9, p.h*0.26, 2.2, 0, Math.PI*2); ctx.fill();
      // Queue
      ctx.fillStyle = '#5fae6e';
      ctx.beginPath();
      ctx.moveTo(p.w*0.12, p.h*0.55);
      ctx.lineTo(-p.w*0.28, p.h*0.4);
      ctx.lineTo(p.w*0.15, p.h*0.72);
      ctx.closePath(); ctx.fill();
      // Dos épineux
      ctx.fillStyle = '#3f8a4d';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(p.w*(0.35 + i*0.14), p.h*0.22);
        ctx.lineTo(p.w*(0.4 + i*0.14), p.h*0.05);
        ctx.lineTo(p.w*(0.46 + i*0.14), p.h*0.22);
        ctx.closePath(); ctx.fill();
      }
      // Pattes (animation de course si au sol)
      ctx.strokeStyle = '#3f8a4d'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const legSwing = p.jumping ? 0.5 : Math.sin(p.legPhase) * 0.6;
      ctx.beginPath(); ctx.moveTo(p.w*0.38, p.h*0.85); ctx.lineTo(p.w*0.38 + legSwing*8, p.h*1.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.w*0.6, p.h*0.85); ctx.lineTo(p.w*0.6 - legSwing*8, p.h*1.05); ctx.stroke();
      ctx.restore();
    }

    // Poussière soulevée par les pas
    s.dust.forEach(d => {
      ctx.fillStyle = `rgba(190,160,120,${Math.max(0, d.life).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, s.groundY + 3, d.r, 0, Math.PI * 2); ctx.fill();
    });

    // HUD : panneau arrondi + distance + vitesse
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(8, 8, 205, 66, 10); else ctx.rect(8, 8, 205, 66);
    ctx.fill();
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`🏃 ${Math.min(s.distance, s.target).toFixed(0)}m / ${s.target}m`, 18, 14);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '11px sans-serif';
    ctx.fillText(`⚡ vitesse : ${(displayPace * 3.6).toFixed(0)} km/h`, 18, 34);
    // Barre de progression avec bornes tous les 50 m
    const pbx = 18, pby = 50, pbw = 185;
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(pbx, pby, pbw, 8);
    const pg2 = ctx.createLinearGradient(pbx, 0, pbx + pbw, 0);
    pg2.addColorStop(0, '#7be38b'); pg2.addColorStop(1, '#ffd76b');
    ctx.fillStyle = pg2;
    ctx.fillRect(pbx, pby, pbw * Math.min(1, s.distance / s.target), 8);
    for (let m = 50; m < s.target; m += 50) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(pbx + pbw * (m / s.target) - 1, pby - 2, 2, 12);
    }
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(pbx + pbw - 2, pby - 2, 3, 12);

    bonusDrawPops(ctx, s, dt);
    bonusHud(ctx, s, s.worldW - 8, 8);

    // Vignette douce pour donner de la profondeur
    const vg = ctx.createRadialGradient(s.worldW / 2, s.worldH / 2, s.worldH * 0.45, s.worldW / 2, s.worldH / 2, s.worldH * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,35,25,0.28)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, s.worldW, s.worldH);

    ctx.restore();
  },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      window.removeEventListener('keyup', mgState._onKeyUp);
    }
    // On restaure la résolution standard du canvas pour les autres mini-jeux
    const c = document.getElementById('mgCanvas');
    if (c) { c.width = 800; c.height = 500; }
  }
};

// ---- Skins des cailloux du mini-jeu de Léonie ----
// Dépose tes images dans assets/mini-jeu-leonie/ sous ces noms exacts :
//   spike.png (caillou pointu), boulder.png (gros bloc rond),
//   cluster.png (amas de 3 pierres), double.png (deux cailloux collés)
// Tant qu'une image n'est pas présente, le dessin dessiné à la main prend le relais automatiquement.
const OBSTACLE_SPRITE_PATH = 'assets/mini-jeu-leonie/';
const OBSTACLE_TYPES = ['spike', 'boulder', 'cluster', 'double'];
const OBSTACLE_IMAGES = {};
function loadObstacleSkins() {
  OBSTACLE_TYPES.forEach(type => {
    const img = new Image();
    img.src = `${OBSTACLE_SPRITE_PATH}${type}.png`;
    img.onload = () => { OBSTACLE_IMAGES[type] = img; };
    img.onerror = () => { /* pas grave, le dessin de secours prend le relais */ };
  });
}
loadObstacleSkins();

// ---- Variété de cailloux façon "jeu du dino" ----
// Chaque obstacle a une empreinte (w, h) utilisée pour la collision,
// et un type qui détermine son dessin. Plus la difficulté augmente,
// plus les formes larges/groupées (donc les sauts plus durs) sont fréquentes.
function spawnObstacleGroup(s, canvas, difficulty) {
  const startX = canvas.width + 30;
  const roll = Math.random();
  if (roll < 0.16 + difficulty * 0.14) {
    // Deux cailloux collés : un seul saut, mais plus long à tenir en l'air
    const size = 24 + Math.random() * 10;
    s.obstacles.push({ x: startX, w: size * 2.1, h: size, type: 'double', size });
  } else if (roll < 0.32 + difficulty * 0.18) {
    // Amas de trois petites pierres, façon rangée de cailloux
    const size = 16 + Math.random() * 6;
    s.obstacles.push({ x: startX, w: size * 3.4, h: size * 1.1, type: 'cluster', size });
  } else if (roll < 0.55) {
    // Gros bloc arrondi, plus large mais un peu moins haut
    const size = 30 + Math.random() * 14;
    s.obstacles.push({ x: startX, w: size * 1.15, h: size * 0.78, type: 'boulder', size });
  } else {
    // Le caillou pointu classique
    const size = 20 + Math.random() * 18;
    s.obstacles.push({ x: startX, w: size * 0.85, h: size, type: 'spike', size });
  }
}

function drawObstacle(ctx, o, groundY) {
  const skin = OBSTACLE_IMAGES[o.type];
  if (skin && skin.complete && skin.naturalWidth > 0) {
    // Image fournie par l'utilisateur : cadrée sur l'empreinte de collision (w × h), pieds au sol
    const dw = o.w * 1.15;
    const dh = o.h * 1.35;
    ctx.drawImage(skin, o.x - dw / 2, groundY - dh, dw, dh);
    return;
  }

  ctx.fillStyle = '#8a8378';
  ctx.strokeStyle = '#5a544a';
  ctx.lineWidth = 2;

  if (o.type === 'spike') {
    const sz = o.size;
    ctx.beginPath();
    ctx.moveTo(o.x - sz/2, groundY);
    ctx.lineTo(o.x - sz/2 + 4, groundY - sz*0.7);
    ctx.lineTo(o.x, groundY - sz);
    ctx.lineTo(o.x + sz/2 - 3, groundY - sz*0.6);
    ctx.lineTo(o.x + sz/2, groundY);
    ctx.closePath(); ctx.fill(); ctx.stroke();

  } else if (o.type === 'boulder') {
    const sz = o.size;
    ctx.beginPath();
    ctx.ellipse(o.x, groundY - sz*0.42, sz*0.58, sz*0.42, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(o.x - sz*0.18, groundY - sz*0.58, sz*0.2, sz*0.12, 0, 0, Math.PI*2); ctx.fill();

  } else if (o.type === 'cluster') {
    const sz = o.size;
    const offsets = [-sz*1.15, 0, sz*1.15];
    offsets.forEach((off, i) => {
      const h = sz * (0.8 + (i % 2) * 0.35);
      ctx.fillStyle = '#8a8378';
      ctx.beginPath();
      ctx.moveTo(o.x + off - sz/2, groundY);
      ctx.lineTo(o.x + off, groundY - h);
      ctx.lineTo(o.x + off + sz/2, groundY);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });

  } else if (o.type === 'double') {
    const sz = o.size;
    [-sz*0.62, sz*0.62].forEach(off => {
      ctx.fillStyle = '#8a8378';
      ctx.beginPath();
      ctx.moveTo(o.x + off - sz/2, groundY);
      ctx.lineTo(o.x + off - sz/2 + 3, groundY - sz*0.7);
      ctx.lineTo(o.x + off, groundY - sz);
      ctx.lineTo(o.x + off + sz/2 - 2, groundY - sz*0.6);
      ctx.lineTo(o.x + off + sz/2, groundY);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }
}
