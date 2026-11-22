/* ============================================================
   js/minijeux/tristan-moto.js — Mini-jeu de Tristan : course de moto à 3 voies (type 'moto', étoiles bonus).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE TITAN : LA COURSE DE MOTO (esquive sur 3 voies) ============ */
MINIGAMES['moto'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.timeLeft = 25;
    s.elapsed = 0;
    s.roadX = 240; s.roadW = 320; s.laneW = s.roadW / 3;
    s.targetLane = 1;
    s.bikeX = s.roadX + s.laneW * 1.5;
    s.bikeY = canvas.height - 90;
    s.obstacles = [];
    bonusInit(s); s.bonusPlan = [6, 15]; // 2 étoiles bonus posées sur la route, à 6 s puis 15 s
    s.spawnTimer = 0.9;
    s.scroll = 0;
    s.lastT = performance.now();
    s._onKeyDown = (e) => {
      if (gameState !== 'miniGame') return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'q' || k === 'a') {
        if (s.targetLane > 0) s.targetLane--;
        e.preventDefault();
      } else if (k === 'arrowright' || k === 'd') {
        if (s.targetLane < 2) s.targetLane++;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', s._onKeyDown);
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    s.elapsed += dt;
    s.timeLeft -= dt;
    if (s.timeLeft <= 0) { mgSuccess(s.zone); return; }

    // La route défile de plus en plus vite : réflexes garantis
    const speed = 400 + s.elapsed * 16;
    s.scroll = (s.scroll + speed * dt) % 60;

    // Glisse douce vers la voie visée
    const targetX = s.roadX + s.laneW * (s.targetLane + 0.5);
    const dx = targetX - s.bikeX;
    s.bikeX += Math.sign(dx) * Math.min(Math.abs(dx), 460 * dt);

    // Apparition des obstacles : jamais 3 voitures près du haut de l'écran
    // (sinon un "mur" de voitures rendrait la partie impossible)
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      s.spawnTimer = Math.max(0.30, 0.75 - s.elapsed * 0.016);
      const carsNearTop = s.obstacles.filter(o => o.type === 'car' && o.y < 70).length;
      const isCar = Math.random() < 0.55 && carsNearTop < 2;
      const lane = Math.floor(Math.random() * 3);
      s.obstacles.push({
        type: isCar ? 'car' : 'cone',
        lane,
        x: s.roadX + s.laneW * (lane + 0.5),
        y: -70,
        color: ['#c62828', '#2f5aa8', '#456a2a', '#7a1f7f', '#b8860b'][Math.floor(Math.random() * 5)]
      });
    }

    // Étoile bonus : on l'ajoute dans une voie où aucun obstacle n'arrive juste derrière
    if (s.bonusPlan.length && s.elapsed >= s.bonusPlan[0]) {
      const libres = [0, 1, 2].filter(l => !s.obstacles.some(o => o.lane === l && o.y < 120));
      if (libres.length) {
        const lane = libres[Math.floor(Math.random() * libres.length)];
        s.bonusPlan.shift();
        s.obstacles.push({ type: 'star', lane, x: s.roadX + s.laneW * (lane + 0.5), y: -70 });
      }
    }
    for (let i = s.obstacles.length - 1; i >= 0; i--) {
      const o = s.obstacles[i];
      o.y += speed * dt;
      if (o.y > canvas.height + 90) { s.obstacles.splice(i, 1); continue; }
      if (o.type === 'star') {
        if (Math.abs(o.x - s.bikeX) < 34 && Math.abs(o.y - s.bikeY) < 44) { bonusCollect(s, o.x, o.y); s.obstacles.splice(i, 1); }
        continue;
      }
      if (Math.abs(o.x - s.bikeX) >= 34) continue;
      const bTop = s.bikeY - 26;
      const bBot = s.bikeY + 26;
      if (o.type === 'car') {
        if (o.y - 42 < bBot && o.y + 42 > bTop) { mgFail(s.zone, 'Crash ! Tu as percuté une voiture !'); return; }
      } else {
        if (o.y - 14 < bBot && o.y + 14 > bTop) { mgFail(s.zone, 'Crash ! Tu as percuté un cône !'); return; }
      }
    }

    // ---- Dessin : autoroute la nuit ----
    ctx.fillStyle = '#2a3b2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3a3f45';
    ctx.fillRect(s.roadX, 0, s.roadW, canvas.height);
    ctx.fillStyle = '#d3b57f';
    ctx.fillRect(s.roadX - 8, 0, 8, canvas.height);
    ctx.fillRect(s.roadX + s.roadW, 0, 8, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 4;
    ctx.setLineDash([26, 34]);
    ctx.lineDashOffset = -s.scroll;
    for (let i = 1; i < 3; i++) {
      const lx = s.roadX + s.laneW * i;
      ctx.beginPath(); ctx.moveTo(lx, -60); ctx.lineTo(lx, canvas.height + 60); ctx.stroke();
    }
    ctx.setLineDash([]);

    s.obstacles.forEach(o => {
      if (o.type === 'car') {
        ctx.fillStyle = o.color;
        ctx.fillRect(o.x - 23, o.y - 42, 46, 84);
        ctx.fillStyle = 'rgba(140,200,255,0.85)';
        ctx.fillRect(o.x - 19, o.y - 36, 38, 14);
        ctx.fillRect(o.x - 19, o.y + 6, 38, 12);
        ctx.strokeStyle = '#101418'; ctx.lineWidth = 3;
        ctx.strokeRect(o.x - 23, o.y - 42, 46, 84);
      } else if (o.type === 'star') {
        bonusDraw(ctx, o.x, o.y, 20);
      } else {
        ctx.fillStyle = '#e8722c';
        ctx.beginPath();
        ctx.moveTo(o.x - 14, o.y + 14);
        ctx.lineTo(o.x, o.y - 16);
        ctx.lineTo(o.x + 14, o.y + 14);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#7a3a10'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillRect(o.x - 10, o.y + 2, 20, 5);
      }
    });

    // Tristan : son sprite vu de dos s'il est chargé, sinon moto dessinée
    const bikeTop = s.bikeY;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(s.bikeX, s.bikeY + 28, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const titanEntry = SPRITES['tristan'];
    if (titanEntry && titanEntry.img.complete && titanEntry.img.naturalWidth > 0) {
      const img = titanEntry.img;
      const row = SPRITE_ROW_INDEX.up; // il roule vers le haut de l'écran
      const cell = mgSpriteCell(titanEntry, row, 0);
      const displayH = 72;
      const displayW = displayH * (cell.w / cell.h);
      ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h,
        s.bikeX - displayW / 2, bikeTop - 20, displayW, displayH);
    } else {
      ctx.fillStyle = '#c62828';
      ctx.fillRect(s.bikeX - 8, bikeTop - 6, 16, 34);
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(s.bikeX - 12, bikeTop + 28, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s.bikeX + 12, bikeTop + 28, 9, 0, Math.PI * 2); ctx.fill();
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🏍️', s.bikeX, bikeTop - 4);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(10, 10, 280, 64);
    ctx.fillStyle = '#ffd76b';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`⏱ ${s.timeLeft.toFixed(1)}s`, 22, 18);
    ctx.fillStyle = '#cfe8d9';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Survis 25s sur l'autoroute folle !`, 22, 44);
    bonusDrawPops(ctx, s, dt);
    bonusHud(ctx, s, canvas.width - 10, 10);
  },
  cleanup() {
    if (mgState) window.removeEventListener('keydown', mgState._onKeyDown);
  }
};
