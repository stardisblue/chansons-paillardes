# Recueil des chansons paillardes

Bienvenue, le but de ce dépot est de fournir une plateforme accessible à tous pour enrichir le repertoire des chansons paillardes.

Les chansons ajoutées à ce dépot sont automatiquement repertoriées sur le site : https://stardisblue.github.io/chansons-paillardes/

## Commandes

Les musiques sont situés dans le répertoire `_chansons/`

Chaque fichier (`markdown`, `html`) doit posseder une entête :
```yml
---
title: Titre de la chanson
author: Auteur (facultatif) 
parskip: 5 (facultatif) Espacement interparagraphe (1= 0.5em, chaque pas vaut 0.25em jusqu'à 5em (19))
colonnes: 1 (facultatif) nombre de colonnes
---
contenu
```

### Commandes spécifiques au paroles

- `\colonneSuivante` : [:warning: NE MARCHE PAS] force la suite des paroles sur la colonne suivante (utilisation déconseillé, peut entrainer des erreurs lors de l'impression)
- `\sauterLigne{10}` : saute `n` ligne (de 1 a 20)
- `\vspace{2em}` : ajoute un interligne de valeur `2em` (cm, px, em ...)