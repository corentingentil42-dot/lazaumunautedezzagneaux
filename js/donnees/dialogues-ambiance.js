/* ============================================================
   js/donnees/dialogues-ambiance.js — Blagues privées et petites discussions d'ambiance entre persos (PRIVATE_JOKES, CASUAL_CHATS).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

const PRIVATE_JOKES = {
  lawisse: "« Lawisse, paraît que t'as encore perdu ton portefeuille... »",
  mm: "« M.M., on t'a dit que le volley c'était pas avec les pieds ? »",
  callipyge: "« Callipyge, tu veux qu'on parle de ton nouveau record ? »",
  berline: "« Perline... raconte-nous une de tes blagues pourries. »",
  elais: "« Elaïs, ta frange est PARFAITE aujourd'hui, comme toujours. »",
  camille: "« Camille, y'a un citron qui traîne là-bas, fais gaffe. »",
  emma: "« Emma, sors-nous une vanne sarcastique, allez. »",
  lilie: "« Lilie, tu nous refais le look de Coco ? »",
  noe: "« Magir, tu nous envoies un meme ? »",
  tristan: "« Tristan, on fait la course ? »",
  noah: "« Noah, ton avis sur le match d'hier ? (on rigole déjà) »",
  naomi: "« Naomi, tu nous joues un truc ? »",
  sinclair: "« Saint-Pierre, toujours aussi classe. »",
  maeva: "« Maeva, tu nous montres ton shoot légendaire ? »",
  horace: "« Horace, tu nous fais une démo de katana ? »"
};

// Discussions enrichies : plusieurs petits échanges à plusieurs répliques
// par perso, tirés au sort à chaque fois qu'on leur reparle (une fois
// débloqués), pour que ça ne soit jamais la même ligne unique.
const CASUAL_CHATS = {
  lawisse: [
    ["« Tu voudrais m'emprunter de l'argent ? Alors là, non, la banque est fermée. »",
     "« Par contre moi, je viens de tout claquer d'un coup sur un truc totalement inutile. »",
     "« La cohérence, très peu pour moi. »"],
    ["« J'ai touché de l'argent ce matin. »",
     "« Il n'en reste déjà plus rien, je l'ai tout dépensé avant midi. »",
     "« Et non, ne compte pas sur moi pour t'en filer un peu. »"],
    ["« On me demande souvent pourquoi je ne prête jamais un centime. »",
     "« Simple : je préfère tout dépenser moi-même, et vite. »",
     "« Radin avec les autres, généreux avec moi-même. Logique, non ? »"]
  ],
  berline: [
    ["« Ah, te voilà ! Laisse-moi te conter une anecdote des plus édifiantes... »",
     "« Pourquoi les plongeurs plongent-ils en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau ! »",
     "« ...Je sais. Mon génie est difficile à appréhender. »"],
    ["« J'étais en pleine réflexion philosophique, figure-toi. »",
     "« Si un menuisier n'a pas d'outils... il est démuni ! Tu saisis la subtilité ? »",
     "« Bon, d'accord, c'était nul. Mais avoue que c'était RAFFINÉ comme nullité. »"],
    ["« Je souhaiterais partager avec toi une pensée d'une grande profondeur. »",
     "« Qu'est-ce qui est jaune et qui attend ? ... Jonathan ! »",
     "« ...OK celle-là n'avait aucun rapport avec le jaune. Mais j'aimais le mot 'Jonathan'. »"]
  ],
  elais: [
    ["« Ah, une visite ! Pour rappel, moi c'est Elaïs Domitille Marguerite Lemay. »",
     "« Oui, en entier. Toujours en entier. C'est important. »",
     "« Et sinon, tu as vu ma frange aujourd'hui ? Regarde. REGARDE. »"],
    ["« Tu sais ce qui me rend heureuse dans la vie ? »",
     "« Avoir la plus belle frange de tout l'univers connu. »",
     "« Ah, et toi aussi je t'aime bien, évidemment. »"],
    ["« Entre nous, je crois que ma frange a encore poussé de façon parfaite. »",
     "« Scientifiquement inexplicable. »",
     "« Sinon, comment tu vas ? Raconte-moi tout, je suis toute ouïe. »"]
  ],
  mm: [
    ["« J'ai fait un smash monumental à l'entraînement aujourd'hui ! »",
     "« Après, j'ai voulu fêter ça... j'ai renversé toute ma gourde sur mon sac. »",
     "« Bref. Le volley ça va, le reste on verra. »"],
    ["« Tu savais que j'ai un service redoutable ? »",
     "« Par contre hier j'ai mis vingt minutes à chercher mes chaussures alors que je les avais aux pieds. »",
     "« Personne n'est parfait, hein. »"],
    ["« Franchement le volley, j'y comprends tout, aucun souci. »",
     "« Ce qui m'échappe complètement, c'est... globalement le reste. »",
     "« Mais je progresse ! Enfin, je crois. »"]
  ],
  callipyge: [
    ["« J'ai battu mon record hier. Encore. »",
     "« Je m'entraîne tous les jours, la rigueur c'est la clé. »",
     "« ...Non, je ne veux pas parler de Corentin. Merci. »"],
    ["« Tu veux voir mes nouveaux temps au chrono ? »",
     "« Je progresse énormément, je suis fière de moi. »",
     "« Et non, je n'ai toujours pas digéré l'histoire avec Coco. Mais ça va. Ça va très bien. »"],
    ["« La performance, c'est une question de mental avant tout. »",
     "« Je me lève tous les matins pour repousser mes limites. »",
     "« Certains préfèrent les filles qui racontent des blagues aux filles sérieuses. Tant pis pour eux. »"]
  ],
  camille: [
    ["« Attends, avant de manger ça, laisse-moi vérifier un truc. »",
     "« ...OK, pas de citron, pas d'orange, pas de pamplemousse. On peut y aller. »",
     "« Une seconde d'inattention et c'est la cata pour moi. »"],
    ["« Tu savais que je peux repérer un agrume à dix mètres ? »",
     "« C'est une question de survie chez moi. »",
     "« Sans-Citron, c'est pas un surnom. C'est un mode de vie. »"],
    ["« J'ai encore dû refuser un jus de fruits tout à l'heure. »",
     "« 'Mais y'a pas d'agrumes dedans' qu'ils disaient. Menteurs. »",
     "« Bref, je reste sur mes gardes H24. »"]
  ]
};
// Pioche sans répétition : on passe par toutes les répliques d'un perso
// (dans un ordre mélangé) avant qu'une seule ne revienne une 2e fois, et on
// évite aussi que la dernière dite redevienne la toute première du tour
// suivant.
const chatState = {};
function pickCasualChat(id) {
  const pool = CASUAL_CHATS[id];
  if (!pool || !pool.length) return [PRIVATE_JOKES[id] || "« ... »"];
  if (!chatState[id]) chatState[id] = { queue: [], last: -1 };
  const cs = chatState[id];
  if (cs.queue.length === 0) {
    const indices = pool.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    if (pool.length > 1 && indices[0] === cs.last) {
      [indices[0], indices[1]] = [indices[1], indices[0]];
    }
    cs.queue = indices;
  }
  const idx = cs.queue.shift();
  cs.last = idx;
  return pool[idx];
}
