/* ============================================================
   js/interface/toast.js — Petits messages qui apparaissent en haut (showToast).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

let toastTimer = null;
function showToast(msg) {
  Snd.play('toast');
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('active');
  // On annule le minuteur précédent : sinon un toast qui en suit un autre disparaissait trop tôt.
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.classList.remove('active'); toastTimer = null; }, 2500);
}
