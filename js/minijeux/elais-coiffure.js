/* ============================================================
   js/minijeux/elais-coiffure.js — Mini-jeu d'Elaïs : la coiffure (type 'coiffure').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ---- Têtes des 3 victimes de la coiffure d'Elaïs, dans l'ordre des rounds ---- */
const COIFFURE_HEAD_FILES = {
  1: 'assets/minijeu-elais/tete-lawisse.png',
  2: 'assets/minijeu-elais/tete-noah.png',
  3: 'assets/minijeu-elais/tete-noe.png'
};
const COIFFURE_ROUND_INFO = {
  1: { name: 'Lawisse', hair: '#3c271d', hairLight: '#5c4030' },
  2: { name: 'Noah',    hair: '#6f523c', hairLight: '#8d6b4e' },
  3: { name: 'Noé',     hair: '#4b1f14', hairLight: '#6c3222' }
};
// Petite réaction du personnage qu'on vient de coiffer, dans la continuité
// de son caractère habituel (cf. PRIVATE_JOKES / CASUAL_CHATS plus haut :
// Lawisse et son rapport à l'argent, Noah et ses avis non-sollicités,
// Noé/Magir accro aux memes).
const COIFFURE_REACTIONS = {
  1: "Lawisse : « Nickel ! Bon, je vais fêter ça... en dépensant tout ce qu'il me reste d'un coup. »",
  2: "Noah : « Mon avis sur cette coupe ? Personne l'a demandé, mais bon : elle est superbe. »",
  3: "Noé : « Celle-là, je la mets en story direct, ça va faire un carton. »"
};
const COIFFURE_HEADS = {};
(function loadCoiffureHeads() {
  Object.entries(COIFFURE_HEAD_FILES).forEach(([round, src]) => {
    const img = new Image();
    img.onload = () => { COIFFURE_HEADS[round] = img; };
    img.onerror = () => {};
    img.src = src;
  });
})();
// Rectangle d'affichage du portrait, centré en haut du canvas (800×500).
// Volontairement grand : la tête doit occuper une bonne partie de l'écran.
function mgCoiffureHeadRect(canvas) {
  const w = 330, h = 369;
  return { x: canvas.width/2 - w/2, y: 78, w, h };
}

function mgCoiffureBuildPath(round, w) {
  const cx = w / 2;
  const startX = cx - 130, endX = cx + 130, baseY = 228;
  const n = 140;
  const params = {
    1: { amp: 21, freq: 1.0, jagged: false },
    2: { amp: 39, freq: 2.0, jagged: false },
    3: { amp: 52, freq: 3.0, jagged: true }
  }[round];
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = startX + t * (endX - startX);
    let wave = Math.sin(t * Math.PI * 2 * params.freq);
    if (params.jagged) wave = Math.asin(Math.sin(t * Math.PI * 2 * params.freq)) * (2 / Math.PI);
    const y = baseY + wave * params.amp;
    pts.push({ x, y });
  }
  return pts;
}
// Précision requise pour faire avancer la coupe (marge de progression).
// Nettement réduite par rapport à avant : il faut suivre le tracé de bien
// plus près pour que ça compte.
function mgCoiffureTolerance(round) { return { 1: 13, 2: 8, 3: 5 }[round]; }
// Largeur du "couloir" fatal (façon corde raide / cookie de Squid Game) :
// tant que le curseur reste dedans, on peut continuer. Dès qu'on en sort,
// c'est perdu direct. Marge d'erreur volontairement resserrée (~2 à 3 fois
// plus étroite qu'avant) pour rendre le jeu bien plus corsé.
function mgCoiffureFailMargin(round) { return { 1: 20, 2: 13, 3: 8 }[round]; }

// Petites affiches décoratives sur le mur du salon : les exploits passés du
// salon, en VRAIE photo — assets/minijeu-elais/portrait1.png = la coupe
// complètement ratée, portrait2.png = l'avant/après spectaculaire. Si les
// fichiers sont absents, on garde le petit dessin cartoon de secours.
const COIFFURE_POSTER_PATH = 'assets/minijeu-elais/portrait';
const COIFFURE_POSTER_EXTS = ['png', 'jpg', 'jpeg', 'webp'];
const COIFFURE_POSTERS = {};
(function loadCoiffurePosters() {
  [1, 2].forEach(key => {
    let i = 0;
    const tryNext = () => {
      if (i >= COIFFURE_POSTER_EXTS.length) return; // pas de photo : dessin repli
      const img = new Image();
      img.onload = () => { COIFFURE_POSTERS[key] = img; };
      img.onerror = tryNext;
      img.src = COIFFURE_POSTER_PATH + key + '.' + COIFFURE_POSTER_EXTS[i++];
    };
    tryNext();
  });
})();
function mgCoiffureDrawPoster(ctx, x, y, w, h, style, photoKey) {
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#f3ead9';
  ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
  const cx = x + w / 2, cy = y + h / 2 - 10;
    const photo = photoKey && COIFFURE_POSTERS[photoKey];
  if (photo && photo.complete && photo.naturalWidth > 0) {
    // La vraie photo en "cover" : remplit le cadre sans déformer l'image,
    // en laissant la place à la légende écrite en bas du cadre.
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 6, y + 6, w - 12, h - 46); ctx.clip();
    const iw = photo.naturalWidth, ih = photo.naturalHeight;
    const scale = Math.max((w - 12) / iw, (h - 46) / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.drawImage(photo, x + 6 + (w - 12 - dw) / 2, y + 6 + (h - 46 - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 6, y + 6, w - 12, h - 12); ctx.clip();
    ctx.fillStyle = '#f0c39a';
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2418';
    ctx.beginPath();
    if (style === 'zigzag') {
      ctx.moveTo(cx - w * 0.3, cy - w * 0.05);
      ctx.lineTo(cx - w * 0.15, cy - w * 0.24);
      ctx.lineTo(cx, cy + w * 0.03);
      ctx.lineTo(cx + w * 0.15, cy - w * 0.27);
      ctx.lineTo(cx + w * 0.3, cy - w * 0.02);
    } else {
      ctx.moveTo(cx - w * 0.3, cy - w * 0.1);
      ctx.lineTo(cx - w * 0.08, cy - w * 0.3);
      ctx.lineTo(cx + w * 0.05, cy - w * 0.02);
      ctx.lineTo(cx + w * 0.3, cy - w * 0.26);
    }
    ctx.lineTo(cx + w * 0.3, cy - w * 0.4);
    ctx.lineTo(cx - w * 0.3, cy - w * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1b2735';
    ctx.beginPath(); ctx.arc(cx - w * 0.1, cy, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + w * 0.1, cy, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1b2735'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy + w * 0.13, w * 0.08, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = '#4a2f1f'; ctx.lineWidth = 3; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  // Légende : UNE seule ligne, bien calée DANS le cadre (jamais sur la bordure)
  ctx.fillStyle = '#3a2418'; ctx.font = 'italic 11.5px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(style === 'zigzag' ? '« plus jamais. »' : '« Avant/Après »', cx, y + h - 20);
}

// (mgWrapText existe déjà plus haut : le doublon qui était ici écrasait la 1re version
//  et faisait mesurer les blagues de Perline avec la mauvaise police.)

function mgCoiffureNextButtonRect(canvas) {
  return { x: canvas.width/2 - 95, y: 424, w: 190, h: 46 };
}

MINIGAMES['coiffure'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.round = 1;
    s.playTime = 0; // v20.25 : temps de coupe cumulé, sans les écrans « Suivant »
    s.lastT = performance.now();
    s.particles = [];
    s.awaitingNext = false;
    s.reactionMsg = null;
    s.failing = false;
    s.failShakeTimer = 0;
    s.failMsg = '';

    s.path = mgCoiffureBuildPath(s.round, canvas.width);
    s.tolerance = mgCoiffureTolerance(s.round);
    s.failMargin = mgCoiffureFailMargin(s.round);
    s.progressIndex = 0;
    s.dragging = false;

    s._onDown = (evt) => {
      if (s.failing) return;
      const pos = mgPointerPos(canvas, evt);
      if (s.awaitingNext) {
        const btn = mgCoiffureNextButtonRect(canvas);
        if (pos.x >= btn.x && pos.x <= btn.x + btn.w && pos.y >= btn.y && pos.y <= btn.y + btn.h) {
          s.awaitingNext = false;
          s.reactionMsg = null;
          if (s._finished) { mgSuccess(s.zone); return; }
          if (s._pendingNextRound) {
            s._pendingNextRound = false;
            s.round++;
            s.path = mgCoiffureBuildPath(s.round, canvas.width);
            s.tolerance = mgCoiffureTolerance(s.round);
            s.failMargin = mgCoiffureFailMargin(s.round);
            s.progressIndex = 0;
            s.particles = [];
          }
        }
        evt.preventDefault();
        return;
      }
      const startPt = s.path[0];
      if (Math.hypot(pos.x - startPt.x, pos.y - startPt.y) <= 45) {
        s.dragging = true;
      }
      evt.preventDefault();
    };
    s._onMove = (evt) => {
      if (!s.dragging || s.awaitingNext || s.failing) return;
      const pos = mgPointerPos(canvas, evt);
      let bestI = -1, bestD = Infinity;
      const searchStart = Math.max(0, s.progressIndex - 6);
      const searchEnd = Math.min(s.path.length - 1, s.progressIndex + 14);
      for (let i = searchStart; i <= searchEnd; i++) {
        const d = Math.hypot(pos.x - s.path[i].x, pos.y - s.path[i].y);
        if (d < bestD) { bestD = d; bestI = i; }
      }
      // On est sorti du couloir : c'est perdu, comme au jeu du calamar.
      // On déclenche d'abord un petit effet (flash + tremblement) avant
      // d'afficher l'écran d'échec, pour bien marquer le coup.
      if (bestD > s.failMargin) {
        s.dragging = false;
        s.failing = true;
        s.failShakeTimer = 0.4;
        s.failMsg = "Tu as dévié du tracé, la frange est ratée !";
        return;
      }
      if (bestI > s.progressIndex && bestD <= s.tolerance) {
        s.progressIndex = bestI;
        if (s.progressIndex >= s.path.length - 1) {
          s.dragging = false;
          const doneKey = Math.min(s.round, 3);
          const doneName = COIFFURE_ROUND_INFO[doneKey].name;
          s.reactionMsg = {
            title: `✂️ Frange de ${doneName} coupée !`,
            quip: COIFFURE_REACTIONS[doneKey]
          };
          s.awaitingNext = true;
          if (s.round >= 3) s._finished = true;
          else s._pendingNextRound = true;
        }
      }
      evt.preventDefault();
    };
    s._onUp = () => {
      if (!s.awaitingNext && !s.failing && s.progressIndex < s.path.length - 1) {
        s.progressIndex = 0; // relâché trop tôt : on reprend cette frange depuis le début
      }
      s.dragging = false;
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
    if (!s.awaitingNext && !s.failing) s.playTime += dt;
    if (!s.particles) s.particles = [];
    if (s.failing) {
      s.failShakeTimer -= dt;
      if (s.failShakeTimer <= 0) {
        s.failing = false;
        mgFail(s.zone, s.failMsg);
        return;
      }
    }

    const roundKey = Math.min(s.round, 3);
    const info = COIFFURE_ROUND_INFO[roundKey];
    const headImg = COIFFURE_HEADS[roundKey];
    const rect = mgCoiffureHeadRect(canvas);
    const hairTopY = rect.y + 36;
    const cutFromI = s.progressIndex;

    // Quelques mèches coupées qui tombent pendant qu'on découpe
    if (s.dragging && cutFromI > 0 && cutFromI < s.path.length - 1) {
      const cutPt = s.path[cutFromI];
      if (Math.random() < 0.55) {
        s.particles.push({
          x: cutPt.x + (Math.random() - 0.5) * 6, y: cutPt.y,
          vx: (Math.random() - 0.5) * 25, vy: 15 + Math.random() * 25,
          life: 0.5 + Math.random() * 0.35, age: 0,
          rot: Math.random() * Math.PI
        });
      }
    }
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const pt = s.particles[i];
      pt.age += dt;
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 70 * dt;
      if (pt.age >= pt.life) s.particles.splice(i, 1);
    }

    // ---- Tremblement d'écran en cas d'échec (avant l'écran "Raté") ----
    ctx.save();
    if (s.failing) {
      const amp = 9 * (s.failShakeTimer / 0.4);
      ctx.translate((Math.random() - 0.5) * 2 * amp, (Math.random() - 0.5) * 2 * amp);
    }

    // ---- Fond : dégradé doux + cape de coiffeur ----
    const bgGrad = ctx.createRadialGradient(canvas.width/2, 220, 40, canvas.width/2, 250, 430);
    bgGrad.addColorStop(0, '#f4ead9');
    bgGrad.addColorStop(1, '#cab68f');
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);
    mgCoiffureDrawPoster(ctx, 24, 84, 200, 184, 'zigzag', 1);
    mgCoiffureDrawPoster(ctx, canvas.width - 224, 84, 200, 184, 'uneven', 2);

    ctx.fillStyle = '#3a7fb0';
    ctx.beginPath();
    ctx.moveTo(rect.x - 40, canvas.height + 10);
    ctx.quadraticCurveTo(canvas.width/2, rect.y + rect.h + 30, rect.x + rect.w + 40, canvas.height + 10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 4; ctx.stroke();

    // ---- Portrait du personnage ----
    if (headImg && headImg.complete && headImg.naturalWidth > 0) {
      ctx.drawImage(headImg, rect.x, rect.y, rect.w, rect.h);
    } else {
      ctx.fillStyle = '#f0c39a';
      ctx.beginPath(); ctx.ellipse(canvas.width/2, rect.y + rect.h/2, rect.w/2, rect.h/2, 0, 0, Math.PI*2); ctx.fill();
    }

    // ---- Frange pas encore coupée : ne couvre plus que la partie restante,
    // elle "recule" visuellement au fil de la progression et révèle le
    // visage propre en dessous. ----
    if (cutFromI < s.path.length - 1) {
      ctx.fillStyle = info.hair;
      ctx.beginPath();
      ctx.moveTo(s.path[cutFromI].x, hairTopY);
      ctx.lineTo(s.path[s.path.length - 1].x, hairTopY);
      for (let i = s.path.length - 1; i >= cutFromI; i--) ctx.lineTo(s.path[i].x, s.path[i].y);
      ctx.closePath(); ctx.fill();
      // Quelques mèches plus claires pour casser l'aplat de couleur
      ctx.strokeStyle = info.hairLight; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.45;
      for (let i = cutFromI; i < s.path.length; i += 9) {
        const p = s.path[i];
        ctx.beginPath(); ctx.moveTo(p.x, hairTopY); ctx.lineTo(p.x, p.y - 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Mèches coupées qui tombent
    for (const pt of s.particles) {
      const a = Math.max(0, 1 - pt.age / pt.life);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot + pt.age * 4);
      ctx.strokeStyle = info.hair; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke();
      ctx.restore();
    }

    // ---- Couloir fatal (très resserré) ----
    ctx.strokeStyle = 'rgba(255,70,70,0.4)'; ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    s.path.forEach((p, i) => { const y = p.y - s.failMargin; if (i === 0) ctx.moveTo(p.x, y); else ctx.lineTo(p.x, y); });
    ctx.stroke();
    ctx.beginPath();
    s.path.forEach((p, i) => { const y = p.y + s.failMargin; if (i === 0) ctx.moveTo(p.x, y); else ctx.lineTo(p.x, y); });
    ctx.stroke();
    ctx.setLineDash([]);

    // ---- Trait guide restant à couper ----
    ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    for (let i = cutFromI; i < s.path.length; i++) {
      const p = s.path[i];
      if (i === cutFromI) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // ---- Ciseaux (point de départ courant) ----
    const sp = s.path[cutFromI];
    ctx.fillStyle = s.dragging ? '#4caf50' : '#ffd76b';
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 9, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#1b2735'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✂️', sp.x, sp.y - 20);

    // ---- HUD ----
    mgRoundRect(ctx, 14, 14, 262, 60, 10);
    ctx.fillStyle = 'rgba(20,18,22,0.62)'; ctx.fill();
    ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`✂️ Frange de ${info.name} — ${roundKey} / 3`, 26, 24);
    ctx.fillStyle = '#f2c9c9'; ctx.font = '12.5px sans-serif';
    ctx.fillText('Une seule sortie du couloir = raté !', 26, 48);

    ctx.restore(); // fin du tremblement d'écran

    // ---- Flash rouge plein écran quand on vient de sortir du couloir ----
    if (s.failing) {
      ctx.fillStyle = `rgba(220,40,40,${(s.failShakeTimer / 0.4) * 0.4})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ---- Panneau "manche terminée" : on n'avance que si on clique sur Suivant ----
    if (s.awaitingNext && s.reactionMsg) {
      mgRoundRect(ctx, canvas.width/2 - 240, 280, 480, 130, 12);
      ctx.fillStyle = 'rgba(20,18,22,0.86)'; ctx.fill();
      ctx.fillStyle = '#ffd76b'; ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.reactionMsg.title, canvas.width/2, 314);
      ctx.fillStyle = '#f0e4c8'; ctx.font = 'italic 14.5px sans-serif';
      mgWrapText(ctx, s.reactionMsg.quip, 440).forEach((ln, i) =>
        ctx.fillText(ln, canvas.width/2, 352 + i * 22));

      const btn = mgCoiffureNextButtonRect(canvas);
      mgRoundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fillStyle = '#4caf50'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s._finished ? 'Terminer ✅' : 'Suivant ▶', btn.x + btn.w/2, btn.y + btn.h/2);
    }
  },
  cleanup() {
    if (mgState) {
      const canvas = document.getElementById('mgCanvas');
      canvas.removeEventListener('pointerdown', mgState._onDown);
      canvas.removeEventListener('pointermove', mgState._onMove);
      window.removeEventListener('pointerup', mgState._onUp);
      // On rend le scroll tactile au reste du jeu (désactivé pendant la coupe)
      canvas.style.touchAction = '';
    }
  }
};
