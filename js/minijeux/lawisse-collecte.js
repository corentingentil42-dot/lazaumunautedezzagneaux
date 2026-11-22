/* ============================================================
   js/minijeux/lawisse-collecte.js — Mini-jeu de Lawisse : collecte de pièces d'or (type 'collecte').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// ---- Skins du mini-jeu de Lawisse ----
// Dépose tes images dans assets/mini-jeu-lawisse/ sous ces noms exacts :
//   bandit.png (les poursuivants), piege.png (les pièges/crottes), drapeau.png (le bonus)
// Sans fichier présent, un dessin de secours prend automatiquement le relais.
const LAWISSE_SPRITE_PATH = 'assets/mini-jeu-lawisse/';
const LAWISSE_SKIN_KEYS = ['bandit', 'piege', 'drapeau', 'lawisse_head'];
const LAWISSE_SKINS = {};
function loadLawisseSkins() {
  LAWISSE_SKIN_KEYS.forEach(key => {
    const img = new Image();
    img.src = `${LAWISSE_SPRITE_PATH}${key}.png`;
    img.onload = () => { LAWISSE_SKINS[key] = img; };
    img.onerror = () => { /* dessin de secours */ };
  });
}
loadLawisseSkins();

MINIGAMES['collecte'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.player = { x: canvas.width/2, y: canvas.height/2, r: 21 };
    s.timeLeft = 80;
    s.collected = 0;
    s.target = 50;
    s.keys = {};
    s._onKeyDown = (e) => { s.keys[e.key.toLowerCase()] = true; };
    s._onKeyUp = (e) => { s.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', s._onKeyDown);
    window.addEventListener('keyup', s._onKeyUp);
    s.lastT = performance.now();

    // Portrait de Lawisse pour le sprite du joueur (rond avec sa tête dedans)
    s.portraitImg = new Image();
    s.portraitOk = false;
    applyPortraitCascade(s.portraitImg, 'lawisse', () => { s.portraitOk = false; });
    s.portraitImg.onload = () => { s.portraitOk = true; };

    const rnd = (min, max) => min + Math.random() * (max - min);
    const margin = 70;
    s.corners = [
      { x: margin, y: margin },
      { x: canvas.width - margin, y: margin },
      { x: margin, y: canvas.height - margin },
      { x: canvas.width - margin, y: canvas.height - margin }
    ];

    s.coins = [];
    for (let i = 0; i < 7; i++) {
      s.coins.push({ x: rnd(50, canvas.width - 50), y: rnd(50, canvas.height - 50), r: 14, spin: Math.random() * Math.PI * 2 });
    }

    s.traps = [];
    // Jamais de piège sur (ou juste à côté de) la case de départ : sinon la partie finit à la première image (≈ 1 fois sur 8 !)
    for (let i = 0; i < 6; i++) {
      let tx, ty, essais = 0;
      do { tx = rnd(90, canvas.width - 90); ty = rnd(90, canvas.height - 90); essais++; }
      while (essais < 50 && Math.hypot(tx - s.player.x, ty - s.player.y) < 140);
      s.traps.push({ x: tx, y: ty, r: 22 });
    }

    // Bandits : un dans chaque coin au départ, pour ne jamais spawn sur le joueur
    s.bandits = s.corners.map((c, i) => ({
      x: c.x, y: c.y, r: 20,
      speed: (1.0 + Math.random() * 0.4) * 0.85,
      wobble: Math.random() * Math.PI * 2,
      vx: 0, vy: 0,
      frozenTime: 0,
      id: i
    }));

    // Le drapeau : apparaît une fois, à 30s de jeu écoulées
    s.flag = null;
    s.flagSpawned = false;
    s.flagBuffTime = 0; // >0 tant que le bonus (immunité + bandits qui fuient) est actif
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    s.timeLeft -= dt;
    if (s.timeLeft <= 0) { mgFail(s.zone, 'Temps écoulé !'); return; }

    const p = s.player;
    let dx = 0, dy = 0;
    if (s.keys['arrowup'] || s.keys['z'] || s.keys['w']) dy -= 1;
    if (s.keys['arrowdown'] || s.keys['s']) dy += 1;
    if (s.keys['arrowleft'] || s.keys['q'] || s.keys['a']) dx -= 1;
    if (s.keys['arrowright'] || s.keys['d']) dx += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      p.x += (dx/len) * 3.24 * dt * 60; p.y += (dy/len) * 3.24 * dt * 60;
    }
    p.x = Math.max(p.r, Math.min(canvas.width - p.r, p.x));
    p.y = Math.max(p.r, Math.min(canvas.height - p.r, p.y));

    if (s.flagBuffTime > 0) s.flagBuffTime = Math.max(0, s.flagBuffTime - dt);
    const buffed = s.flagBuffTime > 0;

    // Pièces d'or : collecte + respawn ailleurs
    for (let i = s.coins.length - 1; i >= 0; i--) {
      const c = s.coins[i];
      c.spin += 0.15 * dt * 60;
      if (Math.hypot(c.x - p.x, c.y - p.y) < c.r + p.r) {
        s.coins.splice(i, 1);
        s.collected++;
        if (s.collected >= s.target) { mgSuccess(s.zone); return; }
        s.coins.push({ x: 50 + Math.random()*(canvas.width-100), y: 50 + Math.random()*(canvas.height-100), r: 12, spin: Math.random()*Math.PI*2 });
      }
    }

    // Le drapeau apparaît une fois, à 30s de jeu écoulées (80 - 30 = 50s restantes à ce moment-là)
    if (!s.flagSpawned && (80 - s.timeLeft) >= 30) {
      s.flagSpawned = true;
      s.flag = { x: 50 + Math.random()*(canvas.width-100), y: 50 + Math.random()*(canvas.height-100), r: 17, bob: 0 };
    }
    if (s.flag) {
      s.flag.bob += dt * 3;
      if (Math.hypot(s.flag.x - p.x, s.flag.y - p.y) < s.flag.r + p.r) {
        s.flag = null;
        s.flagBuffTime = 5; // ne compte pas comme une pièce
      }
    }

    const respawnBanditAtCorner = (b) => {
      const c = s.corners[Math.floor(Math.random() * s.corners.length)];
      b.x = c.x; b.y = c.y; b.vx = 0; b.vy = 0;
      b.frozenTime = 2; // immobile 2s après réapparition, pour prévenir le joueur
    };

    // Bandits : poursuivent le joueur, évitent les pièges et se répartissent entre eux.
    // Sous l'effet du drapeau, ils fuient au lieu de poursuivre.
    for (const b of s.bandits) {
      b.wobble += 0.05 * dt * 60;
      if (b.frozenTime > 0) {
        b.frozenTime = Math.max(0, b.frozenTime - dt);
      } else {
      const tdx = p.x - b.x, tdy = p.y - b.y;
      const tl = Math.hypot(tdx, tdy) || 1;
      let seekX = (tdx/tl), seekY = (tdy/tl);
      if (buffed) { seekX = -seekX; seekY = -seekY; } // fuite pendant le bonus

      // Évitement des pièges : repousse le bandit loin de tout piège proche
      let avoidX = 0, avoidY = 0;
      for (const t of s.traps) {
        const ddx = b.x - t.x, ddy = b.y - t.y;
        const d = Math.hypot(ddx, ddy);
        if (d < t.r + 55) {
          const w = (t.r + 55 - d) / (t.r + 55);
          avoidX += (ddx / (d || 1)) * w;
          avoidY += (ddy / (d || 1)) * w;
        }
      }
      // Séparation entre bandits pour qu'ils ne collent pas ensemble et empruntent des chemins différents
      let sepX = 0, sepY = 0;
      for (const other of s.bandits) {
        if (other === b) continue;
        const ddx = b.x - other.x, ddy = b.y - other.y;
        const d = Math.hypot(ddx, ddy);
        if (d < 48) {
          const w = (48 - d) / 48;
          sepX += (ddx / (d || 1)) * w;
          sepY += (ddy / (d || 1)) * w;
        }
      }

      let mx = seekX * 1.0 + avoidX * 1.6 + sepX * 0.9 + Math.sin(b.wobble) * 0.25;
      let my = seekY * 1.0 + avoidY * 1.6 + sepY * 0.9 + Math.cos(b.wobble) * 0.25;
      const ml = Math.hypot(mx, my) || 1;
      b.x += (mx/ml) * b.speed * dt * 60;
      b.y += (my/ml) * b.speed * dt * 60;
      b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));
      b.y = Math.max(b.r, Math.min(canvas.height - b.r, b.y));

      // Un bandit qui marche quand même sur un piège en meurt, comme le joueur
      for (const t of s.traps) {
        if (Math.hypot(t.x - b.x, t.y - b.y) < t.r + b.r - 8) { respawnBanditAtCorner(b); break; }
      }
      }

      // Contact avec le joueur
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + p.r - 4) {
        if (buffed) { respawnBanditAtCorner(b); }
        else { mgFail(s.zone, "Un bandit t'a attrapé !"); return; }
      }
    }

    // Pièges (statiques) — inoffensifs pendant le bonus du drapeau
    if (!buffed) {
      for (const t of s.traps) {
        if (Math.hypot(t.x - p.x, t.y - p.y) < t.r + p.r - 6) { mgFail(s.zone, 'Piège !'); return; }
      }
    }

    // ---- Dessin ----
    ctx.fillStyle = '#d9c17a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath(); ctx.moveTo(60,140); ctx.lineTo(130,60); ctx.lineTo(200,140); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(canvas.width-220,150); ctx.lineTo(canvas.width-150,70); ctx.lineTo(canvas.width-80,150); ctx.closePath(); ctx.fill();

    s.traps.forEach(t => {
      const skin = LAWISSE_SKINS.piege;
      if (skin && skin.complete && skin.naturalWidth > 0) {
        const dsz = t.r * 2.3;
        ctx.globalAlpha = buffed ? 0.4 : 1;
        ctx.drawImage(skin, t.x - dsz/2, t.y - dsz/2, dsz, dsz);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = buffed ? 'rgba(122,31,31,0.4)' : '#7a1f1f';
        ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#3a0a0a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('💩', t.x, t.y);
      }
    });

    s.coins.forEach(c => {
      const scaleX = Math.abs(Math.cos(c.spin));
      // Pièce d'or : tranche sombre, face claire, liseré et reflet — elle tourne sur elle-même
      ctx.fillStyle = '#b8801f';
      ctx.beginPath(); ctx.ellipse(c.x + 1.5, c.y + 1.5, c.r * scaleX + 2, c.r, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffd76b';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r * scaleX + 2, c.r, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#a87a2a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#f6b93b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, (c.r - 4) * scaleX + 1), c.r - 4, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath(); ctx.ellipse(c.x - c.r * 0.28 * scaleX, c.y - c.r * 0.3, Math.max(0.8, 2.2 * scaleX), 3.2, -0.5, 0, Math.PI*2); ctx.fill();
    });

    if (s.flag) {
      const skin = LAWISSE_SKINS.drapeau;
      const bob = Math.sin(s.flag.bob) * 4;
      if (skin && skin.complete && skin.naturalWidth > 0) {
        const dsz = s.flag.r * 2.6;
        ctx.drawImage(skin, s.flag.x - dsz/2, s.flag.y - dsz/2 + bob, dsz, dsz);
      } else {
        ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(s.flag.x, s.flag.y + 16 + bob); ctx.lineTo(s.flag.x, s.flag.y - 16 + bob); ctx.stroke();
        ctx.fillStyle = '#3a7fb0';
        ctx.beginPath();
        ctx.moveTo(s.flag.x, s.flag.y - 16 + bob);
        ctx.lineTo(s.flag.x + 20, s.flag.y - 10 + bob);
        ctx.lineTo(s.flag.x, s.flag.y - 4 + bob);
        ctx.closePath(); ctx.fill();
      }
    }

    s.bandits.forEach(b => {
      const skin = LAWISSE_SKINS.bandit;
      const frozen = b.frozenTime > 0;
      const flicker = frozen ? (0.4 + 0.5 * Math.abs(Math.sin(b.frozenTime * 10))) : 1;
      if (skin && skin.complete && skin.naturalWidth > 0) {
        const dsz = b.r * 2.3;
        ctx.save();
        ctx.globalAlpha = buffed ? 0.55 : flicker; // "effrayés" pendant la fuite, clignotants au réveil
        ctx.drawImage(skin, b.x - dsz/2, b.y - dsz/2, dsz, dsz);
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha = flicker;
        ctx.fillStyle = buffed ? '#e8b7a0' : '#c98a4a';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2; ctx.stroke();
        // foulard de bandit
        ctx.fillStyle = '#7a2020';
        ctx.beginPath(); ctx.ellipse(b.x, b.y + 3, b.r*0.9, b.r*0.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1b2735';
        ctx.beginPath(); ctx.arc(b.x - 5, b.y - 5, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(b.x + 5, b.y - 5, 2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    });

    // Joueur : rond avec la tête de Lawisse dedans, avec un liseré doré pendant le bonus
    ctx.save();
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.closePath(); ctx.clip();
    const headSkin = LAWISSE_SKINS.lawisse_head;
    if (headSkin && headSkin.complete && headSkin.naturalWidth > 0) {
      const scale = Math.max((p.r*2) / headSkin.naturalWidth, (p.r*2) / headSkin.naturalHeight);
      const dw = headSkin.naturalWidth * scale, dh = headSkin.naturalHeight * scale;
      ctx.drawImage(headSkin, p.x - dw/2, p.y - dh/2, dw, dh);
    } else if (s.portraitOk && s.portraitImg.complete && s.portraitImg.naturalWidth > 0) {
      const img = s.portraitImg;
      // Recadrage auto (même réglage que les portraits CSS) : coupe le
      // décor du haut, le panneau « ! » à droite et les résidus du bas.
      const sx = img.naturalWidth * 0.028, sy = img.naturalHeight * 0.127;
      const sw = img.naturalWidth * 0.797, sh = img.naturalHeight * 0.769;
      const scale = Math.max((p.r*2) / sw, (p.r*2) / sh);
      const dw = sw * scale, dh = sh * scale;
      ctx.drawImage(img, sx, sy, sw, sh, p.x - dw/2, p.y - dh/2, dw, dh);
    } else {
      ctx.fillStyle = '#2f5aa8';
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r*2, p.r*2);
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.strokeStyle = buffed ? '#ffd76b' : '#fff'; ctx.lineWidth = buffed ? 4 : 3; ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(10, 10, 220, buffed ? 86 : 62);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`⏱ ${s.timeLeft.toFixed(1)}s`, 22, 18);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '14px sans-serif';
    ctx.fillText(`🪙 Pièces d'or : ${s.collected} / ${s.target}`, 22, 46);
    if (buffed) {
      ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`🚩 Bonus actif : ${s.flagBuffTime.toFixed(1)}s`, 22, 68);
    }
  },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      window.removeEventListener('keyup', mgState._onKeyUp);
    }
  }
};
