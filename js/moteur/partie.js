/* ============================================================
   js/moteur/partie.js — Démarrer / recommencer une partie, intro de Coco, mise à jour du HUD.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// Tuto de début : reste vrai tant que Coco n'a pas gagné SA course.
// La course se relance en boucle tant qu'elle n'est pas réussie.
let tutorialDone = false;
function newGameFromTitle() {
  if (!confirm('Effacer ta progression et recommencer à zéro ?')) return;
  startGame(true);
}
function startGame(fresh) {
  if (gameState !== 'title') return; // garde : Entrée + clic ne doivent pas lancer la partie deux fois
  if (fresh === true) resetGame(); else loadGame();
  refreshWanderers();
  gameState = 'playing';
  document.body.classList.remove('onTitle');
  document.getElementById('titleScreen').style.display = 'none';
  updateHUD();
  Snd.ensure(); Snd.music('hub'); Snd.play('select');
  if (!loopStarted) { loopStarted = true; requestAnimationFrame(loop); } // une seule boucle, minicarte incluse
  // Partie reprise : Coco est déjà recruté (la course du tuto est gagnée), on ne rejoue pas l'intro.
  if (state.persosDebloques.includes('coco')) {
    showToast('💾 Partie reprise : ' + (state.persosDebloques.length - 1) + '/' + (PERSONNAGES.length - 1) + ' potes');
    return;
  }
  // TUTORIEL D'OUVERTURE : c'est COCO en personne qui parle, avec une
  // expression qui change à chaque réplique (assets/tuto-coco/, avec repli
  // sur son portrait assets/portraits/coco.jpg).
  openDialogue('Coco', [
    { text: "Salut ! Moi c'est Coco, le grand chef de la Z'aumunauté dez Z'Agneaux. Enfin... de ce qu'il en reste. 😎", expr: 'hello' },
    { text: "Six mois qu'un truc a tout cassé : le Vendredi 13, le Cookie Sacré de la Grande Surprise a disparu. À 22h13, pile. Depuis, plus personne ne se parle, chacun est retranché dans SA zone.", expr: 'explain' },
    { text: "Et devine qui écope ? Moi. Le gars qui a déjà avoué un cookie dans sa vie. Sauf que c'était l'AUTRE, le cookie de secours. Bref : je vais trouver le vrai coupable, et ce sera pas moi.", expr: 'determined' },
    { text: "Le plan : réveiller la bande en gagnant leurs défis. Chaque pote recruté verse SA version au dossier — et chaque version élimine des suspects de la liste. La vérité, elle se recoupe.", expr: 'explain' },
    { text: "Commandes : flèches ou ZQSD, E pour parler, R pour l'équipe, M pour la carte, J pour le dossier. Mais d'abord, prouve que t'es digne : MA course d'entraînement ! 🚴", expr: 'happy' }
  ], () => { launchMiniGame(zones.find(z => z.id === 'coco')); }, 'coco');
}
function updateHUD() {
  const p = PERSONNAGES.find(x => x.id === state.persoActif) || PERSONNAGES[0];
  document.getElementById('hudName').textContent = p.surnom;
}
