/* ============================================================
   js/minijeux/perline-blagues.js — Mini-jeu de Perline : les blagues (type 'blagues').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// Les vraies blagues (pourries, comme il se doit) que Perline balance sur scène
const BERLINE_JOKES = [
  "Pourquoi les plongeurs plongent-ils en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau !",
  "Si un menuisier n'a pas d'outils... il est démuni !",
  "Qu'est-ce qui est jaune et qui attend ? ... Jonathan !",
  "Quelle est la femelle du hamster ? L'Amsterdam !",
  "Qu'est-ce qu'un chat qui vient de manger un canard ? Un chat-canard-scié !",
  "C'est l'histoire d'un fil électrique qui traverse la route... il s'est fait arrêter, il n'avait pas de code !",
  "Quel est le sport le plus silencieux ? Le para-chute !",
  "Pourquoi les squelettes ne se battent jamais entre eux ? Ils n'ont pas le cran !",
  "Toc toc. Qui est là ? ... Personne, c'est juste pour l'ambiance."
];

MINIGAMES['blagues'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.timeLeft = 45;
    s.laughs = 0; s.target = 30;
    s.lives = 3;
    s.bubbles = [];
    s.spawnTimer = 0.35;
    s.elapsed = 0;
    s.lastT = performance.now();
    // ---- Ambiance de scène animée ----
    s.idleT = 0;
    s.stars = Array.from({ length: 14 }, () => ({
      x: Math.random() < 0.5 ? 10 + Math.random() * 45 : canvas.width - 55 + Math.random() * 45,
      y: Math.random() * canvas.height,
      phase: Math.random() * Math.PI * 2,
      speed: 1.2 + Math.random() * 1.6
    }));
    s.audienceCheer = 0;
    s.jokePhase = 'gap';
    s.jokePhaseTimer = 0.8;
    s.jokeElapsed = 0;
    s.currentJoke = null;
    s.lastJokeIdx = -1;
    s._onClick = (evt) => {
      const pos = mgPointerPos(canvas, evt);
      for (let i = s.bubbles.length - 1; i >= 0; i--) {
        const b = s.bubbles[i];
        if (Math.hypot(pos.x - b.x, pos.y - b.y) <= b.r) {
          s.bubbles.splice(i, 1);
          if (b.good) {
            s.laughs++;
            s.audienceCheer = 0.7;
            if (s.laughs >= s.target) { mgSuccess(s.zone); }
          } else {
            s.lives--;
            if (s.lives <= 0) { mgFail(s.zone, "Trop de blagues nulles, le public s'en va !"); }
          }
          break;
        }
      }
    };
    canvas.addEventListener('click', s._onClick);
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    s.timeLeft -= dt;
    s.elapsed += dt;
    s.idleT += dt;
    if (s.audienceCheer > 0) s.audienceCheer = Math.max(0, s.audienceCheer - dt);
    if (s.timeLeft <= 0) { mgFail(s.zone, 'Temps écoulé !'); return; }

    // Ça devient progressivement plus corsé : plus de bulles, plus rapides,
    // et davantage de mauvaises blagues à éviter au fil du temps.
    const ramp = Math.min(1, s.elapsed / 45);
    const spawnMin = 0.30 - ramp * 0.14;
    const spawnRange = 0.30 - ramp * 0.14;
    const goodChance = 0.52 - ramp * 0.22;
    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      s.spawnTimer = spawnMin + Math.random() * spawnRange;
      s.bubbles.push({
        x: 60 + Math.random() * (canvas.width - 120),
        y: canvas.height + 30,
        r: 20 + Math.random() * 9,
        vy: -(95 + ramp * 60 + Math.random() * 70),
        wobble: Math.random() * Math.PI * 2,
        good: Math.random() < goodChance
      });
    }
    for (let i = s.bubbles.length - 1; i >= 0; i--) {
      const b = s.bubbles[i];
      b.wobble += dt * 2;
      b.y += b.vy * dt;
      b.x += Math.sin(b.wobble) * 0.6 * dt * 60;
      if (b.y < -40) s.bubbles.splice(i, 1);
    }

    // Cycle des blagues affichées dans la bulle de Perline
    s.jokePhaseTimer -= dt;
    if (s.jokePhase === 'gap' && s.jokePhaseTimer <= 0) {
      let idx = Math.floor(Math.random() * BERLINE_JOKES.length);
      if (BERLINE_JOKES.length > 1 && idx === s.lastJokeIdx) idx = (idx + 1) % BERLINE_JOKES.length;
      s.lastJokeIdx = idx;
      s.currentJoke = BERLINE_JOKES[idx];
      s.jokePhase = 'show';
      s.jokeElapsed = 0;
      s.jokePhaseTimer = 3.4 + Math.min(2.2, s.currentJoke.length * 0.028);
    } else if (s.jokePhase === 'show') {
      s.jokeElapsed += dt;
      if (s.jokePhaseTimer <= 0) {
        s.jokePhase = 'gap';
        s.jokePhaseTimer = 1.6 + Math.random() * 1.6;
      }
    }

    // ---- Dessin : fond de scène animé ----
    const hueShift = Math.sin(s.idleT * 0.25) * 6;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, `hsl(${272 + hueShift}, 42%, ${22 + Math.sin(s.idleT*0.4)*2}%)`);
    grad.addColorStop(1, '#1b1024');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Halo de projecteur qui balaie doucement la scène
    const spotSwing = Math.sin(s.idleT * 0.55) * 70;
    const spotX = canvas.width / 2 + spotSwing;
    const spot = ctx.createRadialGradient(spotX, 170, 25, spotX, 170, 260);
    spot.addColorStop(0, 'rgba(255,244,200,0.22)');
    spot.addColorStop(1, 'rgba(255,244,200,0)');
    ctx.fillStyle = spot;
    ctx.beginPath(); ctx.arc(spotX, 170, 260, 0, Math.PI * 2); ctx.fill();

    // Rideaux de scène (léger frémissement)
    const curtainWave = Math.sin(s.idleT * 1.4) * 3;
    ctx.fillStyle = 'rgba(180,40,60,0.35)';
    ctx.fillRect(0 + curtainWave, 0, 60, canvas.height);
    ctx.fillRect(canvas.width - 60 - curtainWave, 0, 60, canvas.height);
    // filets dorés sur les rideaux
    ctx.strokeStyle = 'rgba(255,215,120,0.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(12 + i * 12 + curtainWave, 0);
      ctx.quadraticCurveTo(18 + i * 12 + curtainWave + Math.sin(s.idleT+i)*4, canvas.height/2, 12 + i * 12 + curtainWave, canvas.height);
      ctx.stroke();
    }

    // Étoiles / paillettes scintillantes près des rideaux
    s.stars.forEach(st => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(s.idleT * st.speed + st.phase));
      ctx.fillStyle = `rgba(255,235,180,${tw * 0.8})`;
      ctx.beginPath(); ctx.arc(st.x, st.y, 1.6, 0, Math.PI * 2); ctx.fill();
    });

    // Silhouettes du public (bob léger + "applaudissement" quand une blague passe bien)
    const cheer = s.audienceCheer > 0;
    for (let i = 0; i < 9; i++) {
      const hx = 70 + i * ((canvas.width - 140) / 8);
      const bob = Math.sin(s.idleT * 2 + i * 0.7) * (cheer ? 4 : 1.5);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.arc(hx, canvas.height - 30 + bob, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(hx - 14, canvas.height - 16 + bob, 28, 20);
      if (cheer) {
        // petits bras levés qui flashent pendant les applaudissements
        ctx.fillStyle = `rgba(255,215,107,${s.audienceCheer})`;
        ctx.fillRect(hx - 18, canvas.height - 30 + bob, 4, 12);
        ctx.fillRect(hx + 14, canvas.height - 30 + bob, 4, 12);
      }
    }

    // ---- Perline sur scène, au centre-fond ----
    const stageCx = canvas.width / 2;
    const standY = 228;
    const perlineBob = Math.sin(s.idleT * 2.2) * 4;
    ctx.fillStyle = 'rgba(255,230,150,0.16)';
    ctx.beginPath(); ctx.ellipse(stageCx, standY + 8, 86, 20, 0, 0, Math.PI * 2); ctx.fill();

    const berlineEntry = SPRITES['berline'];
    let headAnchorY;
    if (berlineEntry && berlineEntry.img.complete && berlineEntry.img.naturalWidth > 0) {
      const img = berlineEntry.img;
      const idleCol = Math.floor(s.idleT * 0.7) % Math.max(1, Math.min(2, berlineEntry.cols));
      const cell = mgSpriteCell(berlineEntry, SPRITE_ROW_INDEX.down, idleCol);
      const displayH = 195;
      const displayW = displayH * (cell.w / cell.h);
      const dy = standY - displayH + perlineBob;
      ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h, stageCx - displayW / 2, dy, displayW, displayH);
      headAnchorY = dy + displayH * 0.16;
    } else {
      ctx.font = '118px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('🎭', stageCx, standY + perlineBob);
      headAnchorY = standY - 100 + perlineBob;
    }

    // Bulle de dialogue avec ses blagues (fondu entrée/sortie)
    if (s.jokePhase === 'show' && s.currentJoke) {
      const fadeDur = 0.35;
      let alpha = 1;
      if (s.jokeElapsed < fadeDur) alpha = s.jokeElapsed / fadeDur;
      else if (s.jokePhaseTimer < fadeDur) alpha = Math.max(0, s.jokePhaseTimer / fadeDur);

      ctx.save();
      ctx.globalAlpha = alpha;
      const maxW = 210;
      const lines = mgWrapText(ctx, s.currentJoke, maxW, '12.5px sans-serif');
      const lineH = 16;
      const padding = 10;
      const boxW = maxW + padding * 2;
      const boxH = lines.length * lineH + padding * 2;
      let bx = stageCx + 34;
      if (bx + boxW > canvas.width - 8) bx = canvas.width - 8 - boxW;
      const by = Math.max(6, headAnchorY - boxH - 10);

      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      mgRoundRect(ctx, bx, by, boxW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,30,60,0.55)'; ctx.lineWidth = 1.4; ctx.stroke();
      // petite pointe qui relie la bulle à Perline
      ctx.beginPath();
      ctx.moveTo(stageCx + 6, by + boxH);
      ctx.lineTo(stageCx + 24, by + boxH);
      ctx.lineTo(stageCx + 10, by + boxH + 13);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,30,60,0.55)'; ctx.stroke();

      ctx.fillStyle = '#2a1a2a';
      ctx.font = '12.5px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      lines.forEach((line, i) => ctx.fillText(line, bx + padding, by + padding + i * lineH));
      ctx.restore();
    }

    // ---- Bulles de réaction du public (gameplay) ----
    // Toujours dessinées en dernier : elles restent visibles et cliquables
    // même quand elles passent devant Perline.
    s.bubbles.forEach(b => {
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.good ? '#ffd76b' : '#8a94a0';
      ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = b.good ? '#a87a2a' : '#4a5460'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#1b2735'; ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.good ? '😂' : '😐', b.x, b.y + 1);
    });

    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(10, 10, 240, 78);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`⏱ ${s.timeLeft.toFixed(1)}s`, 22, 18);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '14px sans-serif';
    ctx.fillText(`😂 Rires : ${s.laughs} / ${s.target}`, 22, 46);
    ctx.fillText(`❤️ ${'♥'.repeat(Math.max(0, s.lives))}`, 22, 66);
  },
  cleanup() {
    if (mgState) {
      const canvas = document.getElementById('mgCanvas');
      canvas.removeEventListener('click', mgState._onClick);
    }
  }
};
