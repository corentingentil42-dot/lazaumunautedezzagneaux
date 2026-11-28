/* ============================================================
   js/moteur/interaction.js — Touche E : parler à un perso, entrer dans une zone, allumer le Grand Feu (vraie fin).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

function tryInteract() {
  if (!nearbyTarget) return;
  if (nearbyTarget.type === 'campfire') { campfireInteract(); return; }
  if (nearbyTarget.type === 'zone') {
    const z = nearbyTarget.ref;
    // v20.23 : devant la maison d'un pote recruté il y a une PANCARTE (le pote, lui, se balade dans le hub) :
    // l'utiliser ouvre la fiche de sa quête pour la rejouer. Pas de double du personnage.
    if (z.id === 'coco' || state.persosDebloques.includes(z.id)) { Snd.play('sign'); openZoneOverlay(z); return; }
    // La zone de Coco (le Circuit) : terrain d'entraînement pour Coco,
    // mais si on joue un autre perso et que Coco est recruté, on peut
    // d'abord discuter avec lui (dialogue d'affinité), puis le menu zone.
    if (z.id === 'coco' && state.persoActif !== 'coco' && state.persosDebloques.includes('coco')) {
      const aff = affinLines('coco', state.persoActif, true);
      openDialogue(z.surnom, aff || pickCasualChat('coco'), () => openZoneOverlay(z), 'coco');
      return;
    }
    // La zone de Coco quand c'est Coco qui joue : entraînement direct.
    if (z.id === 'coco') { openZoneOverlay(z); return; }
    if (state.persosDebloques.includes(z.id) && z.id !== state.persoActif) {
      // Recoupement d'enquête (affaire du Vendredi 13) prioritaire sur
      // les autres discussions, tant qu'il n'est pas fait.
      if (tryRecropIntercept(z.id, z.surnom)) return;
      // DIALOGUE D'AFFINITÉ : dépend de QUI joue, de QUI on parle, et
      // du LIEU (devant sa maison → répliques de zone en plus).
      const aff = affinLines(z.id, state.persoActif, true);
      openDialogue(z.surnom, aff || pickCasualChat(z.id), null, z.id);
    } else {
      const lines = [
        PRIVATE_JOKES[z.id] || "« ... »",
        `« Pour ma quête : ${z.quete.desc} »`,
        `Appuie sur E pour lancer la quête !`
      ];
      openDialogue(z.surnom, lines, () => {
        openZoneOverlay(z);
      }, z.id);
    }
  } else if (nearbyTarget.type === 'wanderer') {
    const w = nearbyTarget.ref;
    // Recoupement d'enquête (affaire du Vendredi 13) prioritaire
    if (tryRecropIntercept(w.perso.id, w.perso.surnom)) return;
    // Même chose pour les persos qui errent sur le hub (pas de
    // répliques de zone ici : ils ne sont pas chez eux).
    const aff = affinLines(w.perso.id, state.persoActif, false);
    openDialogue(w.perso.surnom, aff || pickCasualChat(w.perso.id), null, w.perso.id);
  }
}

// ---- LA VRAIE FIN : le Grand Feu de la Z'aumunauté ----
// Réunir toute la bande n'est qu'un succès : la vraie fin, c'est d'allumer le Grand
// Feu, au sud de la fontaine. Il ne s'allume que si la bande est AU COMPLET.
// (Les préparatifs de la fête sont prévus pour plus tard.)
function campfireInteract() {
  const complete = state.persosDebloques.length >= PERSONNAGES.length;
  if (state.feuAllume) {
    openDialogue('Grand Feu 🔥', ['Le Grand Feu flambe, tranquille. Profite de la fête avec la bande !'], null);
    return;
  }
  if (complete) {
    openDialogue('Grand Feu 🔥', ["Tout est prêt : la bande est RÉUNIE au complet autour du feu. Recule un peu... il est temps d'allumer le Grand Feu ! 🔥"], () => {
      state.feuAllume = true; saveGame();
      showToast('🔥 Le Grand Feu est allumé !');
      showEndScreen();
    });
    return;
  }
  openDialogue('Grand Feu 🔥', [
    "C'est ici que la Z'aumunauté célèbre ses grandes occasions. Il ne s'allume que si la bande est réunie AU COMPLET.",
    `Potes recrutés : ${state.persosDebloques.length}/${PERSONNAGES.length}. Continue de gagner leurs défis !`
  ], null);
}
