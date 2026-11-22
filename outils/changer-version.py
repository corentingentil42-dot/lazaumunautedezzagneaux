#!/usr/bin/env python3
"""
Change le numéro de version du jeu en UN seul geste.

    python3 outils/changer-version.py 20.27

Ça met à jour, aux 3 endroits qui doivent toujours rester d'accord :
  1. index.html            -> tous les « ?v=20.27 » après les fichiers css/js (astuce « anti-cache » :
                              sans ça, un téléphone peut garder l'ancienne version du jeu en mémoire)
  2. index.html            -> le texte « v20.27 » affiché en petit sur l'écran-titre
  3. js/moteur/demarrage.js -> la constante GAME_VERSION
À lancer à chaque fois qu'on publie une nouvelle version.
"""
import re, sys, pathlib

if len(sys.argv) != 2 or not re.fullmatch(r'\d+\.\d+(\.\d+)?', sys.argv[1]):
    sys.exit('Usage : python3 outils/changer-version.py 20.27')
ver = sys.argv[1]
racine = pathlib.Path(__file__).resolve().parent.parent

def remplacer(chemin, motif, rempl, attendu):
    f = racine / chemin
    texte = f.read_text(encoding='utf8')
    nouveau, n = re.subn(motif, rempl, texte)
    if n != attendu:
        sys.exit(f'{chemin} : {n} remplacement(s) au lieu de {attendu} -> arrêt, rien n\'a été modifié dans ce fichier.')
    f.write_text(nouveau, encoding='utf8')
    print(f'  {chemin} : {n} remplacement(s)')

nb_fichiers = len(re.findall(r'(?:href|src)="(?:css|js)/[^"]+\?v=', (racine / 'index.html').read_text(encoding='utf8')))
print(f'Version -> v{ver}')
remplacer('index.html', r'(\.(?:css|js))\?v=[\d.]+(")', rf'\g<1>?v={ver}\g<2>', nb_fichiers)
remplacer('index.html', r'(<div id="titleVersion">)v[\d.]+', rf'\g<1>v{ver}', 1)
remplacer('js/moteur/demarrage.js', r"(const GAME_VERSION = ')v[\d.]+(')", rf"\g<1>v{ver}\g<2>", 1)
print('Terminé. Pense à recharger la page sans cache (Ctrl+Maj+R) pour voir le changement.')
