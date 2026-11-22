/* ============================================================
   js/minijeux/maeva-basket.js — Mini-jeu de Maeva : concours de tirs façon Dunk Shot (type 'basket').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE MAEVA : LE CONCOURS DE TIRS (façon Dunk Shot) ============ */
// Principe : on maintient la balle, on tire vers l'ARRIÈRE comme sur une
// fronde, on relâche pour tirer. Le panier flotte et change de côté à
// chaque réussite : un coup à gauche, un coup à droite.
const BASKET_G = 1000;      // gravité px/s²
const BASKET_TARGET = 10;   // paniers pour gagner
const BASKET_LIVES = 3;     // nombre de ballons (3 tirs ratés = perdu)
const BASKET_DRAG_K = 7;    // vitesse de tir = distance de glisser × ce facteur
const BASKET_MAX_V = 950;   // vitesse de lancement maximale

// Un panier "flottant" façon Dunk Shot : côté gauche ou droit, hauteur variable
function basketNewHoop(side) {
  return {
    cx: side === 'left' ? 180 + Math.random() * 160 : 460 + Math.random() * 160,
    y: 170 + Math.random() * 120,
    halfW: 33
  };
}
function basketResetBall(s) {
  s.ball = { x: s.pad.x, y: s.pad.y, vx: 0, vy: 0, r: 13, prevY: s.pad.y };
}

// ---- Skins (images) pour le mini-jeu de basket de Maeva ----
// Dépose tes images dans : assets/mini-jeu-maeva/ (à côté de index.html)
// - ballon_de_basket.png : le ballon (vu de face, il est affiché à ~32 px)
// - panier_de_basket.png : le panier (cerceau + filet ; le HAUT de l'image
//   doit correspondre au niveau du cerceau)
// Si un fichier n'existe pas, le jeu utilise le dessin par défaut : aucune erreur.
const BASKET_SKINS = { ballon: null, panier: null };
(function loadBasketSkins() {
  const exts = ['png', 'jpg', 'jpeg', 'webp'];
  ['ballon', 'panier'].forEach(key => {
    let i = 0;
    const tryNext = () => {
      if (i >= exts.length) return; // pas de fichier : dessin par défaut
      const img = new Image();
      img.onload = () => { BASKET_SKINS[key] = img; };
      img.onerror = tryNext;
      img.src = 'assets/mini-jeu-maeva/' + key + '_de_basket.' + exts[i++];
    };
    tryNext();
  });
})();

MINIGAMES['basket'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.score = 0;
    s.lives = BASKET_LIVES;
    s.pad = { x: canvas.width / 2, y: 400 };  // point de départ de la balle
    s.mode = 'ready';  // ready = balle posée, aim = on vise, fly = en vol
    s.aim = null;      // position du curseur pendant la visée
    s.netAnim = 0;     // petite animation du filet après un panier
    basketResetBall(s);
    s.hoopSide = Math.random() < 0.5 ? 'left' : 'right';
    s.hoop = basketNewHoop(s.hoopSide);
    s.lastT = performance.now();

    s._onDown = (evt) => {
      if (s.mode !== 'ready') return;
      const pos = mgPointerPos(canvas, evt);
      if (Math.hypot(pos.x - s.ball.x, pos.y - s.ball.y) <= 55) {
        s.mode = 'aim';
        s.aim = pos;
      }
      evt.preventDefault();
    };
    s._onMove = (evt) => {
      if (s.mode !== 'aim') return;
      s.aim = mgPointerPos(canvas, evt);
      evt.preventDefault();
    };
    s._onUp = () => {
      if (s.mode !== 'aim') return;
      // On tire à l'OPPOSÉ du glisser : recule la balle comme une fronde
      const dx = s.ball.x - s.aim.x, dy = s.ball.y - s.aim.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 14) { s.mode = 'ready'; return; } // micro-glissé : on annule
      const v = Math.min(BASKET_MAX_V, dist * BASKET_DRAG_K);
      s.ball.vx = (dx / dist) * v;
      s.ball.vy = (dy / dist) * v;
      s.mode = 'fly';
      s.ball.prevY = s.ball.y;
    };
    canvas.addEventListener('pointerdown', s._onDown);
    canvas.addEventListener('pointermove', s._onMove);
    window.addEventListener('pointerup', s._onUp);
    canvas.style.touchAction = 'none';
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    if (s.netAnim > 0) s.netAnim -= dt;

    // ---- Physique de la balle en vol ----
    if (s.mode === 'fly') {
      const b = s.ball;
      b.prevY = b.y;
      b.vy += BASKET_G * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      // Rebonds murs / plafond
      if (b.x - b.r < 0) { b.x = b.r; b.vx *= -0.7; }
      if (b.x + b.r > canvas.width) { b.x = canvas.width - b.r; b.vx *= -0.7; }
      if (b.y - b.r < 0) { b.y = b.r; b.vy *= -0.6; }
      // Choc sur les deux bords du cerceau
      [s.hoop.cx - s.hoop.halfW, s.hoop.cx + s.hoop.halfW].forEach(px => {
        const dx = b.x - px, dy = b.y - s.hoop.y;
        const d = Math.hypot(dx, dy);
        if (d < b.r && d > 0) {
          const nx = dx / d, ny = dy / d;
          b.x = px + nx * b.r; b.y = s.hoop.y + ny * b.r;
          const dot = b.vx * nx + b.vy * ny;
          b.vx = (b.vx - 2 * dot * nx) * 0.55;
          b.vy = (b.vy - 2 * dot * ny) * 0.55;
        }
      });
      // Panier ! La balle franchit le cerceau de haut en bas, bien dedans
      if (b.prevY <= s.hoop.y && b.y > s.hoop.y && b.vy > 0 &&
          b.x > s.hoop.cx - s.hoop.halfW + 6 && b.x < s.hoop.cx + s.hoop.halfW - 6) {
        s.score++;
        s.netAnim = 0.45;
        s.mode = 'ready';
        basketResetBall(s);
        if (s.score >= BASKET_TARGET) { mgSuccess(s.zone); return; }
        // Le panier file aussitôt de l'autre côté, à une autre hauteur
        s.hoopSide = s.hoopSide === 'left' ? 'right' : 'left';
        s.hoop = basketNewHoop(s.hoopSide);
      } else if (b.y > canvas.height + 40) {
        // Tir raté : la balle tombe hors du gymnase, on perd un ballon
        s.lives--;
        s.mode = 'ready';
        basketResetBall(s);
        if (s.lives <= 0) {
          mgFail(s.zone, `Plus de ballon ! ${s.score} / ${BASKET_TARGET} paniers...`);
          return;
        }
      }
    }

    // ---- Dessin : gymnase ----
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#c98f4a'); grad.addColorStop(1, '#a86f35');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gy = canvas.height - 40;
    ctx.fillStyle = '#8b5a2a'; ctx.fillRect(0, gy, canvas.width, 40);
    ctx.strokeStyle = '#f2e2c4'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.pad.x, gy, 150, Math.PI, 0); ctx.stroke(); // arc à 3 points

    // Maeva encourage depuis le bord du parquet
    const maevaEntry = SPRITES['maeva'];
    if (maevaEntry && maevaEntry.img.complete && maevaEntry.img.naturalWidth > 0) {
      const img = maevaEntry.img;
      const row = SPRITE_ROW_INDEX.right;
      const cell = mgSpriteCell(maevaEntry, row, 0);
      const displayH = 66;
      const displayW = displayH * (cell.w / cell.h);
      ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h, 60 - displayW / 2, gy - displayH + 10, displayW, displayH);
    } else {
      ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('🏀', 60, gy + 6);
    }

    // ---- Panier flottant : image si fournie, sinon dessin par défaut ----
    const h = s.hoop;
    const wig = s.netAnim > 0 ? Math.sin(s.netAnim * 40) * 5 : 0;
    if (BASKET_SKINS.panier) {
      const hp = BASKET_SKINS.panier;
      const drawW = 110;
      const drawH = drawW * (hp.naturalHeight / hp.naturalWidth);
      // Le haut de l'image = le niveau du cerceau
      ctx.drawImage(hp, h.cx - drawW / 2, h.y - 10, drawW, drawH);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 4; i++) {
        const fx = h.cx - h.halfW + (2 * h.halfW) * (i / 4);
        ctx.beginPath(); ctx.moveTo(fx, h.y); ctx.lineTo(h.cx + wig, h.y + 30); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(h.cx - h.halfW * 0.6 + wig, h.y + 22); ctx.lineTo(h.cx + h.halfW * 0.6 + wig, h.y + 22); ctx.stroke();
      ctx.strokeStyle = '#e8722c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(h.cx - h.halfW, h.y); ctx.lineTo(h.cx + h.halfW, h.y); ctx.stroke();
    }
    if (s.netAnim > 0) {
      ctx.fillStyle = `rgba(76,175,80,${Math.max(0, s.netAnim) * 0.5})`;
      ctx.fillRect(h.cx - h.halfW, h.y - 26, 2 * h.halfW, 4);
    }

    // ---- Visée : élastique + trajectoire en pointillés ----
    if (s.mode === 'aim') {
      const dx = s.ball.x - s.aim.x, dy = s.ball.y - s.aim.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= 14) {
        const v = Math.min(BASKET_MAX_V, dist * BASKET_DRAG_K);
        const vx = (dx / dist) * v, vy = (dy / dist) * v;
        ctx.fillStyle = '#fff';
        for (let i = 1; i <= 12; i++) {
          const t = i * 0.06;
          const px = s.ball.x + vx * t;
          const py = s.ball.y + vy * t + 0.5 * BASKET_G * t * t;
          if (py > gy) break;
          ctx.globalAlpha = 0.8 - i * 0.05;
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,215,107,0.85)'; ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(s.aim.x, s.aim.y); ctx.lineTo(s.ball.x, s.ball.y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // ---- Balle : image si fournie, sinon dessin par défaut ----
    const b = s.ball;
    if (s.mode !== 'fly') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(s.pad.x, s.pad.y + b.r + 4, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (BASKET_SKINS.ballon) {
      const bs = BASKET_SKINS.ballon;
      const drawW = 32;
      const drawH = drawW * (bs.naturalHeight / bs.naturalWidth);
      ctx.drawImage(bs, b.x - drawW / 2, b.y - drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = '#e8722c';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a2a10'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x - b.r, b.y); ctx.lineTo(b.x + b.r, b.y); ctx.stroke();
    }

    // ---- HUD ----
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(10, 10, 300, 64);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`🏀 Paniers : ${s.score} / ${BASKET_TARGET}`, 22, 18);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '14px sans-serif';
    ctx.fillText('Ballons : ' + '🏀'.repeat(Math.max(0, s.lives)) + ' · '.repeat(Math.max(0, BASKET_LIVES - s.lives)), 22, 44);

    // Petite aide en bas quand la balle attend
    if (s.mode === 'ready' || s.mode === 'aim') {
      const hint = s.mode === 'aim' ? 'Relâche pour tirer !'
        : "Maintiens la balle, tire vers l'ARRIÈRE, relâche !";
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const w = ctx.measureText(hint).width + 28;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(canvas.width / 2 - w / 2, 470, w, 28);
      ctx.fillStyle = '#ffd76b';
      ctx.fillText(hint, canvas.width / 2, 492);
    }
  },
  cleanup() {
    if (mgState) {
      const canvas = document.getElementById('mgCanvas');
      canvas.removeEventListener('pointerdown', mgState._onDown);
      canvas.removeEventListener('pointermove', mgState._onMove);
      window.removeEventListener('pointerup', mgState._onUp);
      // On rend le scroll tactile au reste du jeu
      canvas.style.touchAction = '';
    }
  }
};
