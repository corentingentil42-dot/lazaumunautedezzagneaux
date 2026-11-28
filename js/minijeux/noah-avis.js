/* ============================================================
   js/minijeux/noah-avis.js — Mini-jeu de Noah : l'avis de la honte (type 'avis', 3 vies).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE NOAH : L'AVIS DE LA HONTE (choix chronométrés) ============ */
const AVIS_ROUNDS = [
  { sujet: "Ton avis sur le film Cars ?", avis: ["Un chef-d'œuvre du cinéma d'animation", "Correct, sans plus"], honte: "La plus belle histoire d'amour jamais racontée depuis Léon et Flash" },
  { sujet: "Ton avis sur les citrons ?", avis: ["Un fruit comme les autres", "Très bon en limonade"], honte: "L'ennemi public numéro 1, à bannir de la surface de la Terre" },
  { sujet: "Ton avis sur les blagues de Perline ?", avis: ["Elles sont nulles", "Nulles, mais d'une nullité raffinée"], honte: "Du grand art : je pleure à chaque fois (de rire, pas de désespoir)" },
  { sujet: "Ton avis sur l'argent de Lawisse ?", avis: ["Il gère plutôt bien", "Il claque tout trop vite"], honte: "Le banquier le plus généreux du groupe, il prête à tout le monde" },
  { sujet: "Ton avis sur le volley de M.M. ?", avis: ["Il est costaud", "Il progresse bien"], honte: "Il joue mieux avec les pieds, candidat au Ballon d'Or" },
  { sujet: "Ton avis sur la frange d'Elaïs ?", avis: ["Très jolie", "Elle a du potentiel"], honte: "Un événement scientifique qui mérite sa thèse à lui tout seul" }
];
const AVIS_CHRONO = 5; // secondes par avis

MINIGAMES['avis'] = {
  type: 'dom',
  init(container, zone, s, callbacks) {
    s.zone = zone;
    s.onSuccess = callbacks.onSuccess;
    s.onFail = callbacks.onFail;
    s.pool = mgShuffle(AVIS_ROUNDS).slice(0, 5);
    s.round = 0;
    s.lives = 3;
    s.timeLeft = AVIS_CHRONO;
    s.done = false;
    s.container = container;
    s._onKeyDown = (e) => {
      if (gameState !== 'miniGame' || e.repeat || s.done) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 3) {
        const opts = s.container.querySelectorAll('.enigmaOption');
        if (opts[n - 1] && !opts[n - 1].disabled) opts[n - 1].click();
      }
    };
    window.addEventListener('keydown', s._onKeyDown);
    s._interval = setInterval(() => {
      if (s.done) return;
      s.timeLeft -= 0.1;
      const fill = s.container.querySelector('#avisTimerFill');
      if (fill) fill.style.width = Math.max(0, (s.timeLeft / AVIS_CHRONO) * 100) + '%';
      if (s.timeLeft <= 0) registerAvisAnswer(s, false, true);
    }, 100);
    renderAvisRound(s);
  },
  update() {},
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      if (mgState._interval) clearInterval(mgState._interval);
    }
  }
};

function renderAvisRound(s) {
  if (s.done || gameState !== 'miniGame') return;
  if (s.round >= s.pool.length) { s.done = true; s.onSuccess(); return; }
  const r = s.pool[s.round];
  s.timeLeft = AVIS_CHRONO;
  const opts = mgShuffle([
    ...r.avis.map(t => ({ text: t, isHonte: false })),
    { text: r.honte, isHonte: true }
  ]);
  s.container.innerHTML = `
    <div style="font-size:15px;color:#9db3a8;margin-bottom:10px;">⚽ Avis n°${s.round + 1} / ${s.pool.length} — ❤️ ${'♥'.repeat(Math.max(0, s.lives))}</div>
    <div id="avisTimerFill" style="width:100%;height:10px;background:#e04b4b;border-radius:4px;margin-bottom:18px;transition:width 0.1s linear;"></div>
    <div class="enigmaQuestion">« ${r.sujet} »</div>
    <div class="enigmaOptions">
      ${opts.map((o, i) => `<button class="enigmaOption">${i + 1}. ${o.text}</button>`).join('')}
    </div>
    <div style="margin-top:14px;color:#9db3a8;font-size:12px;">Choisis l'avis le plus ABSURDE. Vite. La honte n'attend pas.</div>
  `;
  const buttons = s.container.querySelectorAll('.enigmaOption');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (s.done || btn.disabled) return;
      btn.disabled = true;
      registerAvisAnswer(s, opts[i].isHonte, false);
    });
  });
}

function registerAvisAnswer(s, isHonte, viaTimeout) {
  if (s.done) return;
  if (isHonte) {
    s.round++;
    renderAvisRound(s);
    return;
  }
  s.lives--;
  if (s.lives <= 0) {
    s.done = true;
    mgFail(s.zone, viaTimeout ? "Trop lent ! La honte, c'est aussi ça." : "Raté ! Cet avis était beaucoup trop raisonnable.");
    return;
  }
  renderAvisRound(s);
}
