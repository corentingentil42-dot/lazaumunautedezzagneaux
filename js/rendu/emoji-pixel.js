/* ============================================================
   js/rendu/emoji-pixel.js — Emojis redessinés en gros pixels avec contour.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   EMOJI PIXELISÉS : l'emoji est redessiné en gros pixels, avec le même contour sombre que les persos
   ===================================================================== */
const emojiCache = {};
function pixEmoji(e, n, scale) {
  const key = e + '|' + n + '|' + scale;
  if (emojiCache[key]) return emojiCache[key];
  const t = document.createElement('canvas'); t.width = t.height = n;
  const tg = t.getContext('2d', { willReadFrequently: true });
  tg.font = Math.round(n * 0.86) + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  tg.textAlign = 'center'; tg.textBaseline = 'middle';
  tg.fillText(e, n / 2, n / 2 + 1);
  const im = tg.getImageData(0, 0, n, n), d = im.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;   // bords nets, pas de flou
  tg.putImageData(im, 0, 0);
  const sil = document.createElement('canvas'); sil.width = sil.height = n;
  const sg = sil.getContext('2d'); sg.drawImage(t, 0, 0);
  sg.globalCompositeOperation = 'source-in'; sg.fillStyle = OUT; sg.fillRect(0, 0, n, n);
  const o = document.createElement('canvas'); o.width = o.height = n + 2;
  const og = o.getContext('2d');
  [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(([x, y]) => og.drawImage(sil, x, y));
  og.drawImage(t, 1, 1);
  const f = document.createElement('canvas'); f.width = f.height = (n + 2) * scale;
  const fg = f.getContext('2d'); fg.imageSmoothingEnabled = false; fg.drawImage(o, 0, 0, f.width, f.height);
  emojiCache[key] = f;
  return f;
}
