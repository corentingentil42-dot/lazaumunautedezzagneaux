/* ============================================================
   js/minijeux/outils.js — Petits outils partagés par les mini-jeux : mélange (mgShuffle), position du pointeur, retour à la ligne, rectangles arrondis.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   v20 — LES 7 MINI-JEUX QUI MANQUAIENT
   enigmes (Emma), mode (Lilie), moto (Tristan), avis (Noah),
   rythme (Naomi), charme (Saint-Pierre), basket (Maeva)
   ===================================================================== */

// Mélange de Fisher-Yates : uniforme, contrairement à sort(() => Math.random()
// - 0.5) qui favorise certains ordres. Utilisé par le quiz de Magir et les
// jeux DOM ci-dessous.
function mgShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mgPointerPos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (evt.clientX !== undefined) ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
  const cy = (evt.clientY !== undefined) ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

// Découpe un texte en lignes pour qu'il tienne dans une largeur donnée (bulles de dialogue)
function mgWrapText(ctx, text, maxWidth, font) {
  if (font) ctx.font = font; // la police est optionnelle (le mini-jeu de coiffure la règle avant l'appel)
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Rectangle aux coins arrondis (compatible partout, sans dépendre de ctx.roundRect)
function mgRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
