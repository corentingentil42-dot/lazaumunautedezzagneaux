/* ============================================================
   js/donnees/dialogues-communs.js — Répliques générales de chaque perso, quand il n'y a rien de spécial à dire (AFFIN_COMMON).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   RÉPLIQUES GÉNÉRALES (AFFIN_COMMON) — ce qu'un perso peut dire à
   n'importe quel joueur, quand y'a rien de spécial à dire. Des trucs
   de tous les jours, comme entre potes. 5 dialogues par perso.
   ===================================================================== */
const AFFIN_COMMON = {
  coco: [
    [[null, "« T'as fait quoi hier ? Moi j'ai fait du sport, rentré, et refait du sport. »"],
     ['me', "« T'as pas dormi ? »"],
     [null, "« Si, entre deux. »"]],
    [[null, "« T'as vu l'heure qu'il est ? Moi non plus. Je vis au feeling. »"]],
    [[null, "« J'ai faim. C'était tout, je voulais le dire à quelqu'un. »"],
     ['me', "« Merci de m'avoir choisi. »"],
     [null, "« T'étais là. »"]],
    [[null, "« Y'a un truc à faire ce week-end ? Personne organise jamais rien, c'est moi qui organise tout, en vrai. »"]],
    [[null, "« Hier j'ai raté un truc. Je sais plus quoi, mais je l'ai raté. Ça m'apprendra. »"]]
  ],
  lawisse: [
    [[null, "« T'as bien dormi ? Moi oui, et ça va être la seule bonne nouvelle de la journée. »"]],
    [[null, "« Y'a trop de bruit ici. Enfin, y'a du bruit dès que quelqu'un parle. »"],
     ['me', "« C'est le principe du bruit. »"],
     [null, "« Ouais, bah voilà, c'est fatigant. »"]],
    [[null, "« Je suis de bonne humeur. Profite, ça dure jamais longtemps. »"]],
    [[null, "« Des fois je me dis que je devrais dire plus de trucs gentils. Après réflexion, non. »"]],
    [[null, "« T'as vu le temps dehors ? Parfait pour rien faire dehors. »"]]
  ],
  mm: [
    [[null, "« T'as compris un truc aujourd'hui, toi ? Moi j'ai cru une fois, mais c'était pas ça. »"]],
    [[null, "« On fait quoi ? Enfin, vous faites quoi ? Je suis partant pour ce que vous voulez. »"],
     ['me', "« Tu sais jamais, toi ? »"],
     [null, "« Non, mais je suis partant. »"]],
    [[null, "« Hier quelqu'un a dit un truc, j'ai répondu un truc, et tout le monde a ri. Je sais toujours pas pourquoi. »"]],
    [[null, "« J'ai ramené des trucs. Je sais plus ce que c'est, mais j'en ai ramené. »"]],
    [[null, "« Bon, sinon, ça va ? J'ai l'impression de jamais demander. Là je demande. Ça va ? »"]]
  ],
  callipyge: [
    [[null, "« Je me suis levée à 6h ce matin. Et avant que tu demandes : oui, volontairement. »"]],
    [[null, "« T'as un bouquin à me prêter ? J'ai fini le mien cette nuit. »"],
     ['me', "« Cette nuit ? »"],
     [null, "« Y'avait plus que 80 pages, je vais pas les garder pour demain. »"]],
    [[null, "« Aujourd'hui j'ai pas envie de courir. ...Non mais je vais courir, hein. J'ai juste dit que j'avais pas envie. »"]],
    [[null, "« Tu sais ce qui est bien avec le matin ? Y'a personne. Enfin, moi j'aime bien. »"]],
    [[null, "« Nouveau chrono cette semaine. J'hésite à te le dire, tu vas le prendre pour de la chance. »"]]
  ],
  berline: [
    [[null, "« J'ai une blague, mais elle marche que le soir. Reviens ce soir. »"]],
    [[null, "« Tu penses quoi du fait de ne rien faire ? Moi je pense que c'est déjà beaucoup. »"]],
    [[null, "« Coco fait quoi, là, tu sais ? ...C'était juste comme ça, la question. »"]],
    [[null, "« Des fois je me demande si mes blagues sont trop nulles. Après je me dis : non, c'est le monde qui est pas prêt. »"]],
    [[null, "« On devrait faire un truc, un jour, tous ensemble. Enfin, on devrait. Ou pas. Ça dépend. »"]]
  ],
  elais: [
    [[null, "« T'as mangé ? C'est la question la plus importante de la journée. »"],
     ['me', "« Pas encore. »"],
     [null, "« Viens, je vais te trouver un truc. »"]],
    [[null, "« Tout le monde va bien, là ? Genre, tout le monde vraiment ? »"],
     ['me', "« Ouais, ça va. »"],
     [null, "« Ok. C'est le principal. »"]],
    [[null, "« Ma maman a encore fait trop à manger. Y'en a pour tout le groupe, elle l'a dit. »"]],
    [[null, "« Hier j'ai ri pour un truc dont je me souviens plus. C'était le meilleur moment de la semaine quand même. »"]],
    [[null, "« Tu sais que je tiens tout ce monde-là ensemble ? Enfin, je dis ça, je dis rien. ...Je tiens un peu. »"]]
  ],
  camille: [
    [[null, "« Assieds-toi. Non, pas là. Là, à côté. Voilà. »"],
     ['me', "« C'était le plan depuis le début ? »"],
     [null, "« C'était le plan. »"]],
    [[null, "« Y'avait du citron dans un truc qu'on m'a proposé aujourd'hui. J'ai dit non avant même de demander. »"],
     ['me', "« Et si y'en avait pas ? »"],
     [null, "« On le saura jamais. »"]],
    [[null, "« Tu as combien de câlins aujourd'hui ? Attends, je corrige : tu en as combien de moi ? »"]],
    [[null, "« Je suis une personne très calme. C'est juste que mes mains vivent leur vie. »"]],
    [[null, "« Aujourd'hui j'ai réussi à ne toucher personne pendant une heure. Une heure entière. Je progresse. »"]]
  ],
  emma: [
    [[null, "« J'ai lu un truc bien cette nuit. Non, je te le prête pas, tu dors dessus. »"]],
    [[null, "« Le truc, c'est que les gens confondent silence et mauvaise humeur. Ça m'arrange. »"]],
    [[null, "« T'as fait quelque chose d'intéressant aujourd'hui ? Mensonge accepté. »"],
     ['me', "« Ouais, plein de trucs. »"],
     [null, "« Voilà, c'est ça que je voulais entendre. »"]],
    [[null, "« Je fais pas la gueule. Je réfléchis. C'est différent. »"],
     ['me', "« Tu réfléchis à quoi ? »"],
     [null, "« À des trucs. Tu vois, tu poses des questions. »"]],
    [[null, "« Il me faut un nouveau bouquin. Enfin non, il m'en faut trois, mais je vais commencer par un. »"]]
  ],
  lilie: [
    [[null, "« Regarde ce que je viens de trouver. C'est parfait. Et j'ai rien payé, c'est encore mieux. »"]],
    [[null, "« On s'appelle ce soir ? Y'a un truc à se raconter. Enfin y'a rien, mais on va le raconter longtemps. »"]],
    [[null, "« T'as vu ma tenue ? Dis-moi tout. Sauf si c'est négatif, alors dis rien. »"]],
    [[null, "« J'ai trié mes fringues pendant deux heures hier. Ma vie a changé. »"],
     ['me', "« À ce point ? »"],
     [null, "« Tu peux pas comprendre. Enfin si, un jour tu comprendras. »"]],
    [[null, "« Aujourd'hui j'ai décidé d'être gentille. Enfin, je le suis toujours, mais aujourd'hui je le décide. »"]]
  ],
  noe: [
    [[null, "« ... »"],
     ['me', "« Tu vas dire un truc ? »"],
     [null, "« J'y pensais. »"],
     ['me', "« À quoi ? »"],
     [null, "« À rien. J'étais bien. »"]],
    [[null, "« Le Barça a gagné ce week-end. Je le dis comme ça, sans importance. »"],
     ['me', "« Tu dis ça à tout le monde ? »"],
     [null, "« Seulement à ceux qui peuvent comprendre. »"]],
    [[null, "« J'ai une vanne, mais je la garde pour demain. Aujourd'hui, j'économise. »"]],
    [[null, "« T'as remarqué que les gens parlent pour rien ? C'est bien, parfois, de rien dire. »"]],
    [[null, "« ...Ouais. »"],
     ['me', "« Quoi, ouais ? »"],
     [null, "« Non, rien. C'était pour moi. »"]]
  ],
  tristan: [
    [[null, "« Ce soir, y'a un truc. Je sais pas quoi, mais y'a un truc, et on y va. »"]],
    [[null, "« Qui vient samedi ? Enfin, tout le monde vient. Mais qui vient ? »"]],
    [[null, "« Des fois je me dis que je devrais me reposer. Et là je me dis : mais pour quoi faire ? »"],
     ['me', "« Pour te reposer. »"],
     [null, "« Ouais bah voilà, on tourne en rond. »"]],
    [[null, "« J'ai dormi cinq heures et je suis au top. Bon, à peu près. Bon, je suis là, quoi. »"]],
    [[null, "« J'ai une idée. Elle est pas encore claire, mais c'est une idée, et c'est déjà ça. »"]]
  ],
  noah: [
    [[null, "« Je viens d'avoir un avis. Il est peut-être nul, mais il est frais. »"]],
    [[null, "« Tu écoutes quoi en ce moment ? Attends, je le note, je te fais une playlist. »"],
     ['me', "« J'ai rien dit. »"],
     [null, "« Je note quand même. »"]],
    [[null, "« Le Real ce week-end, tu as vu ? Non, t'as pas vu. Regarde le match, je te laisse le revoir avec moi. »"]],
    [[null, "« Y'a un son que personne connaît et il est excellent. Enfin, personne le connaît parce que je le mets que moi, mais quand même. »"]],
    [[null, "« Mon enceinte est à 40 pour cent. Pour une fois. Savoure. »"],
     ['me', "« C'est encore fort. »"],
     [null, "« C'est le minimum vital. »"]]
  ],
  naomi: [
    [[null, "« Chut. Enfin non, parle. Mais parle doucement. »"]],
    [[null, "« J'ai composé un truc cette nuit. Le truc, c'est qu'il est pas fini, mais il existe. »"]],
    [[null, "« Tu veux écouter quelque chose ? J'ai le morceau pour l'heure qu'il est. »"]],
    [[null, "« Y'a du bruit partout dans ce groupe. Mais je vous laisse, c'est mon geste d'amour. »"]],
    [[null, "« Des fois je parle juste pour vérifier que ça marche encore. Ça marche. Bonne journée. »"]]
  ],
  sinclair: [
    [[null, "« Je viens de rentrer. De quoi ? Ça dépend qui demande. »"]],
    [[null, "« T'as besoin de rien ? C'est rare, quelqu'un qui a besoin de rien. Moi, j'ai toujours besoin de quelque chose. »"]],
    [[null, "« Y'a une soirée, quelque part, ce week-end. Et si y'en a pas, y'en aura une, parce que je serai là. »"]],
    [[null, "« On me voit partout, mais on me connaît peu. C'est voulu, tu vois. »"]],
    [[null, "« Bonne journée, toi. Voilà. C'est dit. »"]]
  ],
  maeva: [
    [[null, "« J'ai gagné ce matin. Non, personne n'avait demandé, mais je le dis. »"]],
    [[null, "« Tu fais quoi là ? Rien ? Ok, moi aussi. On fait rien ensemble, alors. »"]],
    [[null, "« Aujourd'hui, une personne m'a dit que j'étais directe. Je lui ai dit merci. C'était pas un compliment, apparemment. »"]],
    [[null, "« Y'a un truc chiant à faire et personne veut le faire. Donc je vais le faire, mais en râlant. »"]],
    [[null, "« T'as vu mes tirs d'hier ? Non ? T'as raté quelque chose, là. »"]]
  ],
  horace: [
    [[null, "« J'ai marché jusqu'au bout de la ville aujourd'hui. Pourquoi ? Y'avait pas de pourquoi. C'est ça le truc. »"]],
    [[null, "« Y'a un mot japonais que j'adore. Je le retiens jamais, mais j'adore l'idée de l'aimer. »"]],
    [[null, "« La discipline, c'est simple : tu décides, et tu fais. Le reste, c'est de la négociation avec soi-même. »"],
     ['me', "« Tu négocies jamais, toi ? »"],
     [null, "« Que sur les durées de marche. »"]],
    [[null, "« Ce matin, j'ai vu le soleil se lever. Vous dormiez tous, c'était que pour moi. »"]],
    [[null, "« Un jour je vous emmène tous en rando. Vous êtes pas prêts, mais ce jour viendra. »"]]
  ]
};
