# POLYGON 2027 — Spécifications Fonctionnelles & Techniques

> **Plateforme d'analyse et de visualisation multidimensionnelle des programmes pour l'élection présidentielle française de 2027.**  
> Hébergement : GitHub Pages | Architecture : 100% Statique (HTML5 / CSS3 / Vanilla JS & Canvas 60fps) | Données : Découplées en `data.json`.

---

## 1. Vision & Philosophie du Projet

Le projet **POLYGON 2027** rompt délibérément avec le clivage traditionnel unidimensionnel **Gauche / Centre / Droite**, jugé obsolète et réducteur. 

### Principes directeurs :
1. **Neutralité axiologique absolue :** Aucun parti ni candidat n'est catégorisé par une étiquette politique préconçue.
2. **Modélisation bipolaire équilibrée :** Chaque thématique sociétale, économique ou régalienne est structurée sous la forme d'une tension continue entre deux visions politiques légitimes et cohérentes (Pôle A $\longleftrightarrow$ Pôle B).
3. **Vérité des données & Transparence :** 
   - Si un candidat n'a pas pris position sur un thème, l'information n'est pas inventée : l'axe est omis en vue solo ou étiqueté "Non renseigné" au centre en vue comparative.
   - Une étiquette d'**Indice de confiance** distingue les positions issues d'un programme officiel de celles issues de votes ou déclarations publiques.
4. **Design Minimaliste Suisse & Accent Fluo :** Interface épurée, rigoureuse, mathématique, animée avec une esthétique futuriste et réactive.

---

## 2. Système Visuel & Direction Artistique (DA)

Le site adopte le **Style C : Minimalisme Suisse Moderne Épuré sur Fond Blanc**.

```
+-----------------------------------------------------------------------------------------+
|  [ POLYGON 2027 ]        [ Synthèse (8) | Détaillé (18) ]      [ Solo | Superposition ] |
|-----------------------------------------------------------------------------------------|
| [ CANDIDATS (220px) ]  |                                                                |
| * Édouard Philippe     |                    ARÈNE RADAR PLEIN ÉCRAN                     |
| * Marine Le Pen        |                                                                |
| * Gabriel Attal        |          (Polygone prenant >85% de l'espace écran)             |
| * Jean-Luc Mélenchon   |                                                                |
| * Bruno Retailleau     |      [ Molette de souris sur le graphe = Défilement candidat ] |
| * ... (12 candidats)   |                                                                |
+-----------------------------------------------------------------------------------------+
```

### 2.1 Palette Chromatique & Typographie
- **Fond primaire :** Blanc pur suisse (`#FFFFFF`) et blanc cassé technique (`#F8F9FA`).
- **Lignes de repère :** Gris clair (`#E2E8F0`), anneau médian d'équilibre (`#94A3B8`).
- **Typographie principale :** Ardoise noire (`#0F172A`) et gris foncé (`#475569`) — Polices : *Space Grotesk*, *Inter*, *JetBrains Mono*.
- **Accents Vectoriels Vifs & Nets :**
  - Vecteur 1 (Bleu Royal Suisse) : `#2563EB`
  - Vecteur 2 (Vert Émeraude) : `#059669`
  - Vecteur 3 (Violet Profond) : `#7C3AED`
  - Vecteur 4 (Ambre Énergique) : `#D97706`

### 2.2 Dynamisme & Micro-interactions
- **Navigation par molette (Wheel Scroll) :** Le survol du radar à la souris et le scroll de la molette fait défiler dynamiquement et immédiatement les candidats avec transition spline fluide à 60 fps.
- **Liste latérale gauche ultra-compacte :** 220px de large, avatars ronds de 26px, noms clairs, zéro texte superflu pour maximiser la surface du polygone.
- **Fond vectoriel réactif :** Grille discrète de micro-points gris perle réagissant subtilement au curseur.

---

## 3. Mathématique & Mécanique du Radar Bipolaire Diamétral (Neutre au Centre)

### 3.1 Structure Diamétrale Continue : Pôle A ⟷ Neutre (0) ⟷ Pôle B
Chaque thématique est modélisée par une **droite diamétrale continue qui passe par le centre** :
- **Extrémité A (-100) :** Adhésion maximale au **Pôle A** (ex: *Libre circulation & Accueil solidaire*).
- **Centre (0) :** Position de neutralité, consensus ou équilibre parfait (**Neutre 0**).
- **Extrémité B (+100) :** Adhésion maximale au **Pôle B** (ex: *Fermeture stricte & Contrôle*).

### 3.2 Modélisation par Cycle Thématique Naturel ($k \to k+1$)

La plateforme structure le tracé polygonal selon **l'ordre logique et séquentiel des piliers thématiques** :
**Économie $\to$ Finances $\to$ Écologie $\to$ Souveraineté $\to$ Frontières $\to$ Sécurité $\to$ Société $\to$ Institutions $\to$ Économie.**

Chaque thème $k$ est ainsi relié strictement à ses deux voisins thématiques immédiats ($k-1$ et $k+1$), indépendamment de la polarité (Pôle A ou Pôle B) :

1. **Vérité thématique absolue (Zéro faux pont) :**
   - Dans les approches précédentes basées sur un tri angulaire, un thème était arbitrairement relié à un autre simplement parce qu'ils se trouvaient du même côté du cercle (ex: relier *Démocratie directe* à *Financement des urgences* au-dessus de *Compétitivité des entreprises*).
   - Avec le cycle séquentiel naturel, chaque sujet n'est relié qu'à ses thèmes voisins directs. Aucune fausse passerelle n'est tracée au-dessus de sujets ignorés.

2. **Signature géométrique transversale (L'« Étoile / Constellation ») :**
   - Lorsqu'un candidat se positionne sur le même pôle (A ou B) pour des thèmes consécutifs, la ligne longe le bord extérieur du cadran.
   - Dès qu'un candidat oscille entre Pôle A et Pôle B (profil hybride ou transversal), le segment **traverse naturellement le centre neutre pour rejoindre la rive opposée**.
   - Cette traversée du centre est **le reflet visuel exact de la transversalité politique du candidat**, formant une signature stellaire / cristalline distinctive, vibrante et authentique.

3. **Aires Pures & Rendu Prisme Facetté (Zéro barre de contour) :**
   - **Suppression des barres de liaison :** Aucun contour filaire sec ne relie les points. Seules les surfaces remplies translucides (`aires`) matérialisent l'espace idéologique.
   - **Facettage triangulaire $(0, P_k, P_{k+1})$ :** Les transparences créent un effet de cristal facetté net et aéré là où les zones se superposent.
   - **Épuration des sommets :** Les badges de pourcentage permanents sont supprimés pour ne laisser que de fines perles blanches épurées.
   - **Détail interactif au survol :** Lorsqu'on survole un sommet, le point s'illumine et une capsule flottante révèle instantanément le pourcentage exact (ex: `+68%`, `-90%`).

### 3.3 Typographie Épurée, Vocabulaire Accessible & Anti-Collision Radiale
- **Vocabulaire direct & accessible à tous (1 à 2 mots par pôle) :** Suppression intégrale du jargon académique ou technocratique (*"fédéralisme européen"*, *"évolutions sociétales"*, *"arbitrage de la valeur"*). Remplacement par des termes concrets et immédiatement intelligibles par tout citoyen (ex: *Hausse du Smic*, *Moins d'impôts*, *Relance Nucléaire*, *100% Renouvelable*, *Réguler l'IA*, *Fermeture des frontières*).
- **Système Anti-Collision par Étagement Radial (Mode Détaillé 18 axes) :**
  - À 18 axes, les rayons ne sont espacés que de $10^\circ$ aux pôles 12h et 6h.
  - L'affichage alterne automatiquement un rayon sur deux entre deux paliers concentriques :
    - **Palier intérieur (indices pairs) :** Libellé positionné à $R + 14\text{ px}$.
    - **Palier extérieur (indices impairs) :** Libellé déporté à $R + 44\text{ px}$ relié par une fine tige guide hairline (`#cbd5e1`) et un micro-repère discret.
  - Cette alternance sépare les textes voisins de 30 px radialement et dédouble l'intervalle angulaire par niveau ($20^\circ \approx 87\text{ px}$ de dégagement), éliminant tout chevauchement.
- **Suppression du bruit visuel en mode détaillé :** L'en-tête de catégorie en majuscules est masqué au repos en mode 18 axes pour préserver la respiration du graphique, et se révèle avec son descriptif complet au survol de la souris.
- **Symétrie bilatérale stricte :** Les libellés sont disposés avec un alignement vectoriel précis (`left`, `right`, `center`) selon leur quadrant angulaire.

### 3.4 Modes d'Affichage : Synthèse (8) vs Détaillé (18)
- **Mode Synthèse (8 thèmes) :** Les 8 piliers sociétaux, économiques et régaliens majeurs.
- **Mode Détaillé (18 thèmes) :** Élargissement à l'ensemble des 18 dimensions (énergie, IA, retraites, fiscalité, bioéthique, etc.).
- **Accès ergonomique :** Sélecteur contrasté dans l'en-tête supérieur + bouton-pilule flottant permanent dans l'arène graphique (`#floating-toggle-view`).

---

## 4. Référentiel des Thèmes & Catalogue Simplifié des Axes

### 4.1 Mode "Synthèse" (Les 8 Piliers Majeurs)
Affiché par défaut pour une lecture immédiate et synthétique :

| Réf | Thématique | Pôle A (-100) | Pôle B (+100) | Description citoyenne |
| :--- | :--- | :--- | :--- | :--- |
| **S1** | **Économie** | Pouvoir d'achat | Aide Entreprises | Priorité à la hausse directe du pouvoir d'achat vs allègement des charges pour investir. |
| **S2** | **Budget & Dette** | Moins de dette | Dépenses d'urgence | Réduction de la dette vs recours au déficit pour financer les urgences sociales/écologiques. |
| **S3** | **Écologie** | Sobriété & Climat | Croissance & Tech | Réduction de la consommation et règles strictes vs innovation technique et croissance verte. |
| **S4** | **Europe** | Plus d'Europe | France souveraine | Intégration européenne renforcée vs primauté de la souveraineté et des lois de la France. |
| **S5** | **Immigration** | Accueil & Asile | Contrôle frontières | Droit d'asile et intégration vs contrôle strict des frontières et expulsions. |
| **S6** | **Sécurité & Justice** | Prévention | Sévérité & Prisons | Prévention et désescalade vs sévérité pénale accrue et nouvelles places de prison. |
| **S7** | **Société & Mœurs** | Liberté des mœurs | Tradition & Famille | Nouveaux droits sociétaux (fin de vie, bioéthique) vs défense des repères traditionnels. |
| **S8** | **Institutions** | Référendums (RIC) | Président & Ordre | Démocratie directe et pouvoir au Parlement vs Ve République et autorité présidentielle forte. |

---

### 4.2 Mode "Détaillé / Expert" (Les 10 Déclinaisons Additionnelles)
En mode Détaillé, les 8 piliers majeurs sont complétés par 10 enjeux sociétaux et économiques précis (pôles en 1 à 2 mots) :

| Réf | Thématique | Pôle A (-100) | Pôle B (+100) | Description citoyenne |
| :--- | :--- | :--- | :--- | :--- |
| **E1** | **Énergie** | 100% Renouvelable | Relance Nucléaire | Sortie du nucléaire pour le solaire/éolien vs construction massive de nouveaux réacteurs. |
| **E2** | **Impôts & Richesse** | Taxer les riches | Baisse d'impôts | Rétablissement de l'ISF et redistribution vs baisse d'impôts sur les capitaux et successions. |
| **E3** | **Retraites** | Retraite à 60 ans | Travailler plus | Retour de la retraite à 60 ans vs recul de l'âge légal et incitation à travailler plus. |
| **E4** | **Mondialisation** | Fabriqué en France | Libre-échange | Protectionnisme et préférence locale vs ouverture douanière et traités de libre-échange. |
| **E5** | **Armée & Défense** | Indépendance armée | Alliance OTAN | Autonomie stratégique de la France vs alignement atlantiste et intégration militaire. |
| **E6** | **Aides sociales** | Aides pour tous | Priorité nationale | Universalité des droits sociaux vs réservation des prestations et logements aux citoyens français. |
| **E7** | **Intelligence Artificielle** | Réguler l'IA | Innover sans freins | Encadrement éthique fort pour protéger l'emploi vs liberté d'innover face à la Chine et aux USA. |
| **E8** | **Éducation** | Pédagogie & Moyens | Uniforme & Autorité | Bienveillance, petits effectifs et fin du tri vs retour de l'autorité, uniforme et mérite. |
| **E9** | **Services Publics** | Public & Gratuit | Recours au Privé | Monopole public et gratuité de l'école/santé vs ouverture au privé et mise en concurrence. |
| **E10** | **Vidéosurveillance** | Vie privée | Vidéosurveillance | Interdiction de la surveillance algorithmique vs déploiement de caméras avec reconnaissance faciale. |

---

## 5. Fonctionnalités & Expérience Utilisateur (UX)

### 5.1 Mode Visualisation & Superposition Citoyenne
1. **Intégration native de "Mon Profil" dans la liste des candidats :**
   - « Mon Profil » est épinglé en tête de la barre latérale gauche (badge Citoyen bleu).
   - En mode **Solo**, il s'affiche seul sur le radar et s'intègre naturellement dans le cycle de défilement à la molette.
   - En mode **Superposition**, l'utilisateur peut cocher « Mon Profil » et jusqu'à 3 autres candidats (ex: *Mon Profil + Philippe + Le Pen + Mélenchon*) pour comparer directement ses surfaces idéologiques avec leurs programmes.
2. **Navigation par molette (Wheel Scroll) :** Le survol du radar et le défilement de la molette fait tourner instantanément tous les profils (Mon Profil + 12 candidats) avec transition spline fluide à 60 fps.
3. **Barre latérale gauche unifiée :** Affiche les avatars, les noms, et les badges de proximité calculés en temps réel.

### 5.2 Mode "Sculpteur de Profil" & Affinités Exhaustives (Podium 1 à 12)
- **Sculpteur interactif :** Déplacement direct des sommets du polygone sur le graphique Canvas ou via le tiroir escamotable de sliders de précision.
- **Affichage exhaustif de TOUS les candidats (1 à 12) :**
  - Fin de la restriction aux 3 premiers : un ruban horizontal défilant présente l'ensemble des 12 candidats avec leur rang (`#1`, `#2`... `#12`), photo, nom et pourcentage d'affinité exact.
  - Code couleur intuitif : Vert émeraude ($\ge 70\%$), Bleu royal ($50-69\%$), Gris ardoise ($< 50\%$).
  - **Superposition en 1 clic :** Cliquer sur n'importe quelle capsule d'affinité bascule instantanément en vue Superposition pour comparer directement le polygone du candidat sélectionné avec « Mon Profil ».
- **Badges d'affinité dans la liste gauche :** Chaque ligne de candidat dans la barre latérale affiche également son score de proximité actualisé en direct à 60 fps.

### 5.3 Export Haute Résolution (PNG)
- Générateur d'image PNG vectorisée haute définition (1500x1500 px) téléchargeable en un clic pour partage sur les réseaux sociaux.

---

## 6. Architecture des Données

- `data/axes.json` & `data/data.js` : Définition des 18 axes bipolaires, catégories et textes des pôles.
- `data/candidates.json` & `data/data.js` : Base des candidats déclarés et pressentis avec leurs scores vectoriels de -100 à +100.
- Les données sont directement intégrées dans `data/data.js` sous l'objet global `window.POLYGON_DATA` afin de garantir un fonctionnement sans aucun serveur web local (double-clic direct sur `index.html`).

---

## 7. Hébergement & Déploiement GitHub Pages (100% Confirmé)

L'application **POLYGON 2027** est **100% statique et conçue nativement pour GitHub Pages**.

### 7.1 Pourquoi c'est 100% compatible sans aucune configuration complexe :
1. **Zéro dépendance serveur ni Node.js :** Pure stack HTML5, CSS3 standard et Vanilla JavaScript 60 fps.
2. **Chemins relatifs universels :** Tous les imports de feuilles de style, scripts et données utilisent des chemins relatifs stricts (`css/polygon.css`, `data/data.js`, `js/...`), compatibles avec n'importe quel sous-dossier GitHub Pages (`https://<username>.github.io/<repo>/`).
3. **Fonctionnement hors-ligne et HTTPS :** Les données étant chargées via `data.js`, aucun problème de restriction CORS n'intervient, ni en local (`file:///`), ni sur GitHub Pages (`https://`).

### 7.2 Procédure de mise en ligne en 1 minute :
1. **Créer le dépôt GitHub :** Créer un dépôt public ou privé sur votre compte GitHub (ex: `polygon-2027`).
2. **Pousser les fichiers du projet :**
   ```bash
   git init
   git add .
   git commit -m "Déploiement initial POLYGON 2027"
   git branch -M main
   git remote add origin https://github.com/<votre-identifiant>/polygon-2027.git
   git push -u origin main
   ```
3. **Activer GitHub Pages :**
   - Sur votre dépôt GitHub, aller dans **Settings** (Paramètres) ➔ **Pages** (dans le menu de gauche).
   - Sous **Build and deployment** / **Source**, choisir **Deploy from a branch**.
   - Sélectionner la branche **`main`** et le dossier **`/ (root)`**.
   - Cliquer sur **Save**.
4. **Site en ligne :**
   En moins de 60 secondes, votre application est accessible publiquement à l'adresse :
   `https://<votre-identifiant>.github.io/polygon-2027/`

---
*POLYGON 2027 — Modélisation vectorielle neutre et transparente pour l'élection présidentielle 2027.*
