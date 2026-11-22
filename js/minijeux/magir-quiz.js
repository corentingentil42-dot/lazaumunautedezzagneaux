/* ============================================================
   js/minijeux/magir-quiz.js — Mini-jeu de Magir : quiz des private jokes (type 'meme', 3 vies).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// ---- Quiz de Magir : private jokes du groupe de potes ----
// Dépose une image par question dans assets/mini-jeu-magir/ sous l'un de ces noms :
// q1.jpg (ou .jpeg/.png/.webp), q2.jpg, ... q10.jpg — une image par question, dans l'ordre ci-dessous.
// Sans image, la question s'affiche simplement sans illustration : aucune erreur.
const MEME_QUIZ_IMG_PATH = 'assets/mini-jeu-magir/';
function loadMemeQuizImage(id, imgEl) {
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  let i = 0;
  function tryNext() {
    if (i >= exts.length) { imgEl.style.display = 'none'; return; }
    const src = `${MEME_QUIZ_IMG_PATH}${id}.${exts[i]}`;
    i++;
    imgEl.onerror = tryNext;
    imgEl.onload = () => { imgEl.style.display = 'block'; };
    imgEl.src = src;
  }
  tryNext();
}

const MEME_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    q: "Quel évènement a marqué le début des fameux mèmes \"Absolute\" dans le groupe de potes ?",
    options: [
      "Quand Maxime Michel a dit \"Absolute Cinéma\" au lieu de \"Absolut Vodka\"",
      "Aucun, juste une idée de génie de Magir, Lawisse et Coco",
      "Lors de la sortie de groupe au cinéma pour voir le film \"Scary Movies\"",
      "La première fois qu'on a rencontré Maxime Michel"
    ],
    correct: 2
  },
  {
    id: 'q2',
    q: "Chez Magir, lorsque Perline et Coco se sont pécho pour la première fois, que regardait-il à la télé ?",
    options: [
      "Le film \"Cars\" (vroum vroum)",
      "Une vidéo d'Inoxtag (mentalité Kaizen)",
      "Le recap du Grand Prix de Formule 1 d'Espagne 2016 (première victoire de Verstappen)",
      "Cnews (le couple de sionistes)"
    ],
    correct: 3
  },
  {
    id: 'q3',
    q: "Lorsque Magir s'est pris sa première cuite chez Tristan, sur quoi a-t-il vomi ?",
    options: [
      "Sur Saint-Pierre",
      "Sur les claquettes de Lilie",
      "Sur ses propres genoux",
      "Dans un récipient prévu pour"
    ],
    correct: 1
  },
  {
    id: 'q4',
    q: "Qui a neutralisé Camille pendant 1 journée entière avec un déodorant ?",
    options: ["Coco", "Lawisse", "Callipyge", "Noah"],
    correct: 3
  },
  {
    id: 'q5',
    q: "Qui a déjà fait une passe à Coco uniquement dans l'espoir de coucher avec lui ?",
    options: ["Coco lui-même", "Callipyge", "Elaïs", "Perline"],
    correct: 2
  },
  {
    id: 'q6',
    q: "Quel est le bon couple de plan cul ?",
    options: ["Perline-Callipyge", "Naomi-Elaïs", "Noah-Magir", "Horace-Camille"],
    correct: 0
  },
  {
    id: 'q7',
    q: "Au lieu de dire \"Ferme ta gueule\", Maxime Michel dit plutôt :",
    options: [
      "Ferme ta bouche tu vas gober les mouches",
      "Ferme ta boite à clapet",
      "T'as un bloc-note ? T'as un crayon ? Écris : Ta gueule",
      "Oublie pas que je suis le démon en personne"
    ],
    correct: 0
  },
  {
    id: 'q8',
    q: "Parmi ces choses stupides, qu'est-ce que Coco a déjà fait ?",
    options: [
      "Mettre un ballon de baudruche pour remplacer une capote pour faire l'amour avec Perline",
      "Se prendre 45€ d'amende dans le bus car sa carte de bus était dans la poche de Perline qui finissait 1h plus tard",
      "Quitter Perline et se remettre avec elle 5 secondes après pour être son sixième et septième mec en même temps (SIX SEVEN)",
      "Gratter les cheveux de la sœur de Perline car de dos il les a confondus"
    ],
    correct: 2
  },
  {
    id: 'q9',
    q: "D'après Maeva, quel est l'avenir de Coco ?",
    options: ["Ingénieur automobile", "Il va redoubler", "Il va finir à la rue", "Il a pas d'avenir"],
    correct: 3
  },
  {
    id: 'q10',
    q: "Selon Noah, quelle équipe est dans le top 3 des meilleurs collectifs du monde ?",
    options: ["Le Brésil", "La France", "Le Japon", "Le Nigeria"],
    correct: 0
  }
];

MINIGAMES['meme'] = {
  type: 'dom',
  init(container, zone, s, callbacks) {
    s.zone = zone;
    s.onSuccess = callbacks.onSuccess;
    s.onFail = callbacks.onFail;
    s.lives = 3; // total de fautes autorisées sur l'ensemble du quiz, toutes questions confondues
    s.pool = mgShuffle([...MEME_QUIZ_QUESTIONS]);
    s.qIndex = 0;
    s.container = container;
    s.timeoutId = null;
    renderMemeQuestion(s);
  },
  update() { /* piloté par les clics, rien à faire par frame */ },
  cleanup() {
    if (mgState && mgState.timeoutId) clearTimeout(mgState.timeoutId);
  }
};

function renderMemeQuestion(s) {
  // Il faut répondre juste à TOUTES les questions du paquet pour gagner
  if (s.qIndex >= s.pool.length) { s.onSuccess(); return; }

  const question = s.pool[s.qIndex];
  const shuffledOptions = mgShuffle(question.options.map((text, i) => ({ text, isCorrect: i === question.correct })));

  s.container.innerHTML = `
    <div class="meme-quiz" id="memeQuizCard">
      <div class="meme-topbar">
        <span>❓ Question ${s.qIndex + 1} / ${s.pool.length}</span>
        <span class="meme-hearts">${'❤️'.repeat(Math.max(0, s.lives))}</span>
      </div>
      <div class="meme-img-wrap"><img id="memeQImg" alt="" /></div>
      <div class="meme-question">${question.q}</div>
      <div class="meme-options">
        ${shuffledOptions.map((o, i) => `<button class="meme-option" data-correct="${o.isCorrect}">${String.fromCharCode(65+i)}) ${o.text}</button>`).join('')}
      </div>
    </div>
  `;
  loadMemeQuizImage(question.id, s.container.querySelector('#memeQImg'));

  const card = s.container.querySelector('#memeQuizCard');
  const buttons = s.container.querySelectorAll('.meme-option');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const isCorrect = btn.getAttribute('data-correct') === 'true';

      if (isCorrect) {
        // Au cas où un temps d'attente était encore en cours (animation
        // d'erreur), on l'annule proprement avant de passer à la suite.
        if (s.timeoutId) { clearTimeout(s.timeoutId); s.timeoutId = null; }
        buttons.forEach(b => b.disabled = true);
        btn.classList.add('correct');
        s.timeoutId = setTimeout(() => {
          s.qIndex++;
          renderMemeQuestion(s);
        }, 700);
      } else {
        // Cette réponse est éliminée (grisée), mais on doit quand même
        // retrouver la bonne réponse sur CETTE question pour avancer.
        btn.disabled = true;
        btn.classList.add('eliminated');
        s.lives--;

        // Effet façon Elaïs : secousse + flash rouge
        card.classList.remove('wrong-flash'); void card.offsetWidth; // relance l'animation si déjà jouée
        card.classList.add('wrong-flash');

        // Le temps d'attente ne sert plus qu'à nettoyer l'animation : la
        // défaite est déclenchée immédiatement quand les vies tombent à 0,
        // sans quoi une bonne réponse cliquée à toute vitesse pendant la
        // fenêtre de 400ms annulait la défaite par erreur.
        s.timeoutId = setTimeout(() => { card.classList.remove('wrong-flash'); }, 400);
        if (s.lives <= 0) { s.onFail(); return; }
      }
    });
  });
}
