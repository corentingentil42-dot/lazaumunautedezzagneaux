/* ============================================================
   js/donnees/dialogues-affinites.js — Dialogues d'affinité : ce que chaque perso dit selon QUI joue (AFFIN_DIAL). Gros fichier de texte.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   DIALOGUES D'AFFINITÉS — le cœur relationnel du groupe. (v2 : ton
   naturel, conversations de potes, vannes dosées)
   Ce que dit un perso dépend de QUI joue : si on joue Coco et qu'on
   parle à Perline, ce n'est PAS la même discussion qu'avec Tristan.
   Clé : 'idDuPnj|idDuJoueur'. Une ligne = [locuteur, texte] où le
   locuteur vaut null (= le PNJ qu'on écoute) ou l'id du perso joué.
   Repli : paire absente → répliques habituelles (pickCasualChat).
   ===================================================================== */
const AFFIN_DIAL = {
  // ======================= COCO (PNJ) =======================
  'coco|lawisse': [
    [null, "« Lawisse, t'étais où hier ? On t'a cherché pour la partie. »"],
    ['lawisse', "« Chez moi. Et c'était bien. »"],
    [null, "« Ouais, super. Tu ramènes les jeux demain alors. »"],
    ['lawisse', "« Si tu arrêtes de raconter ta vie, maybe. »"]
  ],
  'coco|mm': [
    [null, "« Hey, Michel ! »"],
    ['mm', "« Ça va, arrête avec le Michel... enfin non, laisse, c'est trop tard. »"],
    [null, "« C'est bon hein, plus personne dit M.M. maintenant, c'est fini. »"]
  ],
  'coco|callipyge': [
    [null, "« Léonie ! Samedi tu confirmes pour la course ? »"],
    ['callipyge', "« Ouais ouais, je confirme. T'as intérêt à être en avance pour une fois. »"],
    [null, "« Moi je suis toujours... ouais ok, je serai en avance. »"],
    ['callipyge', "« Voilà. On s'en tient là. »"]
  ],
  'coco|berline': [
    [null, "« Perline ! T'as pensé à ce que j'ai dit ce matin ? »"],
    ['berline', "« Le coup du cookie ? Ouais, et ma réponse est toujours non. »"],
    [null, "« Même pas un petit quart ? »"],
    ['berline', "« ...Bon. Un petit quart. Mais parce que c'est toi. »"],
    [null, "« Je l'aime trop, cette fille. »"]
  ],
  'coco|elais': [
    [null, "« Elaïs ! Ta maman m'a encore dit de venir manger, elle me préfère à toi je crois. »"],
    ['elais', "« Elle t'aime plus que moi, c'est officiel. Viens, y'aura des pâtes. »"],
    [null, "« Je viens, mais je rigole pas, je mange. »"]
  ],
  'coco|camille': [
    [null, "« Camille ! Doucement avec les câlins, j'ai mal au dos. »"],
    ['camille', "« C'est justement le moment d'un câlin. Viens là. »"],
    [null, "« ...Ouais bon, ça va, reste. »"]
  ],
  'coco|emma': [
    [null, "« Emma, t'as compris un truc au cours de ce matin, toi ? »"],
    ['emma', "« Ouais. Et j'ai remarqué que tu dormais, ça m'a bien fait marrer. »"],
    [null, "« Le prof m'a vu en plus, trop chaud. »"]
  ],
  'coco|lilie': [
    [null, "« Lily, on a encore parlé jusqu'à 3 heures hier, on est des malades. »"],
    ['lilie', "« Ouais mais c'était trop bien, on refait ce soir. »"],
    [null, "« Ce soir je dors. Ouais... bon, appelle-moi à 23h max. »"],
    ['lilie', "« T'es le premier à décrocher, arrête. »"]
  ],
  'coco|noe': [
    [null, "« Magir ! T'étais où ? Le trio sans toi c'est juste un duo bizarre. »"],
    ['noe', "« J'étais là. Vous parliez trop, j'attendais que ça se calme. »"],
    [null, "« Voilà pourquoi t'es le meilleur. »"]
  ],
  'coco|tristan': [
    [null, "« Tristan ! Bon, t'as répondu à aucun de mes messages hier. »"],
    ['tristan', "« T'en avais envoyé douze en dix minutes, Coco. »"],
    [null, "« Ouais bah c'est ça, mon Coco, tu supportes. »"],
    ['tristan', "« Ouais ouais, mon Coco. »"]
  ],
  'coco|noah': [
    [null, "« Noah, baisse un peu l'enceinte, on va se faire virer du parc. »"],
    ['noah', "« Ouais mais le son est trop bon là, tu veux que je le baisse pour quoi ? »"],
    [null, "« Bon, ok, mets au moins un truc qui plaît à tout le monde. »"],
    ['noah', "« Genre le Real, tu vas voir, ça plaît à tout le monde. »"]
  ],
  'coco|naomi': [
    [null, "« Naomi ! Tu m'insultes moins ces temps-ci, ça va ? »"],
    ['naomi', "« J'économise. »"],
    [null, "« Elle m'adore, en vrai. »"],
    ['naomi', "« Continue comme ça et je repars en production. »"]
  ],
  'coco|sinclair': [
    [null, "« Saint-Pierre, mon pote. Tu me tiens toujours rigueur pour tes cheveux ? »"],
    ['sinclair', "« T'as rasé ma tête à blanc, Coco. Y'a prescription que dans deux ans. »"],
    [null, "« C'était marrant pourtant. »"],
    ['sinclair', "« Ouais, c'était marrant. Je te le pardonne presque pour ça. »"]
  ],
  'coco|maeva': [
    [null, "« Maëva ! On fait un match ? »"],
    ['maeva', "« Ok. T'as peu de chances, mais je te laisse croire un peu. »"],
    [null, "« Elle est gentille, mais genre, à moitié. »"]
  ],

  // ======================= LAWISE / LOÏS (PNJ) =======================
  'lawisse|coco': [
    [null, "« Coco. T'as encore marché sur mon truc. »"],
    ['coco', "« Ton truc était au milieu du salon, c'est ta faute. »"],
    [null, "« Ouais c'est ça. Tu me dois un thé. »"],
    ['coco', "« Je t'en apporte un, carrément. »"]
  ],
  'lawisse|mm': [
    [null, "« M.M., le plan, tu l'as suivi cette fois ? »"],
    ['mm', "« Ouais ouais ! On gagne, quoi. »"],
    [null, "« C'est... ouais, voilà. On gagne. Il a compris, merci. »"]
  ],
  'lawisse|callipyge': [
    [null, "« Léonie, tu me conseilles un bouquin ? J'ai fini le mien. »"],
    ['callipyge', "« Ouais, je t'amène quelque chose demain, tu vas pas dormir de la nuit. »"],
    [null, "« Voilà une menace que j'aime bien. »"]
  ],
  'lawisse|berline': [
    [null, "« Perline, t'as fait quoi ce week-end ? »"],
    ['berline', "« Rien. Genre j'ai réfléchi. Longtemps. »"],
    [null, "« Ça compte comme rien ? »"],
    ['berline', "« Pour moi la réflexion c'est presque rien, c'est un mode de vie. »"]
  ],
  'lawisse|elais': [
    [null, "« Elaïs, tu peux pas rester cinq minutes sans sourire ? »"],
    ['elais', "« Je peux, mais je vois pas l'intérêt. »"],
    [null, "« ...Ouais, ok, c'est une bonne réponse. »"]
  ],
  'lawisse|camille': [
    [null, "« Camille, t'as compris le devoir ? »"],
    ['camille', "« Pas du tout, mais t'inquiète, on va le faire ensemble. »"],
    [null, "« Fais pas ça, la dernière fois t'as fini endormie sur mon épaule. »"],
    ['camille', "« C'est le meilleur endroit pour dormir, change rien. »"]
  ],
  'lawisse|emma': [
    [null, "« Emma. T'as lu le truc pour le cours ? »"],
    ['emma', "« Ouais. Ton résumé était faux, pour changer. »"],
    [null, "« Merci pour la précision. Au moins tu réponds encore. »"],
    ['emma', "« Ouais, on va dire que c'est le principal. »"]
  ],
  'lawisse|lilie': [
    [null, "« Lily, ton défilé, c'était bien. »"],
    ['lilie', "« Attends, Lawisse qui complimente la mode ? Je note quelque part. »"],
    [null, "« Dis rien et profite, ça arrivera pas souvent. »"]
  ],
  'lawisse|noe': [
    [null, "« Magir, tu prépares une vanne depuis dix minutes, là ? »"],
    ['noe', "« Non. »"],
    [null, "« T'es un mauvais menteur, je t'entends réfléchir. »"],
    ['noe', "« ...Elle arrive, oui. »"]
  ],
  'lawisse|tristan': [
    [null, "« Tristan. C'est quoi la prochaine idée de soirée ? »"],
    ['tristan', "« Ça je peux te le dire ! Samedi, chez moi, le truc est lancé ! »"],
    [null, "« Ouais, on verra. Tu sais que je viens rarement au début. »"],
    ['tristan', "« Mais tu viens toujours à la fin, et c'est ça le meilleur moment ! »"]
  ],
  'lawisse|noah': [
    [null, "« Noah, mets pas le Real, je te préviens. »"],
    ['noah', "« Trop tard, c'est lancé. »"],
    [null, "« Je t'aime bien mais là c'est dur. »"],
    ['noah', "« Le Real rassemble les gens, Lawisse. Le Real, c'est la paix. »"]
  ],
  'lawisse|naomi': [
    [null, "« Naomi. »"],
    ['naomi', "« Lawisse. »"],
    [null, "« ...C'était toute la conversation ? »"],
    ['naomi', "« Ouais. C'était bien, non ? »"]
  ],
  'lawisse|sinclair': [
    [null, "« Saint-Pierre. Ça va ? »"],
    ['sinclair', "« Ça va, ça va. Et toi ? »"],
    [null, "« Ouais. Bon, on se garde à distance respectable et tout se passe bien. »"],
    ['sinclair', "« Je connais le contrat, Lawisse. »"]
  ],
  'lawisse|maeva': [
    [null, "« Maëva, tu t'entraînes encore ? »"],
    ['maeva', "« Évidemment. Toi, tu fais quoi de tes journées ? »"],
    [null, "« Des trucs. »"],
    ['maeva', "« Ça a l'air passionnant, franchement. »"]
  ],

  // ======================= M.M. (PNJ) =======================
  'mm|coco': [
    [null, "« Coco ! Tu m'expliques un truc ? »"],
    ['coco', "« Vas-y, Michel. »"],
    [null, "« Le Michel... bon, oublie, j'ai déjà oublié ma question. »"],
    ['coco', "« Je t'adore, mec. »"]
  ],
  'mm|lawisse': [
    [null, "« Lawisse, tu peux me réexpliquer le plan ? »"],
    ['lawisse', "« M.M., je te l'ai fait trois fois. »"],
    [null, "« Ouais mais à un moment je comprends mieux. »"],
    ['lawisse', "« On gagne. C'est tout le plan. Retiens juste ça. »"],
    [null, "« Ah oui, là c'est bon ! »"]
  ],
  'mm|callipyge': [
    [null, "« Léonie, tu cours tous les jours, même dimanche ? »"],
    ['callipyge', "« Surtout dimanche, c'est le jour où y'a la place. »"],
    [null, "« Moi le dimanche je regarde des trucs, mais chacun son truc hein. »"]
  ],
  'mm|berline': [
    [null, "« Perline, t'as une blague pour moi ? »"],
    ['berline', "« J'en ai une mais elle est nulle. »"],
    [null, "« Bah justement. »"],
    ['berline', "« Ouais, c'est vrai, t'es le public parfait. »"]
  ],
  'mm|elais': [
    [null, "« Elaïs, hier c'était trop bien, j'ai ri tout le soir. »"],
    ['elais', "« C'était moi ou les deux bières ? »"],
    [null, "« Les deux. Enfin, surtout toi. Enfin voilà. »"]
  ],
  'mm|camille': [
    [null, "« Camille, pourquoi tu t'assieds sur moi ? »"],
    ['camille', "« Parce que t'es assis au meilleur endroit. »"],
    [null, "« Ok, mais je bouge plus alors. »"],
    ['camille', "« C'est exactement le plan. »"]
  ],
  'mm|emma': [
    [null, "« Emma, j'ai la réponse de ta devinette ! »"],
    ['emma', "« Elle date d'hier soir. »"],
    [null, "« Le silence ? C'est le silence ? »"],
    ['emma', "« Ouais. Prends ton temps, c'est l'important. »"]
  ],
  'mm|lilie': [
    [null, "« Lily, ma tenue, elle est mode ou pas ? »"],
    ['lilie', "« Elle est... mignonne. C'est déjà bien pour toi. »"],
    [null, "« Mignonne ! Je note ! »"]
  ],
  'mm|noe': [
    [null, "« Magir, c'est quand le prochain truc du quatuor ? »"],
    ['noe', "« C'est demain. Comme la dernière fois que tu as demandé. »"],
    [null, "« Ah. Bah au moins c'est demain. »"]
  ],
  'mm|tristan': [
    [null, "« Tristan, tu m'invites à la prochaine soirée ? »"],
    ['tristan', "« T'es toujours invité, M.M., demande à personne. »"],
    [null, "« Cool, j'amène des trucs. Je sais pas quoi encore, mais des trucs. »"]
  ],
  'mm|noah': [
    [null, "« Noah, tu me mets un son ? »"],
    ['noah', "« J'ai justement un avis sur le son que je devrais mettre, et il est excellent. »"],
    [null, "« Bon, mets celui de ton avis alors. »"],
    ['noah', "« Voilà, on fait équipe. »"]
  ],
  'mm|naomi': [
    [null, "« Naomi, tu joues quelque chose ? »"],
    ['naomi', "« Peut-être. Pourquoi ? »"],
    [null, "« Comme ça, pour écouter. »"],
    ['naomi', "« ...Bonne réponse. Assieds-toi. »"]
  ],
  'mm|sinclair': [
    [null, "« Saint-Pierre, remets-moi le truc que tu m'as expliqué hier. »"],
    ['sinclair', "« Lequel ? T'en veux toujours trois fois le même. »"],
    [null, "« Le truc avec les gens et les soirées. »"],
    ['sinclair', "« Souris et laisse faire. C'est le même plan que d'habitude. »"]
  ],
  'mm|maeva': [
    [null, "« Maëva. »"],
    ['maeva', "« M.M. »"],
    [null, "« ...Ça va ? »"],
    ['maeva', "« Ouais. Toi ? »"],
    [null, "« Ouais. »"],
    ['maeva', "« Bon. »"]
  ],

  // ======================= CALLIPYGE / LÉONIE (PNJ) =======================
  'callipyge|coco': [
    [null, "« Coco, t'as couru ce matin ? »"],
    ['coco', "« Ouais, un petit tour. Toi ? »"],
    [null, "« Mes dix kilomètres habituels. »"],
    ['coco', "« Habituels... ouais, moi c'était un petit tour. »"],
    [null, "« Mmh mmh. Samedi on voit qui rigole. »"]
  ],
  'callipyge|lawisse': [
    [null, "« Lawisse, tu dors assez ? T'as une tête. »"],
    ['lawisse', "« Merci, c'est le compliment du jour. »"],
    [null, "« C'était pas un compliment, c'était une inquiétude. »"],
    ['lawisse', "« C'est pareil chez toi, et ça me va. »"]
  ],
  'callipyge|mm': [
    [null, "« M.M., t'es venu courir au bout ? »"],
    ['mm', "« J'ai couru. Enfin, y'avait du marcher aussi. »"],
    [null, "« Le mélange des deux, c'est déjà pas mal. Je respecte. »"]
  ],
  'callipyge|berline': [
    [null, "« Perline, t'as dormi ? T'as une tête bizarre. »"],
    ['berline', "« J'ai réfléchi toute la nuit. »"],
    [null, "« Sur quoi ? »"],
    ['berline', "« Je sais plus. Mais c'était profond, je te jure. »"],
    [null, "« T'es un cas, Perline. Je t'adore. »"]
  ],
  'callipyge|elais': [
    [null, "« Elaïs, tu viens courir avec moi un matin ? Promis, je vais doucement. »"],
    ['elais', "« Doucement pour toi, c'est le sprint de ma vie. »"],
    [null, "« Je m'adapte, je suis une fille bien. »"],
    ['elais', "« On dit ça... mais ouais, un matin, je note. »"]
  ],
  'callipyge|camille': [
    [null, "« Camille, pas les chatouilles aujourd'hui, je suis courbaturée. »"],
    ['camille', "« C'est le meilleur moment, tu peux pas te défendre. »"],
    [null, "« ...Je te hais. »"],
    ['camille', "« Non, tu m'aimes. »"]
  ],
  'callipyge|emma': [
    [null, "« Emma, t'as un bouquin pour moi ? »"],
    ['emma', "« J'en ai un, mais tu vas le finir en deux jours et me le rendre en parlant pendant. »"],
    [null, "« C'est exactement ce qui va se passer, oui. »"],
    ['emma', "« Tiens. »"]
  ],
  'callipyge|lilie': [
    [null, "« Lily, t'as vu mes nouvelles chaussures ? »"],
    ['lilie', "« Ouais ! Elles sont trop bien, tu les as eues où ? »"],
    [null, "« Je te dis pas, sinon tout le monde aura les mêmes. »"],
    ['lilie', "« C'est atroce comme idée, mais je respecte. »"]
  ],
  'callipyge|noe': [
    [null, "« Magir, t'as dit un mot depuis ce matin ? »"],
    ['noe', "« Deux. Je crois que ça compte. »"],
    [null, "« On progresse, je suis fière de toi. »"]
  ],
  'callipyge|tristan': [
    [null, "« Tristan, tu me proposes une soirée et je viens, voilà. »"],
    ['tristan', "« Attends, c'est moi qui propose d'habitude ! Là tu viens toute seule, c'est un événement. »"],
    [null, "« Savoure, ça arrivera pas deux fois. »"]
  ],
  'callipyge|noah': [
    [null, "« Noah, mets un son pour courir, j'ai besoin de motivation. »"],
    ['noah', "« Oh ça, c'est mon domaine. Je te fais une playlist, tu vas voler. »"],
    [null, "« Si je vole vraiment, ce sera ta faute, je te préviens. »"]
  ],
  'callipyge|naomi': [
    [null, "« Naomi, on fait quoi ce soir ? »"],
    ['naomi', "« Rien de spécial. Pourquoi ? »"],
    [null, "« Non mais on le fait ensemble, le rien de spécial. »"],
    ['naomi', "« Évidemment. C'était sous-entendu. »"]
  ],
  'callipyge|sinclair': [
    [null, "« Saint-Pierre, tu touches pas à mes cheveux, on s'est compris ? »"],
    ['sinclair', "« Jamais touché de ta vie, Léonie. »"],
    [null, "« C'est le ton qu'il faut. Continue comme ça. »"]
  ],
  'callipyge|maeva': [
    [null, "« Maëva, on fait un match un de ces jours ? »"],
    ['maeva', "« Course ou basket ? »"],
    [null, "« Les deux, comme ça on gagne une fois chacune. »"],
    ['maeva', "« Deal. »"]
  ],

  // ======================= BERLINE / PERLINE (PNJ) =======================
  'berline|coco': [
    [null, "« Coco ! T'as fini par manger le cookie hier soir, je le sais. »"],
    ['coco', "« Il me regardait, j'avais pas le choix. »"],
    [null, "« C'est ça, c'est le cookie le méchant. »"],
    ['coco', "« Ouais, on s'est compris. Je t'aime. »"],
    [null, "« Moi aussi. Tu me dois un cookie. »"]
  ],
  'berline|lawisse': [
    [null, "« Lawisse, tu ris jamais à mes blagues et ça me travaille. »"],
    ['lawisse', "« C'est faux. Je ris intérieurement, tu peux pas voir. »"],
    [null, "« Facile, comme excuse. »"],
    ['lawisse', "« Ouais bah essaye de me prendre en flag, tu verras. »"]
  ],
  'berline|mm': [
    [null, "« M.M., tu ris à mes blagues, toi ? »"],
    ['mm', "« Ouais, mais je comprends pas toujours pourquoi je ris. »"],
    [null, "« C'est le plus beau compliment qu'on m'ait fait. »"]
  ],
  'berline|callipyge': [
    [null, "« Léonie, viens là, il faut que je te raconte. »"],
    ['callipyge', "« Raconte. Je suis prête. »"],
    [null, "« En fait non, j'ai oublié. Mais c'était top, je te jure. »"],
    ['callipyge', "« T'inquiète, si c'était top, ça reviendra. »"]
  ],
  'berline|elais': [
    [null, "« Elaïs, arrête de nous regarder comme ça, Coco et moi. »"],
    ['elais', "« Comme quoi ? Je regarde normalement. »"],
    [null, "« Non, tu regardes avec des étoiles. »"],
    ['elais', "« Ouais bon. Un peu, peut-être. Vous êtes mignons, c'est plus fort que moi. »"]
  ],
  'berline|camille': [
    [null, "« Camille, tu me lâches deux secondes ? »"],
    ['camille', "« Deux secondes exactement. Une... deux... voilà, c'est reparti. »"],
    [null, "« C'est ce que je disais. »"]
  ],
  'berline|emma': [
    [null, "« Emma, tu notes mes blagues quelque part, avoue. »"],
    ['emma', "« Dans la case spéciale. Elle est grande, la case. »"],
    [null, "« ...C'est un compliment ou pas ? »"],
    ['emma', "« Tu décides. »"]
  ],
  'berline|lilie': [
    [null, "« Lily, t'as fini par me montrer la fameuse tenue ? »"],
    ['lilie', "« Je te la montre samedi, mais tu dis rien à personne. »"],
    [null, "« Tu parles, moi ? Jamais. »"],
    ['lilie', "« Ouais c'est ça. »"]
  ],
  'berline|noe': [
    [null, "« Magir, t'as un avis sur ma blague d'hier ? »"],
    ['noe', "« Elle était nulle. »"],
    [null, "« Ok, mais nulle comment ? »"],
    ['noe', "« Nulle bien. La bonne catégorie. »"],
    [null, "« Merci, c'est tout ce que je demande. »"]
  ],
  'berline|tristan': [
    [null, "« Tristan, c'est bizarre de te dire ça, mais merci. »"],
    ['tristan', "« Pour quoi ? »"],
    [null, "« Le jour où tu m'as dit que Coco pensait à moi. »"],
    ['tristan', "« Ah, ouais. Bah de rien, ça a marché plutôt bien, non ? »"],
    [null, "« Plutôt bien, oui. »"]
  ],
  'berline|noah': [
    [null, "« Noah, ça fait longtemps qu'on a pas fait un truc, tous les deux. »"],
    ['noah', "« Ouais, c'est vrai. Faut qu'on remette ça. »"],
    [null, "« On dit toujours qu'il faut remettre ça. »"],
    ['noah', "« Ouais... bah cette fois c'est noté. Pour de vrai. »"]
  ],
  'berline|naomi': [
    [null, "« Naomi, tu joues un truc triste, j'adore. »"],
    ['naomi', "« C'est pas triste, c'est lent. C'est différent. »"],
    [null, "« Pour moi c'est pareil, mais en bien. »"],
    ['naomi', "« Je prends. »"]
  ],
  'berline|sinclair': [
    [null, "« Saint-Pierre, entre nous, tu penses quoi de mes blagues ? »"],
    ['sinclair', "« Elles sont atroces. »"],
    [null, "« Ok. »"],
    ['sinclair', "« Atroces et indispensables. Y'en a qui font les deux, c'est rare. »"]
  ],
  'berline|maeva': [
    [null, "« Maëva, tu penses quoi de ma nouvelle blague ? »"],
    ['maeva', "« Elle est nulle, mais tu le sais déjà, alors ça va. »"],
    [null, "« C'est ça, au moins c'est honnête. »"]
  ],

  // ======================= ELAIS (PNJ) =======================
  'elais|coco': [
    [null, "« Coco ! Tu restes manger ? Ma maman a fait trop, comme d'hab. »"],
    ['coco', "« Elle fait exprès, tu le sais très bien. »"],
    [null, "« Ouais, je sais. Elle t'adore. »"],
    ['coco', "« Bah alors évidemment que je reste. »"]
  ],
  'elais|lawisse': [
    [null, "« Lawisse, t'as passé une bonne journée ? »"],
    ['lawisse', "« Ouais, tranquille. »"],
    [null, "« C'est bien, ça me fait plaisir. »"],
    ['lawisse', "« T'es bizarre, mais c'est cool. »"]
  ],
  'elais|mm': [
    [null, "« M.M., tu viens à la prochaine soirée ? Y'aura du monde. »"],
    ['mm', "« Ouais, si on m'explique où c'est. Et à quelle heure. Et le reste. »"],
    [null, "« Je te fais un plan dessiné, tu vas voir, ça va être parfait. »"]
  ],
  'elais|callipyge': [
    [null, "« Léonie, tu m'as manqué hier, y'avait personne pour rigoler avec moi. »"],
    ['callipyge', "« J'étais à trois mètres, Elaïs. »"],
    [null, "« Trois mètres, c'est loin quand tu ris tout seul. »"],
    ['callipyge', "« C'est très toi, comme phrase. »"]
  ],
  'elais|berline': [
    [null, "« Perline, j'ai besoin d'une blague, c'est urgent. »"],
    ['berline', "« Urgent pour quoi ? »"],
    [null, "« Mon humeur. Elle est à zéro et une blague nulle la remonte toujours. »"],
    ['berline', "« Ça tombe bien, c'est ma spécialité. »"]
  ],
  'elais|camille': [
    [null, "« Camille, tu peux t'asseoir ailleurs que sur moi ? »"],
    ['camille', "« Non. »"],
    [null, "« Ok, bah voilà, c'est réglé. »"],
    ['camille', "« Voilà. »"]
  ],
  'elais|emma': [
    [null, "« Emma ! Raconte-moi ta semaine, j'ai raté un épisode. »"],
    ['emma', "« Tu rates jamais un épisode, tu sais tout avant moi. »"],
    [null, "« Ouais mais j'aime quand c'est toi qui racontes. »"],
    ['emma', "« ...D'accord. Mais je raconte mal exprès pour te faire râler. »"]
  ],
  'elais|lilie': [
    [null, "« Lily ! C'était quoi ce délire hier à 3 heures du mat ? »"],
    ['lilie', "« Ne m'en parle pas, j'ai honte. Enfin non, j'ai trop ri. »"],
    [null, "« On est les pires et je kiffe ça. »"],
    ['lilie', "« Meilleures amies de toujours, on ne changera jamais. »"]
  ],
  'elais|noe': [
    [null, "« Magir, tu restes pour le repas ? »"],
    ['noe', "« Je reste. »"],
    [null, "« T'as dit ça comme si t'étais obligé, mais tu m'aimes bien, je le sais. »"],
    ['noe', "« Je dis rien. »"]
  ],
  'elais|tristan': [
    [null, "« Tristan, tu peux amener autre chose que des trucs forts à la prochaine soirée ? »"],
    ['tristan', "« Genre quoi ? »"],
    [null, "« Genre rien. Je tiens plus après deux bières, tu le sais. »"],
    ['tristan', "« Ouais, mais les deux bières c'est ton moment star, tout le monde attend ça. »"]
  ],
  'elais|noah': [
    [null, "« Noah, tu peux baisser un tout petit peu ? »"],
    ['noah', "« Toujours toi qui demandes ça. »"],
    [null, "« Ouais bah c'est toujours moi qui suis à côté de l'enceinte aussi. »"],
    ['noah', "« Ok, deux crans. Mais pas plus. »"],
    [null, "« Merci. Deux crans, c'est notre compromis. »"]
  ],
  'elais|naomi': [
    [null, "« Naomi, joue-moi le truc calme, tu sais lequel. »"],
    ['naomi', "« Celui d'hier ? »"],
    [null, "« Ouais, celui qui fait penser à rien. »"],
    ['naomi', "« Je sais exactement lequel. »"]
  ],
  'elais|sinclair': [
    [null, "« Saint-Pierre, tu te souviens des appels à 3 heures avec Lily ? »"],
    ['sinclair', "« On riait pour absolument rien. »"],
    [null, "« C'était le mieux, rien. »"],
    ['sinclair', "« Un jour on remet ça. Un jour. »"]
  ],
  'elais|maeva': [
    [null, "« Maëva, tu as passé un bon week-end ? »"],
    ['maeva', "« Ouais, j'ai joué au basket, j'ai gagné. Bon week-end automatique. »"],
    [null, "« J'adore ta logique. »"]
  ],

  // ======================= CAMILLE (PNJ) =======================
  'camille|coco': [
    [null, "« Coco ! Viens là, j'ai besoin d'un appui. »"],
    ['coco', "« Pourquoi moi ? »"],
    [null, "« Parce que t'es là. Et que t'es stable. »"],
    ['coco', "« Bon, ok, mais je bouge plus après. »"]
  ],
  'camille|lawisse': [
    [null, "« Lawisse, le cours de demain, t'y es ? »"],
    ['lawisse', "« Obligé. Et toi tu vas dormir sur mon épaule, je présume. »"],
    [null, "« C'est le plan depuis septembre, pourquoi changer. »"],
    ['lawisse', "« Aucune raison. Continue. »"]
  ],
  'camille|mm': [
    [null, "« M.M., t'es bien assis ? Bouge pas. »"],
    ['mm', "« Pourquoi ? ...Ah. Ok, voilà. »"],
    [null, "« Merci. T'es le meilleur fauteuil du groupe. »"],
    ['mm', "« C'est bizarre comme compliment, mais je le prends. »"]
  ],
  'camille|callipyge': [
    [null, "« Léonie, on fait une soirée filles ou pas ? Ça fait des semaines. »"],
    ['callipyge', "« Ouais, il faut qu'on remette ça. Qui vient ? »"],
    [null, "« Tout le monde. Et je choisis le film, c'est non négociable. »"],
    ['callipyge', "« C'est jamais renégocié de ta vie, oui. »"]
  ],
  'camille|berline': [
    [null, "« Perline, tu me tiens au courant pour samedi ? »"],
    ['berline', "« Ouais. Enfin, je réfléchis encore à comment organiser ça. »"],
    [null, "« Réfléchis vite, sinon je m'assois sur tes plans. »"],
    ['berline', "« C'est pas une menace, ça ? »"]
  ],
  'camille|elais': [
    [null, "« Elaïs, tu peux me garder une place ce soir ? »"],
    ['elais', "« À côté de moi ? Tu vas t'asseoir sur moi, je le sais. »"],
    [null, "« Une place, Elaïs. Je demande juste une place. »"],
    ['elais', "« La place, c'est sur mes genoux, on se connaît. »"]
  ],
  'camille|emma': [
    [null, "« Emma ! On se voit ce soir ? »"],
    ['emma', "« Ouais. Tu viens et tu t'assois pas sur mon livre. »"],
    [null, "« Je promets rien. »"],
    ['emma', "« Voilà, c'est pour ça que je t'adore. »"]
  ],
  'camille|lilie': [
    [null, "« Lily, la tenue d'hier, elle était trop bien. »"],
    ['lilie', "« Merci ! La prochaine fois je t'en fais une pareille. »"],
    [null, "« Avec des poches, pour que je puisse mettre mes mains sur les genoux des gens. »"],
    ['lilie', "« C'est pas lié, mais ok. »"]
  ],
  'camille|noe': [
    [null, "« Magir, une vanne, vite. »"],
    ['noe', "« Non. »"],
    [null, "« Pourquoi non ? »"],
    ['noe', "« Parce que tu la répétras à tout le monde et tu diras que c'est toi. »"],
    [null, "« ...Ok, c'est exactement ça. »"]
  ],
  'camille|tristan': [
    [null, "« Tristan. »"],
    ['tristan', "« Camille ! Ça va ? »"],
    [null, "« Ouais. Bon, on en reste là, hein ? »"],
    ['tristan', "« On en reste là. Ça me va très bien. »"]
  ],
  'camille|noah': [
    [null, "« Noah, tu peux mettre l'enceinte moins fort ? »"],
    ['noah', "« Ah non, là c'est le morceau. »"],
    [null, "« Bon, je m'éloigne de deux mètres. »"],
    ['noah', "« Deux mètres ?! T'abandonnes le morceau ? »"],
    [null, "« Il me manquera. »"]
  ],
  'camille|naomi': [
    [null, "« Naomi, je peux m'asseoir à côté de toi, sans chatouilles ? »"],
    ['naomi', "« Tu dis ça à chaque fois. »"],
    [null, "« Et à chaque fois c'est vrai. Presque. »"],
    ['naomi', "« ...Assieds-toi. »"]
  ],
  'camille|sinclair': [
    ['sinclair', "« Camille, t'as une minute ? »"],
    [null, "« Non. »"],
    ['sinclair', "« Ok. Deux secondes ? »"],
    [null, "« Deux secondes, c'est déjà fini. C'était quoi ? »"],
    ['sinclair', "« Rien. Salut. »"],
    [null, "« Parfait. Salut. »"]
  ],
  'camille|maeva': [
    [null, "« Maëva, on fait un match un jour ? »"],
    ['maeva', "« Toi au basket ? Ok, mais je viens juste te regarder. »"],
    [null, "« C'est déjà ça. »"],
    ['maeva', "« J'apporte les snacks. »"]
  ],

  // ======================= EMMA (PNJ) =======================
  'emma|coco': [
    [null, "« Coco, t'as pris les notes du cours ? »"],
    ['coco', "« J'ai pris la moitié des notes de la moitié du cours. »"],
    [null, "« Donc rien. »"],
    ['coco', "« Ton résumé est violent, mais juste. »"]
  ],
  'emma|lawisse': [
    [null, "« Lawisse, tu me passes le livre que je t'avais prêté ? »"],
    ['lawisse', "« Il est chez moi, je te le rends demain. »"],
    [null, "« Comme à l'époque. Un jour de retard, à chaque fois. »"],
    ['lawisse', "« Y'a des constantes qui ne changent pas. »"]
  ],
  'emma|mm': [
    [null, "« M.M., t'avais compris la devinette d'hier, à la fin ? »"],
    ['mm', "« Non. Mais j'ai ri au bon moment, c'est déjà bien. »"],
    [null, "« C'est... effectivement bien. »"]
  ],
  'emma|callipyge': [
    [null, "« Léonie, tu peux me prêter le bouquin dont tu parlais ? »"],
    ['callipyge', "« Ouais. Tu le rends quand tu veux. »"],
    [null, "« Je le rends avant toi, c'est une différence entre nous. »"],
    ['callipyge', "« Personne n'est parfait. »"]
  ],
  'emma|berline': [
    [null, "« Perline, ta blague de vendredi, je l'ai encore en tête. »"],
    ['berline', "« Dans le bon sens ? »"],
    [null, "« Elle tourne en boucle, je peux pas la faire partir. »"],
    ['berline', "« C'est le but, en fait. »"],
    [null, "« Je sais. Et c'est ça qui est horrible. »"]
  ],
  'emma|elais': [
    [null, "« Elaïs, tu as fait quoi ce matin ? »"],
    ['elais', "« J'ai souri à trois inconnus. Deux ont souri en retour. »"],
    [null, "« Et le troisième ? »"],
    ['elais', "« Il s'est méfié. On progresse quand même. »"],
    [null, "« C'est très toi, comme statistique. »"]
  ],
  'emma|camille': [
    [null, "« Camille, t'as passé une bonne semaine ? »"],
    ['camille', "« Ouais ! Enfin... pose-moi la question quand j'ai fini de courir après tout le monde. »"],
    [null, "« Et c'est pour quand, la fin de la course ? »"],
    ['camille', "« Quand vous arrêterez tous de bouger. Donc jamais. »"]
  ],
  'emma|lilie': [
    [null, "« Lily, tu te souviens du collège, notre trio ? »"],
    ['lilie', "« Ouais... ça a changé, hein. »"],
    [null, "« Ça a changé et c'est pas grave. »"],
    ['lilie', "« Non, c'est pas grave. On est juste répartis autrement. »"]
  ],
  'emma|noe': [
    [null, "« Magir, tu as dit un mot ce matin ? »"],
    ['noe', "« Deux. »"],
    [null, "« Alors t'es au quota. »"],
    ['noe', "« Je peux repartir dans le silence, alors. »"]
  ],
  'emma|tristan': [
    [null, "« Tristan, tu as encore planifié trois trucs pour ce soir ? »"],
    ['tristan', "« Deux. Le troisième c'est demain. »"],
    [null, "« Bon. On en fait un, et on reste ensemble pour le reste. »"],
    ['tristan', "« Ouais... c'est encore mieux comme plan, en fait. »"],
    [null, "« Évidemment que c'est mieux. C'est moi qui l'ai fait. »"]
  ],
  'emma|noah': [
    ['noah', "« Emma ! J'ai un avis sur le livre que tu lis. »"],
    [null, "« Tu l'as pas lu. »"],
    ['noah', "« J'ai pas besoin de le lire pour avoir un avis dessus. »"],
    [null, "« Voilà exactement pourquoi je ne te demanderai jamais rien. »"],
    ['noah', "« On est d'accord, alors. »"]
  ],
  'emma|naomi': [
    [null, "« Naomi, tu peux jouer un truc calme ? »"],
    ['naomi', "« Calme... oui. Pour qui, pour toi ? »"],
    [null, "« Pour moi. Enfin, commence calme. »"],
    ['naomi', "« Ok. Mais je finis fort, c'est prévenu. »"]
  ],
  'emma|sinclair': [
    [null, "« Saint-Pierre, tu ramènes quoi samedi ? »"],
    ['sinclair', "« Le nécessaire. »"],
    [null, "« Le nécessaire selon Saint-Pierre, c'est jamais que le nécessaire. »"],
    ['sinclair', "« C'est une marque de confiance. Je te laisse le superflu. »"]
  ],
  'emma|maeva': [
    [null, "« Maëva, tu penses à quoi ? »"],
    ['maeva', "« Au basket. Et toi ? »"],
    [null, "« À un livre. On est très prévisibles, toutes les deux. »"],
    ['maeva', "« Ouais, mais au moins on est cohérentes. »"]
  ],

  // ======================= LILIE (PNJ) =======================
  'lilie|coco': [
    [null, "« Coco, t'es réveillé ? T'as une voix. »"],
    ['coco', "« C'est le matin. Et c'est toi qui m'as appelé à 23h. »"],
    [null, "« C'était pas 23h... bon ok, peut-être 23h. »"],
    ['coco', "« Et on a raccroché à 3h. On est des cas. »"]
  ],
  'lilie|lawisse': [
    [null, "« Lawisse, tu viens à mon défilé ou tu dis encore que tu viens ? »"],
    ['lawisse', "« J'y vais. Je critique de l'intérieur, c'est mieux. »"],
    [null, "« Critique gentiment, sinon tu sors. »"],
    ['lawisse', "« C'est le principe même de la critique. »"]
  ],
  'lilie|mm': [
    [null, "« M.M., tu trouves que cette tenue va ensemble ? »"],
    ['mm', "« Euh... oui ? Enfin oui. Ça va ensemble, oui. »"],
    [null, "« T'es sûr ? Regarde bien. »"],
    ['mm', "« ...Oui. »"],
    [null, "« Mauvaise réponse. Mais t'as essayé, c'est gentil. »"]
  ],
  'lilie|callipyge': [
    [null, "« Léonie, tu cours même sous la pluie ? »"],
    ['callipyge', "« Surtout sous la pluie, y'a moins de monde. »"],
    [null, "« C'est une image de film, cette vie. »"],
    ['callipyge', "« Ouais bah moi je m'amuse, c'est tout. »"]
  ],
  'lilie|berline': [
    [null, "« Perline, tu me donnes ton avis sur ma tenue ? »"],
    ['berline', "« Elle est belle. Enfin, je réfléchis encore à pourquoi, mais elle est belle. »"],
    [null, "« C'est le genre d'avis que j'aime. »"]
  ],
  'lilie|elais': [
    [null, "« Elaïs, j'ai oublié de te dire un truc super important hier. »"],
    ['elais', "« Dis maintenant. »"],
    [null, "« ...J'ai oublié. Mais c'était important, je le sens. »"],
    ['elais', "« Reviens quand ça remonte, on gère. »"]
  ],
  'lilie|camille': [
    [null, "« Camille, tu touches à mes fringues, tu meurs. »"],
    ['camille', "« C'est écrit où ? »"],
    [null, "« Partout. C'est écrit partout. »"],
    ['camille', "« Ok, ouais, je vois le panneau. »"]
  ],
  'lilie|emma': [
    [null, "« Emma, on remet ça, un jour, toutes les trois ? »"],
    ['emma', "« Le trio ? Ça existe encore, il me semble. »"],
    [null, "« Ouais, mais version collège, le vrai. »"],
    ['emma', "« Le vrai est en maintenance. Mais il revient, le vrai. »"]
  ],
  'lilie|noe': [
    [null, "« Magir, tu me dis quoi sur cette tenue, franchement ? »"],
    ['noe', "« Rien. »"],
    [null, "« Pourquoi rien ? »"],
    ['noe', "« Parce que c'est bien. Rien à dire. »"],
    [null, "« Ok, c'est le meilleur compliment de la journée. »"]
  ],
  'lilie|tristan': [
    [null, "« Tristan, tu portes quoi ce soir ? »"],
    ['tristan', "« Ce que tu me diras de porter. »"],
    [null, "« C'est la bonne réponse. »"],
    ['tristan', "« J'ai appris avec le temps. »"]
  ],
  'lilie|noah': [
    [null, "« Noah, la musique, ça va moins fort aujourd'hui ? »"],
    ['noah', "« C'est le même volume qu'hier. »"],
    [null, "« Ok. Bonne journée, Noah. »"],
    ['noah', "« Bizarre comme conversation, mais ouais, bonne journée ! »"]
  ],
  'lilie|naomi': [
    [null, "« Naomi, tu me fais la playlist pour trier mes fringues ? »"],
    ['naomi', "« Encore ? »"],
    [null, "« C'est un rituel maintenant, t'as pas le choix. »"],
    ['naomi', "« C'est vrai. J'y suis obligée. »"]
  ],
  'lilie|sinclair': [
    [null, "« Saint-Pierre, c'était quoi notre délire hier, déjà ? »"],
    ['sinclair', "« Le truc avec la voix ? »"],
    [null, "« Non, l'autre. »"],
    ['sinclair', "« On a eu trop de délires, c'est trop loin pour que je me souvienne. »"],
    [null, "« C'est le meilleur problème qu'on puisse avoir. »"]
  ],
  'lilie|maeva': [
    [null, "« Maëva, tu trouves pas que mon style est mieux que le tien ? »"],
    ['maeva', "« Non. »"],
    [null, "« Ok, bah voilà, au moins c'est clair. »"],
    ['maeva', "« C'était le but. »"]
  ],

  // ======================= NOE / MAGIR (PNJ) =======================
  'noe|coco': [
    [null, "« Coco, le trio, c'est quand ? »"],
    ['coco', "« Dès que Lawisse arrête de chasser. »"],
    [null, "« Il chasse tout le temps. »"],
    ['coco', "« Voilà pourquoi le trio est rare. »"]
  ],
  'noe|lawisse': [
    [null, "« Lawisse. »"],
    ['lawisse', "« Magir. »"],
    [null, "« ...C'est tout, je voulais juste vérifier un truc. »"],
    ['lawisse', "« Tout va bien ? »"],
    [null, "« Ouais. Bonne journée. »"]
  ],
  'noe|mm': [
    [null, "« M.M., le truc, c'est demain. »"],
    ['mm', "« Ah oui ! Le truc ! C'est demain ! »"],
    [null, "« Tu sais ce que c'est, le truc ? »"],
    ['mm', "« ...Non. »"],
    [null, "« C'est pas grave. Demain, tu sauras. »"]
  ],
  'noe|callipyge': [
    [null, "« Léonie, tu cours où, exactement ? »"],
    ['callipyge', "« Partout. C'est pas la question du où, c'est la question du combien. »"],
    [null, "« Ok, ouais. Bon courage. »"]
  ],
  'noe|berline': [
    [null, "« Perline, la blague d'hier... »"],
    ['berline', "« Je sais. Elle était nulle. »"],
    [null, "« Non. Elle était tellement nulle que c'était bien. »"],
    ['berline', "« C'est mon genre en entier, là. »"]
  ],
  'noe|elais': [
    [null, "« Elaïs. »"],
    ['elais', "« Magir ! Assieds-toi, tu veux un truc ? »"],
    [null, "« Non. Enfin ouais. Reste comme tu es. »"],
    ['elais', "« C'est le meilleur truc qu'on m'ait demandé aujourd'hui. »"]
  ],
  'noe|camille': [
    [null, "« Camille, tu peux t'asseoir ailleurs ? »"],
    ['camille', "« Pourquoi, je te dérange ? »"],
    [null, "« Non. Mais tu me chatouilles en t'installant. »"],
    ['camille', "« C'est involontaire. Presque. »"]
  ],
  'noe|emma': [
    [null, "« Emma. »"],
    ['emma', "« Magir. »"],
    [null, "« ...T'as fini ton livre ? »"],
    ['emma', "« Oui. Toi, tu lis jamais. »"],
    [null, "« ...Exact. »"]
  ],
  'noe|lilie': [
    [null, "« Lily. »"],
    ['lilie', "« Magir ! Dis-moi que ma tenue est bien. »"],
    [null, "« Elle est bien. »"],
    ['lilie', "« Merci. Ça compte, venant de toi. »"]
  ],
  'noe|tristan': [
    [null, "« Tristan, la soirée de samedi, c'est chez toi ? »"],
    ['tristan', "« Ouais ! Tu viens, hein ? Tu viens ? »"],
    [null, "« Je viens. »"],
    ['tristan', "« Promis ? »"],
    [null, "« Je viens, Tristan. »"],
    ['tristan', "« Merci. »"]
  ],
  'noe|noah': [
    [null, "« Noah, le match de samedi ? »"],
    ['noah', "« Le Real gagne. Je le dis maintenant, comme ça personne sera choqué. »"],
    [null, "« Le Barça gagne. Je le dis aussi. »"],
    ['noah', "« On verra samedi. L'enceinte sera de mon côté. »"]
  ],
  'noe|naomi': [
    [null, "« Naomi. »"],
    ['naomi', "« Mmh ? »"],
    [null, "« Rien. »"],
    ['naomi', "« Ok. »"],
    [null, "« Ouais. »"]
  ],
  'noe|sinclair': [
    [null, "« Saint-Pierre, c'était bien hier ? »"],
    ['sinclair', "« Ouais, t'as raté un bon moment. »"],
    [null, "« Je dormais. C'était un bon moment aussi. »"],
    ['sinclair', "« C'est une manière de voir. »"]
  ],
  'noe|maeva': [
    [null, "« Maëva. »"],
    ['maeva', "« Magir. »"],
    [null, "« ...Ça va ? »"],
    ['maeva', "« Ça va. »"],
    [null, "« Ok. »"],
    ['maeva', "« Ok. »"]
  ],

  // ======================= TRISTAN / TITAN (PNJ) =======================
  'tristan|coco': [
    [null, "« Coco ! Tu viens ce soir ? Dis ouais. »"],
    ['coco', "« Je sais même pas c'est quoi, le plan. »"],
    [null, "« Y'a pas de plan. Y'a nous. Le plan, c'est nous. »"],
    ['coco', "« Ok, bah là je viens. »"],
    [null, "« Merci, mon Coco. »"]
  ],
  'tristan|lawisse': [
    [null, "« Lawisse, samedi, tu viens ? Une heure ? Deux heures ? »"],
    ['lawisse', "« J'arrive quand j'arrive. »"],
    [null, "« C'est ta phrase préférée. »"],
    ['lawisse', "« Et elle a toujours marché. »"]
  ],
  'tristan|mm': [
    [null, "« M.M., tu viens ce soir ? »"],
    ['mm', "« Ouais ! Enfin, si je suis invité. »"],
    [null, "« T'es invité, M.M. »"],
    ['mm', "« Ok, alors oui. »"],
    [null, "« C'était pas compliqué, merci. »"]
  ],
  'tristan|callipyge': [
    [null, "« Léonie, la course avec Coco, c'est quand déjà ? »"],
    ['callipyge', "« Samedi. Tu peux venir encourager. »"],
    [null, "« Je serai le plus bruyant du parcours, tu peux pas m'en empêcher. »"],
    ['callipyge', "« C'est le seul risque que j'accepte. »"]
  ],
  'tristan|berline': [
    [null, "« Perline, tu viens ce soir avec Coco ? »"],
    ['berline', "« Ouais. Enfin, lui il vient ? »"],
    [null, "« Je l'ai déjà invité trois fois, il a dit ouais. »"],
    ['berline', "« Alors je viens. »"]
  ],
  'tristan|elais': [
    [null, "« Elaïs, samedi tu viens ? J'amène ce qu'il faut. »"],
    ['elais', "« Amène surtout pas trop. Deux bières et je raconte ma vie à tout le monde. »"],
    [null, "« C'est le moment de la soirée, on est d'accord. »"],
    ['elais', "« Ouais, on est d'accord. »"]
  ],
  'tristan|camille': [
    [null, "« Camille, ce soir, tu... »"],
    ['camille', "« Non. »"],
    [null, "« J'ai rien dit. »"],
    ['camille', "« T'allais dire. »"],
    [null, "« Ouais, t'as raison. Désolé. »"],
    ['camille', "« C'est bien, tu apprends. »"]
  ],
  'tristan|emma': [
    [null, "« Emma, j'ai une idée. »"],
    ['emma', "« Une bonne ? »"],
    [null, "« Une idée. »"],
    ['emma', "« C'est déjà ça. Vas-y. »"],
    [null, "« Ce soir, on fait rien. Tous les deux. Juste rien. »"],
    ['emma', "« C'est ta meilleure idée du mois. »"]
  ],
  'tristan|lilie': [
    [null, "« Lily, ce soir, je mets quoi ? »"],
    ['lilie', "« Deuxième fois que tu demandes cette semaine. »"],
    [null, "« Parce que t'es la seule qui réponds bien. »"],
    ['lilie', "« Ok... mets le truc simple. L'autre fait trop. »"],
    [null, "« Le truc simple. Noté. »"]
  ],
  'tristan|noe': [
    [null, "« Magir, samedi tu viens ? »"],
    ['noe', "« Je viens. »"],
    [null, "« Juste comme ça ? Sans négocier ? »"],
    ['noe', "« J'ai déjà négocié avec moi-même. C'est bon. »"],
    [null, "« Je prends. »"]
  ],
  'tristan|noah': [
    [null, "« Noah, tu amènes l'enceinte samedi ? »"],
    ['noah', "« Évidemment. Et j'ai un avis sur chaque morceau que je mets. »"],
    [null, "« C'est ça le problème, mais ouais, amène. »"],
    ['noah', "« Mes avis font partie de la soirée. »"]
  ],
  'tristan|naomi': [
    [null, "« Naomi, samedi, tu joues ? »"],
    ['naomi', "« Si on me met pas devant tout le monde. »"],
    [null, "« Dans un coin, à l'écart, volume bas. »"],
    ['naomi', "« ...Donc ouais. »"]
  ],
  'tristan|sinclair': [
    [null, "« Saint-Pierre, on s'occupe de quoi, nous deux ? »"],
    ['sinclair', "« De la partie qu'on amène, comme d'hab. »"],
    [null, "« Comme d'hab. On fait ça bien. »"],
    ['sinclair', "« On fait ça mieux que bien. »"]
  ],
  'tristan|maeva': [
    [null, "« Maëva, tu viens ce soir ? »"],
    ['maeva', "« Je sais même pas où c'est. »"],
    [null, "« Je t'envoie l'adresse. Tu viens ? »"],
    ['maeva', "« ...Ouais, ok. »"],
    [null, "« Yes. »"]
  ],

  // ======================= NOAH (PNJ) =======================
  'noah|coco': [
    [null, "« Coco, tu écoutes quoi en ce moment ? »"],
    ['coco', "« Toi, surtout. T'es partout avec ton enceinte. »"],
    [null, "« C'est le but. »"],
    ['coco', "« Au moins t'es honnête. »"]
  ],
  'noah|lawisse': [
    [null, "« Lawisse, on écoute quoi ? »"],
    ['lawisse', "« Toi tu écoutes le Real, moi je subis. »"],
    [null, "« Voilà, une belle relation. »"],
    ['lawisse', "« C'est pour ça qu'on s'entend. »"]
  ],
  'noah|mm': [
    [null, "« M.M., j'ai mis un nouveau son, tu écoutes ? »"],
    ['mm', "« Ouais ! C'est bien ! Enfin je crois. Non, mais oui, c'est bien. »"],
    [null, "« Merci, c'est l'avis le plus M.M. possible. »"]
  ],
  'noah|callipyge': [
    [null, "« Léonie, je te fais une playlist pour courir ? »"],
    ['callipyge', "« Fais. Mais si elle me fait courir plus vite que mon chrono, je te dois quoi ? »"],
    [null, "« Rien. C'est gratuit. C'est mon cadeau au monde. »"]
  ],
  'noah|berline': [
    [null, "« Perline, tu te souviens de nos vieux délires ? »"],
    ['berline', "« Ouais... c'était mieux avant, non ? »"],
    [null, "« Ouais, c'était mieux avant. Enfin, c'était juste avant. »"],
    ['berline', "« C'est ça. On remettra ça un de ces quatre. »"]
  ],
  'noah|elais': [
    [null, "« Elaïs, je mets combien ? Dis-moi ton chiffre. »"],
    ['elais', "« Soixante-dix. Comme la dernière fois. »"],
    [null, "« Toujours soixante-dix. C'est ton chiffre. »"],
    ['elais', "« C'est mon chiffre et je le respecte. »"]
  ],
  'noah|camille': [
    [null, "« Camille, j'ai un avis sur ta playlist. »"],
    ['camille', "« Personne te l'a demandé. »"],
    [null, "« C'est le principe de l'avis. »"],
    ['camille', "« Alors garde-le. Il est bien chez toi. »"],
    [null, "« ...Ok, je garde. »"]
  ],
  'noah|emma': [
    [null, "« Emma ! J'ai pensé un truc sur ton bouquin. »"],
    ['emma', "« Tu ne l'as pas lu. »"],
    [null, "« J'ai pensé un truc sans l'avoir lu. C'est différent. »"],
    ['emma', "« C'est différent, oui. C'est pire. »"],
    [null, "« ...Bon. Je repasserai. »"]
  ],
  'noah|lilie': [
    [null, "« Lily, tu écoutes quoi en ce moment ? »"],
    ['lilie', "« Des trucs calmes. »"],
    [null, "« Ok. Je peux te faire une playlist calme ? »"],
    ['lilie', "« ...Non merci. J'ai déjà mes trucs. »"],
    [null, "« Ok, pas de souci. »"]
  ],
  'noah|noe': [
    [null, "« Magir, samedi, le match. »"],
    ['noe', "« Le Barça. »"],
    [null, "« Le Real. »"],
    ['noe', "« On a déjà fait cette conversation. »"],
    [null, "« Et on la refera. C'est ça, la tradition. »"]
  ],
  'noah|tristan': [
    [null, "« Tristan, c'est où samedi ? »"],
    ['tristan', "« Chez moi ! Tu viens ? Tu viens, hein ? »"],
    [null, "« J'amène l'enceinte, c'est automatique. »"],
    ['tristan', "« L'enceinte et toi. Surtout toi. »"]
  ],
  'noah|naomi': [
    [null, "« Naomi, je peux passer un truc ? »"],
    ['naomi', "« Ça dépend du volume. »"],
    [null, "« ...Moyen ? »"],
    ['naomi', "« Moyen. Ok. »"]
  ],
  'noah|sinclair': [
    [null, "« Saint-Pierre, tu amènes quoi samedi ? »"],
    ['sinclair', "« Ma part. Et toi ? »"],
    [null, "« L'enceinte et mon avis sur tout. »"],
    ['sinclair', "« On est un duo complet, nous. »"]
  ],
  'noah|maeva': [
    [null, "« Maëva, on fait quoi ce soir ? »"],
    ['maeva', "« Traditionnel : tu parles, je gagne. »"],
    [null, "« Ouais... en fait je parlais de la soirée. »"],
    ['maeva', "« Ah. Bah tu parles, et je viens. »"],
    [null, "« Voilà. On a notre équilibre. »"]
  ],

  // ======================= NAOMI (PNJ) =======================
  'naomi|coco': [
    [null, "« Coco, tu veux écouter ou tu veux parler ? »"],
    ['coco', "« Les deux. En même temps si possible. »"],
    [null, "« ...Je joue d'abord. Tu parles après. »"],
    ['coco', "« Deal. »"]
  ],
  'naomi|lawisse': [
    [null, "« Lawisse. »"],
    ['lawisse', "« Naomi. »"],
    [null, "« Ça fait deux fois qu'on se croise aujourd'hui. »"],
    ['lawisse', "« Le monde est petit. Bonne journée. »"]
  ],
  'naomi|mm': [
    [null, "« M.M., tu te souviens de ce que je t'ai dit hier ? »"],
    ['mm', "« Oui... enfin, c'était quoi déjà ? »"],
    [null, "« Laisse tomber. C'était important pour moi, mais laisse tomber. »"],
    ['mm', "« Désolé... je crois que j'avais compris l'inverse aussi. »"]
  ],
  'naomi|callipyge': [
    [null, "« Léonie, t'as ta place pour ce soir ? »"],
    ['callipyge', "« À côté de toi, comme toujours. »"],
    [null, "« C'était ma place. Merci de me la laisser. »"],
    ['callipyge', "« C'est nous qui décidons qui a la place. Et c'est moi. »"]
  ],
  'naomi|berline': [
    [null, "« Perline, tu peux rester à côté de moi ce soir ? »"],
    ['berline', "« Ouais. Tu joues ? »"],
    [null, "« Peut-être. Si y'a pas trop de monde. »"],
    ['berline', "« Je bloque la salle pour toi, alors. Enfin, je le dirai fort, c'est pareil. »"]
  ],
  'naomi|elais': [
    [null, "« Elaïs, tu écoutes ce que je joue ou tu parles par-dessus ? »"],
    ['elais', "« Les deux. Je fais tout par-dessus, moi. »"],
    [null, "« Je sais. C'est pour ça que je t'aime bien. »"],
    ['elais', "« C'est pas un compliment, mais je le prends. »"]
  ],
  'naomi|camille': [
    [null, "« Camille, tu peux rester assise un moment ? »"],
    ['camille', "« Un moment. Genre combien ? »"],
    [null, "« Le temps d'un morceau. »"],
    ['camille', "« Ok, mais juste un. »"],
    [null, "« Merci. »"]
  ],
  'naomi|emma': [
    [null, "« Emma, tu lis quoi ? »"],
    ['emma', "« Un truc calme. »"],
    [null, "« Ok. Je peux jouer un truc calme à côté ? »"],
    ['emma', "« Si c'est vraiment calme. »"],
    [null, "« ...Je peux essayer. »"]
  ],
  'naomi|lilie': [
    [null, "« Lily, j'ai fait une playlist pour ton rituel du tri. »"],
    ['lilie', "« C'est notre rituel à nous. Évidemment. »"],
    [null, "« Voilà. À ce soir, alors. »"],
    ['lilie', "« À ce soir. »"]
  ],
  'naomi|noe': [
    [null, "« Magir. »"],
    ['noe', "« Naomi. »"],
    [null, "« ...Bonne journée. »"],
    ['noe', "« ...Ouais. Toi aussi. »"]
  ],
  'naomi|tristan': [
    [null, "« Tristan, pour samedi, je peux jouer dans un coin ? »"],
    ['tristan', "« Le coin, disons plutôt une salle entière pour toi si tu veux ! »"],
    [null, "« Le coin me va. »"],
    ['tristan', "« Le coin est réservé. »"]
  ],
  'naomi|noah': [
    [null, "« Noah, ton enceinte, tu peux la mettre plus loin ? »"],
    ['noah', "« Plus loin, genre où ? »"],
    [null, "« Loin de moi. »"],
    ['noah', "« C'est un avis, ça ? »"],
    [null, "« C'est une demande. »"]
  ],
  'naomi|sinclair': [
    ['sinclair', "« Naomi, un petit truc pour moi ? »"],
    [null, "« Non. »"],
    ['sinclair', "« Même court ? »"],
    [null, "« Surtout court. »"],
    ['sinclair', "« D'accord. Le message est clair. »"],
    [null, "« Parfait. »"]
  ],
  'naomi|maeva': [
    [null, "« Maëva, tu peux écouter un truc ? »"],
    ['maeva', "« Ça dépend de quoi ça parle. »"],
    [null, "« De rien. C'est instrumental. »"],
    ['maeva', "« Alors ouais. »"]
  ],

  // ======================= SINCLAIR / SAINT-PIERRE (PNJ) =======================
  'sinclair|coco': [
    [null, "« Coco, t'étais où hier soir ? »"],
    ['coco', "« Chez moi, pourquoi ? »"],
    [null, "« J'ai eu un plan génial et t'étais pas là pour le subir. »"],
    ['coco', "« Le plan était quoi ? »"],
    [null, "« Je m'en souviens plus, mais il était génial. »"]
  ],
  'sinclair|lawisse': [
    [null, "« Lawisse, ça marche toujours entre nous, hein. »"],
    ['lawisse', "« Ouais. Tant que rien ne change. »"],
    [null, "« Rien ne change de mon côté. »"],
    ['lawisse', "« C'est le seul point sur lequel on discutera jamais. »"]
  ],
  'sinclair|mm': [
    [null, "« M.M., tu viens samedi ? »"],
    ['mm', "« Ouais ! Enfin, si je suis invité. Et si c'est où je crois. »"],
    [null, "« T'es invité et c'est où tu crois. »"],
    ['mm', "« Donc ouais. Parfait. »"]
  ],
  'sinclair|callipyge': [
    [null, "« Léonie, t'as besoin de quelque chose ? »"],
    ['callipyge', "« Non, mais merci de demander. »"],
    [null, "« C'est mon plaisir. C'est tout ce que je fais. »"],
    ['callipyge', "« Tu le fais bien, c'est déjà ça. »"]
  ],
  'sinclair|berline': [
    [null, "« Perline, ta blague sur le truc, elle était bien. »"],
    ['berline', "« Attends, tu te souviens de mes blagues ? »"],
    [null, "« Celle-là, oui. »"],
    ['berline', "« C'est la plus grande chose qui me soit arrivée. »"]
  ],
  'sinclair|elais': [
    [null, "« Elaïs, tu te souviens du délire de la voix ? »"],
    ['elais', "« Le nôtre ? Ou celui de Lily ? »"],
    [null, "« Celui à 3 heures du matin. »"],
    ['elais', "« Alors c'est les deux à la fois, et on se souvient de rien, et c'est ça qui est bien. »"]
  ],
  'sinclair|camille': [
    [null, "« Camille, tu vas bien ? »"],
    ['camille', "« Je vais bien. Merci d'avoir demandé de là-bas. »"],
    [null, "« De là-bas ? »"],
    ['camille', "« Où tu es. Reste là. »"],
    [null, "« ...Ok. »"]
  ],
  'sinclair|emma': [
    [null, "« Emma, t'as besoin d'un verre ? »"],
    ['emma', "« Non. Et tu sais pourquoi. »"],
    [null, "« Ouais, je sais pourquoi. Mais je devais demander. »"],
    ['emma', "« C'est bien, tu as des réflexes. »"]
  ],
  'sinclair|lilie': [
    [null, "« Lily, le délire d'hier, on le refait ? »"],
    ['lilie', "« Je me souviens même plus de quoi c'était. »"],
    [null, "« Moi non plus. On en refait un nouveau. »"],
    ['lilie', "« C'est comme ça qu'on fait, oui. »"]
  ],
  'sinclair|noe': [
    [null, "« Magir, t'as un avis sur ce que je mets ? »"],
    ['noe', "« ...Ouais. »"],
    [null, "« Je l'écoute. »"],
    ['noe', "« C'est bien. »"],
    [null, "« Merci, c'est tout ce que j'attendais. »"]
  ],
  'sinclair|tristan': [
    [null, "« Tristan, on reprend notre rôle ? »"],
    ['tristan', "« Toujours. Toi la partie, moi la fête. »"],
    [null, "« On fait une bonne équipe. »"],
    ['tristan', "« La meilleure équipe logistique du groupe. »"]
  ],
  'sinclair|noah': [
    [null, "« Noah, tu amènes l'enceinte ? »"],
    ['noah', "« Et toi, tu amènes le reste ? »"],
    [null, "« On fait une soirée complète, nous deux. »"],
    ['noah', "« Une soirée complète. C'est bien, comme idée. »"]
  ],
  'sinclair|naomi': [
    [null, "« Naomi, ça va ? »"],
    ['naomi', "« Ça va. »"],
    [null, "« Parfait. »"],
    ['naomi', "« Voilà. »"],
    [null, "« Bonne journée. »"],
    ['naomi', "« Bonne journée. »"]
  ],
  'sinclair|maeva': [
    [null, "« Maëva, tu viens ce soir ? »"],
    ['maeva', "« Peut-être. »"],
    [null, "« C'est une réponse correcte. »"],
    ['maeva', "« C'est ma réponse standard. »"]
  ],

  // ======================= MAEVA (PNJ) =======================
  'maeva|coco': [
    [null, "« Coco, t'as déjà joué au basket, une fois ? »"],
    ['coco', "« Ouais, au collège. »"],
    [null, "« C'est ce que je pensais. »"],
    ['coco', "« Attends, c'est un jugement ? »"],
    [null, "« C'est une observation. »"]
  ],
  'maeva|lawisse': [
    [null, "« Lawisse, tu fais quoi de ta journée ? »"],
    ['lawisse', "« Des trucs calmes. »"],
    [null, "« Donc rien. »"],
    ['lawisse', "« C'est une version de rien, oui. »"]
  ],
  'maeva|mm': [
    [null, "« M.M. »"],
    ['mm', "« Maëva. »"],
    [null, "« ... »"],
    ['mm', "« ... »"],
    [null, "« Bon. »"],
    ['mm', "« Ouais. Bon. »"]
  ],
  'maeva|callipyge': [
    [null, "« Léonie, demain, t'es là ? »"],
    ['callipyge', "« Ouais, pourquoi ? »"],
    [null, "« Pour le match. Sois pas en retard. »"],
    ['callipyge', "« Je suis jamais en retard. C'est toi qui arrives en avance. »"]
  ],
  'maeva|berline': [
    [null, "« Perline, ta blague d'hier, ouais. »"],
    ['berline', "« T'as aimé ? »"],
    [null, "« Elle était nulle. Mais ouais, j'ai ri. »"],
    ['berline', "« C'est tout ce que je demande. »"]
  ],
  'maeva|elais': [
    [null, "« Elaïs, tu peux pas rester tranquille cinq minutes ? »"],
    ['elais', "« Si. Mais c'est moins drôle. »"],
    [null, "« C'est... ok, ouais, c'est moins drôle. »"]
  ],
  'maeva|camille': [
    [null, "« Camille, on fait un match un jour ? »"],
    ['camille', "« Toi au basket ? Ok, mais je viens juste te regarder. »"],
    [null, "« C'est déjà ça. »"],
    ['camille', "« J'apporte les snacks. »"]
  ],
  'maeva|emma': [
    [null, "« Emma, t'as lu combien de livres ce mois ? »"],
    ['emma', "« Quatre. »"],
    [null, "« Ok. Moi, quatre matchs. »"],
    ['emma', "« On est équivalentes, quelque part. »"],
    [null, "« On est équivalentes, oui. »"]
  ],
  'maeva|lilie': [
    [null, "« Lily, tu me rates pas trop au basket, toi ? »"],
    ['lilie', "« Pas du tout, je suis dans mon domaine. »"],
    [null, "« C'est bien, le domaine. »"],
    ['lilie', "« Tu devrais essayer. »"],
    [null, "« Non. Le basket me va mieux. »"]
  ],
  'maeva|noe': [
    [null, "« Magir. »"],
    ['noe', "« Maëva. »"],
    [null, "« ...Ça va ? »"],
    ['noe', "« Ça va. »"],
    [null, "« Ok. »"]
  ],
  'maeva|tristan': [
    [null, "« Tristan, c'est où, samedi ? »"],
    ['tristan', "« Je te l'envoie ! Tu viens ? »"],
    [null, "« Peut-être. »"],
    ['tristan', "« Ta réponse standard. J'adore. »"]
  ],
  'maeva|noah': [
    [null, "« Noah, tu fais quoi ce soir ? »"],
    ['noah', "« Je sais pas encore. Pourquoi ? »"],
    [null, "« On fait rien ensemble ? »"],
    ['noah', "« Ouais, faire rien ensemble, c'est notre spécialité. »"],
    [null, "« La meilleure du groupe. »"]
  ],
  'maeva|naomi': [
    [null, "« Naomi, t'as un morceau pour moi ? »"],
    ['naomi', "« Un calme ou un rapide ? »"],
    [null, "« Surprends-moi. »"],
    ['naomi', "« Ok. Mais tu dis rien après. »"],
    [null, "« Je promets rien. »"],
    ['naomi', "« Voilà pourquoi je t'en mets deux. »"]
  ],
  'maeva|sinclair': [
    [null, "« Saint-Pierre, pourquoi tu souris tout le temps ? »"],
    ['sinclair', "« Parce que ça marche. »"],
    [null, "« C'est une bonne réponse, en fait. »"],
    ['sinclair', "« Je sais. »"]
  ]
};
