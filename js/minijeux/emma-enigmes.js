/* ============================================================
   js/minijeux/emma-enigmes.js — Mini-jeu d'Emma : énigmes du sarcasme (type 'enigmes', 3 vies).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU D'EMMA : L'ÉNIGME DU SARCASME (quiz chronométré) ============ */
const ENIGMES_POOL = [
  { q: "Plus j'en prends, plus j'en laisse derrière moi. Que suis-je ?", options: ["Des pas", "Des excuses", "Des soucis", "Des abonnés"], correct: 0 },
  { q: "Je n'ai pas de voix, mais je réponds toujours quand on me parle. Qui suis-je ?", options: ["Un perroquet endormi", "Un écho", "Un miroir", "Un prof absent"], correct: 1 },
  { q: "Je commence la nuit et je termine le matin, et je ne compte qu'une seule lettre. Qui suis-je ?", options: ["La lettre N", "La lettre O", "La lettre Z", "Personne, c'est n'importe quoi"], correct: 0 },
  { q: "Qu'est-ce qui t'appartient, mais que les autres utilisent plus souvent que toi ?", options: ["Ton téléphone", "Ton prénom", "Ton argent", "Ton lit"], correct: 1 },
  { q: "Qu'est-ce qui a des dents mais ne mange jamais ?", options: ["Un vampire au régime", "Un peigne", "Une fourchette", "Un requin distrait"], correct: 1 },
  { q: "Qu'est-ce qui traverse les vitres sans jamais les casser ?", options: ["La lumière", "Un caillou bien lancé", "Le vent", "Un pigeon déterminé"], correct: 0 },
  { q: "Qu'est-ce qui monte et descend mais reste toujours à la même place ?", options: ["La température", "Le soleil", "Un escalier", "L'ascenseur de perlinpinpin"], correct: 2 },
  { q: "Qu'est-ce qui peut remplir une salle entière sans prendre la moindre place ?", options: ["La voix", "Un éléphant", "La fumée", "L'odeur de fromage"], correct: 0 },
  { q: "Je suis plein de trous, pourtant je retiens l'eau. Que suis-je ?", options: ["Une passoire", "Une éponge", "Un fromage suisse", "Un filet de pêche"], correct: 1 },
  { q: "Je suis toujours devant toi, mais on ne peut jamais me voir. Qui suis-je ?", options: ["Le mur", "L'avenir", "Ton reflet", "Le tableau"], correct: 1 },
  { q: "Qu'est-ce qui a un cou mais pas de tête ?", options: ["Une bouteille", "Un escargot", "Un parapluie", "Une girafe en chocolat"], correct: 0 },
  { q: "Qu'est-ce qui a quatre pieds mais ne marche jamais ?", options: ["Une table", "Un chat", "Un cheval de course", "Un prof de maths pressé"], correct: 0 },
  { q: "Plus je sèche les autres, plus je suis mouillée. Qui suis-je ?", options: ["Une serviette", "Un nuage", "Un sèche-cheveux", "Un poisson"], correct: 0 },
  { q: "J'ai des villes mais pas de maisons, des forêts mais pas d'arbres, de l'eau mais pas de poissons. Qui suis-je ?", options: ["Une carte", "Une forêt tropicale", "Un aquarium", "Un manuel de SVT"], correct: 0 },
  { q: "Qu'est-ce qui se brise dès qu'on prononce son nom ?", options: ["Un œuf", "Le silence", "Un os", "Un cœur"], correct: 1 },
  { q: "Qu'est-ce qui devient plus grand quand on lui enlève de la matière ?", options: ["Un gâteau", "Un trou", "Un budget", "Une pile de devoirs"], correct: 1 },
  { q: "Je vole sans ailes et je pleure sans yeux. Qui suis-je ?", options: ["Un nuage", "Un avion en papier", "Un oignon", "Un fantôme enrhumé"], correct: 0 },
  { q: "Je grandis quand on me nourrit, et je meurs quand on me donne à boire. Qui suis-je ?", options: ["Une plante", "Un hamster", "Le feu", "Un volcan éteint"], correct: 2 },
  { q: "Qu'est-ce qui commence par un E, finit par un E, et ne contient qu'une seule lettre ?", options: ["Un éléphant", "Une enveloppe", "Un écureuil", "Un examen"], correct: 1 },
  { q: "J'ai 88 touches, mais je n'ouvre aucune porte. Qui suis-je ?", options: ["Un trousseau de clés", "Un piano", "Un clavier de PC", "Un ascenseur"], correct: 1 },
  { q: "Qu'est-ce qui court sans jamais avoir de jambes ?", options: ["Un escargot", "Une rivière", "Une tortue", "Un fauteuil"], correct: 1 },
  { q: "Qu'est-ce qu'on peut battre sans jamais le toucher ?", options: ["Un tapis", "Un record", "Des œufs", "Un tambour"], correct: 1 }
];
const ENIGMES_PAR_MANCHE = 10; // v20.25 : 10 énigmes tirées de 22, avec 3 vies comme Magir
const ENIGMES_CHRONO = 25; // secondes par énigme

MINIGAMES['enigmes'] = {
  type: 'dom',
  init(container, zone, s, callbacks) {
    s.zone = zone;
    s.onSuccess = callbacks.onSuccess;
    s.onFail = callbacks.onFail;
    s.pool = mgShuffle(ENIGMES_POOL).slice(0, ENIGMES_PAR_MANCHE);
    s.qIndex = 0;
    s.lives = 3;
    s.timeLeft = ENIGMES_CHRONO;
    s.done = false;
    s.container = container;
    s._onKeyDown = (e) => {
      if (gameState !== 'miniGame' || e.repeat || s.done) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 4) {
        const opts = s.container.querySelectorAll('.enigmaOption');
        if (opts[n - 1] && !opts[n - 1].disabled) opts[n - 1].click();
      }
    };
    window.addEventListener('keydown', s._onKeyDown);
    s._interval = setInterval(() => {
      if (s.done) return;
      s.timeLeft -= 0.1;
      const fill = s.container.querySelector('#enigmeTimerFill');
      if (fill) fill.style.width = Math.max(0, (s.timeLeft / ENIGMES_CHRONO) * 100) + '%';
      if (s.timeLeft <= 0) {
        s.done = true;
        mgFail(s.zone, "Temps écoulé ! Emma a bâilli. C'est dire.");
      }
    }, 100);
    renderEnigme(s);
  },
  update() { /* piloté par les clics et le chrono */ },
  cleanup() {
    if (mgState) {
      window.removeEventListener('keydown', mgState._onKeyDown);
      if (mgState._interval) clearInterval(mgState._interval);
    }
  }
};

function renderEnigme(s) {
  if (s.done || gameState !== 'miniGame') return;
  if (s.qIndex >= s.pool.length) { s.done = true; s.onSuccess(); return; }
  const en = s.pool[s.qIndex];
  s.timeLeft = ENIGMES_CHRONO;
  const opts = mgShuffle(en.options.map((text, i) => ({ text, isCorrect: i === en.correct })));
  s.container.innerHTML = `
    <div style="font-size:15px;color:#9db3a8;margin-bottom:10px;">📚 Emma te fixe avec un sourire en coin — Énigme ${s.qIndex + 1} / ${s.pool.length} — ❤️ ${'♥'.repeat(Math.max(0, s.lives))}</div>
    <div id="enigmeTimerFill" style="width:100%;height:10px;background:#7bc8ff;border-radius:4px;margin-bottom:18px;transition:width 0.1s linear;"></div>
    <div class="enigmaQuestion">« ${en.q} »</div>
    <div class="enigmaOptions">
      ${opts.map((o, i) => `<button class="enigmaOption">${i + 1}. ${o.text}</button>`).join('')}
    </div>
    <div style="margin-top:14px;color:#9db3a8;font-size:12px;">Emma : « Vite, s'il te plaît, j'ai une bibliothèque qui m'attend. »</div>
  `;
  const buttons = s.container.querySelectorAll('.enigmaOption');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (s.done || btn.disabled) return;
      if (opts[i].isCorrect) {
        btn.classList.add('correct');
        buttons.forEach(b => b.disabled = true);
        s.qIndex++;
        setTimeout(() => renderEnigme(s), 450);
      } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        s.lives--;
        if (s.lives <= 0) {
          s.done = true;
          mgFail(s.zone, "Emma : « Pas besoin d'être intello pour voir que tu es nul. »");
        }
      }
    });
  });
}
