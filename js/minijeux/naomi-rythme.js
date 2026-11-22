/* ============================================================
   js/minijeux/naomi-rythme.js — Mini-jeu de Naomi : concert improvisé, jeu de rythme (type 'rythme').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE NAOMI : LE CONCERT IMPROVISÉ (jeu de rythme) ============ */
const RYTHME_KEYS = ['a', 's', 'd', 'f'];
const RYTHME_LABELS = ['A', 'S', 'D', 'F'];
const RYTHME_COLORS = ['#7bc8ff', '#ffd76b', '#c98cff', '#7bd6a0'];
// --- La musique : Waltz No. 2 de Chostakovitch ---
// Dépose ton fichier à côté d'index.html dans :
//   assets/mini-jeu-naomi/musique.mp3   (ou .ogg / .wav, essayés dans l'ordre)
// Deux réglages si besoin, après un test chez toi :
//   - les notes tombent un peu AVANT la musique → augmente RYTHME_START_OFFSET
//   - le décalage grandit au fil du morceau → ajuste RYTHME_BPM
const RYTHME_AUDIO_PATH = 'assets/mini-jeu-naomi/musique.';
const RYTHME_AUDIO_EXTS = ['mp3', 'ogg', 'wav'];
const RYTHME_BPM = 132;        // tempo (noire) de la valse
const RYTHME_START_OFFSET = 0;  // décalage si ton fichier a une intro
// Partition façon valse (3 temps) : { bar: mesure, beat: temps (0 à 2.5),
// lane: 0..3 }. Les notes démarrent à la mesure 2 : deux mesures pour
// entendre le "un-deux-trois" et prendre le rythme. Phrases de 2 mesures
// à la manière de la 1re valse du Waltz No. 2 : note chantée sur le 1er
// temps, réponse sur les temps 2-3, quelques croches pour le relief.
const RYTHME_SCORE = [
  { bar: 2, beat: 0, lane: 1 }, { bar: 2, beat: 2, lane: 2 },
  { bar: 3, beat: 0, lane: 2 }, { bar: 3, beat: 1, lane: 1 }, { bar: 3, beat: 2, lane: 1 },
  { bar: 4, beat: 0, lane: 3 }, { bar: 4, beat: 2, lane: 2 },
  { bar: 5, beat: 0, lane: 2 }, { bar: 5, beat: 1.5, lane: 1 }, { bar: 5, beat: 2, lane: 1 },
  { bar: 6, beat: 0, lane: 2 }, { bar: 6, beat: 2, lane: 3 },
  { bar: 7, beat: 0, lane: 3 }, { bar: 7, beat: 1, lane: 2 }, { bar: 7, beat: 2, lane: 2 },
  { bar: 8, beat: 0, lane: 1 }, { bar: 8, beat: 1.5, lane: 0 }, { bar: 8, beat: 2, lane: 1 },
  { bar: 9, beat: 0, lane: 0 }, { bar: 9, beat: 2, lane: 0 },
  { bar: 10, beat: 0, lane: 2 }, { bar: 10, beat: 2, lane: 3 },
  { bar: 11, beat: 0, lane: 3 }, { bar: 11, beat: 1, lane: 3 }, { bar: 11, beat: 2, lane: 2 },
  { bar: 12, beat: 0, lane: 2 }, { bar: 12, beat: 1, lane: 1 }, { bar: 12, beat: 2, lane: 0 },
  { bar: 13, beat: 0, lane: 1 }, { bar: 13, beat: 1.5, lane: 2 }, { bar: 13, beat: 2, lane: 1 },
  { bar: 14, beat: 0, lane: 3 }, { bar: 14, beat: 2, lane: 3 },
  { bar: 15, beat: 0, lane: 2 }, { bar: 15, beat: 1, lane: 3 }, { bar: 15, beat: 2, lane: 2 },
  { bar: 16, beat: 0, lane: 1 }, { bar: 16, beat: 2, lane: 0 },
  // Second tour de piste : la valse reprend de plus belle
  { bar: 17, beat: 0, lane: 1 }, { bar: 17, beat: 2, lane: 2 },
  { bar: 18, beat: 0, lane: 2 }, { bar: 18, beat: 1, lane: 3 }, { bar: 18, beat: 2, lane: 3 },
  { bar: 19, beat: 0, lane: 3 }, { bar: 19, beat: 2, lane: 1 },
  { bar: 20, beat: 0, lane: 1 }, { bar: 20, beat: 1.5, lane: 2 }, { bar: 20, beat: 2, lane: 1 },
  { bar: 21, beat: 0, lane: 0 }, { bar: 21, beat: 2, lane: 2 },
  { bar: 22, beat: 0, lane: 2 }, { bar: 22, beat: 1, lane: 1 }, { bar: 22, beat: 2, lane: 3 },
  { bar: 23, beat: 0, lane: 3 }, { bar: 23, beat: 2, lane: 2 },
  { bar: 24, beat: 0, lane: 2 }, { bar: 24, beat: 1.5, lane: 1 }, { bar: 24, beat: 2, lane: 2 },
  { bar: 25, beat: 0, lane: 1 }, { bar: 25, beat: 2, lane: 0 },
  { bar: 26, beat: 0, lane: 0 }, { bar: 26, beat: 1, lane: 1 }, { bar: 26, beat: 2, lane: 2 },
  { bar: 27, beat: 0, lane: 3 }, { bar: 27, beat: 1, lane: 2 }, { bar: 27, beat: 2, lane: 1 },
  // Dernier accord : sobre, bref, parfait
  { bar: 28, beat: 0, lane: 0 }
];
// Conversion mesures/temps → secondes : (bar × 3 + beat) × 60 / BPM
const RYTHME_MELODIE = RYTHME_SCORE.map(n => ({
  lane: n.lane,
  t: (n.bar * 3 + n.beat) * (60 / RYTHME_BPM)
}));
// Charge la musique (cascade mp3/ogg/wav). Si aucun fichier n'est trouvé,
// le mini-jeu tourne en silence sur l'horloge interne : aucune erreur.
function rythmeLoadAudio(s) {
  let i = 0;
  const tryNext = () => {
    if (i >= RYTHME_AUDIO_EXTS.length) return; // pas de musique → mode silencieux
    const a = new Audio(RYTHME_AUDIO_PATH + RYTHME_AUDIO_EXTS[i++]);
    a.oncanplaythrough = () => {
      s.audio = a;
      a.volume = 0.9;
      // Lecture SEULEMENT si la partie est encore en cours : si on a gagné,
      // perdu ou quitté avant la fin du chargement, pas de musique fantôme
      // qui démarre toute seule une fois revenu dans le hub !
      if (!s.over) a.play().catch(() => {});
    };
    a.onerror = tryNext;
    a.load();
  };
  tryNext();
}
const RYTHME_SPEED = 260;    // px/s de chute des notes
const RYTHME_HIT_Y = 420;    // hauteur de la zone de réussite
const RYTHME_WINDOW = 0.16;  // fenêtre de réussite, en secondes
const RYTHME_TARGET_HITS = 30;

MINIGAMES['rythme'] = {
  type: 'canvas',
  init(canvas, zone, s) {
    s.zone = zone;
    s.songT = 0;
    s.audio = null;
    rythmeLoadAudio(s);
    s.notes = RYTHME_MELODIE.map(n => ({ lane: n.lane, t: n.t, judged: false, hit: false }));
    s.hits = 0; s.misses = 0;
    s.flashes = []; // { lane, ok, age }
    s.ended = false;
    s.lastT = performance.now();
    s._onKeyDown = (e) => {
      if (gameState !== 'miniGame' || e.repeat) return;
      const lane = RYTHME_KEYS.indexOf(e.key.toLowerCase());
      if (lane === -1) return;
      e.preventDefault();
      // Cherche la note non jugée la plus proche sur CETTE voie
      let best = null, bestD = Infinity;
      for (const n of s.notes) {
        if (n.lane !== lane || n.judged) continue;
        const d = Math.abs(n.t - s.songT);
        if (d < bestD) { bestD = d; best = n; }
      }
      if (best && bestD <= RYTHME_WINDOW) {
        best.judged = true; best.hit = true;
        s.hits++;
        s.flashes.push({ lane, ok: true, age: 0 });
      } else {
        s.misses++;
        s.flashes.push({ lane, ok: false, age: 0 });
      }
    };
    window.addEventListener('keydown', s._onKeyDown);
  },
  update(ctx, canvas, s) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - s.lastT) / 1000);
    s.lastT = now;
    // Horloge calée sur la musique (aucune dérive possible) si le fichier
    // est présent, sinon horloge interne en mode silencieux.
    if (s.audio && !s.audio.paused && !s.audio.ended) {
      s.songT = s.audio.currentTime - RYTHME_START_OFFSET;
    } else {
      s.songT += dt;
    }

    // Notes dépassées sans avoir été jouées : manquées
    for (const n of s.notes) {
      if (!n.judged && s.songT > n.t + RYTHME_WINDOW) { n.judged = true; n.hit = false; s.misses++; }
    }

    if (!s.ended && s.songT > RYTHME_MELODIE[RYTHME_MELODIE.length - 1].t + 1.2) {
      s.ended = true;
      // La valse s'arrête net à la fin du concert, pas une seconde de plus
      if (s.audio) s.audio.pause();
      if (s.hits >= RYTHME_TARGET_HITS) mgSuccess(s.zone);
      else mgFail(s.zone, `Le public s'est endormi : ${s.hits} / ${RYTHME_TARGET_HITS} notes !`);
      return;
    }

    // ---- Dessin : scène du conservatoire ----
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1b2440'); grad.addColorStop(1, '#0d1117');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 4 couloirs
    const laneW = canvas.width / 4;
    RYTHME_COLORS.forEach((c, i) => {
      ctx.fillStyle = c + '14';
      ctx.fillRect(i * laneW, 0, laneW, canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(i * laneW, 0); ctx.lineTo(i * laneW, canvas.height);
      ctx.stroke();
    });

    // Zone de réussite
    ctx.fillStyle = 'rgba(255,215,107,0.15)';
    ctx.fillRect(0, RYTHME_HIT_Y - 26, canvas.width, 52);
    ctx.strokeStyle = '#ffd76b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, RYTHME_HIT_Y); ctx.lineTo(canvas.width, RYTHME_HIT_Y); ctx.stroke();

    // Rondes de touche A S D F
    RYTHME_LABELS.forEach((lbl, i) => {
      const cx = i * laneW + laneW / 2;
      ctx.fillStyle = RYTHME_COLORS[i] + '55';
      ctx.beginPath(); ctx.arc(cx, RYTHME_HIT_Y, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = RYTHME_COLORS[i]; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(lbl, cx, RYTHME_HIT_Y + 1);
    });

    // Notes qui tombent (les réussies disparaissent, les manquées grisent)
    s.notes.forEach(n => {
      if (n.judged && n.hit) return;
      const cx = n.lane * laneW + laneW / 2;
      const y = RYTHME_HIT_Y - (n.t - s.songT) * RYTHME_SPEED;
      if (y < -30 || y > canvas.height + 30) return;
      ctx.globalAlpha = (n.judged && !n.hit) ? 0.25 : 1;
      ctx.fillStyle = (n.judged && !n.hit) ? '#5a6b7a' : RYTHME_COLORS[n.lane];
      ctx.beginPath();
      ctx.ellipse(cx, y, 16, 11, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Retours visuels (touché / raté)
    for (let i = s.flashes.length - 1; i >= 0; i--) {
      const f = s.flashes[i];
      f.age += dt;
      if (f.age > 0.35) { s.flashes.splice(i, 1); continue; }
      const cx = f.lane * laneW + laneW / 2;
      const p = f.age / 0.35;
      ctx.strokeStyle = f.ok ? `rgba(76,175,80,${1 - p})` : `rgba(224,75,75,${1 - p})`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, RYTHME_HIT_Y, 26 + p * 30, 0, Math.PI * 2); ctx.stroke();
    }

    // Violon de Naomi en déco
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('🎻', canvas.width - 16, 12);

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(10, 10, 230, 40);
    ctx.fillStyle = '#ffd76b';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`🎶 Notes : ${s.hits} / ${RYTHME_TARGET_HITS}`, 22, 18);
  },
  cleanup() {
    if (mgState) window.removeEventListener('keydown', mgState._onKeyDown);
    // Stoppe la musique ET bloque tout démarrage tardif : même si le fichier
    // finissait de se charger après la sortie du jeu, il ne jouera jamais.
    if (mgState) {
      mgState.over = true;
      if (mgState.audio) { mgState.audio.pause(); mgState.audio.currentTime = 0; }
    }
  }
};
