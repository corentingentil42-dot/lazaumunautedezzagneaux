/* ============================================================
   js/minijeux/noyau.js — Cœur des mini-jeux : lancement, tutoriel, victoire / défaite (mgSuccess, mgFail), bouton Rejouer, écran de fin.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEUX ============ */
const MINIGAMES = {};
let activeMiniGame = null, mgAnimationId = null, mgState = null;
let mgTries = 0; // échecs de suite sur le même défi (affiché seulement : « Tentative n°X »)
let tutoCallback = null;

function showTutorial(title, lines, keysList, callback) {
  document.getElementById('tutoTitle').textContent = title;
  const content = document.getElementById('tutoContent');
  content.innerHTML = '';
  lines.forEach(l => {
    const p = document.createElement('p');
    p.textContent = l;
    content.appendChild(p);
  });
  if (keysList && keysList.length) {
    const kd = document.createElement('div');
    kd.className = 'keys';
    keysList.forEach(k => {
      const kb = document.createElement('div');
      kb.className = 'keyBadge';
      kb.textContent = k;
      kd.appendChild(kb);
    });
    content.appendChild(kd);
  }
  document.getElementById('tutorialOverlay').classList.add('active');
  tutoCallback = callback;
}
document.getElementById('tutoBtn').addEventListener('click', () => {
  Snd.play('select');
  document.getElementById('tutorialOverlay').classList.remove('active');
  if (tutoCallback) { tutoCallback(); tutoCallback = null; }
});

function launchMiniGame(zone, opts) {
  gameState = 'miniGame';
  mgTries = (opts && opts.retry) ? mgTries + 1 : 0;
  document.getElementById('zoneOverlay').classList.remove('active');
  document.getElementById('miniGameContainer').classList.add('active');
  document.getElementById('mgTitle').textContent = zone.quete.nom;
  document.getElementById('mgStats').innerHTML = `<span>${zone.nom} • <b>${zone.zone}</b></span>`;
  document.getElementById('mgMessage').classList.remove('active');
  const mg = MINIGAMES[zone.quete.type];
  if (!mg) {
    document.getElementById('mgCanvas').style.display = 'none';
    const dom = document.getElementById('mgDOM');
    dom.style.display = 'flex';
    dom.innerHTML = `<h3 style="color:#ffd76b">Mini-jeu "${zone.quete.type}" à venir</h3>`;
    activeMiniGame = null; return;
  }
  const mgCanvas = document.getElementById('mgCanvas');
  const mgDOM = document.getElementById('mgDOM');
  mgCanvas.style.display = 'none'; mgDOM.style.display = 'none'; mgDOM.innerHTML = '';
  if (mgAnimationId) cancelAnimationFrame(mgAnimationId);
  mgAnimationId = null;
  mgState = { zone, won: false, over: false, startTime: performance.now() };

  const tutos = {
    course: { title: "🚴 La Course de Coco", lines: ["← → pour diriger, ↑ pour pédaler à fond (sur téléphone, tu pédales tout seul), ↓ pour freiner.", "Tu cours contre 5 concurrents ! Foncer dans un coureur ou un rocher te fait TOMBER : tu repars au ralenti.", "Colle-toi derrière un coureur pour profiter de son sillage 💨 (+10 %). Les plaques ⚡ donnent un boost ; l'herbe et la boue te freinent.", "Il faut finir sur le podium : 1er ★★★ · 2ᵉ ★★ · 3ᵉ ★. Plus bas, on recommence !"], keys: ["← → Diriger", "↑ Pédaler", "↓ Freiner"] },
    moto: { title: "🏍️ La Course de Moto", lines: ["Tu roules sur une autoroute à 3 voies.", "Esquive les VOITURES et les CÔNES en changeant de voie.", "Survis 25 secondes, ça accélère !"], keys: ["← → Changer de voie"] },
    endurance: { title: "🏃‍♀️ Le Dépassement de Soi", lines: ["Tu cours automatiquement vers la droite, à vive allure.", "Appuie sur ESPACE pour sauter les obstacles — c'est un jeu de réflexes !", "Le HUD affiche ton rythme (3 à 25 km/h) qui grimpe doucement.", "Atteins 300m !"], keys: ["ESPACE ou ↑ Sauter"] },
    volley: { title: "🏐 Tournoi de Volley", lines: ["Bouge M.M. avec ← →.", "Renvoie la balle pour marquer — ça accélère au fil du temps !", "20 renvois pour gagner !"], keys: ["← → Bouger M.M."] },
    blagues: { title: "🎭 Le Rire Contagieux", lines: ["Clique sur les bulles JAUNES (bonnes blagues).", "Évite les GRISES (mauvaises), tu n'as droit qu'à 2 erreurs.", "Fais rire 30 spectateurs avant la fin du chrono, ça s'accélère !"], keys: ["Clic gauche sur les jaunes"] },
    coiffure: { title: "✂️ Le Relooking Légendaire", lines: ["Clique sur les ciseaux au départ du trait, sans relâcher.", "Suis le tracé : un couloir très étroit délimite la marge d'erreur.", "Si tu sors du couloir, c'est raté direct (comme au jeu du calamar !).", "Si tu lâches trop tôt, tu reprends la frange depuis le début.", "3 franges à couper sur 3 victimes : Lawisse, puis Noah, puis Noé. Clique sur Suivant après chaque coupe pour continuer."], keys: ["Clic maintenu + glisser"] },
    collecte: { title: "💰 Le Trésor Maudit", lines: ["Ramasse les pièces d'or.", "Évite les bandits et les pièges — le drapeau te rend temporairement imbattable !", "50 pièces d'or en 80s !"], keys: ["← ↑ → ↓ Déplacement"] },
    esquive: { title: "🍋 Fuir les Agrumes", lines: ["Bouge pour éviter les citrons.", "Une large bande jaune clignotante traverse l'écran : elle montre le couloir EXACT du prochain citron, à sa taille. Sors de la bande !", "Survis 30 secondes !"], keys: ["← ↑ → ↓ Déplacement"] },
    basket: { title: "🏀 Le Concours de Tirs", lines: ["Maintiens la balle et tire vers l'ARRIÈRE, comme une fronde.", "Relâche pour tirer : la trajectoire s'affiche en pointillés pendant que tu vises.", "Le panier change de côté à chaque réussite — un coup à gauche, un coup à droite !", "10 paniers pour gagner, et seulement 3 ballons : chaque tir raté t'en coûte un."], keys: ["Glisser + relâcher"] },
    rythme: { title: "🎻 Le Concert Improvisé", lines: ["Appuie sur A, S, D, F quand la note atteint la zone, en suivant la valse de Shostakovitch !", "30 notes réussies pour faire danser tout le parquet !"], keys: ["A S D F"] },
    duel: { title: "⚔️ Le Duel au Katana", lines: ["Le maître télégraphie une attaque, puis une flèche s'affiche.", "Appuie sur LA MÊME flèche avant la fin de l'anneau doré pour parer et contre-attaquer.", "Mauvaise touche ou trop lent = une vie en moins (tu en as 6).", "La fenêtre se resserre au fil des touches — 20 touches pour gagner, un vrai duel qui dure !"], keys: ["← ↑ → ↓ Parer dans le bon sens"] },
    avis: { title: "⚽ L'Avis de la Honte", lines: ["Choisis l'avis le plus ABSURDE avec 1, 2, 3 ou clic.", "5 avis de la honte, 5 secondes chacun !", "Tu as 3 vies : chaque erreur en coûte une. À zéro, c'est la honte totale."], keys: ["1 2 3 Choix"] },
    meme: { title: "🎭 Le Meme Parfait", lines: ["Un quiz sur les private jokes du groupe !", "Une mauvaise réponse se grise : il faut retrouver la bonne pour passer à la question suivante.", "3 erreurs au total sur tout le quiz font perdre.", "10 questions à réussir pour gagner !"], keys: ["Clic sur une réponse"] },
    enigmes: { title: "📚 L'Énigme du Sarcasme", lines: ["Emma te pose 10 énigmes, 25 secondes chacune.", "Réponds avec 1, 2, 3, 4 ou la souris.", "Tu as 3 vies : chaque erreur en coûte une. À zéro, son regard méprisant te suivra à vie."], keys: ["1 2 3 4 Répondre"] },
    mode: { title: "👗 Le Défilé Éclair", lines: ["Compose la tenue parfaite, SANS chrono : prends le temps qu'il te faut.", "Choisis UNE pièce dans chacune des 4 catégories.", "Puis valide : le jury note ton style... et l'harmonie haut-bas aussi !"], keys: ["Clic pour choisir", "Valider quand tu es prêt !"] },
    charme: { title: "🍸 La Soirée Mondaine", lines: ["Trois personnes à draguer, une par une.", "Chaque bonne réplique fait grimper la jauge, chaque ratée la fait chuter.", "Jauge pleine = dragué(e). Jauge à zéro ou plus de moments = raté, mais tu passes à la suivante.", "Il te faut au moins 1 jauge pleine sur 3 pour gagner."], keys: ["Clic ou 1 2 3 pour répondre"] }
  };
  if (tutos[zone.quete.type] && !(opts && opts.skipTuto)) {
    const t = tutos[zone.quete.type];
    const goalsLine = starGoalsText(zone.quete.type);
    showTutorial(t.title, goalsLine ? t.lines.concat(['⭐ ' + goalsLine]) : t.lines, t.keys, () => {
      actuallyLaunch(mg, zone, mgCanvas, mgDOM, mgState);
    });
  } else {
    actuallyLaunch(mg, zone, mgCanvas, mgDOM, mgState);
  }
}

function actuallyLaunch(mg, zone, mgCanvas, mgDOM, mgStateRef) {
  mgStateRef.startTime = performance.now(); // le chrono du record démarre APRÈS la fiche d'instructions
  Snd.music(zone.quete.type === 'rythme' ? null : 'mini'); // le rythme a sa propre musique
  if (mg.type === 'canvas') {
    mgCanvas.style.display = 'block';
    activeMiniGame = mg;
    mg.init(mgCanvas, zone, mgStateRef);
    loopMiniGameCanvas();
  } else {
    mgDOM.style.display = 'flex';
    activeMiniGame = mg;
    mg.init(mgDOM, zone, mgStateRef, {
      onSuccess: () => mgSuccess(zone),
      onFail: () => mgFail(zone, 'Raté ! Réessaie.')
    });
  }
}

function loopMiniGameCanvas() {
  if (!activeMiniGame || gameState !== 'miniGame') return;
  if (mgState && mgState.over) return; // la partie est déjà finie, on arrête tout net
  const mgCanvas = document.getElementById('mgCanvas');
  const mgCtx = mgCanvas.getContext('2d');
  activeMiniGame.update(mgCtx, mgCanvas, mgState);
  if (mgState && mgState.over) return; // évite de replanifier une frame juste après la fin
  mgAnimationId = requestAnimationFrame(loopMiniGameCanvas);
}
// Vraie fin de jeu : devient vrai quand le 16e membre rejoint l'équipe,
// pour déclencher la Révélation finale de l'affaire du Vendredi 13
// (voir maybeRevealFinal), puis la célébration au Grand Feu.
let bandeCompleteToast = false;
function mgSuccess(zone) {
  // Garde-fou : une partie ne peut se terminer qu'UNE fois, et seulement si elle est en cours.
  // Évite un « Raté » qui écrase un « Bravo » (clic tardif sur une bulle) et les victoires
  // fantômes si on quitte pendant un délai (ex. le jury de Lilie, 1,5 s).
  if (!mgState || mgState.over) return;
  if (mgState) { mgState.won = true; mgState.over = true; }
  if (mgAnimationId) { cancelAnimationFrame(mgAnimationId); mgAnimationId = null; }
  const firstTime = !state.persosDebloques.includes(zone.id);
  const tutoCourse = zone.id === 'coco' && !tutorialDone;
  if (firstTime) {
    state.persosDebloques.push(zone.id);
    saveGame();
    refreshWanderers();
    if (zone.id !== 'coco') pendingTemoignage = zone.id;
    showToast(tutoCourse ? '🎉 Coco a rejoint... sa propre équipe !' : `🎉 ${zone.surnom} a rejoint ton équipe !`);
  }
  // v20.25 : records. Étoiles = qualité de la partie (voir STAR_RULES), jamais le nombre d'essais.
  const secs = (performance.now() - mgState.startTime) / 1000;
  const type = zone.quete.type;
  const stars = starsFor(type, mgState);
  const rec = state.records[zone.id] || (state.records[zone.id] = { best: null, stars: 0, wins: 0 });
  const starsBefore = rec.stars || 0;
  rec.wins++;
  if (rec.best === null || secs < rec.best) rec.best = Math.round(secs * 10) / 10;
  if (stars > rec.stars) rec.stars = stars;
  const newStarRecord = starsBefore > 0 && stars > starsBefore;
  saveGame();
  const complete = firstTime && state.persosDebloques.length >= PERSONNAGES.length;
  bandeCompleteToast = bandeCompleteToast || complete;
  document.getElementById('mgMsgTitle').textContent = complete ? '🏆 LA BANDE AU COMPLET !' : (firstTime ? '🎉 Bravo !' : '✅ Réussi !');
  document.getElementById('mgMsgText').textContent = complete
    ? `Incroyable : ${zone.surnom} était le dernier. Seize versions, enfin réunies. Reste à recouper les indices pour refermer le dossier... 🔎`
    : (tutoCourse && firstTime
      ? 'Tuto réussi haut la main ! Coco fait officiellement partie de la Z\'aumunauté — c\'est toi, en fait. 😎'
      : (firstTime
        ? `${zone.surnom} rejoint ton équipe ! Il se balade maintenant dans le hub.`
        : `Tu as réussi la quête de ${zone.surnom} une nouvelle fois !`));
  document.getElementById('mgMsgBtn').textContent = 'Continuer';
  // « Viser ★★★ » : rejouer tout de suite pour améliorer ses étoiles (pas au premier recrutement, qui enchaîne sur le témoignage)
  const rbtn = document.getElementById('mgRetryBtn');
  const canBetter = !firstTime && stars < 3;
  rbtn.textContent = canBetter ? '🔁 Viser ' + '★'.repeat(stars + 1) : '🔁 Rejouer';
  rbtn.classList.toggle('show', canBetter);
  document.getElementById('mgStars').innerHTML = [1, 2, 3].map(i => i <= stars ? '★' : '<span class="off">★</span>').join('');
  const lignes = [];
  const detail = starDetailFor(type, mgState);
  if (detail) lignes.push(detail);
  if (stars < 3 && STAR_RULES[type]) lignes.push('Pour ' + '★'.repeat(stars + 1) + ' : ' + STAR_RULES[type].goals[stars - 1]);
  if (newStarRecord) lignes.push('🏆 Nouveau record d\'étoiles !');
  else if (starsBefore > stars) lignes.push('Ton record : ' + '★'.repeat(starsBefore) + '☆'.repeat(3 - starsBefore));
  document.getElementById('mgRecord').innerHTML = lignes.join('<br>');
  document.getElementById('mgMessage').classList.add('active');
  Snd.play(firstTime ? 'unlock' : 'win'); fxConfetti(firstTime);
}
function mgFail(zone, msg) {
  if (!mgState || mgState.over) return; // voir mgSuccess
  if (mgState) mgState.over = true;
  if (mgAnimationId) { cancelAnimationFrame(mgAnimationId); mgAnimationId = null; }
  // Pendant le tuto : la course de Coco se relance tant qu'elle n'est pas gagnée
  const tutoRetry = zone.id === 'coco' && !state.persosDebloques.includes('coco');
  document.getElementById('mgMsgTitle').textContent = tutoRetry ? '⏳ Le tuto n\'est pas fini !' : '❌ Raté...';
  document.getElementById('mgMsgText').textContent = tutoRetry
    ? `${msg} Un vrai membre de la Z'aumunauté ne lâche jamais : la course se relance ! 💪`
    : msg;
  document.getElementById('mgMsgBtn').textContent = tutoRetry ? 'Réessayer 🔁' : 'Continuer';
  document.getElementById('mgStars').innerHTML = '';
  document.getElementById('mgRecord').textContent = 'Tentative n°' + (mgTries + 1);
  document.getElementById('mgRetryBtn').textContent = '🔁 Rejouer';
  document.getElementById('mgRetryBtn').classList.toggle('show', !tutoRetry); // bouton Rejouer (ou touche R)
  document.getElementById('mgMessage').classList.add('active');
  Snd.play('fail'); shakeEl(document.getElementById('miniGameContainer'));
}
function mgRetryVisible() {
  return document.getElementById('mgRetryBtn').classList.contains('show') && document.getElementById('mgMessage').classList.contains('active');
}
// Bouton « Rejouer » : relance tout de suite le même défi, sans repasser par le hub ni par la fiche d'instructions.
document.getElementById('mgRetryBtn').addEventListener('click', () => {
  const zg = mgState && mgState.zone;
  if (!zg || !mgRetryVisible()) return;
  Snd.play('select');
  document.getElementById('mgMessage').classList.remove('active');
  document.getElementById('mgRetryBtn').classList.remove('show');
  if (mgAnimationId) { cancelAnimationFrame(mgAnimationId); mgAnimationId = null; }
  if (activeMiniGame && activeMiniGame.cleanup) activeMiniGame.cleanup();
  activeMiniGame = null; mgState = null;
  launchMiniGame(zg, { retry: true, skipTuto: true });
});
document.getElementById('mgMsgBtn').addEventListener('click', () => {
  const zg = (mgState && mgState.zone) || null;
  document.getElementById('mgRetryBtn').classList.remove('show');
  Snd.music('hub');
  document.getElementById('mgMessage').classList.remove('active');
  document.getElementById('miniGameContainer').classList.remove('active');
  if (activeMiniGame && activeMiniGame.cleanup) activeMiniGame.cleanup();
  activeMiniGame = null; mgState = null; gameState = 'playing'; updateHUD();
  // Tuto : tant que la course de Coco n'est pas gagnée, on la relance
  if (zg && zg.id === 'coco' && !state.persosDebloques.includes('coco')) {
    launchMiniGame(zones.find(z => z.id === 'coco'));
    return;
  }
  // Fin du tuto : ouverture de l'affaire du Vendredi 13 (Coco parle seul)
  if (zg && zg.id === 'coco' && !tutorialDone) {
    tutorialDone = true; saveGame();
    openDialogue('Coco', [
      { text: "Voilà. Officiellement digne de mener la bande. Enfin, ce qu'il en reste. 🎉", expr: 'happy' },
      { text: "Rappel de la situation : le Cookie Sacré a disparu un Vendredi 13, à 22h13. Et toute la bande a regardé... DANS la bande. Personne n'a pensé à regarder dehors : les profs, les familles, les voisins.", expr: 'explain' },
      { text: "Le dossier, c'est moi qui le tiens (touche J). Dix-huit suspects extérieurs, zéro pote. Chaque version versée en élimine, et certains potes verrouillent des indices : chauve, lunettes, siffleur...", expr: 'explain' },
      { text: "Réveille la bande : gagne leurs défis, récolte les versions, remplis le dossier. Et une fois la bande au complet, l'affaire sera loin d'être finie : Noah, M.M., Lawisse et Magir savent recouper les indices.", expr: 'determined' },
      { text: "Objectif : trouver le vrai coupable, et prouver que ce n'est pas moi. En selle. 🔎", expr: 'determined' }
    ], () => showToast('Objectif : recruter les potes, remplir le dossier... et trouver le coupable ! (J)'), 'coco');
    return;
  }
  // Témoignage du pote recruté : sa version du Vendredi 13, versée au dossier
  if (pendingTemoignage && CASE_TEMOIGNAGES[pendingTemoignage]) {
    const tid = pendingTemoignage;
    pendingTemoignage = null;
    const p = PERSONNAGES.find(q => q.id === tid);
    openDialogue(p.surnom, CASE_TEMOIGNAGES[tid].lines, () => {
      if (bandeCompleteToast) {
        bandeCompleteToast = false;
        showToast('🔎 Seize versions réunies ! Mais l\'affaire reste ouverte : retourne voir Noah, M.M., Lawisse et Magir (E) !');
      } else {
        showToast('📎 Témoignage de ' + p.surnom + ' versé au dossier — ' + caseSuspectsRestants() + ' suspects restants (J)');
      }
    }, tid);
    return;
  }
});
// Écran de fin : liste des 16 potes recrutés + retour au hub en un clic
function showEndScreen() {
  document.getElementById('endCredits').textContent =
    PERSONNAGES.map(p => `${p.emoji} ${p.surnom}`).join('   •   ');
  document.getElementById('endScreen').style.display = 'flex';
  gameState = 'endScreen';
}
function closeEndScreen() {
  document.getElementById('endScreen').style.display = 'none';
  gameState = 'playing';
}
document.getElementById('endScreenBtn').addEventListener('click', closeEndScreen);
document.getElementById('mgCloseBtn').addEventListener('click', () => {
  // Quêtes gagnées : la croix ✕ doit se comporter comme « Continuer », sinon la suite
  // (témoignage du dossier, fin du tuto de Coco) était sautée.
  if (mgState && mgState.over && mgState.won) { document.getElementById('mgMsgBtn').click(); return; }
  const zg = (mgState && mgState.zone) || null;
  document.getElementById('mgRetryBtn').classList.remove('show');
  Snd.music('hub');
  if (mgAnimationId) { cancelAnimationFrame(mgAnimationId); mgAnimationId = null; }
  if (activeMiniGame && activeMiniGame.cleanup) activeMiniGame.cleanup();
  activeMiniGame = null; mgState = null;
  document.getElementById('miniGameContainer').classList.remove('active');
  document.getElementById('mgMessage').classList.remove('active');
  document.getElementById('tutorialOverlay').classList.remove('active');
  gameState = 'playing';
  // Tuto : même en fermant par la croix, la course de Coco se relance
  // tant qu'elle n'a pas été gagnée — impossible de la sauter !
  if (zg && zg.id === 'coco' && !state.persosDebloques.includes('coco')) {
    launchMiniGame(zones.find(z => z.id === 'coco'));
  }
});

/* Mini-jeux : COURSE, ESQUIVE, BASKET, ENIGMES, MODE, AVIS, MEME, BLAGUES, COLLECTE, ENDURANCE, VOLLEY, MOTO, RYTHME, CHARME, DUEL, COIFFURE */
/* (Tout le code de jeu reste identique à ta version actuelle, je le tronque ici pour la lisibilité.
   Copie-colle les MINIGAMES de ton fichier original ici, ils sont compatibles.) */
