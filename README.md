# 🐑 La Z'aumunauté dez Z'Agneaux

Jeu en pixel art (HTML5 canvas) sur la bande : on se balade sur la place, on recrute toute la bande en réussissant leur mini-jeu, on remplit le journal d'enquête (touche **J**) et on allume le Grand Feu.

**Jouer :** ouvrir `index.html` (ou le lien GitHub Pages du dépôt). Marche sur ordinateur (clavier) et sur téléphone en paysage (commandes tactiles). La partie se sauvegarde toute seule dans le navigateur (`localStorage`) — voir « Limites de la sauvegarde » plus bas.

---

## 🗺️ Où modifier quoi (version rapide)

| Je veux… | J'ouvre |
|---|---|
| Ajouter / changer un perso (nom, couleurs, traits) | `js/donnees/personnages.js` |
| Changer la **difficulté des étoiles** (seuils ★★ / ★★★, étoiles bonus) | `js/minijeux/etoiles.js` |
| Modifier **un mini-jeu** précis | `js/minijeux/<perso>-<jeu>.js` (1 fichier par jeu, voir tableau) |
| Changer ce qui se passe quand on lance / gagne / perd un mini-jeu, l'écran de fin, « Rejouer » | `js/minijeux/noyau.js` |
| Modifier les **dialogues** d'un perso | `js/donnees/dialogues-*.js` (affinités, communs, zones, ambiance) |
| Modifier la **liste des zones / maisons** et leur quête | `js/donnees/zones.js` |
| Les **suspects**, témoignages, indices de l'enquête | `js/enquete/donnees.js` |
| L'affichage du journal d'enquête (touche J) | `js/enquete/journal.js` |
| Les **sons** (tous générés par le code) | `js/moteur/son.js` |
| Le **zoom** du hub (ordinateur ×2,4 / téléphone ×1,6) et la **vitesse** du joueur | `js/moteur/monde.js` (`HUB_ZOOM_PC`, `HUB_ZOOM_TOUCH`, `player.speed`) |
| La **taille** du joystick et de tous les boutons sur téléphone | `css/tactile.css` (variables `--pad`, `--bigbtn`, `--smallbtn`, `--rhbtn`, `--ui-h`, `--ui-fs` en haut du fichier) |
| Les **rochers solides** / collisions du hub | `js/moteur/mise-a-jour.js` (`rockHit`) |
| La **course de Coco** : concurrents, difficulté, circuit | `js/minijeux/coco-course.js` (`COURSE`, `COURSE_RIVALS`) |
| La **sauvegarde** | `js/moteur/sauvegarde.js` |
| Le **look du décor** (sol, arbres, maisons, place, persos) | `js/rendu/*.js` |
| Les **couleurs / tailles / mise en page** d'un écran | `css/*.css` (voir tableau CSS) |
| L'écran-titre (texte, note de sauvegarde, boutons) | `index.html` + `css/titre.css` |
| Les commandes tactiles (joystick, boutons) | `js/moteur/tactile.js` + `css/tactile.css` |
| La **taille de l'écran**, le **plein écran** et l'orientation (téléphone) | `js/moteur/ecran.js` |
| La mise en page des **petits écrans** (téléphone en paysage) | `css/petit-ecran.css` (+ `css/tactile.css`) |
| « Passer » les dialogues | `js/interface/dialogue.js` (`skipDialogue`) + bouton `#dialogueSkip` dans `index.html` |
| L'**icône / l'installation** du jeu sur l'écran d'accueil du téléphone | `manifest.webmanifest`, `sw.js`, `assets/icones/` |
| Les textes fixes de l'interface (boutons, bulles…) | `index.html` |
| Publier une nouvelle version | `python3 outils/changer-version.py 20.27` |

---

## 📁 Les fichiers

```
index.html          La structure de la page (le « squelette » : écrans, boutons, canvas) + la liste des fichiers à charger
css/                Le design : 1 fichier par grande famille d'écrans
js/                 Le code du jeu, rangé par rôle :
  donnees/            les données et les textes (persos, zones, dialogues)
  moteur/             le fonctionnement (sauvegarde, entrées clavier/tactile, sons, boucle, démarrage)
  interface/          les panneaux (dialogue, menu équipe, carte, liste « À faire »…)
  enquete/            l'enquête (suspects, journal)
  rendu/              le dessin de la scène (sol, arbres, maisons, persos…)
  minijeux/           le cœur des mini-jeux + 1 fichier par mini-jeu
assets/             Les images (portraits, sprites, illustrations de mini-jeux)
outils/             Petits utilitaires (changer le numéro de version)
manifest.webmanifest + sw.js   Pour « Installer l'application » / « Sur l'écran d'accueil » (le jeu s'ouvre alors en plein écran, sans barre d'adresse)
tableau-des-100-suspects.xlsx   Le tableau des suspects (fichier de travail)
```

### CSS (`css/`)
Chargés dans cet ordre (le dernier gagne en cas d'égalité, d'où `tactile.css` en dernier).

| Fichier | Contenu |
|---|---|
| `css/base.css` | Fondations : remise à zéro, page, conteneur du jeu, canevas (taille 4:3 plein écran). |
| `css/titre.css` | Écran-titre : titre, boutons Commencer / Nouvelle partie, version, note sur la sauvegarde. |
| `css/ecrans.css` | Écrans simples : chargement, fin (Grand Feu), avertissement images, diagnostic (touche D), toast. |
| `css/dialogue.css` | Boîte de dialogue, portraits et grande image d'expression de Coco. |
| `css/hud.css` | Interface en jeu : bulle « Appuie sur E », bandeau du haut, aide touches, mini-carte, liste « À faire », bouton son. |
| `css/panneaux.css` | Panneaux plein écran : grande carte, menu équipe (cartes persos), fiche de zone, dossier d'enquête. |
| `css/minijeux.css` | Tout ce qui touche aux mini-jeux : conteneur, tuto, message de fin + étoiles, quiz, boutons, cartes, secousse. |
| `css/petit-ecran.css` | Écrans peu hauts (≤ 460 px : téléphone en paysage) : panneaux, mini-jeux (`.mg-compact` plein écran, `.mg-wide` titre/Quitter dans les marges) et menus compacts ; rien ne dépasse de l'écran. |
| `css/tactile.css` | Écran tactile (téléphone) : joystick, boutons, touches de rythme, « tourne ton téléphone ». Chargé en dernier (il surcharge le reste). |

### JavaScript (`js/`)
Les fichiers sont chargés **dans cet ordre** (celui d'`index.html`). Ce sont des scripts « classiques » : ils partagent les mêmes variables globales, donc **l'ordre compte**. Les tableaux ci-dessous suivent cet ordre.

#### Données (textes, persos, zones)
| Fichier | Rôle |
|---|---|
| `js/donnees/personnages.js` | Liste des persos (id, surnom, couleurs, traits). C'est ICI qu'on ajoute / change un perso. |
| `js/donnees/dialogues-ambiance.js` | Blagues privées et petites discussions d'ambiance entre persos (PRIVATE_JOKES, CASUAL_CHATS). |
| `js/donnees/dialogues-affinites.js` | Dialogues d'affinité : ce que chaque perso dit selon QUI joue (AFFIN_DIAL). Gros fichier de texte. |
| `js/donnees/dialogues-communs.js` | Répliques générales de chaque perso, quand il n'y a rien de spécial à dire (AFFIN_COMMON). |
| `js/donnees/dialogues-zones.js` | Répliques devant la maison / zone de chaque perso, à propos de sa quête (AFFIN_ZONE). |
| `js/donnees/zones.js` | Les zones du monde : position des maisons, quête associée à chaque perso (type de mini-jeu, texte). |

#### Moteur
| Fichier | Rôle |
|---|---|
| `js/moteur/ecran.js` | Taille réelle de l'écran (`--app-w`, `--app-h`, `--vh`), plein écran (premier toucher sur téléphone), orientation paysage, appli installable. **Chargé en premier.** |
| `js/moteur/sprites.js` | Chargement des sprites PNG des persos (grille 4×5) et calibrage. |
| `js/moteur/dialogues-outils.js` | Outils pour choisir / formater les dialogues d'affinité (persoNom, formatAffin, …). |
| `js/moteur/sauvegarde.js` | Sauvegarde automatique (localStorage) : saveGame, loadGame, resetGame. |
| `js/moteur/monde.js` | Canevas, état global du jeu, joueur, caméra. |
| `js/moteur/pnj-et-decor-hub.js` | PNJ qui se promènent sur la place + positions du décor du hub (arbres, fleurs, rochers…). |
| `js/moteur/son.js` | Sons générés par le code (WebAudio) : Snd.play('nom'), bouton muet. |
| `js/moteur/effets.js` | Effets : confettis, éclats, secousses d'écran. |
| `js/moteur/tactile.js` | Commandes tactiles : joystick, boutons, détection du téléphone. |
| `js/moteur/entrees.js` | Clavier (flèches, E, R, M, J, N…) et clics sur les boutons de l'interface. |
| `js/moteur/partie.js` | Démarrer / recommencer une partie, intro de Coco, mise à jour du HUD. |
| `js/moteur/interaction.js` | Touche E : parler à un perso, entrer dans une zone, allumer le Grand Feu (vraie fin). |
| `js/moteur/mise-a-jour.js` | update() : déplacement du joueur, collisions, PNJ, détection de ce qui est à portée, HUD. |
| `js/moteur/boucle.js` | Boucle principale du jeu (requestAnimationFrame). |
| `js/moteur/verif-version.js` | Détecte qu'une nouvelle version est en ligne (le téléphone garde parfois l'ancienne) et recharge : seul sur l'écran-titre, bandeau « Mettre à jour » en partie, bouton 🔄 sur le titre. |
| `js/moteur/demarrage.js` | Démarrage : version du jeu, diagnostic des images (touche D), init() et écran-titre (simple dégradé, voir css/titre.css). Chargé EN DERNIER. |

#### Interface
| Fichier | Rôle |
|---|---|
| `js/interface/a-faire.js` | Liste « À faire » (guidage du joueur, en haut à gauche). |
| `js/interface/dialogue.js` | Boîte de dialogue : portraits, ouverture, réplique suivante, fermeture. |
| `js/interface/fiche-zone.js` | Fiche de zone (devant une maison) : description de la quête, bouton Lancer. |
| `js/interface/cartes.js` | Grande carte (M) et mini-carte en coin. |
| `js/interface/menu-equipe.js` | Menu équipe (touche R) : grille des persos débloqués. |
| `js/interface/toast.js` | Petits messages qui apparaissent en haut (showToast). |

#### Enquête
| Fichier | Rôle |
|---|---|
| `js/enquete/donnees.js` | L'Affaire du Vendredi 13 : témoignages, recoupements, indices, suspects (CASE_*). Les 43 suspects viendront ici. |
| `js/enquete/journal.js` | Dossier d'enquête (touche J) : calcul des suspects blanchis, révélation finale, affichage du journal. |

#### Rendu (dessin)
| Fichier | Rôle |
|---|---|
| `js/rendu/camera.js` | Conversion monde → écran, test « est-ce visible ? ». |
| `js/rendu/art-pixel.js` | Boîte à outils pixel art : couleurs, bruit déterministe, mini-canevas, contours. |
| `js/rendu/sol.js` | Sol : herbe, chemins de terre, place pavée (rendu par morceaux de 256 px, mis en cache). |
| `js/rendu/arbres.js` | Arbres, buissons, rochers. |
| `js/rendu/emoji-pixel.js` | Emojis redessinés en gros pixels avec contour. |
| `js/rendu/maisons.js` | Maisons des persos (verrouillée = volets clos et cadenas ; recrutée = fenêtres allumées). |
| `js/rendu/place.js` | La place centrale : fontaine, Grand Feu, bancs, lampadaires. |
| `js/rendu/pancartes-papillons.js` | Pancartes (rejouer un mini-jeu), poussière, bulle « ! », papillons. |
| `js/rendu/scene.js` | draw() : toute la scène triée par profondeur (devant / derrière). |
| `js/rendu/personnages.js` | Dessin des persos (sprite PNG) et petits utilitaires de sprites en pixels. |

#### Mini-jeux
| Fichier | Rôle |
|---|---|
| `js/minijeux/noyau.js` | Cœur des mini-jeux : lancement, tutoriel, victoire / défaite (mgSuccess, mgFail), bouton Rejouer, écran de fin, `mgFitCanvas()` (taille du canevas : le plus grand possible, plein écran sur téléphone). |
| `js/minijeux/etoiles.js` | ÉTOILES : règles de chaque mini-jeu (seuils 2★ / 3★), étoiles bonus ⭐. C'est ICI qu'on règle la difficulté des étoiles. |
| `js/minijeux/outils.js` | Petits outils partagés par les mini-jeux : mélange (mgShuffle), position du pointeur, retour à la ligne, rectangles arrondis. |
| `js/minijeux/coco-course.js` | Mini-jeu de Coco : la course à vélo contre 5 concurrents, en pixel art (type 'course'). Podium obligatoire : 1er ★★★, 2ᵉ ★★, 3ᵉ ★. |
| `js/minijeux/camille-esquive.js` | Mini-jeu de Camille : esquive des citrons (type 'esquive', étoiles bonus). |
| `js/minijeux/emma-enigmes.js` | Mini-jeu d'Emma : énigmes du sarcasme (type 'enigmes', 3 vies). |
| `js/minijeux/lilie-defile.js` | Mini-jeu de Lilie : défilé éclair (type 'mode'). |
| `js/minijeux/tristan-moto.js` | Mini-jeu de Tristan : course de moto à 3 voies (type 'moto', étoiles bonus). |
| `js/minijeux/noah-avis.js` | Mini-jeu de Noah : l'avis de la honte (type 'avis', 3 vies). |
| `js/minijeux/naomi-rythme.js` | Mini-jeu de Naomi : concert improvisé, jeu de rythme (type 'rythme'). |
| `js/minijeux/saint-pierre-charme.js` | Mini-jeu de Saint-Pierre : la soirée mondaine, 3 jauges de séduction (type 'charme'). |
| `js/minijeux/maeva-basket.js` | Mini-jeu de Maeva : concours de tirs façon Dunk Shot (type 'basket'). |
| `js/minijeux/mm-volley.js` | Mini-jeu de M.M. : volley (type 'volley', étoiles bonus). |
| `js/minijeux/magir-quiz.js` | Mini-jeu de Magir : quiz des private jokes (type 'meme', 3 vies). |
| `js/minijeux/lawisse-collecte.js` | Mini-jeu de Lawisse : collecte de pièces d'or (type 'collecte'). |
| `js/minijeux/callipyge-endurance.js` | Mini-jeu de Callipyge : course d'endurance, sauts par-dessus les cailloux (type 'endurance', étoiles bonus). |
| `js/minijeux/perline-blagues.js` | Mini-jeu de Perline : les blagues (type 'blagues'). |
| `js/minijeux/elais-coiffure.js` | Mini-jeu d'Elaïs : la coiffure (type 'coiffure'). |

---

## 💾 Limites de la sauvegarde

La partie est enregistrée automatiquement dans le **navigateur** de l'appareil (`localStorage`, clé `zaumunaute_save_v2`). Conséquences, que le joueur est prévenu de lire sur l'écran-titre :

- elle reste **sur cet appareil et dans ce navigateur** : pas de passage d'un téléphone à l'autre, ni d'ordinateur à téléphone ;
- elle **disparaît** si on vide les données du navigateur, ou en navigation privée ;
- sur iPhone, Safari peut **l'effacer après environ une semaine sans jouer** ;
- si le stockage est bloqué, le jeu démarre quand même, simplement sans sauvegarde.

Pour une sauvegarde qui voyage entre appareils, il faudrait un **code de sauvegarde à copier/coller** (pas encore fait).

---

## 🧪 Tester en local

Il suffit d'ouvrir `index.html` dans le navigateur. Si les images ne s'affichent pas (certains navigateurs bloquent `file://`), lancer un petit serveur dans le dossier :

```
python3 -m http.server 8000      # puis ouvrir http://localhost:8000
```

Dans le jeu, **D** (ou **F2**) affiche le diagnostic des images.

## 🌐 Publier sur GitHub Pages

*Settings → Pages → Source : « Deploy from a branch » → branche `main`, dossier `/ (root)`*. Le jeu est alors en ligne à `https://<compte>.github.io/<dépôt>/`. GitHub garde les fichiers en cache ~10 min : après une mise à jour, lancer `outils/changer-version.py` (ça change les `?v=…` qui forcent le rechargement) et recharger sans cache.
