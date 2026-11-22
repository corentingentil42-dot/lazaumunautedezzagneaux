/* ============================================================
   js/minijeux/etoiles.js — ÉTOILES : règles de chaque mini-jeu (seuils 2★ / 3★), étoiles bonus ⭐. C'est ICI qu'on règle la difficulté des étoiles.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

// ==================== v20.25 : ÉTOILES = qualité de la partie ====================
// Les étoiles ne dépendent JAMAIS du nombre d'essais : à la 50e partie on peut encore viser ★★★.
// 1★ = victoire. Chaque règle donne les objectifs affichés (2★, 3★), le calcul, et une ligne de bilan.
const STAR_BONUS_TOTAL = 2; // jeux « tout ou rien » : 2 étoiles bonus ⭐ à ramasser pendant la partie
// --- Petits outils pour les étoiles bonus (dessin, ramassage, HUD) ---
function bonusInit(s) { s.bonus = 0; s.bonusPops = []; }
function bonusCollect(s, x, y) { s.bonus = (s.bonus || 0) + 1; (s.bonusPops = s.bonusPops || []).push({ x, y, t: 0 }); Snd.play('coin'); }
function bonusStarPath(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = (i % 2 === 0) ? r : r * 0.45;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}
function bonusDraw(ctx, x, y, r, blink) {
  const k = 1 + 0.12 * Math.sin(performance.now() / 120);
  if (blink && Math.floor(performance.now() / 110) % 2 === 0) return; // clignote quand elle va disparaître
  ctx.save();
  ctx.shadowColor = '#ffe27a'; ctx.shadowBlur = 14;
  bonusStarPath(ctx, x, y, r * k);
  ctx.fillStyle = '#ffd23f'; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#a8740a'; ctx.stroke();
  bonusStarPath(ctx, x - r * 0.12, y - r * 0.14, r * 0.38 * k);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  ctx.restore();
}
function bonusDrawPops(ctx, s, dt) {
  if (!s.bonusPops) return;
  for (let i = s.bonusPops.length - 1; i >= 0; i--) {
    const p = s.bonusPops[i]; p.t += dt;
    if (p.t > 0.6) { s.bonusPops.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = 1 - p.t / 0.6;
    ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, 14 + p.t * 70, 0, Math.PI * 2); ctx.stroke();
    ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff3b0'; ctx.fillText('+⭐', p.x, p.y - 18 - p.t * 40);
    ctx.restore();
  }
}
function bonusHud(ctx, s, x, y) {
  ctx.save();
  ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  const n = s.bonus || 0;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x - 96, y, 96, 30);
  ctx.fillStyle = n >= STAR_BONUS_TOTAL ? '#ffe27a' : '#ffd76b';
  ctx.fillText('⭐ ' + n + ' / ' + STAR_BONUS_TOTAL, x - 10, y + 6);
  ctx.restore();
}
const fmtS = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',') + ' s';
const errTxt = (n) => n <= 0 ? 'aucune erreur' : (n === 1 ? '1 erreur' : n + ' erreurs');
const starsByMin = (v, two, three) => v >= three ? 3 : (v >= two ? 2 : 1);  // plus c'est grand, mieux c'est
const starsByMax = (v, three, two) => v <= three ? 3 : (v <= two ? 2 : 1);  // plus c'est petit, mieux c'est
const starsByLives3 = (s) => { const e = 3 - s.lives; return e <= 0 ? 3 : (e === 1 ? 2 : 1); }; // 3 vies : 0 / 1 / 2 erreurs
const livesRule = (nom) => ({
  goals: ['Une seule erreur au maximum', 'Aucune erreur'],
  calc: starsByLives3,
  detail: s => nom + ' : ' + errTxt(3 - s.lives)
});
const bonusRule = (ou) => ({
  goals: ['Ramasser 1 étoile bonus ⭐ ' + ou, 'Ramasser les ' + STAR_BONUS_TOTAL + ' étoiles bonus ⭐ ' + ou],
  calc: s => Math.min(3, 1 + (s.bonus || 0)),
  detail: s => 'Étoiles bonus : ' + (s.bonus || 0) + ' / ' + STAR_BONUS_TOTAL
});
const STAR_RULES = {
  course:    { goals: ['Arriver avec 8 s d\'avance', 'Arriver avec 16 s d\'avance'], calc: s => starsByMin(s.timeLimit, 8, 16), detail: s => 'Il te restait ' + fmtS(s.timeLimit) },
  collecte:  { goals: ['Finir avec 15 s d\'avance', 'Finir avec 25 s d\'avance'], calc: s => starsByMin(s.timeLeft, 15, 25), detail: s => 'Il te restait ' + fmtS(s.timeLeft) },
  blagues:   { goals: ['Finir avec 10 s d\'avance', 'Finir avec 20 s d\'avance'], calc: s => starsByMin(s.timeLeft, 10, 20), detail: s => 'Il te restait ' + fmtS(s.timeLeft) },
  coiffure:  { goals: ['Finir en 30 s ou moins', 'Finir en 20 s ou moins'], calc: s => starsByMax(s.playTime, 20, 30), detail: s => 'Temps de coupe : ' + fmtS(s.playTime) },
  enigmes:   livesRule('Emma'),
  meme:      livesRule('Quiz'),
  avis:      livesRule('Avis'),
  mode:      { goals: ['Un style de 28 / 35 ou plus', 'Un style de 32 / 35 ou plus'], calc: s => starsByMin(s.score, 28, 32), detail: s => 'Style : ' + s.score + ' / 35' },
  rythme:    { goals: ['40 notes réussies', '55 notes réussies'], calc: s => starsByMin(s.hits, 40, 55), detail: s => 'Notes réussies : ' + s.hits + ' / ' + s.notes.length },
  charme:    { goals: ['2 jauges sur 3 remplies à 100 %', 'Les 3 jauges remplies à 100 %'], calc: s => Math.max(1, Math.min(3, s.filled)), detail: s => 'Jauges pleines : ' + s.filled + ' / ' + CHARME_PERSONNES.length },
  basket:    { goals: ['1 ballon raté au maximum', 'Aucun ballon raté'], calc: s => { const e = BASKET_LIVES - s.lives; return e <= 0 ? 3 : (e === 1 ? 2 : 1); }, detail: s => 'Ballons ratés : ' + (BASKET_LIVES - s.lives) },
  duel:      { goals: ['4 erreurs au maximum', '2 erreurs au maximum'], calc: s => { const e = DUEL_LIVES - s.lives; return e <= 2 ? 3 : (e <= 4 ? 2 : 1); }, detail: s => 'Duel : ' + errTxt(DUEL_LIVES - s.lives) },
  esquive:   bonusRule('qui flotte dans l\'arène'),
  moto:      bonusRule('posée sur la route'),
  endurance: bonusRule('au-dessus des obstacles'),
  volley:    bonusRule('qui tombe du ciel')
};
function starGoalsText(type) {
  const r = STAR_RULES[type];
  return r ? '★★ : ' + r.goals[0] + '  ·  ★★★ : ' + r.goals[1] : '';
}
function starsFor(type, s) {
  const r = STAR_RULES[type];
  if (!r) return 1;
  try { const n = Math.round(r.calc(s)); return Math.max(1, Math.min(3, n)); } catch (e) { return 1; }
}
function starDetailFor(type, s) {
  const r = STAR_RULES[type];
  if (!r) return '';
  try { return r.detail(s); } catch (e) { return ''; }
}
