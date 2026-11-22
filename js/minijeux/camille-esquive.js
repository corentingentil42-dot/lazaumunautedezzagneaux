/* ============================================================
   js/minijeux/camille-esquive.js — Mini-jeu de Camille : esquive des citrons (type 'esquive', étoiles bonus).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

MINIGAMES['esquive'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.player = { x: canvas.width/2, y: canvas.height - 60, r: 18 };
    s.citrons = []; s.timeLeft = 30;
    bonusInit(s); s.bonusStars = []; s.bonusPlan = [7, 17]; // 2 étoiles bonus : à 7 s puis à 17 s de jeu
    s.pending = []; // alertes : annoncent les citrons AVANT qu'ils n'arrivent
    s.spawnTimer = 0; s.spawnInterval = 1.1;
    s.keys = {};
    s._onKeyDown = (e) => { s.keys[e.key.toLowerCase()] = true; };
    s._onKeyUp = (e) => { s.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', s._onKeyDown);
    window.addEventListener('keyup', s._onKeyUp);
    s.lastT = performance.now();
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now; s.timeLeft -= dt;
    const k = dt * 60; // = 1 à 60 images/s : la vitesse ne dépend plus de la fréquence de l'écran
    if (s.timeLeft <= 0) { mgSuccess(s.zone); return; }
    const p = s.player;
    let dx = 0, dy = 0;
    if (s.keys['arrowup'] || s.keys['z'] || s.keys['w']) dy -= 1;
    if (s.keys['arrowdown'] || s.keys['s']) dy += 1;
    if (s.keys['arrowleft'] || s.keys['q'] || s.keys['a']) dx -= 1;
    if (s.keys['arrowright'] || s.keys['d']) dx += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      p.x += (dx/len) * 4.5 * k; p.y += (dy/len) * 4.5 * k;
    }
    p.x = Math.max(p.r, Math.min(canvas.width - p.r, p.x));
    p.y = Math.max(p.r, Math.min(canvas.height - p.r, p.y));
    // Étoiles bonus : posées loin de toi, elles disparaissent après 8 s
    if (s.bonusPlan.length && (30 - s.timeLeft) >= s.bonusPlan[0]) {
      s.bonusPlan.shift();
      let bx = 0, by = 0;
      for (let tries = 0; tries < 30; tries++) {
        bx = 70 + Math.random() * (canvas.width - 140); by = 70 + Math.random() * (canvas.height - 140);
        if (Math.hypot(bx - p.x, by - p.y) > 230) break;
      }
      s.bonusStars.push({ x: bx, y: by, r: 17, life: 8 });
    }
    for (let i = s.bonusStars.length - 1; i >= 0; i--) {
      const b = s.bonusStars[i];
      b.life -= dt;
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r) { bonusCollect(s, b.x, b.y); s.bonusStars.splice(i, 1); continue; }
      if (b.life <= 0) s.bonusStars.splice(i, 1);
    }
    s.spawnTimer += dt;
    if (s.spawnTimer > s.spawnInterval) {
      s.spawnTimer = 0;
      s.spawnInterval = Math.max(0.55, s.spawnInterval * 0.94);
      const edge = Math.floor(Math.random() * 4);
      let cx, cy, vx, vy;
      const speed = 2.4 + Math.random() * 1.8;
      if (edge === 0) { cx = Math.random() * canvas.width; cy = -20; vx = 0; vy = speed; }
      else if (edge === 1) { cx = canvas.width + 20; cy = Math.random() * canvas.height; vx = -speed; vy = 0; }
      else if (edge === 2) { cx = Math.random() * canvas.width; cy = canvas.height + 20; vx = 0; vy = -speed; }
      else { cx = -20; cy = Math.random() * canvas.height; vx = speed; vy = 0; }
      const tx = p.x - cx, ty = p.y - cy;
      const tl = Math.hypot(tx, ty) || 1;
      vx = (vx * 0.6 + (tx / tl) * speed * 0.6);
      vy = (vy * 0.6 + (ty / tl) * speed * 0.6);
      // Le citron n'apparaît pas tout de suite : une alerte clignotante
      // traverse tout l'écran pendant 0,85 s pour montrer son couloir.
      s.pending.push({ cx, cy, vx, vy, t: 0.85 });
    }
    // Les alertes arrivées à terme se transforment en vrais citrons
    for (let i = s.pending.length - 1; i >= 0; i--) {
      const w = s.pending[i];
      w.t -= dt;
      if (w.t <= 0) {
        s.citrons.push({ x: w.cx, y: w.cy, vx: w.vx, vy: w.vy, r: 26 });
        s.pending.splice(i, 1);
      }
    }
    for (let i = s.citrons.length - 1; i >= 0; i--) {
      const c = s.citrons[i];
      c.x += c.vx * k; c.y += c.vy * k;
      if (c.x < -50 || c.x > canvas.width + 50 || c.y < -50 || c.y > canvas.height + 50) {
        s.citrons.splice(i, 1); continue;
      }
      if (Math.hypot(c.x - p.x, c.y - p.y) < c.r + p.r) { mgFail(s.zone, 'Touché !'); return; }
    }
    ctx.fillStyle = '#2a1f1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Alertes clignotantes : une large bande jaune translucide, AUSSI GROSSE
    // QUE LE CITRON, traverse tout l'écran le long de sa trajectoire exacte.
    s.pending.forEach(w => {
      const blink = 0.13 + 0.20 * Math.abs(Math.sin(performance.now() / 90));
      const vl = Math.hypot(w.vx, w.vy) || 1;
      ctx.strokeStyle = `rgba(245,208,32,${blink})`;
      ctx.lineWidth = 52; // le diamètre du citron : on voit son vrai couloir
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(w.cx - (w.vx / vl) * 40, w.cy - (w.vy / vl) * 40);
      // Assez long pour traverser l'écran de part en part (diagonale ≈ 943px)
      ctx.lineTo(w.cx + (w.vx / vl) * 1100, w.cy + (w.vy / vl) * 1100);
      ctx.stroke();
    });
    s.citrons.forEach(c => {
      ctx.fillStyle = '#f5d020';
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#a88a10'; ctx.lineWidth = 2; ctx.stroke();
    });
    s.bonusStars.forEach(b => bonusDraw(ctx, b.x, b.y, b.r, b.life < 2));
    ctx.fillStyle = '#7bc8ff';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    bonusDrawPops(ctx, s, dt);
    bonusHud(ctx, s, canvas.width - 10, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(10, 10, 200, 40);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`⏱ ${s.timeLeft.toFixed(1)}s`, 22, 18);
  },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      window.removeEventListener('keyup', mgState._onKeyUp);
    }
  }
};
