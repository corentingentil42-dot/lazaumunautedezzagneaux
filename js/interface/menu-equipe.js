/* ============================================================
   js/interface/menu-equipe.js — Menu équipe (touche R) : grille des persos débloqués.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* ============ MENU ÉQUIPE ============ */
function openTeamMenu() {
  gameState = 'teamMenu';
  // Le panneau s'affiche d'abord, quoi qu'il arrive : même si le rendu de
  // la grille plante sur un cas imprévu, le menu reste visible et
  // utilisable au lieu de rester bloqué invisible comme avant.
  document.getElementById('teamMenu').classList.add('active');
  try {
    renderTeamGrid();
  } catch (err) {
    console.error('Erreur lors de l\'affichage du menu équipe :', err);
  }
}
function closeTeamMenu() {
  document.getElementById('teamMenu').classList.remove('active');
  gameState = 'playing';
}
function renderTeamGrid() {
  const grid = document.getElementById('teamGrid');
  grid.innerHTML = '';
  for (const p of PERSONNAGES) {
    const unlocked = state.persosDebloques.includes(p.id);
    const selected = state.persoActif === p.id;
    const card = document.createElement('div');
    card.className = 'persoCard' + (unlocked ? '' : ' locked') + (selected ? ' selected' : '');
    card.innerHTML = `
      <div class="cardHeader">
        <div class="avatar">${unlocked ? '' : '🔒'}</div>
        <div class="nameBlock">
          <div class="main">${p.surnom}</div>
        </div>
      </div>
      <div class="zoneName">📍 ${p.zone}</div>
    `;
    // Avatar : extrait la 1ère frame de la ligne 0 (face) du sprite, dessinée
    // directement dans un mini-canvas (pas de toDataURL : sur certains
    // navigateurs/configs ça pouvait lever une erreur silencieuse et
    // empêcher le menu entier de s'afficher).
    if (unlocked) {
      const avatarSlot = card.querySelector('.avatar');
      // Frame du sprite (pixel-art) + emoji : le repli si aucun portrait
      // n'est disponible pour ce personnage, exactement comme avant.
      const fallbackToSprite = () => {
        try {
          const sprite = SPRITES[p.id];
          if (sprite) {
            const c = document.createElement('canvas');
            c.width = 40; c.height = 48;
            const g2 = c.getContext('2d');
            g2.imageSmoothingEnabled = false;
            g2.drawImage(sprite.img, 0, 0, sprite.cellW, sprite.cellH, 0, 0, 40, 48);
            avatarSlot.appendChild(c);
          } else {
            avatarSlot.textContent = p.emoji;
          }
        } catch (err) {
          console.warn(`Avatar impossible pour ${p.id}, repli sur l'emoji :`, err);
          avatarSlot.textContent = p.emoji;
        }
      };
      // Portrait (photo) en priorité, via la même cascade jpg/jpeg/png que
      // la boîte de dialogue ; repli automatique si aucun fichier n'existe.
      const img = document.createElement('img');
      img.className = 'portraitImg';
      img.alt = p.nom;
      avatarSlot.appendChild(img);
      applyPortraitCascade(img, p.id, () => { img.remove(); fallbackToSprite(); });
    }
    if (unlocked) {
      card.addEventListener('click', () => {
        state.persoActif = p.id;
        saveGame();
        updateHUD();
        refreshWanderers();
        renderTeamGrid();
      });
    }
    grid.appendChild(card);
  }
}
