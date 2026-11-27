/* ============================================================
   js/interface/dialogue.js — Boîte de dialogue : portraits, ouverture, réplique suivante, fermeture.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

let currentDialogue = null, dialogueIndex = 0;
let dialogueOnClose = null;
let dialogueOpenedAt = 0;   // sert à ignorer le toucher qui vient d'ouvrir la discussion (sinon il sauterait la 1re réplique)
// Photo (portrait) d'un personnage : utilisée dans la boîte de dialogue ET,
// désormais, dans le menu équipe à la place du sprite. Chemin :
// assets/portraits/<id>.jpg (ou .jpeg ou .png, essayés dans cet ordre — le
// premier qui existe est utilisé). Le slot est ouvert à TOUS les
// personnages ; ceux qui n'ont pas encore de fichier retombent
// silencieusement sur l'ancien affichage, sans aucune erreur.
const PORTRAIT_PATH = 'assets/portraits/';
const PORTRAIT_EXTS = ['jpg', 'jpeg', 'png'];
const PORTRAIT_IDS = new Set(PERSONNAGES.map(p => p.id));
// Essaie chaque extension sur <imgEl> jusqu'à ce qu'une existe ; appelle
// onAllFailed() si aucune n'a pu être chargée (ou si aucun portrait n'est
// prévu pour ce persoId).
function applyPortraitCascade(imgEl, persoId, onAllFailed) {
  if (!persoId || !PORTRAIT_IDS.has(persoId)) { if (onAllFailed) onAllFailed(); return; }
  let extIndex = 0;
  const tryNextExt = () => {
    if (extIndex >= PORTRAIT_EXTS.length) { if (onAllFailed) onAllFailed(); return; }
    imgEl.src = `${PORTRAIT_PATH}${persoId}.${PORTRAIT_EXTS[extIndex]}`;
    extIndex++;
  };
  imgEl.onerror = tryNextExt;
  tryNextExt();
}
// Expressions de Coco pour le tuto : cascade en 2 étapes —
// 1) assets/tuto-coco/<expression>.<ext> (le dossier de Coco, avec ses
//    expressions hello/explain/determined/happy) ;
// 2) assets/portraits/coco.<jpg|jpeg|png> (ses portraits, en repli).
const TUTO_EXPR_DIR = 'assets/tuto-coco/';
function applyExprCascade(imgEl, expr, onAllFailed) {
  const exts = ['png', 'jpg', 'jpeg', 'webp'];
  const portraitExts = ['jpg', 'jpeg', 'png'];
  let extIndex = 0, portraitIndex = 0;
  // Repli n°2 : le portrait de Coco (assets/portraits/coco.jpg)
  const tryPortrait = () => {
    if (portraitIndex >= portraitExts.length) { if (onAllFailed) onAllFailed(); return; }
    imgEl.src = `${PORTRAIT_PATH}coco.${portraitExts[portraitIndex]}`;
    portraitIndex++;
  };
  const tryNextExt = () => {
    if (extIndex >= exts.length) { tryPortrait(); return; }
    imgEl.src = `${TUTO_EXPR_DIR}${expr}.${exts[extIndex]}`;
    extIndex++;
  };
  imgEl.onerror = tryNextExt;
  tryNextExt();
}
// Une ligne de dialogue : soit une simple chaîne, soit { text, expr } —
// expr fait changer l'expression du portrait (utilisé par le tuto de Coco).
function dialogueLine(li) {
  return (typeof li === 'string') ? { text: li } : li;
}
// Précharge les 4 expressions de Coco au lancement : elles s'affichent alors instantanément
// à chaque réplique du tuto, sans clignotement ni attente réseau.
function preloadTutoImages() {
  ['hello', 'explain', 'determined', 'happy'].forEach(n => {
    const im = new Image();
    im.src = `${TUTO_EXPR_DIR}${n}.png`;
  });
}
function showExprPortrait(line, persoId) {
  const portraitImg = document.getElementById('dialoguePortrait');
  const portraitWrap = document.getElementById('dialoguePortraitWrap');
  const bigImg = document.getElementById('cutsceneImg');
  const hideBig = () => { bigImg.removeAttribute('src'); bigImg.style.display = 'none'; };
  if (line.expr) {
    // Expression → GRANDE image au centre de l'écran, comme si le perso
    // parlait en vrai. Pas de petit carré portrait pour ce dialogue.
    portraitImg.style.display = 'none';
    portraitWrap.style.display = 'none';
    // 'block' et NON '' : le CSS de #cutsceneImg contient « display: none ».
    // Vider le style inline (= '') laissait cette règle CSS gagner, donc
    // l'image restait invisible même une fois chargée.
    bigImg.style.display = 'block';
    bigImg.classList.remove('pop'); void bigImg.offsetWidth; // relance l'anim
    bigImg.classList.add('pop');
    applyExprCascade(bigImg, line.expr, hideBig);
  } else {
    // Sans expression : la phrase prend la place de l'image de Coco —
    // texte seul, rien d'autre à l'écran.
    hideBig();
    portraitImg.style.display = '';
    portraitWrap.style.display = '';
    applyPortraitCascade(portraitImg, persoId, () => {
      portraitImg.removeAttribute('src');
      portraitImg.style.display = 'none';
      portraitWrap.style.display = 'none';
    });
  }
}
// Affiche la réplique ; si elle est longue (> 140 caractères), la boîte prend la classe `longText` (texte un peu plus petit sur téléphone, voir css/tactile.css).
function setDialogueText(text) {
  const t = text == null ? '' : String(text);
  document.getElementById('dialogueText').textContent = t;
  document.getElementById('dialogueBox').classList.toggle('longText', t.length > 140);
}
function openDialogue(name, lines, onClose, persoId) {
  gameState = 'dialogue';
  currentDialogue = { name, lines, persoId };
  dialogueIndex = 0;
  dialogueOnClose = onClose || null;
  document.getElementById('dialogueBox').classList.add('active');
  // Ligne multi-locuteur ? (dialogues d'affinités : champ who/whoId)
  // → le nom affiché et le portrait suivent le locuteur de la ligne.
  const firstLine = dialogueLine(lines[0]);
  document.getElementById('dialogueName').textContent = firstLine.who || name;
  setDialogueText(firstLine.text);
  document.getElementById('interactPrompt').style.display = 'none';
  showExprPortrait(firstLine, firstLine.whoId || persoId);
  Snd.play('open');
  dialogueOpenedAt = performance.now();
}
function advanceDialogue() {
  dialogueIndex++;
  Snd.play('blip');
  if (dialogueIndex < currentDialogue.lines.length) {
    const line = dialogueLine(currentDialogue.lines[dialogueIndex]);
    if (line.who) document.getElementById('dialogueName').textContent = line.who;
    setDialogueText(line.text);
    showExprPortrait(line, line.whoId || currentDialogue.persoId);
  } else closeDialogue();
}
// « Passer » (bouton ou Échap) : on saute TOUTE la discussion d'un coup. La suite (onClose : lancer la quête, etc.) se fait comme si on l'avait lue.
function skipDialogue() {
  if (gameState !== 'dialogue' || !currentDialogue) return;
  Snd.play('blip');
  closeDialogue();
}
function closeDialogue() {
  document.getElementById('dialogueBox').classList.remove('active');
  const bigImg = document.getElementById('cutsceneImg');
  bigImg.removeAttribute('src'); bigImg.style.display = 'none';
  currentDialogue = null;
  gameState = 'playing';
  if (dialogueOnClose) { const cb = dialogueOnClose; dialogueOnClose = null; cb(); }
}
