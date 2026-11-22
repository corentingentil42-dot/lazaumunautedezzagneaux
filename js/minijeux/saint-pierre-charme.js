/* ============================================================
   js/minijeux/saint-pierre-charme.js — Mini-jeu de Saint-Pierre : la soirée mondaine, 3 jauges de séduction (type 'charme').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE SAINT-PIERRE : LA SOIRÉE MONDAINE (dragage narratif) ============ */
// Principe : chaque personne à draguer a une JAUGE de séduction. Les bonnes
// répliques la font grimper, les ratées la font chuter. Jauge pleine = la
// personne est draguée, on passe à la suivante. Jauge à zéro = dégoûtée,
// soirée finie. Entre les deux, on peut chuter plusieurs fois... tant qu'on
// remonte assez vite avant d'épuiser les moments de la rencontre.
const CHARME_START = 35;   // jauge de départ
const CHARME_SEDUIT = 100; // seuil de dragage réussi

const CHARME_PERSONNES = [
  {
    nom: 'Lily, la barmaid', emoji: '🍸',
    intro: "Première personne à draguer : Lily, la barmaid du Bar Mondain. Elle essuie un verre sans regarder personne, et derrière son comptoir, c'est elle la loi. Trois clients ont déjà retenti sans succès. Toi, tu commandes un whisky, tu souris, et tu te dis que la soirée commence à peine.",
    moments: [
      { situation: "Elle pose ton verre sans un mot. Le silence, ici, c'est son territoire de chasse.", options: [
        { t: "« Ton silence est tellement intense que j'aimerais le faire durer un peu. »", d: 20, r: "Elle retient un sourire en coin. « Première phrase correcte de la soirée. »" },
        { t: "« Y'a de la musique dans ce bar ? »", d: 8, r: "« Le patron l'a coupée. Ici, c'est moi la playlist. » L'ambiance se détend un peu." },
        { t: "« C'est toujours aussi silencieux, ou c'est que pour moi ? »", d: -15, r: "Elle soupire : « C'est surtout que vous êtes le dixième à me sortir celle-là. »" }
      ]},
      { situation: "Un client prétentieux, deux places plus loin, clame que son whisky est 'fade'. Lily lève les yeux au ciel.", options: [
        { t: "« Le whisky est parfait. C'est son palais qui est fade. »", d: 20, r: "Elle sert le client suivant en glissant : « Réparé en une phrase. Respect. »" },
        { t: "« Chacun son goût, hein. »", d: 8, r: "Elle hoche la tête. Prudent. Un peu trop pour marquer des points." },
        { t: "« Il est vrai qu'il est fade, votre whisky. »", d: -15, r: "Le regard d'Lily se refroidit d'un coup. Critiquer son whisky, quelle idée." }
      ]},
      { situation: "Elle te teste, chiffon en travers de l'épaule : « Pourquoi moi ? Y'a tout le bar, ce soir. »", options: [
        { t: "« Tout le bar te regarde. Moi, je te vois. »", d: 20, r: "Un temps. « Continue. Tu m'intérresses soudainement. »" },
        { t: "« Bonne question. Je vais y réfléchir sérieusement. »", d: 8, r: "Elle sourit. « Au moins tu réfléchis. C'est déjà rare ici. »" },
        { t: "« T'es la plus proche du comptoir, c'est tout. »", d: -15, r: "« Charmant. Tu cherches la sortie aussi ? » La jauge plonge." }
      ]},
      { situation: "Elle avoue, entre deux verres, qu'elle déteste les hommes qui parlent de leur montre.", options: [
        { t: "« Je n'ai pas de montre. J'ai le temps. »", d: 20, r: "Elle pose son chiffon. « OK, celle-là, tu l'as travaillée. »" },
        { t: "« Moi non plus, je porte pas de montre. »", d: 8, r: "« On a au moins ça en commun. » Léger, mais sincère." },
        { t: "« Regarde ma montre, elle est énorme. »", d: -15, r: "Elle fixe la montre, puis toi. « Exactement ce que je déteste. Bien joué. »" }
      ]},
      { situation: "Elle te tourne le dos pour ranger les hautes bouteilles. Moment risqué : on peut la perdre ou la conquérir.", options: [
        { t: "« Tu ranges comme une reine. J'attends mon tour pour le sacre. »", d: 20, r: "Elle rit, dos tourné. « Le sacre, c'est pas gagné. » Mais la jauge grimpe." },
        { t: "Tu patientes, serein, sans un mot.", d: 8, r: "Se retourner est son choix. Elle le fait, du coin de l'œil. Serein, ça marche." },
        { t: "« Hé, on se sert pas soi-même ici, non ? »", d: -15, r: "« Si. Mais pas vous. » Retour au silence de départ." }
      ]},
      { situation: "Le bar se vide peu à peu. Elle souffle : « Alors, c'est quoi ton plan pour me convaincre ? »", options: [
        { t: "« Aucun plan. Le charme qui s'improvise, c'est le seul qui se voit. »", d: 20, r: "Elle pose ses coudes sur le comptoir. « Vas-y. Je t'écoute. »" },
        { t: "« T'offrir un dernier verre que tu n'as pas préparé toi-même ? »", d: 8, r: "« Drôle d'idée. Mais originale. »" },
        { t: "« T'emmener direct à ma moto, on s'en va maintenant. »", d: -15, r: "« On ne connaît même pas nos prénoms. Recule d'un pas. »" }
      ]},
      { situation: "Dernier moment avant qu'elle ne reprenne son service. Elle attend, immobile.", options: [
        { t: "« Donne-moi ton prénom, et je te laisse travailler en paix. Ce soir. »", d: 20, r: "« Lily. Et toi, tu m'as fait passer une belle soirée. »" },
        { t: "« Bon service, hein, la prochaine. »", d: 8, r: "« À la prochaine, alors. » Sympa. Sobre." },
        { t: "« Bon, t'es de garde combien de temps encore ? »", d: -15, r: "« Toute la nuit. Comme ta patience, apparemment. » Ouch." }
      ]}
    ],
    reussite: "Lily repose son chiffon et verse deux whiskies qu'elle n'a pas fait payer. « T'as réussi l'impossible : me faire aimer ce bar. Parle-moi encore un peu. »",
    ratee: "Lily reprend son chiffon. « On drague mieux que ça, d'habitude. » Verdict sans appel : soirée finie."
  },
  {
    nom: 'Elaïs, l\'héritière', emoji: '👑',
    intro: "Deuxième personne à draguer : Elaïs, l'héritière de la fortune en liqueurs des Vaudor. Elle trône au fond du salon au milieu d'une cour de faux sourires. Tout le monde veut quelque chose d'elle. Personne, ce soir, ne la regarde vraiment.",
    moments: [
      { situation: "Sa cour de courtisans te dévisage. Elaïs attend ta première phrase, un sourire figé aux lèvres.", options: [
        { t: "« Je n'ai rien à te demander. C'est plutôt reposant, non ? »", d: 20, r: "Le sourire figé devient vrai. « Effectivement. Continue. »" },
        { t: "« Enchanté, charmante demoiselle. »", d: 8, r: "« Enchantée. » Poli, tiré par les cheveux, mais poli." },
        { t: "« Alors, c'est quoi d'avoir une fortune pareille ? »", d: -15, r: "La cour retient son souffle. « On ne demande PAS ça à une Vaudor. »" }
      ]},
      { situation: "Un courtisan étale l'éloge de sa fortune familiale depuis dix minutes. Elaïs bâille.", options: [
        { t: "« Raconte-moi plutôt la dernière fois que t'as ri pour de vrai. »", d: 20, r: "Elle pose son éventail. « Il y a très longtemps. Il y a... quarante secondes. »" },
        { t: "« Il est long, lui. »", d: 8, r: "Elle étouffe un rire derrière son éventail." },
        { t: "« D'ailleurs, elle vaut combien au juste, ta fortune ? »", d: -15, r: "« La question fatidique. Si tôt. » L'éventail se referme." }
      ]},
      { situation: "Elle te fixe, soudain sérieuse : « Tout le monde est intéressé, ici. Toi aussi, forcément. »", options: [
        { t: "« Intéressé par la liqueur de famille ? J'ai déjà trop bu pour ça. »", d: 20, r: "Elle éclate d'un rire court, mal poli, magnifique. « Enfin quelqu'un de correct. »" },
        { t: "« Peut-être un tout petit peu. »", d: 8, r: "« Honnête. Je note l'honnêteté. »" },
        { t: "« Carrément. Qui refuserait une fortune ? »", d: -15, r: "Elle claque son éventail. « Tout le monde respectable. »" }
      ]},
      { situation: "Son père surgit, sévère : « Et vous, jeune homme, que faites-vous dans la vie ? »", options: [
        { t: "« Je charme. Jusqu'ici, ça marche plutôt bien, vous ne trouvez pas ? »", d: 20, r: "Un silence glacial. Puis Elaïs éclate de rire — la première vraie de la soirée. Son père sourit malgré lui." },
        { t: "« Je me présente en cours, pour l'instant. »", d: 8, r: "« Les études, très bien », approuve le père. Elaïs sourit doucement." },
        { t: "« Rien. Mais je suis très dispo. »", d: -15, r: "Le père se tourne vers sa fille. « Tu fréquentes vraiment ce genre de gens ? »" }
      ]},
      { situation: "Elle t'entraîne sur le balcon, loin de la cour et des convenances.", options: [
        { t: "« C'est le premier endroit où t'as l'air libre depuis ce soir. »", d: 20, r: "Elle s'appuie à la balustrade. « Le balcon est petit, mais la phrase est immense. »" },
        { t: "« Joli balcon. »", d: 8, r: "« Bof comme réplique, joli comme balcon. » Elle sourit quand même." },
        { t: "« On retourne dedans ? J'ai vu des petits fours. »", d: -15, r: "« Des petits fours. Vraiment. C'est ça qui te retient ici ? »" }
      ]},
      { situation: "Sur le balcon, la ville scintille en contrebas. Elle murmure : « Convaincs-moi de rester ici, et pas là-bas. »", options: [
        { t: "« Ici, t'as pas besoin d'être parfaite. C'est la première fois de la soirée. Reste. »", d: 20, r: "Elle te regarde longtemps. « Personne ne m'avait vue comme ça. »" },
        { t: "« Reste avec moi, alors. »", d: 8, r: "« Simple. Efficace. On croise les doigts. »" },
        { t: "« Après tout, les petits fours refroidissent... »", d: -15, r: "Elle lève les yeux au ciel. « Les petits fours. Encore. »" }
      ]},
      { situation: "La cour tambourine à la porte vitrée du balcon. Dernière chance avant qu'elle ne reparte.", options: [
        { t: "« Refuse-moi ce soir, et je repartirai. Mais tu te souviendras que j'attendais ici. »", d: 20, r: "Elle ouvre la porte vitrée et fait signe à la cour de partir. « Eux, ils attendront. »" },
        { t: "« Tu reviens quand tu veux, je suis là. »", d: 8, r: "« Tu es patient. C'est rare. »" },
        { t: "« Bon, j'y retourne, ils m'attendent là-bas. »", d: -15, r: "« Vas-y. Nous aussi. » Chaud, très chaud." }
      ]}
    ],
    reussite: "Elaïs lâche son éventail et laisse sa cour marner derrière elle. « Toi, tu restes à ma table. Le reste du monde peut bien attendre. »",
    ratee: "Elaïs regarde ailleurs, lassée. « Encore un de plus qui parle sans rien dire. » La cour se referme, et toi avec."
  },
  {
    nom: 'Naomi, la violoniste', emoji: '🎻',
    intro: "Troisième et dernière personne à draguer : Naomi, la violoniste du quatuor. Toute la soirée, elle ferme les yeux quand elle joue — la seule sincère de ce monde de paillettes. Le morceau s'achève, le public applaudit poliment. Toi, tu te lèves.",
    moments: [
      { situation: "Le morceau s'achève. Le public applaudit poliment, déjà tourné vers les buffets. Elle n'a pas ouvert les yeux.", options: [
        { t: "« T'étais pas ici. T'étais ailleurs. C'était magnifique, cet ailleurs. »", d: 20, r: "Elle ouvre enfin les yeux, surprise. « Personne n'avait remarqué. »" },
        { t: "« Bravo, vraiment ! »", d: 8, r: "« Merci », dit-elle, polie et déjà lointaine." },
        { t: "« C'était... long, non ? »", d: -15, r: "Elle fixe son violon. « Le morceau, ou la vie ? » Le froid s'installe." }
      ]},
      { situation: "Elle descend de l'estrade, violon sous le bras : « Vous jouez d'un instrument, vous ? »", options: [
        { t: "« Non. Mais je reconnais quelqu'un qui joue juste quand je l'entends. »", d: 20, r: "Elle serre son archet un peu plus fort. « Joli. Continuez. »" },
        { t: "« Un peu de guitare, entre amis. »", d: 8, r: "« La guitare, c'est bien. », dit-elle avec un sourire léger." },
        { t: "« Le triangle. Au CE1. J'étais doué. »", d: -15, r: "Elle étouffe un rire. « Vous êtes sérieux, là ? » L'ambiance vacille." }
      ]},
      { situation: "Elle avoue en rangeant une corde : « Les gens m'applaudissent par politesse. Ça me vide de l'intérieur. »", options: [
        { t: "« Alors joue-moi quelque chose de faux, de vivant, de juste pour moi. »", d: 20, r: "Elle lève les yeux. « Quelque chose de faux... tu oseras le critiquer si c'est raté ? » Le jeu s'installe." },
        { t: "« La politesse, c'est surfait, c'est vrai. »", d: 8, r: "« Ça aussi, c'est poli à dire. », sourit-elle." },
        { t: "« Faut être reconnaissant des applaudissements, quand même. »", d: -15, r: "« Recommandable. Et c'est tout. » Le regard se referme." }
      ]},
      { situation: "Elle hésite, archet en l'air : « Pourquoi moi ? Il y a du monde plus brillant que moi, ce soir. »", options: [
        { t: "« Le monde brillant est poli. Toi, t'es vivante. Ça ne se trouve pas. »", d: 20, r: "Elle détourne les yeux, puis se ravise. « Vivante. Je garde le mot. »" },
        { t: "« T'as un bel instrument. »", d: 8, r: "« Il a surtout une belle voix. Mais merci. »" },
        { t: "« Bah, t'étais sur l'estrade, c'est plus simple. »", d: -15, r: "« Pratique. Voilà un mot qui tue tout. »" }
      ]},
      { situation: "Un ivrogne renverse son verre juste à côté du violon. Un frisson parcourt le salon.", options: [
        { t: "Tu t'interposes et tu sèches l'alcool avant même qu'elle ne s'inquiète.", d: 20, r: "Elle regarde tes mains s'activer, puis ton visage. « Merci. » Le mot sonne différent." },
        { t: "« Attention ! »", d: 8, r: "Elle sauve le violon à temps. « Ça passe. Bof. »" },
        { t: "« Il est où le prochain verre ? Moi aussi je suis sec. »", d: -15, r: "Elle écarquille les yeux. « Le violon qui a failli mourir, ça vous fait quoi ? »" }
      ]},
      { situation: "Le quatuor l'appelle pour le dernier morceau. Elle regarde la scène, puis toi.", options: [
        { t: "« Va-y. Mais ce soir, t'as joué pour toi, pas pour eux. Et moi, j'en profite depuis le début. »", d: 20, r: "Elle sourit franchement. « La scène attendra. Restons ici encore un peu. »" },
        { t: "« Tu reviens me voir après ? »", d: 8, r: "« Peut-être. J'aime bien les reviens-voir. »" },
        { t: "« Bon vent, et bon courage là-haut. »", d: -15, r: "Elle hoche la tête, déjà ailleurs. Le courant passe mal." }
      ]},
      { situation: "Elle tient son violon contre elle, à deux pas de la sortie. Dernière chance de la soirée.", options: [
        { t: "« J'ai rien compris à la musique classique ce soir. J'ai seulement compris toi. »", d: 20, r: "Elle rit — un vrai rire cette fois — et referme la boîte du violon. « Toi, tu restes. »" },
        { t: "« Tu sors avec moi ce soir, ou c'est un rêve ? »", d: 8, r: "« C'est un rêve. Mais continue de rêver à voix haute. »" },
        { t: "« Allez, salut, jolie mélodie. »", d: -15, r: "« Salut. » La porte du salon se referme." }
      ]}
    ],
    reussite: "Naomi abandonne le quatuor à ses collègues et vient s'asseoir près de toi, violon sur les genoux. « La suite, je la joue hors scène. Avec toi. »",
    ratee: "Naomi range son violon dans sa boîte sans un mot. Le quatuor reprend sans toi dans la salle. C'est fini."
  }
];

MINIGAMES['charme'] = {
  type: 'dom',
  init(container, zone, s, callbacks) {
    s.zone = zone;
    s.onSuccess = callbacks.onSuccess;
    s.onFail = callbacks.onFail;
    s.personne = 0;     // index dans CHARME_PERSONNES
    s.filled = 0;       // nombre de jauges remplies à 100 % (= étoiles)
    s.moment = 0;       // index des moments de la personne en cours
    s.gauge = CHARME_START;
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
    renderCharmeIntro(s);
  },
  update() {},
  cleanup() {
    if (mgState) window.removeEventListener('keydown', mgState._onKeyDown);
  }
};

// Humeur affichée selon le niveau de la jauge
function charmeGaugeLabel(g) {
  if (g <= 20) return '😑';
  if (g <= 40) return '😐';
  if (g <= 60) return '🙂';
  if (g <= 80) return '😏';
  return '😍';
}
function charmeGaugeColor(g) {
  if (g <= 20) return '#e04b4b';
  if (g <= 50) return '#e8722c';
  if (g <= 80) return '#ffd76b';
  return '#4caf50';
}

// Écran d'introduction narratif de chaque personne
function renderCharmeIntro(s) {
  if (s.done || gameState !== 'miniGame') return;
  const p = CHARME_PERSONNES[s.personne];
  s.container.innerHTML = `
    <div style="font-size:15px;color:#9db3a8;margin-bottom:10px;">🍸 Personne ${s.personne + 1} / ${CHARME_PERSONNES.length} à draguer</div>
    <div style="font-size:64px;margin-bottom:6px;">${p.emoji}</div>
    <div class="mgTitle">${p.nom}</div>
    <div class="mgSub" style="max-width:560px;line-height:1.6;white-space:pre-line;">${p.intro}</div>
    <button class="mgBtn" id="charmeApproche">Approcher</button>
  `;
  s.container.querySelector('#charmeApproche').addEventListener('click', () => {
    if (s.done) return;
    s.moment = 0;
    s.gauge = CHARME_START;
    renderCharmeMoment(s);
  });
}

// Un moment de la rencontre : situation + 3 répliques, plus la réaction
// narrée de la personne après un choix (la jauge bouge en même temps).
function renderCharmeMoment(s, reaction) {
  if (s.done || gameState !== 'miniGame') return;
  const p = CHARME_PERSONNES[s.personne];
  const m = p.moments[s.moment];
  // La jauge reste TOUJOURS à l'écran, question comme réaction
  const gaugeHtml = `
    <div style="font-size:15px;color:#9db3a8;margin-bottom:10px;">🍸 ${p.nom} — moment ${s.moment + 1} / ${p.moments.length}</div>
    <div style="width:100%;max-width:560px;height:18px;background:#1b2735;border:2px solid #2a3b4a;border-radius:10px;overflow:hidden;margin-bottom:4px;">
      <div style="height:100%;width:${Math.max(0, Math.min(CHARME_SEDUIT, s.gauge))}%;background:${charmeGaugeColor(s.gauge)};transition:width 0.6s ease;"></div>
    </div>
    <div style="font-size:14px;margin-bottom:14px;">${charmeGaugeLabel(s.gauge)} Jauge de dragage : ${Math.round(s.gauge)} / ${CHARME_SEDUIT}</div>
  `;
  // Écran "réaction" : la jauge reste affichée, on lit la réaction, et c'est
  // TOUT — ni question ni réponses avant d'avoir cliqué sur Suivant.
  if (reaction) {
    s.container.innerHTML = `
      ${gaugeHtml}
      <div style="max-width:560px;color:#f0e4c8;font-size:14px;font-style:italic;line-height:1.5;margin-bottom:18px;">${reaction}</div>
      <button class="mgBtn" id="charmeNext">Suivant ▶</button>
    `;
    // Le joueur lit la réaction tranquillement, puis clique lui-même sur
    // Suivant : plus rien ne se passe automatiquement.
    s.container.querySelector('#charmeNext').addEventListener('click', () => {
      if (s.done || gameState !== 'miniGame') return;
      if (s.gauge >= CHARME_SEDUIT) { charmePersonneDraguee(s); return; }
      if (s.gauge <= 0) {
        charmePersonneRatee(s, p.nom + " est carrément dégoûtée. Elle te tourne le dos sans un mot, et la jauge est tombée à zéro.");
        return;
      }
      s.moment++;
      if (s.moment >= p.moments.length) {
        charmePersonneRatee(s, p.ratee);
        return;
      }
      renderCharmeMoment(s);
    });
    return;
  }
  // Écran "question" : situation + 3 répliques
  const opts = mgShuffle(m.options);
  s.container.innerHTML = `
    ${gaugeHtml}
    <div class="enigmaQuestion">« ${m.situation} »</div>
    <div class="enigmaOptions">
      ${opts.map((o, i) => `<button class="enigmaOption">${i + 1}. ${o.t}</button>`).join('')}
    </div>
    <div style="margin-top:14px;color:#9db3a8;font-size:12px;">Les bonnes répliques font grimper la jauge. Les ratées la font chuter. Jauge pleine = dragué(e) !</div>
  `;
  const buttons = s.container.querySelectorAll('.enigmaOption');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (s.done || btn.disabled) return;
      const o = opts[i];
      btn.classList.add(o.d > 0 ? 'correct' : 'wrong');
      buttons.forEach(b => b.disabled = true);
      s.gauge = Math.max(0, Math.min(CHARME_SEDUIT, s.gauge + o.d));
      renderCharmeMoment(s, o.r);
    });
  });
}

// La personne est draguée : petit écran de réussite narré, puis la suivante
function charmePersonneDraguee(s) {
  const p = CHARME_PERSONNES[s.personne];
  s.filled++;
  s.container.innerHTML = `
    <div style="font-size:64px;margin:6px;">${p.emoji} 💛</div>
    <div class="mgTitle">${p.nom} est draguée !</div>
    <div class="mgSub" style="max-width:560px;line-height:1.6;white-space:pre-line;">${p.reussite}</div>
    <button class="mgBtn" id="charmeNextPersonne">${s.personne + 1 >= CHARME_PERSONNES.length ? 'Terminer ✅' : 'Personne suivante ▶'}</button>
  `;
  // Là aussi : le joueur lit, puis clique. Rien d'automatique.
  s.container.querySelector('#charmeNextPersonne').addEventListener('click', () => {
    if (s.done || gameState !== 'miniGame') return;
    charmeAvance(s);
  });
}

// Personne ratée : elle ne fait PLUS perdre la partie. On passe à la suivante,
// et le score (étoiles) = nombre de jauges remplies à 100 %.
function charmePersonneRatee(s, texte) {
  const p = CHARME_PERSONNES[s.personne];
  const dernier = s.personne + 1 >= CHARME_PERSONNES.length;
  s.container.innerHTML = `
    <div style="font-size:64px;margin:6px;">${p.emoji} 💔</div>
    <div class="mgTitle">${p.nom} n'a pas craqué…</div>
    <div class="mgSub" style="max-width:560px;line-height:1.6;white-space:pre-line;">${texte}</div>
    <div style="margin:10px 0;color:#ffd76b;font-size:14px;">Jauges pleines : ${s.filled} / ${CHARME_PERSONNES.length}</div>
    <button class="mgBtn" id="charmeNextPersonne">${dernier ? 'Terminer ▶' : 'Personne suivante ▶'}</button>
  `;
  s.container.querySelector('#charmeNextPersonne').addEventListener('click', () => {
    if (s.done || gameState !== 'miniGame') return;
    charmeAvance(s);
  });
}

// Passe à la personne suivante, ou termine la soirée.
// ≥ 1 jauge pleine = victoire (1/2/3 étoiles) ; 0 jauge pleine = défaite.
function charmeAvance(s) {
  s.personne++;
  if (s.personne >= CHARME_PERSONNES.length) {
    s.done = true;
    if (s.filled >= 1) s.onSuccess();
    else mgFail(s.zone, "Aucune des trois n'a craqué... Même le barman a levé les yeux au ciel. Retente ta chance !");
    return;
  }
  renderCharmeIntro(s);
}
