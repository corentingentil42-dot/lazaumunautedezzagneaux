/* ============================================================
   js/donnees/dialogues-zones.js — Répliques devant la maison / zone de chaque perso, à propos de sa quête (AFFIN_ZONE).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   RÉPLIQUES DE ZONE (AFFIN_ZONE) — ce qu'un perso dit devant SA
   maison / SA zone, à propos de sa quête. 3 dialogues par perso.
   ===================================================================== */
const AFFIN_ZONE = {
  coco: [
    [[null, "« Bienvenue sur le circuit. T'as le chrono, t'as la route, t'as tout ce qu'il faut. »"],
     ['me', "« Et si je vais dans l'herbe ? »"],
     [null, "« T'iras moins vite. C'est la loi du circuit. »"]],
    [[null, "« Ici, c'est chez moi. Enfin, c'est le seul endroit où personne me dit d'arrêter de pédaler. »"]],
    [[null, "« Le boost sur la gauche est piégé. Enfin non. Mais je le dis pour te déstabiliser. »"]]
  ],
  lawisse: [
    [[null, "« Tu comptes prendre le trésor ? Tout le monde compte prendre le trésor. »"]],
    [[null, "« Les pièges sont visibles. C'est ça qui les rend insultants. »"]],
    [[null, "« Les pièces d'or sont à moi. Enfin, elles sont dans la pyramide, mais c'est pareil. »"]]
  ],
  mm: [
    [[null, "« Ici, c'est le Dôme. Je viens souvent. Je comprends pas tout, mais je viens souvent. »"]],
    [[null, "« Les ballons reviennent toujours. Comme les questions que je redemande, en fait. »"]],
    [[null, "« Je me suis déjà perdu ici. Dans le Dôme. Une fois. »"]]
  ],
  callipyge: [
    [[null, "« Trois cents mètres, c'est ma maison. Toi, fais juste attention aux obstacles. »"]],
    [[null, "« Sur la piste, y'a que toi et ton temps. C'est violent, mais c'est bien. »"]],
    [[null, "« Si tu cours ici, cours pour toi. Le reste, on s'en fiche. »"]]
  ],
  berline: [
    [[null, "« La scène est à moi. Enfin, quand y'a personne. »"]],
    [[null, "« Faire rire trente personnes, c'est un métier. Enfin, c'est mon métier. »"]],
    [[null, "« Ici, on peut dire n'importe quoi. C'est le concept, et ça marche. »"]]
  ],
  elais: [
    [[null, "« Assieds-toi, je te fais une frange. Non, je plaisante. Enfin, on sait jamais. »"]],
    [[null, "« Ici, personne sort avec une coupe ratée. C'est la règle du salon. »"]],
    [[null, "« La frange parfaite existe. J'en ai vu trois. C'est mon record. »"]]
  ],
  camille: [
    [[null, "« Entre, mais touche pas aux trucs jaunes. »"]],
    [[null, "« Cette cuisine est maudite, mais c'est la meilleure cuisine du monde. Faut juste savoir où regarder. »"]],
    [[null, "« Y'a des citrons cachés quelque part. Je les ai pas encore trouvés. C'est ça le problème. »"]]
  ],
  emma: [
    [[null, "« Chut. »"],
     ['me', "« Y'a personne. »"],
     [null, "« La bibliothèque, elle dort aussi. »"]],
    [[null, "« Les énigmes sont rangées par difficulté. Comme les gens qui les ratent, d'ailleurs. »"]],
    [[null, "« Ici, c'est le seul endroit où le silence parle pour moi. »"]]
  ],
  lilie: [
    [[null, "« Trente secondes pour une tenue parfaite. Le chrono, il démarre quand t'ouvres l'armoire. »"]],
    [[null, "« Ici, tout est à la bonne taille. C'est le miracle du défilé. »"]],
    [[null, "« La mode, c'est du sérieux. Enfin, c'est du sérieux quand je le dis. »"]]
  ],
  noe: [
    [[null, "« Les neuf questions sont dans le studio. Tu les connais déjà, en fait. C'est ça le piège. »"]],
    [[null, "« Si tu rates une question, on te regarde partir en silence. C'est la règle. »"]],
    [[null, "« Le meme parfait est pas encore ici. Mais on s'approche. »"]]
  ],
  tristan: [
    [[null, "« Vingt-cinq secondes. C'est court, une vie, sur l'autoroute. »"]],
    [[null, "« Ici, les obstacles arrivent vite. Un peu comme mes idées de soirée. »"]],
    [[null, "« Casque obligatoire. Ou pas obligatoire, mais casque quand même. »"]]
  ],
  noah: [
    [[null, "« Le terrain est maudit. Enfin, c'est ce que les gens disent quand ils perdent. »"]],
    [[null, "« Cinq avis en cinq secondes. Le record, c'est moi, évidemment. »"]],
    [[null, "« Tu rates, y'a pas de honte. Tu rates cinq fois, là, y'a de la honte. »"]]
  ],
  naomi: [
    [[null, "« A, S, D, F. Ce sont les quatre touches, et les quatre seules. »"]],
    [[null, "« Si tu rates le rythme, le morceau le sait. Et il te le fait payer. »"]],
    [[null, "« Le silence du conservatoire, c'est le plus cher de la ville. »"]]
  ],
  sinclair: [
    [[null, "« Trois invités à charmer. Après le troisième, tu sais qui tu es. »"]],
    [[null, "« Ici, un sourire, ça vaut une conversation. Et une conversation, ça vaut le bar. »"]],
    [[null, "« Le bar ferme quand je pars. C'est la règle. Officieuse, mais c'est la règle. »"]]
  ],
  maeva: [
    [[null, "« Dix paniers, trois ballons, zéro filet. Le filet, c'est pour les entraînements. »"]],
    [[null, "« Le gymnase sent le basket. Enfin, l'effort. Enfin, tu vois ce que je veux dire. »"]],
    [[null, "« Ici, j'ai jamais perdu. Enfin, presque jamais. Presque jamais. »"]]
  ],
  horace: [
    [[null, "« Le maître dort. Enfin, il attend. C'est pareil chez lui, paraît-il. »"]],
    [[null, "« Vingt touches. La moitié de ma préparation militaire, en plus rapide. »"]],
    [[null, "« Respecte le dojo, et le dojo te respecte. C'est simple, mais faut le faire. »"]]
  ]
};
