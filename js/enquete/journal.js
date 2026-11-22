/* ============================================================
   js/enquete/journal.js — Dossier d'enquête (touche J) : calcul des suspects blanchis, révélation finale, affichage du journal.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

const recropsDone = new Set();
let pendingTemoignage = null;
let caseSolved = false;
// La Révélation finale : quand les 4 recoupements sont versés, le pool des
// suspects ne contient plus qu'un nom. Le dossier se referme dessus.
const CASE_FINALE = [
  "« Dossier : LE VENDREDI 13. Seize versions recueillies. Quatre recoupements décisifs. La bande au complet autour de la table. Il est temps de refermer l'affaire. »",
  "« Dès le début, une certitude : PERSONNE de la bande. À 22h12, quand le local a été trouvé vide, vous étiez TOUS devant la porte, à douze paires d'yeux les uns sur les autres. Le coupable n'était pas dans la fête : il était déjà rentré chez lui. »",
  "« 22h05. Lawisse cache la boîte au local, avec la clé empruntée. 22h09. Un adulte qui range ses affaires dans l'école trouve la boîte. Un bien non étiqueté, déposé dans un local à provisions. Il fait ce qu'il faut : il confisque. »",
  "« 22h11. Horace le croise : lunettes, boîte sous le bras, sifflement tranquille. Direction : chez lui. 22h12 : le local est vide, le silence tombe sur la fête, et la bande accuse le seul qui avait déjà avoué un cookie dans sa vie : Coco. »",
  "« 22h13. Naomi joue le morceau du moment exact. Derrière le mur du sud, pendant le grand silence musical, le voleur goûte sa confiscation : une bouchée, croquée, nette. Noah l'a enregistrée sans le savoir. »",
  "« Et l'élimination a fait son œuvre. Un adulte. Chauve. Avec des lunettes. Muni d'une clé de l'école. Et qui siffle en rentrant chez lui. Dix-huit suspects, dix-sept noms rayés du dossier. »",
  "« Le coupable, c'est le Prof de Maths. 📐 Le cookie, il l'a confisqué. Le règlement, il l'a appliqué. Et ensuite il l'a croqué derrière un mur, comme un gamin de 327 ans. »",
  "« Et toi, Coco ? Innocenté. Le cookie que tu avais mangé, tu l'avais avoué depuis le début : c'était l'autre. Le cookie de secours. Le dossier te doit des excuses. La bande aussi. »",
  "« Le Vendredi 13 n'a jamais été maudit. C'était juste un vendredi soir où un adulte avait faim. Et le sens du devoir. »",
  "« AFFAIRE CLASSÉE. La Z'aumunauté est réunie, innocentée, et elle a six mois de retard sur sa Grande Surprise. Cette fois, planifiez mieux la garde du cookie. 🔎 »"
];
function maybeRevealFinal() {
  if (caseSolved || recropsDone.size < 4) return;
  openDialogue('Dossier — le Vendredi 13 🔎', CASE_FINALE, () => {
    caseSolved = true; saveGame();
    showToast('🗂️ AFFAIRE CLASSÉE ! Le coupable est désigné — et ce n\'est pas toi !');
  });
}
// Interception de dialogue : une fois la bande au complet, parler à un
// membre de l'équipe d'enquête (Noah, M.M., Lawisse, Magir) déclenche son
// recoupement AVANT toute autre discussion. Retourne true si le
// recoupement a été joué.
function tryRecropIntercept(persoId, surnom) {
  if (caseSolved) return false;
  if (state.persosDebloques.length < PERSONNAGES.length) return false;
  const r = CASE_RECROISES[persoId];
  if (!r || recropsDone.has(persoId)) return false;
  openDialogue(surnom, r.lines, () => {
    recropsDone.add(persoId); saveGame();
    showToast('📎 Recoupement de ' + surnom + ' versé au dossier (' + recropsDone.size + '/4 — J pour relire)');
    maybeRevealFinal();
  }, persoId);
  return true;
}
// ---- Le calcul des suspects ----
// Indices verrouillés sur le coupable : dérivés des témoignages versés
// (champ clue) et des recoupements faits.
function caseClues() {
  const clues = new Set();
  for (const p of PERSONNAGES) {
    const t = CASE_TEMOIGNAGES[p.id];
    if (t && t.clue && state.persosDebloques.includes(p.id)) {
      for (const c of t.clue) clues.add(c);
    }
  }
  for (const rid in CASE_RECROISES) {
    const r = CASE_RECROISES[rid];
    if (recropsDone.has(rid) && r.clue) {
      for (const c of r.clue) clues.add(c);
    }
  }
  return clues;
}
// Suspects blanchis par un alibi (champ blanchit).
function caseBlanchis() {
  const b = new Set();
  for (const p of PERSONNAGES) {
    const t = CASE_TEMOIGNAGES[p.id];
    if (t && t.blanchit && state.persosDebloques.includes(p.id)) {
      for (const x of t.blanchit) b.add(x);
    }
  }
  for (const rid in CASE_RECROISES) {
    const r = CASE_RECROISES[rid];
    if (recropsDone.has(rid) && r.blanchit) {
      for (const x of r.blanchit) b.add(x);
    }
  }
  return b;
}
// Le pool : les suspects ni blanchis, ni éliminés par les indices. Un
// suspect est éliminé dès qu'un indice verrouillé ne le matche pas.
function casePool() {
  const clues = caseClues();
  const b = caseBlanchis();
  return CASE_SUSPECTS.filter(s => {
    if (b.has(s.id)) return false;
    for (const c of clues) {
      if (!s.attrs.includes(c)) return false;
    }
    return true;
  });
}
function caseSuspectsRestants() { return casePool().length; }
// Qui a blanchi un suspect (pour l'affichage du dossier).
function caseBlanchiPar(sid) {
  for (const p of PERSONNAGES) {
    const t = CASE_TEMOIGNAGES[p.id];
    if (t && t.blanchit && t.blanchit.includes(sid) && state.persosDebloques.includes(p.id)) return p.surnom;
  }
  for (const rid in CASE_RECROISES) {
    const r = CASE_RECROISES[rid];
    if (recropsDone.has(rid) && r.blanchit && r.blanchit.includes(sid)) {
      const p = PERSONNAGES.find(q => q.id === rid);
      if (p) return p.surnom;
    }
  }
  return null;
}
function caseJournalHtml() {
  const recruited = PERSONNAGES.filter(p => p.id !== 'coco' && state.persosDebloques.includes(p.id));
  const clues = caseClues();
  const pool = casePool();
  const allRecruited = state.persosDebloques.length >= PERSONNAGES.length;
  const recropOrder = ['noah', 'mm', 'lawisse', 'noe'];
  const attrOrder = ['adulte', 'chauve', 'lunettes', 'acces', 'siffleur'];
  let h = '';
  h += '<span class="caseStamp">' + (caseSolved ? '✔ AFFAIRE CLASSÉE' : 'ENQUÊTE EN COURS') + '</span>';
  h += '<p class="caseIntro">' + CASE_INTRO + '</p>';
  h += '<h4>INDICES SUR LE COUPABLE (' + clues.size + '/5)</h4>';
  for (const a of attrOrder) {
    if (clues.has(a)) {
      h += '<div class="caseItem">✔ INDICE VERROUILLÉ : ' + CASE_ATTRS[a] + '.</div>';
    } else {
      h += '<div class="caseItem missing">🔒 Indice non verrouillé : ???</div>';
    }
  }
  h += '<h4>LES SUSPECTS — ' + (caseSolved ? 'le coupable est désigné' : (pool.length + ' suspect' + (pool.length > 1 ? 's' : '') + ' encore dans le coup')) + '</h4>';
  for (const s of CASE_SUSPECTS) {
    if (caseSolved && s.id === CASE_COUPABLE) {
      h += '<div class="caseItem"><b>🔴 LE COUPABLE : ' + s.nom + '</b> — il a « confisqué » le cookie au nom du règlement, puis croqué sa confiscation derrière le mur du sud.</div>';
      continue;
    }
    const blanchiPar = caseBlanchiPar(s.id);
    if (blanchiPar) {
      h += '<div class="caseItem">😇 <b>' + s.nom + '</b> (' + s.note + ') — blanchi par ' + blanchiPar + '.</div>';
      continue;
    }
    let eliminePar = null;
    for (const c of clues) {
      if (!s.attrs.includes(c)) { eliminePar = c; break; }
    }
    if (eliminePar) {
      h += '<div class="caseItem missing">❌ <b>' + s.nom + '</b> (' + s.note + ') — éliminé par les indices : ' + CASE_ATTRS[eliminePar] + '... pas lui.</div>';
    } else {
      h += '<div class="caseItem">🔍 <b>' + s.nom + '</b> (' + s.note + ') — toujours dans le coup : matche tous les indices.</div>';
    }
  }
  h += '<h4>TÉMOIGNAGES DE LA BANDE (' + recruited.length + '/15)</h4>';
  for (const p of PERSONNAGES) {
    if (p.id === 'coco') continue;
    if (state.persosDebloques.includes(p.id)) {
      const t = CASE_TEMOIGNAGES[p.id];
      h += '<div class="caseItem"><b>' + p.surnom + '</b> — ' + t.court + '<br><span class="casePiece">📎 ' + t.piece + '</span></div>';
    } else {
      h += '<div class="caseItem missing">' + p.surnom + ' — pas encore entendu.</div>';
    }
  }
  h += '<h4>RECOUPEMENTS DE L\'ÉQUIPE (' + recropsDone.size + '/4)</h4>';
  if (!allRecruited) {
    h += '<div class="caseItem missing">🔒 Recrute toute la bande d\'abord. Recouper des indices, c\'est un travail d\'équipe : Noah, M.M., Lawisse et Magir attendent que la bande soit au complet pour s\'y mettre.</div>';
  } else {
    for (const rid of recropOrder) {
      const p = PERSONNAGES.find(q => q.id === rid);
      if (recropsDone.has(rid)) {
        h += '<div class="caseItem">✔ <b>' + p.surnom + '</b> — ' + CASE_RECROISES[rid].key + '.</div>';
      } else {
        h += '<div class="caseItem missing">🔎 <b>' + p.surnom + '</b> — retourne lui parler (E) : il a un indice à verrouiller.</div>';
      }
    }
  }
  h += '<h4>NOTE DU DOSSIER</h4>';
  h += '<div class="caseItem">' + (caseSolved
    ? 'Affaire classée : dix-huit suspects, dix-sept alibis ou éliminations, un coupable. La bande est innocentée — et Coco plus que quiconque.'
    : (allRecruited
      ? 'Toutes les versions sont versées. Reste à recouper : Noah, M.M., Lawisse et Magir peuvent verrouiller les derniers indices. La bande n\'a jamais été dans cette liste : le coupable est quelqu\'un de dehors.'
      : 'La bande n\'est pas dans cette liste : à 22h12, ils étaient tous devant la porte du local. Coco avait avoué SON cookie (l\'autre) dès le premier soir. Le vrai coupable, c\'est quelqu\'un de dehors.')) + '</div>';
  return h;
}
function toggleCaseJournal() {
  const el = document.getElementById('caseJournal');
  if (el.classList.contains('active')) {
    el.classList.remove('active');
    if (gameState === 'caseJournal') gameState = 'playing';
  } else {
    document.getElementById('caseContent').innerHTML = caseJournalHtml();
    el.classList.add('active');
    gameState = 'caseJournal';
  }
}
document.getElementById('caseJournal').addEventListener('click', (e) => {
  if (e.target.id === 'caseJournal' && gameState === 'caseJournal') toggleCaseJournal();
});
