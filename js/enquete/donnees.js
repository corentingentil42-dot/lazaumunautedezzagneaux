/* ============================================================
   js/enquete/donnees.js — L'Affaire du Vendredi 13 : témoignages, recoupements, indices, suspects (CASE_*). Les 43 suspects viendront ici.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   L'AFFAIRE DU VENDREDI 13 — fil conducteur narratif du jeu.
   Il y a six mois, le soir de la Grande Surprise, le Cookie Sacré a
   disparu à 22h13, et la bande s'est dispersée. Chaque pote recruté
   verse son témoignage au dossier ; trois témoins extérieurs (le Prof
   de Maths, la CPE, le Concierge) rôdent sur la place. À 16/16, la
   Révélation referme l'affaire. Journal consultable avec J.
   (Ton : mystérieux et sérieux pendant l'enquête, fin drôle.)
   ===================================================================== */
const CASE_INTRO = "Il y a six mois, un Vendredi 13, la Z'aumunauté préparait sa Grande Surprise. Au cœur du dispositif : le Cookie Sacré, cuisiné par Perline, caché par Lawisse. À 22h13, la boîte a disparu. Le lendemain, plus personne ne se parlait. Et pendant que la bande s'accusait en silence, personne n'a pensé à regarder DEHORS. Ce dossier recense TOUS les suspects extérieurs : les adultes de l'école, les familles, les gens du quartier. Le vrai coupable est quelque part dans cette liste.";
// Indices physiques sur le coupable : chaque indice verrouillé dans le
// dossier resserre la liste — ne restent que les suspects qui le matchent.
// (Liste des suspects à valider/amender avec Corentin : renommer, virer,
// ajouter... le mécanisme d'élimination recalcule tout seul.)
const CASE_ATTRS = {
  adulte: "c'est un adulte, pas un gamin",
  chauve: "il est chauve (sa tête a brillé sous la lune)",
  lunettes: "il porte des lunettes (elles ont réfléchi l'angle du mur)",
  acces: "il avait une clé de l'école (une clé de prof)",
  siffleur: "il siffle en rentrant chez lui, tranquillement"
};
const CASE_COUPABLE = 'prof-maths';
// La grosse liste des suspects : PERSONNE du groupe. Des gens de la vie de
// la bande : l'école, les familles, le quartier.
const CASE_SUSPECTS = [
  { id: 'prof-maths', nom: "Le Prof de Maths 📐", note: "range ses copies au local à provisions chaque vendredi soir", attrs: ['adulte','chauve','lunettes','siffleur','acces'] },
  { id: 'cpe', nom: "La CPE 📋", note: "a ouvert puis enterré une enquête réglementaire", attrs: ['adulte','acces'] },
  { id: 'concierge', nom: "Le Concierge 🔑", note: "voit tout, ne dit rien, sourit rarement", attrs: ['adulte','acces','siffleur'] },
  { id: 'prof-eps', nom: "Le Prof d'EPS 🏃", note: "chronomètre tout ce qui bouge", attrs: ['adulte','chauve','acces'] },
  { id: 'documentaliste', nom: "La Documentaliste 📚", note: "ferme le CDI à 22h30, jamais une minute de plus", attrs: ['adulte','lunettes'] },
  { id: 'surveillant', nom: "Le Surveillant 🦺", note: "jeune, tient la grille du parking le vendredi soir", attrs: ['acces'] },
  { id: 'papa-berline', nom: "Le papa de Perline 🥖", note: "au fournil du restaurant familial toute la soirée", attrs: ['adulte','siffleur'] },
  { id: 'maman-berline', nom: "La maman de Perline 🧁", note: "deux heures au téléphone pour la recette du glaçage", attrs: ['adulte','lunettes'] },
  { id: 'papa-noah', nom: "Le papa de Noah 🦷", note: "des couronnes sur toute la rangée du haut, il croque plus rien", attrs: ['adulte','chauve'] },
  { id: 'soeur-naomi', nom: "La grande sœur de Naomi 🎼", note: "tenait les pages de la partition avec Naomi", attrs: ['lunettes'] },
  { id: 'mamie-tristan', nom: "La mamie de Tristan ⏱️", note: "chronométrait le plan au téléphone avec Tristan", attrs: ['adulte','lunettes'] },
  { id: 'papy-lawisse', nom: "Le papy de Lawisse 🚶", note: "sa grande passion : rentrer chez lui", attrs: ['adulte','chauve','siffleur'] },
  { id: 'tante-elais', nom: "La tante d'Elaïs ✂️", note: "tenait le shampoing et le machin à cheveux au salon", attrs: ['adulte','lunettes'] },
  { id: 'frere-camille', nom: "Le grand frère de Camille 🎧", note: "était le banc sur lequel Camille était assise", attrs: [] },
  { id: 'voisine-magir', nom: "La voisine de Magir 🧹", note: "sort ses poubelles et ses opinions à toute heure", attrs: ['adulte','chauve','lunettes'] },
  { id: 'boulanger', nom: "Le boulanger 🥐", note: "rangeait ses croissants devant le match", attrs: ['adulte','chauve','siffleur'] },
  { id: 'facteur', nom: "Le facteur 🚲", note: "en retard sur sa tournée, il pédalait à 22h", attrs: ['adulte','lunettes','siffleur'] },
  { id: 'cousin-sinclair', nom: "Le cousin de Saint-Pierre 🎯", note: "raconte qu'il était pas là, ce qui est sa phrase habituelle", attrs: [] }
];
const CASE_TEMOIGNAGES = {
  lawisse: {
    court: "Le local était fermé à clé et RIEN n'a été cassé : le voleur avait une clé. Pas la sienne.",
    piece: "Le plan du local (illisible, donc fiable)",
    lines: [
      "« Le Vendredi 13 ? Je m'en souviens parfaitement. Dossier ouvert. »",
      "« La boîte était au local à provisions. Il me fallait la clé. Le concierge en a une pour chaque porte, donc j'ai... emprunté la mienne. À lui. Sans lui dire. C'est de la logistique. »",
      "« À 22h12, on va la chercher : local vide. Et voilà le détail qui compte : la porte n'a pas été forcée. Le voleur est entré AVEC une clé. »",
      "« Ce n'était pas la mienne : je l'avais rendue avant 22h, je tiens un registre. Je vous laisse faire le calcul. Moi je l'ai fait. Deux fois. »",
      "« Et Coco ? Coco cherchait la boîte avec nous, sous les yeux de tout le monde. Le dossier pointe le mauvais mouton. »",
      "📎 Pièce n°1 versée au dossier : le plan du local (illisible, donc fiable)."
    ]
  },
  mm: {
    court: "Il a veillé. Enfin, regardé. Enfin, beaucoup applaudi. Et le facteur, lui, pédalait à 22h : trop épuisé pour voler quoi que ce soit.",
    piece: "Un dessin du cookie (avec des lunettes)",
    blanchit: ['facteur'],
    lines: [
      "« On m'avait dit : M.M., tu veilles sur la fête. Alors j'ai veillé. Enfin, j'ai regardé. Enfin, j'ai beaucoup applaudi. »",
      "« À un moment j'ai vu un mouvement près du mur du sud. J'ai dit : halte ! Il y avait personne. J'ai dit : parfait, tout va bien. »",
      "« Ah, et le facteur ? Je l'ai vu à 22h, il pédalait comme un dangereux, en retard sur sa tournée. Il avait l'air trop épuisé pour voler quoi que ce soit. Le voilà blanchi. »",
      "« Ce soir-là, le cookie existait. Après, il existait plus. Voilà mon témoignage complet. Je signe où ? »",
      "📎 Pièce n°2 versée au dossier : un dessin du cookie (il y porte des lunettes). SUSPECT BLANCHI : le facteur."
    ]
  },
  callipyge: {
    court: "Le coureur à la boîte de 22h05, c'était Lawisse qui allait la cacher. Et le prof d'EPS l'a chronométrée au stade toute la soirée.",
    piece: "Une miette, au pied de la piste",
    blanchit: ['prof-eps'],
    lines: [
      "« Moi j'étais à l'entraînement, ce soir-là. Tour du quartier, comme tous les vendredis. »",
      "« Et là, je dépasse quelqu'un qui court avec une boîte. Vite. Très vite. Je l'ai revu en repassant : c'était Lawisse, qui allait cacher la boîte. Un coureur de plus innocent que lui, tu meurs. »",
      "« Et le prof d'EPS ? Au stade avec moi, toute la soirée. C'est lui qui tient le chrono, pas le chrono qui le tient. Il est hors de cause. »",
      "« La course m'a appris une chose : les souvenirs courent plus vite que nous. Mais le coureur de la boîte, lui, c'est réglé. »",
      "📎 Pièce n°3 versée au dossier : une miette au pied de la piste (analysée : cookie, sans doute). SUSPECT BLANCHI : le prof d'EPS."
    ]
  },
  berline: {
    court: "Le cookie était sa pièce maîtresse. Son papa ? Au fournil du restaurant familial, avec douze serveurs pour témoins.",
    piece: "La recette secrète, annotée top secret",
    blanchit: ['papa-berline'],
    lines: [
      "« Le Cookie Sacré, c'était MON cookie. Enfin, notre cookie. Enfin, la pièce maîtresse de la Grande Surprise, cuisinée par mes soins. »",
      "« J'avais tout prévu : la recette, le papier doré, la boîte, la musique, les miettes réglementaires. »",
      "« Et puisqu'on me demande : mon père, ce soir-là, était au fournil du restaurant. Toute la soirée. Avec douze serveurs pour témoins. Il fait le meilleur pain de la ville, pas le meilleur vol. »",
      "« Ce soir-là j'ai perdu deux choses : la Grande Surprise, et la blague que je voulais faire après. La blague, je l'ai refaite. Le cookie, lui... »",
      "📎 Pièce n°4 versée au dossier : la recette secrète (ingrédient principal : du beurre, et de l'amour). SUSPECT BLANCHI : le papa de Perline."
    ]
  },
  elais: {
    court: "Soirée franges au salon : le cookie n'est jamais entré en scène. Sa tante tenait le shampoing, à deux mètres d'elle.",
    piece: "Une frange, coupée trop net",
    blanchit: ['tante-elais'],
    lines: [
      "« Ce soir-là : salon de coiffure, soirée franges. J'avais les mains dedans, littéralement. »",
      "« Le cookie devait arriver à 22h13. L'ambiance était prête. Le public était coiffé. Tout était prêt, tu vois l'image ? »",
      "« Et ma tante ? Elle me tenait le shampoing et le machin à cheveux. Elle était sur place, à deux mètres de moi, toute la soirée. On ne tient pas un shampoing ET un vol de cookie en même temps. »",
      "« Déclaration officielle du salon : nous sommes innocents, et la frange était parfaite. »",
      "📎 Pièce n°5 versée au dossier : une frange coupée net. SUSPECT BLANCHI : la tante d'Elaïs."
    ]
  },
  camille: {
    court: "L'ombre qui longeait le mur du sud marchait droit, très calme... et sa tête a BRILLÉ sous la lune. Chauve, donc.",
    piece: "Une photo floue, prise de trop près (la lune, elle, était nette)",
    clue: ['chauve'],
    lines: [
      "« Ce soir-là, je n'ai touché personne. Enfin, presque personne. Enfin personne de mal, et personne de cookie. »",
      "« J'étais assise sur le banc. Enfin, sur quelqu'un qui était sur le banc. Vue imprenable sur le mur du sud. »",
      "« Et là, une ombre longe le mur, très droit, très calme. Et quand la lune est revenue de derrière son nuage... sa tête a BRILLÉ. Pas un reflet de cheveux : un crâne. Un vrai crâne de chauve. »",
      "« Nous, on a des cheveux plein la tête, tu peux vérifier. Le voleur, lui, pas un. Retiens ça : CHAUVE. »",
      "📎 Pièce n°6 versée au dossier : une photo floue (mais la lune était nette). INDICE VERROUILLÉ : le coupable est chauve."
    ]
  },
  emma: {
    court: "Elle lisait. Elle a consigné le silence soudain. Et la documentaliste rangeait les retours du CDI jusqu'à la fermeture.",
    piece: "Un marque-page, glissé à la page 13",
    blanchit: ['documentaliste'],
    lines: [
      "« Je lisais. »",
      "« ...Non mais je vois ta tête. Je lisais VRAIMENT. À 22h, tout le monde crie, et moi je lis. C'est mon rythme. »",
      "« Et la documentaliste ? Elle rangeait les retours du CDI jusqu'à 22h30, la fermeture, jamais une minute de plus. Je l'ai vue, j'ai consigné. Elle est rentrée direct chez elle après. »",
      "« J'ai relevé les yeux UNE fois, parce que le silence devenait soudain. Rien vu, rien entendu, aucun alibi. C'est le témoignage le plus honnête que tu auras aujourd'hui. »",
      "📎 Pièce n°7 versée au dossier : un marque-page, glissé exactement à la page 13. SUSPECT BLANCHI : la documentaliste."
    ]
  },
  lilie: {
    court: "Le papier doré ne brillait plus. Et la maman de Perline a passé deux heures au téléphone sur la recette du glaçage.",
    piece: "Un bout de papier doré, près de l'école",
    blanchit: ['maman-berline'],
    lines: [
      "« Le cookie était MAGNIFIQUE. Papier doré, boîte coordonnée, tu vois le niveau de la soirée ? Tout brillait. »",
      "« 22h13 : tout le monde crie. Le papier doré ne brillait plus nulle part. J'ai dit : catastrophe. Personne ne m'a entendue : tout le monde criait. »",
      "« La maman de Perline ? Deux heures au téléphone, sur la recette du glaçage. On ne discute pas deux heures de beurre avec un voleur de cookie. Elle est hors de cause. »",
      "« J'ai des soupçons ? J'ai des intuitions. Mon intuition dit : regarde du côté des adultes de l'école. Les intuitions, ça s'explique pas. »",
      "📎 Pièce n°8 versée au dossier : un bout de papier doré, retrouvé près de l'école. SUSPECT BLANCHI : la maman de Perline."
    ]
  },
  noe: {
    court: "Le cookie était bon. Le Barça a gagné. Et le boulanger rangeait ses croissants devant le match.",
    piece: "Un silence, consigné par écrit",
    blanchit: ['boulanger'],
    lines: [
      "« ... »",
      "« Le cookie était bon. »",
      "« ...Le Barça jouait ce soir-là. On a gagné. Et le boulanger ? Devant sa vitrine, à ranger ses croissants en regardant le match. On l'a vu passer. Voilà. »",
      "« C'est mon témoignage entier. Bon. Disparu. Comme le cookie. »",
      "📎 Pièce n°9 versée au dossier : un silence entier, consigné par écrit. SUSPECT BLANCHI : le boulanger."
    ]
  },
  tristan: {
    court: "Le cookie devait entrer à 22h13, sur le morceau de Naomi. À 22h12, le local était vide. Et sa mamie tenait le chrono du plan au téléphone.",
    piece: "Le planning de la soirée, annoté jusqu'au plan G",
    blanchit: ['mamie-tristan'],
    lines: [
      "« Il y avait un PLAN ! Le cookie entrait en scène à 22h13, sur le morceau de Naomi. Timing béton. J'avais le plan A, le plan B, le plan C, et le plan du plan ! »",
      "« À 22h12, Lawisse devait rapporter la boîte. Résultat : le local est vide. Un plan sans cookie, ça fait juste des gens qui regardent leur montre. »",
      "« Et ma mamie ? Au téléphone avec moi, du plan A au plan E. Elle chronométrait la soirée AVEC moi. Elle a même dit « respire, mon grand ». Vous voyez une complice dire ça ? Moi non plus. »",
      "« Ce soir-là j'ai appris une chose : le vrai chaos, il se planifie pas. »",
      "📎 Pièce n°10 versée au dossier : le planning annoté jusqu'au plan G. SUSPECT BLANCHI : la mamie de Tristan."
    ]
  },
  noah: {
    court: "Une bouchée s'est fait entendre pendant MA pause, entre les pistes 12 et 14. Son papa, lui, ne croque plus rien : couronnes.",
    piece: "L'enregistrement, avec la bouchée audible",
    blanchit: ['papa-noah'],
    lines: [
      "« L'enceinte jouait. Un morceau grave, mystérieux, parfait pour l'entrée d'un cookie. L'ambiance était ÉNORME. »",
      "« Entre deux morceaux, j'ai mis une pause. C'est pendant MA pause qu'une bouchée s'est fait entendre. Une bouchée, croquée en plein dans mon set ! »",
      "« Mon père ? Il croque plus rien, il a des couronnes sur toute la rangée du haut. Le dentiste a signé un certificat. Enfin, il a dit « c'est des couronnes ». Voilà : blanchi. »",
      "« J'ai réécouté la soirée cent fois. La bouchée est là, entre les pistes 12 et 14. Le crime est musical, et il a un rythme. »",
      "📎 Pièce n°11 versée au dossier : l'enregistrement de la soirée. SUSPECT BLANCHI : le papa de Noah."
    ]
  },
  naomi: {
    court: "Un cookie ne disparaît pas, il se fait manger. La morsure venait de derrière le mur, pendant son morceau. Sa grande sœur tenait la partition.",
    piece: "Une note grave : le moment exact de la morsure",
    blanchit: ['soeur-naomi'],
    lines: [
      "« Un cookie ne disparaît pas. Il se fait manger. C'est la seule loi. »",
      "« Ce soir-là, j'ai joué le moment exact. Et pendant le grand silence, quelque chose a mordu. Une bouchée, derrière le mur. Le son d'une bouchée, ça s'entend, si tu écoutes vraiment. »",
      "« Ma grande sœur ? Elle tenait les pages de ma partition. On ne tourne pas les pages d'une sonate ET on vole pas un cookie en même temps. Personne ne sait faire les deux. »",
      "« Tout le monde criait. Personne n'écoutait. Moi, j'ai écouté. C'est tout ce que je dirai. »",
      "📎 Pièce n°12 versée au dossier : une note grave, consignée « le moment exact de la morsure ». SUSPECT BLANCHI : la grande sœur de Naomi."
    ]
  },
  sinclair: {
    court: "Une silhouette portait la boîte comme quelqu'un qui RANGE. Le surveillant, lui, tenait la grille, à l'autre bout de la cour.",
    piece: "Un ticket de bus, jamais utilisé",
    blanchit: ['surveillant'],
    lines: [
      "« Officiellement, j'étais pas là. Officieusement, je vois tout de partout, tu me connais. Donc ma présence compte double. »",
      "« Ce soir-là, j'ai vu une silhouette près du local à provisions. Elle portait la boîte, mais pas comme quelqu'un qui cache : comme quelqu'un qui RANGE. Ça m'a glacé. »",
      "« Le surveillant ? À la grille du parking, tout le soir, à l'autre bout de la cour. Je l'ai vu de partout, c'est mon truc. Et il est rentré à 22h30, je l'ai vu de partout une deuxième fois. »",
      "« J'ai glissé l'info à la CPE, mais son enquête a foiré à la cafétéria. Les grandes personnes, hein. »",
      "📎 Pièce n°13 versée au dossier : un ticket de bus, jamais utilisé. SUSPECT BLANCHI : le surveillant."
    ]
  },
  maeva: {
    court: "Le match, la victoire, et un concierge qui souriait : il avait suivi le match depuis sa loge et parié un croissant.",
    piece: "Le score du match, authentifié",
    blanchit: ['concierge'],
    lines: [
      "« Ce soir-là, j'avais un match. On a gagné. Voilà ma soirée. »",
      "« En rentrant, j'ai croisé le concierge. Il souriait. Le concierge, ça sourit jamais. Alors j'ai demandé. Il avait suivi le match depuis sa loge, il avait parié un croissant. Il était devant SA loge, toute la soirée. »",
      "« Donc le sourire, c'était le score. Un alibi de championnat, c'est un alibi. Le voilà blanchi. »",
      "« Mon témoignage : le match, la victoire, le sourire expliqué. Enquête avec ça. »",
      "📎 Pièce n°14 versée au dossier : le score du match, authentifié. SUSPECT BLANCHI : le concierge."
    ]
  },
  horace: {
    court: "22h11 : un adulte aux lunettes, boîte sous le bras, sifflement tranquille. Il raconte tout... mais refuse de signer.",
    piece: "Le carnet de marche, entrée 22h11",
    lines: [
      "« Ce soir-là, je marchais. Le Vendredi 13, la ville se vide plus vite que d'habitude. »",
      "« 22h11. J'ai croisé quelqu'un. Un adulte, des lunettes, la boîte sous le bras. Il ne se cachait pas. C'est ça qui m'a dérangé. »",
      "« Il sifflait. Un sifflement tranquille, de quelqu'un qui rentre chez lui après une bonne journée. À 22h11. Avec une boîte. »",
      "« Je raconte tout, mais je signe rien : c'est la marche qui témoigne, pas moi. Les indices, recoupez-les vous-mêmes. Retiens juste les lunettes. Et le reste. »",
      "📎 Pièce n°15 versée au dossier : le carnet de marche. « 22h11. Adulte. Lunettes. Boîte. Sifflement. Direction : chez lui. »"
    ]
  }
};
// Recoupements de l'équipe d'enquête : une fois la bande au complet,
// retourner voir ces quatre-là (E pour leur parler). Chaque recoupement
// VERROUILLE un indice dans le dossier (et parfois blanchit un suspect).
const CASE_RECROISES = {
  noah: {
    key: "INDICE : le coupable est un adulte",
    clue: ['adulte'],
    lines: [
      "« Tu m'as demandé de réécouter la soirée. J'ai fait mieux : j'ai isolé la bouchée. Piste 13. Elle est LÀ. »",
      "« Analyse du set : la bouchée arrive pendant MA pause, et elle vient de dehors. Derrière le mur du sud. Le croqueur n'était pas dans la fête. »",
      "« Et le rythme... lent. Régulier. Tranquille. Un gamin qui croque en cachette, ça panique. Ça, c'était un adulte qui prend son temps. »",
      "« Verrouille ça dans le dossier : le coupable est un ADULTE. Pas un gamin, pas une grande sœur, pas un cousin de 14 ans. Un adulte. »",
      "📎 Recoupement versé au dossier. INDICE VERROUILLÉ : le coupable est un adulte."
    ]
  },
  mm: {
    key: "INDICE : le coupable porte des lunettes (+ la CPE est blanchie)",
    clue: ['lunettes'],
    blanchit: ['cpe'],
    lines: [
      "« On m'a dit : M.M., recoupe. J'ai recoupé. Enfin, j'ai réfléchi. Enfin, j'ai dessiné. »",
      "« Camille a vu une ombre longer le mur du sud, très droit, angle parfait. Horace a croisé un adulte avec des lunettes. Moi, j'avais dessiné le cookie avec des lunettes. Je pensais que c'était un style. C'était un signe. »",
      "« Et l'angle parfait : quand la lune a brillé, ce sont les VERRES qui ont réfléchi. Des lunettes. Verrouille ça. »",
      "« La CPE, par contre : son enquête s'est arrêtée à la cafétéria, un malaise, une chaise défaillante. Elle cherchait du mauvais côté. Elle est innocente, la pauvre. Elle grignotait juste. 📋 »",
      "📎 Recoupement versé au dossier. INDICE VERROUILLÉ : le coupable porte des lunettes. SUSPECT BLANCHI : la CPE."
    ]
  },
  lawisse: {
    key: "INDICE : le coupable avait une clé de l'école",
    clue: ['acces'],
    lines: [
      "« Dossier. La clé. J'ai repris toute la logistique de A à Z. Comme d'habitude. »",
      "« Ma clé empruntée n'a jamais ouvert ce local : aucune trace, aucune effraction, et le concierge jure — en silence, mais il jure — que sa clé n'a pas quitté le trousseau. »",
      "« J'ai interrogé le concierge. Enfin, je l'ai écouté faire silence d'une façon très éloquente. Sa conclusion muette : la clé qui a ouvert le local, c'était une clé de PROF. Une clé de l'école. »",
      "« Donc : quelqu'un qui a un accès officiel à l'école un vendredi soir. Verrouille ça, et regarde qui reste dans la liste. Tu verras, ça réduit. »",
      "📎 Recoupement versé au dossier. INDICE VERROUILLÉ : le coupable avait une clé de l'école."
    ]
  },
  noe: {  // id du perso Magir = 'noe' (l'ancienne clé 'magir' ne correspondait à personne : le recoupement ne se déclenchait jamais)
    key: "INDICE : le coupable siffle en rentrant chez lui",
    clue: ['siffleur'],
    lines: [
      "« ... »",
      "« J'ai comparé les silences. Le silence de la bouchée. Et le silence d'après, quand tout le monde cherchait. »",
      "« Le silence de la bouchée était... paisible. Un gamin qui croque en cachette, ça fait un silence nerveux. Ça, c'était un adulte tranquille. »",
      "« Horace a dit : il siffle en rentrant. Les gamins, ça siffle pas en rentrant chez eux. Les adultes, si. Verrouille : un siffleur. ... Voilà. J'ai dit des choses. »",
      "📎 Recoupement versé au dossier. INDICE VERROUILLÉ : le coupable siffle en rentrant chez lui."
    ]
  }
};
