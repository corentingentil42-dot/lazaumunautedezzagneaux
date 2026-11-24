/* ============================================================
   js/donnees/personnages.js — Liste des 16 persos (id, surnom, couleurs, traits). C'est ICI qu'on ajoute / change un perso.
   (script classique : partage les variables globales des autres fichiers js/ ; l'ordre de chargement est dans index.html)
   ============================================================ */

/* =====================================================================
   LA Z'AUMUNAUTÉ DEZ Z'AGNEAUX
   Sprites PNG externes : grille 4 lignes × 5 colonnes
   Ligne 0 = Face (bas) | Ligne 1 = Gauche | Ligne 2 = Droite | Ligne 3 = Dos (haut)
   ===================================================================== */

const PERSONNAGES = [
  { id:'coco', nom:'Coco', surnom:'Coco', zone:'Le Circuit',
    theme:'course / vélo', emoji:'🚴', couleur:'#2f5aa8',
    quete:{ nom:'La Course de Coco', desc:'Course à vélo contre 5 concurrents : évite les chutes, profite des sillages et des boosts, et termine sur le podium !', type:'course' } },
  { id:'lawisse', nom:'Lawisse', surnom:'Lawisse', zone:'La Pyramide d\'Or',
    theme:'Égypte + Israël + argent', emoji:'💰', couleur:'#3a7fb0',
    quete:{ nom:'Le Trésor Maudit', desc:'Ramasse 50 pièces d\'or en 80s en évitant bandits et pièges !', type:'collecte' } },
  { id:'mm', nom:'M.M.', surnom:'M.M.', zone:'Le Volley Dôme',
    theme:'volley magique', emoji:'🏐', couleur:'#c9622a',
    quete:{ nom:'Tournoi de Volley Magique', desc:'Renvoie 20 ballons, la vitesse augmente au fil du temps !', type:'volley' } },
  { id:'callipyge', nom:'Callipyge', surnom:'Callipyge', zone:'La Piste Infinie',
    theme:'course à pied / dépassement de soi', emoji:'🏃‍♀️', couleur:'#e75480',
    quete:{ nom:'Le Dépassement de Soi', desc:'Cours 300m en sautant les obstacles, ta vitesse augmente au fil de la course !', type:'endurance' } },
  { id:'berline', nom:'Perline', surnom:'Perline', zone:'Le Théâtre des Mots',
    theme:'humour / jeux de mots', emoji:'🎭', couleur:'#8b3f8b',
    quete:{ nom:'Le Rire Contagieux', desc:'Fais rire 30 spectateurs avec tes blagues !', type:'blagues' } },
  { id:'elais', nom:'Elaïs', surnom:'Elaïs', zone:'Le Salon de Coiffure',
    theme:'coiffure / frange légendaire', emoji:'💇', couleur:'#a06b34',
    quete:{ nom:'Le Relooking Légendaire', desc:'Coupe 3 franges au bon endroit !', type:'coiffure' } },
  { id:'camille', nom:'Camille', surnom:'Camille', zone:'La Cuisine Maudite',
    theme:'cuisine / anti-agrumes', emoji:'🍋', couleur:'#f5d020',
    quete:{ nom:'Fuir les Agrumes', desc:'Survis 30 secondes en évitant les citrons !', type:'esquive' } },
  { id:'emma', nom:'Emma', surnom:'Emma', zone:'La Grande Bibliothèque',
    theme:'intello / sarcasme', emoji:'📚', couleur:'#5a3a7a',
    quete:{ nom:'L\'Énigme du Sarcasme', desc:'Résous 10 énigmes sans perdre tes 3 vies !', type:'enigmes' } },
  { id:'lilie', nom:'Lilie', surnom:'Lilie', zone:'Le Défilé Éclair',
    theme:'mode', emoji:'👗', couleur:'#e75480',
    quete:{ nom:'Le Défilé Éclair', desc:'Assemble la tenue parfaite : pas de chrono, le jury juge ton style !', type:'mode' } },
  { id:'noe', nom:'Magir', surnom:'Magir', zone:'Le Studio Meme',
    theme:'memes / gifs', emoji:'😂', couleur:'#4caf50',
    quete:{ nom:'Le Meme Parfait', desc:'Réponds à 10 questions sur les private jokes du groupe (3 vies) !', type:'meme' } },
  { id:'tristan', nom:'Tristan', surnom:'Tristan', zone:'L\'Autoroute Folle',
    theme:'moto / vitesse', emoji:'🏍️', couleur:'#c62828',
    quete:{ nom:'La Course de Moto', desc:'Survis 25s en esquivant les obstacles !', type:'moto' } },
  { id:'noah', nom:'Noah', surnom:'Noah', zone:'Le Terrain Maudit',
    theme:'foot / pires avis', emoji:'⚽', couleur:'#2e7d32',
    quete:{ nom:'L\'Avis de la Honte', desc:'Donne 5 avis de la honte en 5 secondes chacun !', type:'avis' } },
  { id:'naomi', nom:'Naomi', surnom:'Naomi', zone:'Le Conservatoire',
    theme:'musique', emoji:'🎻', couleur:'#8b6a3a',
    quete:{ nom:'Le Concert Improvisé', desc:'Joue la mélodie en rythme (A S D F) !', type:'rythme' } },
  { id:'sinclair', nom:'Saint-Pierre', surnom:'Saint-Pierre', zone:'Le Bar Mondain',
    theme:'charme / fumée', emoji:'🍸', couleur:'#2a2a2a',
    quete:{ nom:'La Soirée Mondaine', desc:'Remplis les jauges de 3 invités !', type:'charme' } },
  { id:'maeva', nom:'Maeva', surnom:'Maeva', zone:'Le Gymnase',
    theme:'basket', emoji:'🏀', couleur:'#e8722c',
    quete:{ nom:'Le Concours de Tirs', desc:'10 paniers, 3 ballons, zéro filet !', type:'basket' } },
  { id:'horace', nom:'Horace', surnom:'Horace', zone:'Le Dojo du Katana',
    theme:'japon / katana', emoji:'⚔️', couleur:'#7a1f1f',
    quete:{ nom:'Le Duel au Katana', desc:'Bats le maître en 20 touches !', type:'duel' } }
];
