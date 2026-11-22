/* ============================================================
   js/minijeux/horace-duel.js — Mini-jeu d'Horace : duel au katana (type 'duel').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE HORACE : DUEL AU KATANA (réflexes / timing) ============
   Mécanique volontairement différente de tout le reste : pas de déplacement,
   pas de tracé, pas de quiz — un duel à la japonaise où il faut lire la
   direction de l'attaque du maître et appuyer sur la bonne flèche avant la
   fin de la fenêtre de réaction, qui se resserre à chaque touche réussie. */
const DUEL_LIVES = 6; // v20.25 : 6e erreur = perdu ; 0-2 erreurs ★★★, 3-4 ★★, 5 ★
const DUEL_ARROWS = {
  arrowup:    { symbol: '↑', dx: 0, dy: -1 },
  arrowdown:  { symbol: '↓', dx: 0, dy: 1 },
  arrowleft:  { symbol: '←', dx: -1, dy: 0 },
  arrowright: { symbol: '→', dx: 1, dy: 0 }
};
const DUEL_MASTER_LINES = [
  "Le maître : « Voyons ce que vaut le p'tit dernier du groupe... »",
  "Le maître : « Un an au Japon et toujours aussi lent ? »",
  "Le maître : « Ton charme ne marchera pas sur moi, gamin. »"
];
const DUEL_HORACE_LINES = [
  "Horace : « Franchement, t'as pas idée de ce que j'ai vu là-bas. »",
  "Horace : « Attends, je me suis juste échauffé le bras ! »",
  "Horace : « J'ai ramené bien plus qu'un souvenir du Japon... »"
];

// ---- Skin du maître (mini-jeu de Horace) ----
// Dépose ton image dans assets/mini-jeu-horace/ sous le nom "maitre" (.png, .jpg, .jpeg ou .webp).
// Sans fichier, le dessin par défaut (silhouette) est utilisé automatiquement.
const DUEL_SKINS = { maitre: null };
(function loadDuelMaitreSkin() {
  const exts = ['png', 'jpg', 'jpeg', 'webp'];
  let i = 0;
  function tryNext() {
    if (i >= exts.length) return;
    const img = new Image();
    img.src = `assets/mini-jeu-horace/maitre.${exts[i]}`;
    i++;
    img.onload = () => { DUEL_SKINS.maitre = img; };
    img.onerror = tryNext;
  }
  tryNext();
})();

MINIGAMES['duel'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.hits = 0; s.target = 20;
    s.lives = DUEL_LIVES;
    s.petals = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      speed: 18 + Math.random() * 22, drift: Math.random() * Math.PI * 2, size: 4 + Math.random() * 4
    }));
    s.roundBanner = DUEL_MASTER_LINES[0];
    s.phase = 'telegraph';   // telegraph -> strike -> resolved
    s.phaseTimer = 1.0;
    s.reactionTime = 1.05;  // se réduit à chaque touche réussie, plancher plus haut vu la longueur du duel
    s.expectedKey = null;
    s.resolveTimer = 0;
    s.resolveGood = false;
    s.shakeTimer = 0;
    s.lastT = performance.now();

    s._onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (s.phase !== 'strike') return;
      if (!DUEL_ARROWS[k]) return;
      e.preventDefault();
      if (k === s.expectedKey) duelResolveRound(s, true);
      else duelResolveRound(s, false);
    };
    window.addEventListener('keydown', s._onKeyDown);
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    if (s.shakeTimer > 0) s.shakeTimer -= dt;

    // ---- Machine à états du duel ----
    if (s.phase === 'telegraph') {
      s.phaseTimer -= dt;
      if (s.phaseTimer <= 0) {
        const keys = Object.keys(DUEL_ARROWS);
        s.expectedKey = keys[Math.floor(Math.random() * keys.length)];
        s.phase = 'strike';
        s.phaseTimer = s.reactionTime;
      }
    } else if (s.phase === 'strike') {
      s.phaseTimer -= dt;
      if (s.phaseTimer <= 0) duelResolveRound(s, false); // trop lent : raté
    } else if (s.phase === 'resolved') {
      s.resolveTimer -= dt;
      if (s.resolveTimer <= 0) {
        if (s.hits >= s.target) { mgSuccess(s.zone); return; }
        if (s.lives <= 0) { mgFail(s.zone, 'Le maître a eu raison de toi !'); return; }
        s.phase = 'telegraph';
        s.phaseTimer = 1.0;
        s.roundBanner = Math.random() < 0.5
          ? DUEL_MASTER_LINES[Math.floor(Math.random() * DUEL_MASTER_LINES.length)]
          : DUEL_HORACE_LINES[Math.floor(Math.random() * DUEL_HORACE_LINES.length)];
      }
    }

    // ---- Décor : dojo + pétales de sakura ----
    const shakeX = s.shakeTimer > 0 ? (Math.random() - 0.5) * 10 * (s.shakeTimer / 0.3) : 0;
    ctx.save();
    ctx.translate(shakeX, 0);

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#2a1a1f'); bg.addColorStop(1, '#150d10');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // tatamis au sol
    ctx.fillStyle = 'rgba(120,80,50,0.25)';
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 140, canvas.height - 90, 132, 84);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) ctx.strokeRect(i * 140, canvas.height - 90, 132, 84);

    // panneaux shoji en fond
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'rgba(255,240,220,0.05)';
      ctx.fillRect(40 + i * 150, 40, 110, canvas.height - 170);
      ctx.strokeStyle = 'rgba(255,240,220,0.12)'; ctx.lineWidth = 3;
      ctx.strokeRect(40 + i * 150, 40, 110, canvas.height - 170);
    }

    // lanternes
    [110, canvas.width - 110].forEach(lx => {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.ellipse(lx, 90, 22, 28, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#5a1a10'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,120,0.5)';
      ctx.beginPath(); ctx.ellipse(lx, 90, 10, 14, 0, 0, Math.PI*2); ctx.fill();
    });

    // pétales de sakura qui tombent
    s.petals.forEach(p => {
      p.y += p.speed * dt; p.drift += dt;
      p.x += Math.sin(p.drift) * 12 * dt;
      if (p.y > canvas.height + 10) { p.y = -10; p.x = Math.random() * canvas.width; }
      ctx.fillStyle = 'rgba(255,182,193,0.75)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size*0.6, p.drift, 0, Math.PI*2); ctx.fill();
    });

    // le maître (son skin si disponible, sinon silhouette de secours — côté gauche)
    if (DUEL_SKINS.maitre && DUEL_SKINS.maitre.complete && DUEL_SKINS.maitre.naturalWidth > 0) {
      const img = DUEL_SKINS.maitre;
      const displayH = 170;
      const displayW = displayH * (img.naturalWidth / img.naturalHeight);
      ctx.drawImage(img, 150 - displayW/2, 390 - displayH, displayW, displayH);
    } else {
      ctx.fillStyle = '#1a1216';
      ctx.beginPath(); ctx.ellipse(150, 320, 34, 70, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(150, 232, 26, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(178, 300); ctx.lineTo(230, 260); ctx.stroke();
    }

    // Horace (son vrai sprite, tourné vers le maître — pour bien montrer que c'est SON duel)
    const horaceEntry = SPRITES['horace'];
    if (horaceEntry && horaceEntry.img.complete && horaceEntry.img.naturalWidth > 0) {
      const img = horaceEntry.img;
      const row = SPRITE_ROW_INDEX.left; // il fait face au maître, à sa gauche
      const lunge = s.phase === 'resolved' && s.resolveGood ? -14 : 0; // petit pas en avant sur une touche réussie
      const cell = mgSpriteCell(horaceEntry, row, 0);
      const displayH = 170;
      const displayW = displayH * (cell.w / cell.h);
      ctx.drawImage(img, cell.x, cell.y, cell.w, cell.h,
        650 - displayW/2 + lunge, 390 - displayH, displayW, displayH);
    } else {
      ctx.fillStyle = '#4a2f22';
      ctx.beginPath(); ctx.ellipse(650, 320, 34, 70, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(650, 232, 26, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#6a4a30'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(622, 300); ctx.lineTo(570, 260); ctx.stroke();
    }

    // bannière de réplique comique
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(canvas.width/2 - 260, 16, 520, 34);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'italic 14px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.roundBanner, canvas.width/2, 33);

    // ---- Prompt central : flèche à jouer + anneau de temps ----
    if (s.phase === 'telegraph') {
      const p = 1 - Math.max(0, s.phaseTimer) / 1.0;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(canvas.width/2, 260, 30 + p*14, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 15px sans-serif';
      ctx.fillText('En garde...', canvas.width/2, 260);
    } else if (s.phase === 'strike') {
      const remain = Math.max(0, s.phaseTimer) / s.reactionTime;
      ctx.strokeStyle = remain > 0.3 ? '#ffd76b' : '#e04b4b';
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(canvas.width/2, 260, 42, -Math.PI/2, -Math.PI/2 + remain * Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 46px sans-serif';
      ctx.fillText(DUEL_ARROWS[s.expectedKey].symbol, canvas.width/2, 262);
    } else if (s.phase === 'resolved') {
      ctx.fillStyle = s.resolveGood ? '#4caf50' : '#e04b4b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(s.resolveGood ? '⚔️ Paré et touché !' : '💢 Raté !', canvas.width/2, 260);
      if (s.resolveGood) {
        // petit éclat façon lames qui s'entrechoquent
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI * 2 / 6) * i;
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(canvas.width/2 + Math.cos(ang)*20, 260 + Math.sin(ang)*20);
          ctx.lineTo(canvas.width/2 + Math.cos(ang)*40, 260 + Math.sin(ang)*40);
          ctx.stroke();
        }
      }
    }

    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(10, 10, 210, 62);
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`⚔️ Touches : ${s.hits} / ${s.target}`, 22, 18);
    ctx.fillStyle = '#cfe8d9'; ctx.font = '14px sans-serif';
    ctx.fillText(`❤️ ${'♥'.repeat(Math.max(0, s.lives))}`, 22, 44);
  },
  cleanup() {
    if (mgState) window.removeEventListener('keydown', mgState._onKeyDown);
  }
};

function duelResolveRound(s, good) {
  s.phase = 'resolved';
  s.resolveGood = good;
  s.resolveTimer = 0.6;
  if (good) {
    s.hits++;
    s.reactionTime = Math.max(0.6, s.reactionTime - 0.06); // ça devient plus dur, mais en douceur vu le nombre de touches à tenir
  } else {
    s.lives--;
    s.shakeTimer = 0.3;
  }
}
