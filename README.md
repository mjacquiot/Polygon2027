# POLYGON 2027 — Plateforme d'Analyse Multidimensionnelle des Idées

> **Visualisation vectorielle et comparaison des programmes pour l'élection présidentielle française de 2027.**  
> Sortez du clivage réducteur Gauche / Droite grâce à une modélisation par radar bipolaire dynamique.

---

## 🚀 Déploiement sur GitHub Pages (En 2 minutes)

Le site est **100% statique** et spécialement conçu pour fonctionner instantanément sur **GitHub Pages** sans aucune étape de compilation (`npm` / `webpack` / `vite` non requis) :

1. Créez un nouveau dépôt sur votre compte GitHub (ex: `polygon-2027`).
2. Poussez l'ensemble des fichiers de ce dossier sur la branche `main` :
   ```bash
   git init
   git add .
   git commit -m "Initial release: Polygon 2027"
   git branch -M main
   git remote add origin https://github.com/VOTRE-PSEUDO/polygon-2027.git
   git push -u origin main
   ```
3. Dans les paramètres de votre dépôt GitHub (**Settings** > **Pages**) :
   - Sous **Source**, choisissez **Deploy from a branch**.
   - Sélectionnez la branche `main` et le dossier `/ (root)`.
   - Cliquez sur **Save**.
4. Votre site est instantanément en ligne sur `https://VOTRE-PSEUDO.github.io/polygon-2027/` !

---

## 💻 Test en 1 Clic (Sans Terminal)

- Double-cliquez directement sur **`Lancer_POLYGON_2027.bat`** ou **`index.html`** dans votre dossier Windows.
- L'application s'ouvre instantanément dans votre navigateur web par défaut sans aucune commande ni serveur requis.

---

## ✨ Fonctionnalités Clés

- **Défilement à la Molette (Wheel Scroll) :** Survolez le graphique avec le curseur et utilisez la molette de votre souris pour faire défiler instantanément les candidats avec transition spline à 60 fps.
- **Moteur Radar Bipolaire Non-Collisionnant :** Rayon radial dédié pour chaque thème (anneau médian d'équilibre à $0$, Pôle B vers l'extérieur, Pôle A vers l'intérieur). Zéro chevauchement de sommets ou de textes.
- **Barre Latérale Gauche Épurée :** Navigation verticale compacte (220px) avec avatars discrets et noms clairs, laissant plus de 85% de l'écran pour le polygone.
- **Superposition Multi-Candidats :** Superposez jusqu'à 4 candidats simultanés avec transparence colorée pour comparer instantanément leurs visions.
- **Mode Synthèse (8 axes) & Mode Détaillé (18 axes) :** Bascule instantanée entre vue macroscopique et analyse exhaustive.
- **Mode Matching ("Mon Profil") :** Déplacez directement les points sur le polygone pour sculpter votre candidat idéal avec calcul en direct du % de proximité.
- **Export Haute Définition PNG :** Générateur de visuel HD pour vos partages sur les réseaux sociaux.

---

## 📂 Structure du Projet

```
.
├── index.html                   # Page principale de l'application
├── css/
│   └── polygon.css              # Design system suisse minimaliste & néon fluo
├── js/
│   ├── background.js            # Grille vectorielle fluide animée (Canvas)
│   ├── radar.js                 # Moteur mathématique du radar bipolaire
│   └── app.js                   # Contrôleur d'états, matching et filtres
├── data/
│   ├── axes.json                # Référentiel des 18 axes et de leurs pôles
│   └── candidates.json          # 12 figures majeures et leurs scores vectoriels
├── scripts/
│   └── build_data.py            # Script d'extraction et de régénération des données
├── POLYGON_2027_SPECIFICATIONS.md # Cahier des charges et spécifications complètes
└── README.md                    # Guide d'utilisation et déploiement
```

---

## 🔄 Mise à Jour des Données

Pour actualiser les propositions ou ajouter un nouveau candidat :
1. Modifiez directement le fichier [`data/candidates.json`](data/candidates.json) ou lancez le script [`scripts/build_data.py`](scripts/build_data.py).
2. Poussez sur GitHub : la mise à jour sera immédiatement répercutée en ligne !
