# CLAUDE.md — La Z'aumunauté dez Z'Agneaux

Jeu HTML5 canvas en pixel art, 100 % statique (aucun build, aucun framework). Propriétaire : Corentin (« Coco »), francophone, tutoiement, ton décontracté. Le joueur est sur téléphone (GitHub Pages) et ordinateur.
Le plan complet « où modifier quoi » est dans **README.md** (tableaux générés à partir des en-têtes de fichiers) : le consulter avant de chercher, et le garder à jour si on ajoute/déplace un fichier.

## Règles à toujours respecter
- **« Elaïs » s'écrit sans É** (jamais « Élaïs ») dans tout texte, code ou doc.
- **Scripts classiques, pas de modules ES.** Chaque `js/**/*.js` est un `<script src>` ; ils partagent la portée globale (les `const`/`let` du haut de fichier sont visibles depuis les autres fichiers). Marche aussi en `file://`.
- **L'ordre des `<script>` dans `index.html` compte.** Les fonctions sont « remontées » mais les `const`/`let`/`class` ne le sont pas : un appel exécuté au chargement ne doit référencer que des fichiers déjà chargés. `js/moteur/demarrage.js` se charge **en dernier** ; `js/minijeux/etoiles.js` et `outils.js` **avant** les fichiers de jeux ; `css/tactile.css` en dernier (il surcharge).
- **Nouveau fichier JS/CSS** = l'ajouter dans `index.html` (avec `?v=`), à la bonne place, avec un en-tête `/* ==== chemin — description ==== */` sur la 2e ligne (le README en est tiré), et mettre à jour le tableau du README.
- **Version** : à chaque livraison, `python3 outils/changer-version.py 20.NN` (met à jour les `?v=` anti-cache, le texte de l'écran-titre et `GAME_VERSION`). Ne pas les éditer à la main.
- **Pas de style inline dans `index.html`**, tout est dans `css/`. Exception volontaire : `#dialoguePortraitWrap` et `#dialoguePortrait` gardent `style="display:none;"` car le JS les révèle en vidant `style.display`. Les éléments cachés par défaut dans le CSS (`#titleScreen`, `#endScreen`, `#assetsWarning`, `#mgCanvas`, `#mgDOM`, `#btnTitleNew`, `#cutsceneImg`…) sont affichés par le JS avec une valeur **explicite** (`'flex'`, `'block'`, `'inline-block'`) — jamais `style.display = ''`.
- Les sons sont synthétisés dans `js/moteur/son.js` (WebAudio, `Snd.play('nom')`) : aucun fichier audio (les 404 `assets/sons/*` en console sont normaux).
- Ne pas toucher à `tableau-des-100-suspects.xlsx` sans l'accord de Coco (fichier public dans le dépôt, il le modifie lui-même).

## Architecture en bref
- Machine d'état `gameState` : `'loading' | 'title' | 'playing' | 'dialogue' | 'miniGame' | 'teamMenu' | 'bigMap' | 'caseJournal' | 'zoneOverlay' | 'endScreen'`.
- Mini-jeux : objets `MINIGAMES[type]` (un fichier par jeu dans `js/minijeux/`), terminés par `mgSuccess()` / `mgFail()` (dans `noyau.js`). Les étoiles (★ de performance + ⭐ bonus) sont décidées par `STAR_RULES` dans `etoiles.js`.
- Sauvegarde : `localStorage['zaumunaute_save_v2']`, charge utile `v: 3` (`js/moteur/sauvegarde.js`). Ne jamais casser la lecture d'anciennes sauvegardes (migrations).
- Persos : `js/donnees/personnages.js` ; zones/maisons/quêtes : `js/donnees/zones.js` ; enquête (témoignages, indices, suspects `CASE_*`) : `js/enquete/donnees.js`.
- Écran-titre vivant (`titleLoop`, hub dessiné derrière) et note grise sur les limites de la sauvegarde (`#saveNote`, bas de l'écran-titre) : `index.html` + `css/titre.css`. Si la sauvegarde change (export de code, cloud…), mettre la note à jour.

## Tester (Playwright + Chromium sont préinstallés dans l'environnement cloud)
```
python3 -m http.server 8125          # dans la racine du dépôt
node --check js/**/*.js              # syntaxe (ou boucle sur chaque fichier)
```
- Vérifier au minimum : démarrage sans `pageerror`, aucun 404 inattendu (hors sons/`.png`/`.jpeg` de repli), l'écran-titre (avec et sans sauvegarde), un mini-jeu, la reprise de sauvegarde.
- Sur mobile émulé, **utiliser un viewport paysage (ex. 844×390)** : en portrait `#rotateHint` intercepte les clics.
- Pour un mini-jeu : `launchMiniGame(zones.find(z => z.id === 'camille'))` depuis `page.evaluate`, puis forcer la fin avec `mgSuccess()`/`mgFail()` ou jouer avec un bot.

## Idées en attente (ne pas les faire sans demande)
Bouton « copier / coller mon code de sauvegarde » ; brancher les 43 suspects (xlsx) dans le journal « Qui est-ce ? » (les zones ne sont que des chapitres, pas de sprite par suspect) ; refaire les mini-jeux de Coco, Perline, Noah (avis), dialogues de Saint-Pierre ; scènes d'excuses ; Grand Feu / scène d'accusation ; compression des images (WebP).
