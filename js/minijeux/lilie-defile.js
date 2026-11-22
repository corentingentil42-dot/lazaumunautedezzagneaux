/* ============================================================
   js/minijeux/lilie-defile.js — Mini-jeu de Lilie : défilé éclair (type 'mode').
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MINI-JEU DE LILIE : LE DÉFILÉ ÉCLAIR (styling sans chrono) ============ */
// Photos des tenues : dépose-les dans assets/mini-jeu-Lily/ sous les noms
// "haut-1", "haut-2", ..., "bas-1", ..., "chaussures-1", ..., "accessoire-1", ...
// avec l'extension de ton choix (png, jpg, jpeg ou webp, essayés dans cet
// ordre). Sans fichier, la carte reste simplement en mode texte : aucune erreur.
const MODE_IMG_PATH = 'assets/mini-jeu-Lily/';
const MODE_IMG_EXTS = ['png', 'jpg', 'jpeg', 'webp'];
function mgLoadModeImage(imgEl, key) {
  let i = 0;
  const tryNext = () => {
    if (i >= MODE_IMG_EXTS.length) return; // pas d'image : carte texte, comme avant
    const src = `${MODE_IMG_PATH}${key}.${MODE_IMG_EXTS[i]}`;
    i++;
    imgEl.onerror = tryNext;
    imgEl.onload = () => {
      imgEl.style.display = 'block';
      // l'emoji ne sert plus à rien quand la vraie photo est là
      const em = imgEl.parentElement && imgEl.parentElement.querySelector('.emoji');
      if (em) em.style.display = 'none';
    };
    imgEl.src = src;
  };
  tryNext();
}

const MODE_CATALOGUE = [
  { cat: 'Le haut', items: [
    { nom: 'Kimono doré', pts: 9, file: 'haut-1' },
    { nom: 'T-shirt 6-7', pts: 3, file: 'haut-2' },
    { nom: 'Top à pois', pts: 9, file: 'haut-3' }
  ]},
  { cat: 'Le bas', items: [
    { nom: 'Pantalon de survêtement', pts: 8, file: 'bas-1' },
    { nom: 'Jupe à volants', pts: 6, file: 'bas-2' },
    { nom: 'Jogging troué (authentique)', pts: 2, file: 'bas-3' }
  ]},
  { cat: 'Les chaussures', items: [
    { nom: 'Claquettes de Lilie (légendaires)', pts: 2, file: 'chaussures-1' },
    { nom: 'Baskets blanches impeccables', pts: 9, file: 'chaussures-2' },
    { nom: 'Tongs de piscine', pts: 5, file: 'chaussures-3' }
  ]},
  { cat: "L'accessoire", items: [
    { nom: "Frange d'Elaïs (réplique certifiée)", pts: 5, file: 'accessoire-1' },
    { nom: 'Lunettes de Coco', pts: 5, file: 'accessoire-2' },
    { nom: 'Bob de Noah', pts: 5, file: 'accessoire-3' }
  ]}
];
const MODE_SEUIL = 22; // sur 35 : le jury veut du style, pas du hasard
// Pas de chrono ici : on prend le temps qu'il faut pour composer le look.
// Paires haut + bas qui vont tellement bien ensemble que le jury accorde un
// bonus d'harmonie. C'est voulu : avec le kimono, prends le pantalon ; avec
// le top à pois, la jupe à volants est la reine du podium.
const MODE_SYNERGIES = [
  { haut: 'Kimono doré', bas: 'Pantalon de survêtement', bonus: 4 },
  { haut: 'Top à pois', bas: 'Jupe à volants', bonus: 4 }
];
const MODE_CHRONO = 0; // plus aucun chrono : 0 = désactivé (le temps qu'il faut)

MINIGAMES['mode'] = {
  type: 'dom',
  init(container, zone, s, callbacks) {
    s.zone = zone;
    s.onSuccess = callbacks.onSuccess;
    s.onFail = callbacks.onFail;
    s.selection = [-1, -1, -1, -1];
    s.done = false;
    s.container = container;
    renderMode(s);
  },
  update() {},
  cleanup() {}
};

function renderMode(s) {
  s.container.innerHTML = `
    <div style="width:100%;max-width:860px;">
      <div class="mgTitle">👗 Assemble la tenue du siècle</div>
      <div class="mgSub">Une pièce par catégorie, puis valide quand le look te plaît ! Certaines paires haut + bas valent un bonus d'harmonie... 🔎</div>
      ${MODE_CATALOGUE.map((cat, ci) => `
        <div style="font-size:14px;color:#ffd76b;margin:10px 0 6px;">${cat.cat}</div>
        <div class="mgGrid cols3">
          ${cat.items.map((it, ii) => `
            <button class="mgCard" data-cat="${ci}" data-item="${ii}">
              <img class="itemImg" data-item-img="${it.file}" alt="" />
              <span class="emoji">✨</span>
              <span>${it.nom}</span>
            </button>`).join('')}
        </div>`).join('')}
      <div style="text-align:center;margin-top:18px;">
        <button class="mgBtn" id="modeValidate" disabled style="opacity:0.5;">✨ Valider le look</button>
      </div>
    </div>
  `;
  // Chargement en cascade des photos (repli silencieux sur les cartes texte)
  s.container.querySelectorAll('.itemImg').forEach(img => mgLoadModeImage(img, img.dataset.itemImg));
  s.container.querySelectorAll('.mgCard').forEach(card => {
    card.addEventListener('click', () => {
      if (s.done) return;
      const ci = parseInt(card.dataset.cat, 10);
      const ii = parseInt(card.dataset.item, 10);
      s.selection[ci] = ii;
      s.container.querySelectorAll(`.mgCard[data-cat="${ci}"]`).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (s.selection.every(v => v >= 0)) {
        const btn = s.container.querySelector('#modeValidate');
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    });
  });
  s.container.querySelector('#modeValidate').addEventListener('click', () => {
    if (s.done || s.selection.some(v => v < 0)) return;
    s.done = true;
    const pieces = MODE_CATALOGUE.map((cat, ci) => cat.items[s.selection[ci]]);
    const look = pieces.map(p => p.nom).join(' + ');
    // Bonus d'harmonie : la paire haut + bas peut faire mouche
    const paire = MODE_SYNERGIES.find(p => pieces[0].nom === p.haut && pieces[1].nom === p.bas);
    const syn = paire ? paire.bonus : 0;
    const score = pieces.reduce((sum, p) => sum + p.pts, 0) + syn;
    s.score = score; // v20.25 : sert aux étoiles
    if (score >= MODE_SEUIL) {
      s.container.innerHTML = `
        <div style="text-align:center;max-width:620px;">
          <div class="mgTitle">✨ Le jury est bluffé !</div>
          <div class="mgSub">Style : ${score} / 35${syn ? ` (harmonie haut-bas : +${syn} !)` : ''}</div>
          <p style="color:#f2f2f2;font-size:15px;line-height:1.5;">Ton look : ${look}</p>
          <p style="color:#cfe8d9;font-size:15px;line-height:1.5;">Lilie : « Là, carrément, t'as compris la mode. Même Coco pourrait presque sortir avec toi. Presque. »</p>
        </div>`;
      setTimeout(() => s.onSuccess(), 1500);
    } else {
      mgFail(s.zone, `Le jury a noté ${score}/35 : c'est non. Un peu plus de goût (et d'harmonie), ça ira !`);
    }
  });
}
