/* ============================================================
   js/minijeux/mm-volley.js — Mini-jeu de M.M. : volley (type 'volley', étoiles bonus).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// ---- Skins (images) pour le mini-jeu de volley de M.M. ----
// Dépose tes images dans : assets/mini-jeu-maxime-michel/ (à côté de index.html)
// - ballon.png : le ballon
// - filet.png   : le filet
// Si un fichier n'existe pas, le jeu utilise automatiquement un dessin par défaut : aucune erreur.
const VOLLEY_SKINS = { ballon: null, filet: null };
(function loadVolleySkins() {
  const b = new Image();
  b.onload = () => { VOLLEY_SKINS.ballon = b; };
  b.onerror = () => {};
  b.src = 'assets/mini-jeu-maxime-michel/ballon.png';
  const f = new Image();
  f.onload = () => { VOLLEY_SKINS.filet = f; };
  f.onerror = () => {};
  f.src = 'assets/mini-jeu-maxime-michel/filet.png';
})();

MINIGAMES['volley'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.paddle = { x: canvas.width/2, y: canvas.height - 46, speed: 6.5, animFrame: 0, animTimer: 0 };
    s.hits = 0;
    s.target = 20;
    s.elapsed = 0;
    bonusInit(s); s.bonusPlan = [5, 12]; s.bonusStar = null; // 2 étoiles bonus qui tombent après 5 puis 12 renvois
    s.keys = {};
    s._onKeyDown = (e) => { s.keys[e.key.toLowerCase()] = true; };
    s._onKeyUp = (e) => { s.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', s._onKeyDown);
    window.addEventListener('keyup', s._onKeyUp);
    s.ball = {
      x: canvas.width/2 + (Math.random()-0.5)*160,
      y: 80,
      vx: (Math.random()-0.5) * 3,
      vy: 2.2,
      r: 15
    };
    s.lastT = performance.now();
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT)/1000);
    s.lastT = now;
    s.elapsed += dt;

    // M.M. — sprite affiché de face (vue "down"), plus large de dossier que
    // son sprite visuel pour rester généreux sur les touches un peu ratées.
    const mmEntry = SPRITES['mm'];
    const hasSprite = mmEntry && mmEntry.img.complete && mmEntry.img.naturalWidth > 0;
    const visualH = hasSprite ? 78 : 64;
    const visualW = hasSprite ? visualH * (mmEntry.cellW / mmEntry.cellH) : 60;
    const hitPadSide = 16; // marge de tolérance de chaque côté du sprite (réduite : il faut viser plus juste)
    const hitW = visualW + hitPadSide * 2;

    // Déplacement + anim de marche (cycle des frames uniquement en mouvement)
    let moveDir = 0;
    if (s.keys['arrowleft'] || s.keys['q'] || s.keys['a']) { s.paddle.x -= s.paddle.speed * dt * 60; moveDir = -1; }
    if (s.keys['arrowright'] || s.keys['d']) { s.paddle.x += s.paddle.speed * dt * 60; moveDir = 1; }
    s.paddle.x = Math.max(hitW/2, Math.min(canvas.width - hitW/2, s.paddle.x));
    if (moveDir !== 0) {
      s.paddle.animTimer += dt;
      if (s.paddle.animTimer > 0.1) { s.paddle.animTimer = 0; s.paddle.animFrame = (s.paddle.animFrame + 1) % SPRITE_COLS; }
    } else {
      s.paddle.animFrame = 0; s.paddle.animTimer = 0;
    }

    // Balle : gravité + rebonds sur les murs et le plafond. La gravité (donc
    // la vitesse globale) augmente doucement avec le temps écoulé.
    const speedMult = 1 + Math.min(0.85, s.elapsed / 35);
    const b = s.ball;
    b.vy += 5.2 * speedMult * dt;
    b.x += b.vx * 60 * dt;
    b.y += b.vy * 60 * dt;
    if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
    if (b.x + b.r > canvas.width) { b.x = canvas.width - b.r; b.vx *= -1; }
    if (b.y - b.r < 40) { b.y = 40 + b.r; b.vy *= -1; }

    // Collision avec M.M. — zone de collision élargie (hitW) par rapport au
    // sprite affiché (visualW), pour rester jouable même un peu excentré.
    if (b.vy > 0 &&
        b.y + b.r >= s.paddle.y &&
        b.y + b.r <= s.paddle.y + 26 &&
        b.x > s.paddle.x - hitW/2 - b.r &&
        b.x < s.paddle.x + hitW/2 + b.r) {
      b.vy = -Math.abs(b.vy) - 0.4;
      b.vx += (b.x - s.paddle.x) / (hitW/2) * 2.2 * speedMult;
      s.hits++;
      if (s.hits >= s.target) { mgSuccess(s.zone); return; }
    }

    // Étoile bonus : tombe doucement du ciel, à attraper avec M.M. (sans lâcher le ballon !)
    if (!s.bonusStar && s.bonusPlan.length && s.hits >= s.bonusPlan[0]) {
      s.bonusPlan.shift();
      let bx = 90 + Math.random() * (canvas.width - 180);
      for (let tries = 0; tries < 20 && Math.abs(bx - s.paddle.x) < 170; tries++) bx = 90 + Math.random() * (canvas.width - 180);
      s.bonusStar = { x: bx, y: 60, r: 17, vy: 135 };
    }
    if (s.bonusStar) {
      const st = s.bonusStar;
      st.y += st.vy * dt;
      if (st.y + st.r >= s.paddle.y - 6 && st.y - st.r <= s.paddle.y + 40 && Math.abs(st.x - s.paddle.x) < hitW / 2 + st.r) {
        bonusCollect(s, st.x, st.y); s.bonusStar = null;
      } else if (st.y - st.r > canvas.height) s.bonusStar = null;
    }

    // Balle tombée au sol -> raté
    if (b.y - b.r > canvas.height) { mgFail(s.zone, 'La balle est tombée !'); return; }

    // ---- Dessin ----
    const grad = ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0, '#2a3b6b'); grad.addColorStop(1, '#1b2440');
    ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(canvas.width,40); ctx.stroke();

    // Filet : image si dispo, sinon ligne pointillée comme avant
    const netY = canvas.height/2 + 30;
    if (VOLLEY_SKINS.filet && VOLLEY_SKINS.filet.complete) {
      const nw = canvas.width;
      const nh = nw * (VOLLEY_SKINS.filet.height / VOLLEY_SKINS.filet.width);
      ctx.drawImage(VOLLEY_SKINS.filet, 0, netY - nh/2, nw, nh);
    } else {
      ctx.strokeStyle = 'rgba(255,215,107,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, netY); ctx.lineTo(canvas.width, netY); ctx.stroke();
    }

    // M.M. : sprite de face si dispo, sinon rectangle comme avant
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(s.paddle.x, s.paddle.y + visualH + 2, visualW*0.4, 5, 0, 0, Math.PI*2); ctx.fill();
    if (hasSprite) {
      const img = mmEntry.img;
      const row = SPRITE_ROW_INDEX.down;
      const col = s.paddle.animFrame;
      const cell = mgSpriteCell(mmEntry, row, col);
      ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h,
        s.paddle.x - visualW/2, s.paddle.y - visualH + 16, visualW, visualH);
    } else {
      ctx.fillStyle = '#c9622a';
      ctx.fillRect(s.paddle.x - visualW/2, s.paddle.y, visualW, 16);
      ctx.strokeStyle = '#7a3a10'; ctx.lineWidth = 2;
      ctx.strokeRect(s.paddle.x - visualW/2, s.paddle.y, visualW, 16);
    }

    // Ballon : image si dispo, sinon dessin vectoriel comme avant
    if (VOLLEY_SKINS.ballon && VOLLEY_SKINS.ballon.complete) {
      ctx.drawImage(VOLLEY_SKINS.ballon, b.x - b.r, b.y - b.r, b.r*2, b.r*2);
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#c9622a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x - b.r, b.y); ctx.lineTo(b.x + b.r, b.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, -0.5, 0.5); ctx.stroke();
    }

    if (s.bonusStar) bonusDraw(ctx, s.bonusStar.x, s.bonusStar.y, s.bonusStar.r);
    bonusDrawPops(ctx, s, dt);
    bonusHud(ctx, s, canvas.width - 10, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(10,10,200,40);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`🏐 Renvois : ${s.hits} / ${s.target}`, 22, 18);
  },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      window.removeEventListener('keyup', mgState._onKeyUp);
    }
  }
};
