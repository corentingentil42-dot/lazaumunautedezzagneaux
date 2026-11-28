/* ============================================================
   js/donnees/zones.js — Les zones du monde : position des maisons, quête associée à chaque perso (type de mini-jeu, texte).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

const ZONE_RADIUS = 1050;
const zones = PERSONNAGES.map((p, i) => {
  let x, y, angle;
  if (p.id === 'coco') {
    // Maison de Coco, au sud de la place. Ce qu'on voit au-dessus du toit (l'émoji et le nom de la
    // zone, ~82 px de haut) fait partie de son « skin » : il ne doit toucher ni la place (rayon
    // HUB_RADIUS + 4 px de trait), ni le feu de camp. Avant (y = HUB_Y + 180), le nom et l'émoji
    // étaient dessinés EN PLEIN sur le feu. 96 = 4 (trait) + 82 (émoji + nom) + 10 de marge.
    x = HUB_X - 70; y = HUB_Y + HUB_RADIUS + 96;
    angle = Math.PI / 2;
  } else {
    // Les amis se répartissent à égale distance sur tout le cercle, quel que soit leur nombre.
    // Le sud est réservé à la maison de Coco : si le nombre d'amis est PAIR, il y aurait une
    // maison pile au sud (sa route traverserait celle de Coco), donc on décale le cercle d'un demi-pas.
    const nbAmis = PERSONNAGES.length - 1;
    angle = ((i - 1) / nbAmis) * Math.PI * 2 - Math.PI/2 + (nbAmis % 2 === 0 ? Math.PI / nbAmis : 0);
    x = HUB_X + Math.cos(angle) * ZONE_RADIUS - 70;
    y = HUB_Y + Math.sin(angle) * ZONE_RADIUS - 60;
  }
  const pnjOffset = 95;   // distance de la maison, côté hub (sur le chemin)
  const pnjSide = 50;     // décalage latéral pour se tenir sur un côté du chemin
  // Magir (noe) et Tristan (tristan) : exceptionnellement de l'autre côté du
  // chemin, leur nom de maison chevauchait leur étiquette "Parler à..."
  const pnjSideSign = (p.id === 'noe' || p.id === 'tristan') ? -1 : 1;
  const towardHub = angle + Math.PI; // vers le hub = "devant" la maison
  const perp = angle + Math.PI / 2;
  const pnjAngle = p.id === 'coco' ? Math.PI / 2 : towardHub;
  return {
    ...p,
    x, y, w: 140, h: 120, angle, isHome: p.id === 'coco',
    pnjHome: {
      x: x + 70 + Math.cos(pnjAngle) * pnjOffset + Math.cos(perp) * pnjSide * pnjSideSign - 12,
      y: y + 60 + Math.sin(pnjAngle) * pnjOffset + Math.sin(perp) * pnjSide * pnjSideSign - 15
    }
  };
});
