/* ============================================================
   js/interface/fiche-zone.js — Fiche de zone (devant une maison) : description de la quête, bouton Lancer.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

let currentZone = null;
function openZoneOverlay(zone) {
  gameState = 'zoneOverlay'; currentZone = zone;
  const done = state.persosDebloques.includes(zone.id);
  document.getElementById('zoneBadge').textContent = done ? '✓ DÉJÀ DÉBLOQUÉ' : 'ZONE';
  document.getElementById('zoneTitle').textContent = zone.zone;
  document.getElementById('zoneTheme').textContent = zone.theme;
  document.getElementById('zoneDesc').textContent =
    zone.id === 'coco'
      ? `Ton terrain d'entraînement, ô grand Coco !\n\n${zone.quete.desc}`
      : `${zone.surnom} t'attend ici.\n\n${zone.quete.desc}`;
  // v20.23 : le meilleur résultat s'affiche sur la fiche (et donc sur la pancarte du pote)
  const rec = state.records[zone.id];
  if (rec && rec.wins) {
    document.getElementById('zoneDesc').textContent +=
      `\n\n🏆 Record : ${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)} · ${rec.wins} victoire${rec.wins > 1 ? 's' : ''}`;
  }
  const objectifs = starGoalsText(zone.quete.type);
  if (objectifs) document.getElementById('zoneDesc').textContent += `\n\n⭐ ${objectifs}`;
  Snd.play('open');
  const btn = document.getElementById('zoneStartBtn');
  btn.textContent = done ? '↻ Rejouer la quête' : '▶ Lancer la quête';
  document.getElementById('zoneOverlay').classList.add('active');
  document.getElementById('interactPrompt').style.display = 'none';
}
function closeZoneOverlay() {
  document.getElementById('zoneOverlay').classList.remove('active');
  currentZone = null; gameState = 'playing';
}
document.getElementById('zoneCloseBtn').addEventListener('click', closeZoneOverlay);
document.getElementById('zoneStartBtn').addEventListener('click', () => {
  if (!currentZone) return;
  launchMiniGame(currentZone);
});
