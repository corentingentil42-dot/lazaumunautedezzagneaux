/* ============================================================
   js/moteur/dialogues-outils.js — Outils pour choisir / formater les dialogues d'affinité (persoNom, formatAffin, …).
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

function persoNom(id) {
  const p = PERSONNAGES.find(q => q.id === id);
  return p ? p.surnom : '???';
}
// Met un dialogue brut au format multi-locuteurs attendu par openDialogue.
// 'me' = le perso joué ; null = le PNJ ; une paire [id, ...] garde son id.
function formatAffin(raw, npcId, speakerId) {
  return raw.map(pair => {
    let whoId = pair[0];
    if (whoId === 'me') whoId = speakerId;
    else if (!whoId) whoId = npcId;
    return { who: persoNom(whoId), whoId: whoId, text: pair[1] };
  });
}
// ROTATION : la 1re discussion d'une paire est TOUJOURS le dialogue
// dédié (AFFIN_DIAL). Ensuite on tourne SANS répétition dans un pool :
// dialogue dédié + répliques générales (AFFIN_COMMON) + répliques de
// zone (AFFIN_ZONE, uniquement devant sa maison). La file est
// indépendante pour « maison » et « hub », pour que les deux endroits
// aient leurs propres rotations.
const affinSeen = {}; // 'npc|joueur' → le dialogue dédié a-t-il déjà été vu ?
const affinRot = {};  // 'npc|joueur|home' ou '...|hub' → { queue, last }
function affinLines(npcId, speakerId, atHome) {
  const dedicated = AFFIN_DIAL[npcId + '|' + speakerId] || null;
  const common = AFFIN_COMMON[npcId] || [];
  const zone = atHome ? (AFFIN_ZONE[npcId] || []) : [];
  if (!dedicated && !common.length && !zone.length) return null;
  // Première rencontre de la paire → le dialogue dédié, toujours.
  const seenKey = npcId + '|' + speakerId;
  if (dedicated && !affinSeen[seenKey]) {
    affinSeen[seenKey] = true;
    return formatAffin(dedicated, npcId, speakerId);
  }
  // Pool : index 0 = dédié (s'il existe), puis les générales, puis la zone.
  const poolSize = (dedicated ? 1 : 0) + common.length + zone.length;
  if (poolSize === 0) return null;
  if (poolSize === 1) {
    const only = dedicated || common[0] || zone[0];
    return formatAffin(only, npcId, speakerId);
  }
  const rotKey = seenKey + '|' + (atHome ? 'home' : 'hub');
  if (!affinRot[rotKey]) affinRot[rotKey] = { queue: [], last: -1 };
  const st = affinRot[rotKey];
  if (st.queue.length === 0) {
    const idx = [];
    for (let i = 0; i < poolSize; i++) idx.push(i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    if (poolSize > 1 && idx[0] === st.last) [idx[0], idx[1]] = [idx[1], idx[0]];
    st.queue = idx;
  }
  const pickIdx = st.queue.shift();
  st.last = pickIdx;
  let raw;
  if (dedicated) {
    raw = pickIdx === 0 ? dedicated
      : (pickIdx <= common.length ? common[pickIdx - 1] : zone[pickIdx - 1 - common.length]);
  } else {
    raw = pickIdx < common.length ? common[pickIdx] : zone[pickIdx - common.length];
  }
  return formatAffin(raw, npcId, speakerId);
}
