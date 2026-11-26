/* ============================================================
   js/moteur/verif-version.js — Détecte qu'une nouvelle version du jeu est en ligne (un téléphone garde parfois l'ancienne en mémoire, surtout en plein écran sans bouton « actualiser ») et recharge : tout seul sur l'écran-titre, via un bandeau « Mettre à jour » pendant la partie, ou avec le bouton 🔄 de l'écran-titre.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html ; appelé par demarrage.js)
   ============================================================ */

const MAJ_INTERVALLE = 5 * 60 * 1000;   // on revérifie toutes les 5 minutes (et à chaque retour sur la page)
let majVerifEnCours = false;

// Télécharge index.html SANS passer par le cache du navigateur et lit le numéro de version affiché sur l'écran-titre.
// Renvoie par exemple « v20.30 », ou null si on n'a pas pu savoir (hors ligne, jeu ouvert en file://, …).
async function versionEnLigne() {
  try {
    const r = await fetch('index.html?_maj=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return null;
    const m = /<div id="titleVersion">(v\d+(?:\.\d+)+)/.exec(await r.text());
    return m ? m[1] : null;
  } catch (e) { return null; }
}

// « v20.30 » > « v20.29 » ? (comparaison nombre par nombre, pas par ordre alphabétique)
function versionPlusRecente(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number), pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

// Recharge la page en forçant le navigateur à ignorer son cache (adresse différente à chaque fois : « ?maj=… »).
// La sauvegarde n'est pas touchée (elle est dans le localStorage, qui ne dépend pas de l'adresse).
function appliquerMiseAJour(version) {
  try { sessionStorage.setItem('zaum_maj_tentee', version || '?'); } catch (e) {}
  const go = () => { const u = new URL(location.href); u.searchParams.set('maj', Date.now()); location.replace(u.toString()); };
  if (window.caches && caches.keys) caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(go, go); else go();
}

function afficherBandeauMiseAJour(version) {
  if (document.getElementById('majBanner')) return;
  const b = document.createElement('button');
  b.id = 'majBanner'; b.type = 'button';
  b.textContent = '🔄 Nouvelle version ' + version + ' : touche ici pour mettre à jour (ta partie est sauvegardée)';
  b.addEventListener('click', () => appliquerMiseAJour(version));
  document.body.appendChild(b);
}

// Vérifie s'il y a plus récent. manuel = true : on répond toujours à la personne (message) et on met à jour même en pleine partie.
async function verifierMiseAJour(manuel) {
  if (majVerifEnCours) return;
  majVerifEnCours = true;
  try {
    const v = await versionEnLigne();
    if (!v) { if (manuel) showToast('⚠️ Impossible de vérifier : pas de connexion ?'); return; }
    if (!versionPlusRecente(v, GAME_VERSION)) { if (manuel) showToast('✅ Tu as la dernière version (' + GAME_VERSION + ')'); return; }
    let dejaTentee = false;
    try { dejaTentee = sessionStorage.getItem('zaum_maj_tentee') === v; } catch (e) {}
    if (manuel) { showToast('🔄 Mise à jour vers ' + v + '…'); setTimeout(() => appliquerMiseAJour(v), 400); return; }
    // Automatique : on recharge seul uniquement sur l'écran-titre (rien à perdre) ; sinon un bandeau, pour ne pas couper une partie.
    // (si on a déjà essayé pour cette version sans succès, on ne boucle pas : bandeau seulement)
    if ((gameState === 'title' || gameState === 'loading') && !dejaTentee) appliquerMiseAJour(v);
    else afficherBandeauMiseAJour(v);
  } finally { majVerifEnCours = false; }
}

function lancerVeilleMiseAJour() {
  // L'adresse « ?maj=… » a servi à contourner le cache : on la nettoie pour garder une adresse propre.
  try { if (new URLSearchParams(location.search).has('maj')) history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  const btn = document.getElementById('btnMaj');
  if (btn) btn.addEventListener('click', () => verifierMiseAJour(true));
  if (location.protocol === 'file:') return;   // ouvert depuis un dossier : rien à vérifier en ligne
  verifierMiseAJour(false);
  setInterval(() => verifierMiseAJour(false), MAJ_INTERVALLE);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) verifierMiseAJour(false); });
}
