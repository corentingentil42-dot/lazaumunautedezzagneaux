/* ============================================================
   js/minijeux/coco-course.js — Mini-jeu de Coco : la course à vélo (type 'course').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ===== Mini-jeux essentiels (garde les tiens si tu en as plus) ===== */
/* ===== COURSE DE COCO : le Circuit =====
   Vraie course à vélo en vue de dessus : la route serpente vers le haut,
   on dirige avec ← →, ↑ accélère, ↓ freine. Reste sur la route (l'herbe
   freine énormément), chevauche les boosts ⚡ et passe les 4 rangs avant
   d'atteindre l'arrivée — avant la fin du chrono ! */
MINIGAMES['course'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.courseLen = 5200;   // longueur du circuit en px (= 520 m affichés)
    s.timeLimit = 42;     // chrono
    s.wy = 0;             // position du vélo sur le circuit
    s.x = 400;            // position latérale du vélo
    s.speed = 0;
    s.boost = 0;          // temps de boost restant (s)
    s.shake = 0;
    s.wheelSpin = 0;
    s.dustT = 0;
    s.keys = {};
    s.particles = [];
    // Hash pseudo-aléatoire déterministe : la déco est identique à chaque run
    s.hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    // La route serpente : centre et demi-largeur en fonction de l'avancée
    s.pathX = (wy) => 400 + Math.sin(wy * 0.0038) * 150 + Math.sin(wy * 0.0011 + 2) * 90;
    s.pathW = (wy) => 62 + Math.sin(wy * 0.0026 + 1) * 10;
    // Boosts : chevrons à chevaucher sur la route
    s.pads = [];
    for (let i = 1; 320 + i * 520 < s.courseLen - 350; i++) {
      s.pads.push({ wy: 320 + i * 520, off: (s.hash(i * 7.3) * 2 - 1) * 34, taken: false });
    }
    // Rangs : 4 damiers à franchir avant l'arrivée
    s.gates = [];
    for (let i = 1; i <= 4; i++) s.gates.push({ wy: (i / 5) * s.courseLen, n: i, passed: false });
    s._onKeyDown = (e) => { s.keys[e.key.toLowerCase()] = true; };
    s._onKeyUp = (e) => { s.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', s._onKeyDown);
    window.addEventListener('keyup', s._onKeyUp);
    s.lastT = performance.now();
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    s.timeLimit -= dt;
    s.shake = Math.max(0, s.shake - dt * 6);
    if (s.timeLimit <= 0) {
      mgFail(s.zone, `Temps écoulé ! Tu as fait ${Math.min(999, Math.round(s.wy / 10))} m sur 520 m.`);
      return;
    }
    const W = canvas.width, H = canvas.height;
    const bikeSY = 390; // le vélo reste à cette hauteur à l'écran
    const wyToSY = (wy) => bikeSY - (wy - s.wy);

    // --- Contrôles ---
    let steer = 0;
    if (s.keys['arrowleft'] || s.keys['q'] || s.keys['a']) steer = -1;
    if (s.keys['arrowright'] || s.keys['d']) steer = 1;
    const gas = s.keys['arrowup'] || s.keys['z'] || s.keys['w'];
    const brake = s.keys['arrowdown'] || s.keys['s'];
    s.x += steer * 300 * dt;
    s.x = Math.max(24, Math.min(W - 24, s.x));

    // --- Vitesse : route / herbe / boost ---
    const roadC = s.pathX(s.wy), roadW = s.pathW(s.wy);
    const onRoad = Math.abs(s.x - roadC) < roadW;
    let target = 235;
    if (gas) target *= 1.18;
    if (brake) target *= 0.6;
    if (!onRoad) target *= 0.4;
    if (s.boost > 0) { target *= 1.75; s.boost -= dt; }
    s.speed += (target - s.speed) * Math.min(1, dt * 5);
    s.wy += s.speed * dt;
    s.wheelSpin += s.speed * dt * 0.045;
    if (s.wy >= s.courseLen) { mgSuccess(s.zone); return; }
    for (const g of s.gates) if (!g.passed && s.wy >= g.wy) g.passed = true;

    // --- Boosts : chevauchement d'un chevron ---
    for (const pad of s.pads) {
      if (!pad.taken && Math.abs(pad.wy - s.wy) < 24
        && Math.abs(s.x - (s.pathX(pad.wy) + pad.off)) < 46) {
        pad.taken = true;
        s.boost = 1.5; s.shake = 1;
        for (let k = 0; k < 10; k++) {
          s.particles.push({ x: s.x + (Math.random() * 30 - 15), wy: s.wy - 8, vy: -120 - Math.random() * 120, life: 0.35 + Math.random() * 0.25, r: 2 + Math.random() * 3, col: Math.random() < 0.5 ? '255,160,40' : '255,215,107' });
        }
      }
    }
    // Poussière dans l'herbe
    s.dustT -= dt;
    if (!onRoad && s.dustT <= 0) {
      s.dustT = 0.035;
      s.particles.push({ x: s.x + (Math.random() * 16 - 8), wy: s.wy - 14, vy: -50, life: 0.5, r: 3 + Math.random() * 3, col: '150,180,110' });
    }
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life -= dt; p.wy += p.vy * dt;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    // ==================  DESSIN  ==================
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 5 * s.shake, (Math.random() - 0.5) * 5 * s.shake);

    // Herbe de fond + taches de texture (déterministes par bande de 60px)
    const grassGrad = ctx.createLinearGradient(0, 0, 0, H);
    grassGrad.addColorStop(0, '#548a41'); grassGrad.addColorStop(1, '#6fb054');
    ctx.fillStyle = grassGrad; ctx.fillRect(-8, -8, W + 16, H + 16);
    for (let sy = -60; sy < H + 60; sy += 60) {
      const band = Math.floor((s.wy + bikeSY - sy) / 60);
      for (let j = 0; j < 3; j++) {
        const bx = s.hash(band * 3.7 + j * 13.1) * W;
        const by = sy + s.hash(band * 9.1 + j * 5.3) * 60 - 30;
        const r = 16 + s.hash(band * 4.3 + j) * 18;
        ctx.fillStyle = (band % 2) ? 'rgba(96,170,76,0.55)' : 'rgba(63,127,54,0.45)';
        ctx.beginPath(); ctx.ellipse(bx, by, r, r * 0.55, 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Route : échantillonnage tous les 20px d'écran, puis polygone rempli
    const samples = [];
    for (let sy = H; sy >= -40; sy -= 20) {
      const wy = s.wy + bikeSY - sy;
      samples.push({ sy, wy, x: s.pathX(wy), w: s.pathW(wy) });
    }
    ctx.beginPath();
    samples.forEach((sm, i) => { const X = sm.x - sm.w; if (i === 0) ctx.moveTo(X, sm.sy); else ctx.lineTo(X, sm.sy); });
    for (let i = samples.length - 1; i >= 0; i--) ctx.lineTo(samples[i].x + samples[i].w, samples[i].sy);
    ctx.closePath();
    ctx.fillStyle = '#c19a63'; ctx.fill();
    // bandes latérales + ligne centrale pointillée
    const edgeLine = (side) => {
      ctx.beginPath();
      samples.forEach((sm, i) => { const X = sm.x + side * (sm.w - 5); if (i === 0) ctx.moveTo(X, sm.sy); else ctx.lineTo(X, sm.sy); });
      ctx.strokeStyle = '#f2e6c8'; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.stroke(); ctx.setLineDash([]);
    };
    edgeLine(-1); edgeLine(1);
    ctx.beginPath();
    samples.forEach((sm, i) => { const X = sm.x; if (i === 0) ctx.moveTo(X, sm.sy); else ctx.lineTo(X, sm.sy); });
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2.5; ctx.setLineDash([16, 20]); ctx.stroke(); ctx.setLineDash([]);
    // traces de pneus légèrement ondulées
    for (const side of [-1, 1]) {
      ctx.beginPath();
      samples.forEach((sm, i) => { const X = sm.x + side * 15 + Math.sin(sm.wy * 0.02 + side) * 10; if (i === 0) ctx.moveTo(X, sm.sy); else ctx.lineTo(X, sm.sy); });
      ctx.strokeStyle = 'rgba(90,70,45,0.22)'; ctx.lineWidth = 5; ctx.stroke();
    }

    // Déco au bord de la route : arbres, fleurs, rochers (déterministes)
    for (let sy = -80; sy < H + 80; sy += 90) {
      const band = Math.floor((s.wy + bikeSY - sy) / 90);
      for (let side = -1; side <= 1; side += 2) {
        for (let j = 0; j < 2; j++) {
          const wy = s.wy + bikeSY - (sy + s.hash(band * 2.3 + j * 7.7 + side) * 90);
          const off = s.pathW(wy) + 30 + s.hash(band * 6.1 + j * 3.3 + side) * 66;
          const dx = s.pathX(wy) + side * off;
          if (dx < -30 || dx > W + 30) continue;
          const dy = wyToSY(wy);
          const kind = s.hash(band * 8.9 + j * 1.7 + side);
          if (kind < 0.5) { // arbre
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath(); ctx.ellipse(dx, dy + 12, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#6b4222'; ctx.fillRect(dx - 3, dy - 4, 6, 16);
            ctx.fillStyle = '#3f7f36';
            ctx.beginPath(); ctx.arc(dx, dy - 12, 13, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#5aa347';
            ctx.beginPath(); ctx.arc(dx - 4, dy - 16, 8, 0, Math.PI * 2); ctx.fill();
          } else if (kind < 0.8) { // fleurs
            for (let f = 0; f < 3; f++) {
              const fx = dx + (s.hash(band + f * 3.1) * 22 - 11);
              const fy = dy + (s.hash(band + f * 7.7) * 22 - 11);
              ctx.fillStyle = ['#e5657e', '#f2c14e', '#a2c8e1'][Math.floor(s.hash(band + f) * 3)];
              ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = '#fff';
              ctx.beginPath(); ctx.arc(fx, fy, 1, 0, Math.PI * 2); ctx.fill();
            }
          } else { // rocher
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.beginPath(); ctx.ellipse(dx, dy + 6, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#8b8b86';
            ctx.beginPath(); ctx.ellipse(dx, dy, 8, 6, 0.3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#a3a39e';
            ctx.beginPath(); ctx.ellipse(dx - 2, dy - 2, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    }

    // Damiers (départ / rangs / arrivée)
    const drawChecker = (wy, label, passed) => {
      const sy = wyToSY(wy);
      if (sy < -50 || sy > H + 50) return;
      const x0 = s.pathX(wy), w = s.pathW(wy);
      for (let i = -w; i < w; i += 14) {
        const cell = Math.floor((i + 4000) / 14);
        ctx.fillStyle = (cell % 2 === 0) ? '#1b2735' : '#f2f2f2';
        ctx.fillRect(x0 + i, sy - 7, 14, 14);
      }
      ctx.fillStyle = '#6b4a2a';
      ctx.fillRect(x0 - w - 12, sy - 15, 9, 30);
      ctx.fillRect(x0 + w + 3, sy - 15, 9, 30);
      ctx.font = `bold ${(label === '🏁 ARRIVÉE !' ? 17 : 13)}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = passed ? '#7be38b' : '#ffd76b';
      ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 3;
      ctx.strokeText(label, x0, sy + 30);
      ctx.fillText(label, x0, sy + 30);
    };
    drawChecker(0, 'DÉPART', true);
    for (const g of s.gates) drawChecker(g.wy, g.passed ? `✓ RANG ${g.n}` : `RANG ${g.n}`, g.passed);
    if (wyToSY(s.courseLen) < H + 60) drawChecker(s.courseLen, '🏁 ARRIVÉE !', false);

    // Boosts : plaques à chevrons
    const pulse = 0.5 + 0.5 * Math.sin(now / 130);
    for (const pad of s.pads) {
      const sy = wyToSY(pad.wy);
      if (sy < -30 || sy > H + 30) continue;
      const px = s.pathX(pad.wy) + pad.off;
      ctx.save(); ctx.translate(px, sy);
      ctx.fillStyle = pad.taken ? 'rgba(200,200,200,0.22)' : `rgba(255,200,60,${(0.55 + 0.3 * pulse).toFixed(3)})`;
      ctx.strokeStyle = pad.taken ? 'rgba(200,200,200,0.3)' : `rgba(255,150,30,${(0.7 + 0.3 * pulse).toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-42, -18, 84, 36, 8); else ctx.rect(-42, -18, 84, 36);
      ctx.fill(); ctx.stroke();
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = pad.taken ? 'rgba(120,120,120,0.35)' : (k === 1 ? '#fff' : '#7a3a00');
        ctx.beginPath();
        ctx.moveTo(-24, 14 - k * 10);
        ctx.lineTo(0, 5 - k * 10);
        ctx.lineTo(24, 14 - k * 10);
        ctx.lineTo(24, 20 - k * 10);
        ctx.lineTo(0, 11 - k * 10);
        ctx.lineTo(-24, 20 - k * 10);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    // Particules (poussière / flammes de boost)
    for (const p of s.particles) {
      const sy = wyToSY(p.wy);
      ctx.fillStyle = `rgba(${p.col},${Math.max(0, Math.min(1, p.life * 2)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, sy, p.r, 0, Math.PI * 2); ctx.fill();
    }

    // Vélo + Coco (vue de dessus, il pédale vers le haut de l'écran)
    const lean = steer * 0.15;
    const bounce = Math.sin(s.wheelSpin * 3) * 1.4;
    if (s.boost > 0) {
      ctx.fillStyle = 'rgba(255,160,40,0.22)';
      ctx.beginPath(); ctx.arc(s.x, bikeSY, 46, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(s.x, bikeSY + 30, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(s.x, bikeSY + bounce);
    ctx.rotate(lean);
    // roues (avant / arrière, vues de dessus)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-4.5, -30, 9, 22);
    ctx.fillRect(-5.5, 12, 11, 26);
    ctx.fillStyle = '#555';
    ctx.fillRect(-3.5, -30, 7, 4);
    // cadre orange + guidon
    ctx.strokeStyle = '#e07b39'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, -21); ctx.lineTo(15, -21); ctx.stroke();
    ctx.strokeStyle = '#a84f1e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-10, -22); ctx.lineTo(-6, -26); ctx.moveTo(10, -22); ctx.lineTo(6, -26); ctx.stroke();
    ctx.restore();
    // Coco au-dessus du cadre (rang "dos" du sprite : il roule vers le haut)
    const cocoEntry = SPRITES['coco'];
    if (cocoEntry && cocoEntry.img.complete && cocoEntry.img.naturalWidth > 0) {
      const cell = mgSpriteCell(cocoEntry, SPRITE_ROW_INDEX.up, Math.floor(s.wheelSpin) % cocoEntry.cols);
      const displayH = 46;
      const displayW = displayH * (cell.w / cell.h);
      ctx.drawImage(cocoEntry.img, cell.x, cell.y, cell.w, cell.h,
        s.x - displayW / 2, bikeSY - 30 + bounce, displayW, displayH);
    } else {
      ctx.fillStyle = '#2f5aa8';
      ctx.fillRect(s.x - 9, bikeSY - 28 + bounce, 18, 26);
      ctx.fillStyle = '#f0c39a';
      ctx.beginPath(); ctx.arc(s.x, bikeSY - 32 + bounce, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); // fin shake

    // ==================  HUD  ==================
    // Chrono + vitesse
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(10, 10, 158, 62);
    ctx.fillStyle = s.timeLimit < 8 ? '#ff8a65' : '#ffd76b';
    ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`⏱ ${Math.max(0, s.timeLimit).toFixed(1)}s`, 22, 16);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '13px sans-serif';
    ctx.fillText(`🚴 ${(s.speed * 0.135).toFixed(0)} km/h`, 22, 48);
    // Barre de progression du circuit (avec rangs + arrivée)
    const bw = 420, bx = (W - bw) / 2, by = 18;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(bx - 8, by - 6, bw + 16, 24);
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(bx, by, bw, 12);
    const prog = Math.min(1, s.wy / s.courseLen);
    const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    pg.addColorStop(0, '#ffd76b'); pg.addColorStop(1, '#ffb84d');
    ctx.fillStyle = pg; ctx.fillRect(bx, by, bw * prog, 12);
    for (const g of s.gates) {
      ctx.fillStyle = g.passed ? '#7be38b' : '#f2f2f2';
      ctx.fillRect(bx + bw * (g.wy / s.courseLen) - 1.5, by - 3, 3, 18);
    }
    ctx.fillStyle = '#ff5252'; ctx.fillRect(bx + bw - 2, by - 3, 4, 18);
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🚴', bx + bw * prog, by + 6);
    // Indicateurs d'état
    ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    if (s.boost > 0) {
      ctx.fillStyle = `rgba(255,215,107,${(0.7 + 0.3 * pulse).toFixed(3)})`;
      ctx.fillText('⚡ BOOST !', W - 16, 14);
    } else if (!onRoad) {
      ctx.fillStyle = 'rgba(255,82,82,0.95)';
      ctx.fillText("🌱 DANS L'HERBE — RALENTI !", W - 16, 14);
    }
    // Distance restante
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(10, H - 34, 200, 24);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '13px sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText(`🏁 encore ${Math.max(0, Math.ceil((s.courseLen - s.wy) / 10))} m`, 20, H - 22);
  },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      window.removeEventListener('keyup', mgState._onKeyUp);
    }
  }
};
