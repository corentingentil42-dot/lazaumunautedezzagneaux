/* ============================================================
   js/interface/a-faire.js — Liste « À faire » (guidage du joueur, en haut à gauche).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ---------- LISTE « À FAIRE » ---------- */
function compassWord(dx, dy) {
  const a = Math.atan2(-dy, dx) * 180 / Math.PI; // 0 = est, 90 = nord (l'axe y du jeu va vers le bas)
  const names = ['à l\'est', 'au nord-est', 'au nord', 'au nord-ouest', 'à l\'ouest', 'au sud-ouest', 'au sud', 'au sud-est'];
  return names[((Math.round(a / 45) % 8) + 8) % 8];
}
function nearestLockedZone() {
  let best = null, bd = Infinity;
  for (const z of zones) {
    if (z.id === 'coco' || state.persosDebloques.includes(z.id)) continue;
    const dx = z.x + z.w / 2 - (player.x + player.w / 2), dy = z.y + z.h / 2 - (player.y + player.h / 2);
    const d = Math.hypot(dx, dy);
    if (d < bd) { bd = d; best = { z, dx, dy, d }; }
  }
  return best;
}
function todoLines() {
  const L = [];
  if (!state.persosDebloques.includes('coco')) { L.push('Gagner la course d\'entraînement de Coco'); return L; }
  const got = state.persosDebloques.filter(id => id !== 'coco').length;
  const total = PERSONNAGES.length - 1;
  if (got < total) {
    L.push(`Recruter la bande : ${got}/${total}`);
    const n = nearestLockedZone();
    if (n) L.push(`Le plus proche : ${n.z.surnom} (${n.z.zone}), ${compassWord(n.dx, n.dy)}, à ~${Math.round(n.d / 10)} m`);
  } else if (recropsDone.size < 4) {
    const noms = ['noah', 'mm', 'lawisse', 'noe'].filter(id => !recropsDone.has(id)).map(id => PERSONNAGES.find(p => p.id === id).surnom);
    L.push(`Recouper les indices (${recropsDone.size}/4) : va voir ${noms.join(', ')}`);
  } else if (!state.feuAllume) {
    L.push('Allumer le Grand Feu 🔥 au centre du hub');
  } else {
    L.push('Profiter de la fête 🎉');
  }
  if (!caseSolved) L.push(`Dossier (J) : ${caseSuspectsRestants()} suspects encore dans le coup`);
  else if (state.feuAllume) L.push('Affaire classée ✔');
  return L.slice(0, 4);
}
let todoLast = '', todoCollapsed = false;
try { todoCollapsed = localStorage.getItem('zaum_todo') === '0'; } catch (e) {}
function updateTodo(force) {
  const panel = document.getElementById('todoPanel');
  const show = (gameState === 'playing' || gameState === 'dialogue');
  if (panel.classList.contains('show') !== show) panel.classList.toggle('show', show);
  if (!show) return;
  const html = todoLines().map(t => '<li>' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</li>').join('');
  if (html !== todoLast || force) { todoLast = html; document.getElementById('todoList').innerHTML = html; }
}
function toggleTodo() {
  todoCollapsed = !todoCollapsed;
  document.getElementById('todoPanel').classList.toggle('collapsed', todoCollapsed);
  document.getElementById('todoToggle').textContent = todoCollapsed ? '▸' : '▾';
  try { localStorage.setItem('zaum_todo', todoCollapsed ? '0' : '1'); } catch (e) {}
}
document.getElementById('todoHead').addEventListener('click', toggleTodo);
if (todoCollapsed) { document.getElementById('todoPanel').classList.add('collapsed'); document.getElementById('todoToggle').textContent = '▸'; }
