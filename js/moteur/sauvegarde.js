/* ============================================================
   js/moteur/sauvegarde.js — Sauvegarde automatique (localStorage) : saveGame, loadGame, resetGame.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// ---- SAUVEGARDE AUTOMATIQUE (v20.23) ----
// Réactivée à ta demande (elle était coupée avant). Tout est gardé dans le navigateur
// (localStorage) : potes recrutés, perso actif, records, recoupements, affaire classée,
// Grand Feu. Le bouton « Nouvelle partie » de l'écran-titre efface tout.
const SAVE_KEY = 'zaumunaute_save_v2';
let state = { persosDebloques: [], persoActif: 'coco', feuAllume: false, records: {} };
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 3,
      persosDebloques: state.persosDebloques,
      persoActif: state.persoActif,
      feuAllume: state.feuAllume,
      records: state.records,
      recrops: Array.from(recropsDone),
      caseSolved: caseSolved,
      tutorialDone: tutorialDone
    }));
  } catch (e) { /* navigation privée / stockage bloqué : le jeu marche quand même, sans sauvegarde */ }
}
function readSave() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return (d && (d.v === 2 || d.v === 3) && Array.isArray(d.persosDebloques)) ? d : null;
  } catch (e) { return null; }
}
function hasSave() { const d = readSave(); return !!(d && d.persosDebloques.length); }
function loadGame() {
  const d = readSave();
  if (!d) return false;
  const ids = new Set(PERSONNAGES.map(p => p.id));
  state.persosDebloques = d.persosDebloques.filter(id => ids.has(id));
  state.persoActif = (ids.has(d.persoActif) && state.persosDebloques.includes(d.persoActif)) ? d.persoActif : 'coco';
  state.feuAllume = !!d.feuAllume;
  state.records = (d.records && typeof d.records === 'object') ? d.records : {};
  // v20.25 : avant, les étoiles dépendaient du nombre d'essais. Désormais elles mesurent la performance :
  // les anciens records repartent à 1★ (victoire) et se rattrapent en rejouant.
  if (d.v < 3) Object.keys(state.records).forEach(k => { const r = state.records[k]; if (r) r.stars = r.wins ? 1 : 0; });
  recropsDone.clear();
  (d.recrops || []).forEach(r => { if (CASE_RECROISES[r]) recropsDone.add(r); });
  caseSolved = !!d.caseSolved;
  // Coco recruté = la course du tuto a été gagnée : on ne rejoue pas l'intro.
  tutorialDone = !!d.tutorialDone || state.persosDebloques.includes('coco');
  return true;
}
function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  state.persosDebloques = []; state.persoActif = 'coco'; state.feuAllume = false; state.records = {};
  recropsDone.clear(); caseSolved = false; tutorialDone = false;
  pendingTemoignage = null; bandeCompleteToast = false;
}
function fmtTime(sec) { const t = Math.max(0, Math.round(sec)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
