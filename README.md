# ECOFARM CIRCULAR — Visualisation 3D Industrielle & Jumeau Numérique

> **Projet d'Ingénierie & d'Architecture Industrielle**  
> Unité pilote intelligente de valorisation thermochimique de la biomasse agricole par pyrolyse, stockage d'énergie thermique hybride sur lit de sable et séchage convectif automatisé.

---

## Sommaire
- [1. Présentation du Projet](#1-présentation-du-projet)
- [2. Les 6 Zones Fonctionnelles](#2-les-6-zones-fonctionnelles)
- [3. Logique des Circuits & Interverrouillage de Sécurité](#3-logique-des-circuits--interverrouillage-de-sécurité)
- [4. Modes de Visualisation 3D](#4-modes-de-visualisation-3d)
- [5. Contrôles, Touches & Raccourcis Clavier](#5-contrôles-touches--raccourcis-clavier)
- [6. Architecture Technique](#6-architecture-technique)
- [7. Installation & Lancement](#7-installation--lancement)
- [8. Paramètres de Simulation & Supervision IA](#8-paramètres-de-simulation--supervision-ia)

---

## 1. Présentation du Projet

**ECOFARM CIRCULAR** est un modèle d'ingénierie circulaire visant à transformer des résidus agricoles hétérogènes (grignons d'olive, sarments de vigne, pailles, coques de fruits) en énergie propre et en **biochar à haute valeur agronomique** (> 82% de carbone fixe, séquestration négative nette de $\text{CO}_2$).

Le cœur de l'innovation réside dans le couplage d'un **stockage thermique haute température sur sable de silice (Batterie à Sable)** avec :
1. Une source solaire thermique (capteurs à tubes sous vide).
2. La récupération thermique de la combustion contrôlée des gaz de pyrolyse (syngas).
3. La conversion dynamique des surplus d'électricité photovoltaïque par thermoplongeurs électriques.

Cette énergie thermique stockée alimente à la demande un **séchoir industriel continu**, conditionnant la biomasse avant son entrée dans le réacteur de pyrolyse.

---

## 2. Les 6 Zones Fonctionnelles

| Zone | Dénomination | Rôle & Équipements Clés |
| :--- | :--- | :--- |
| **Zone A** | **Réception & Préparation Biomasse** | Fosse de déchargement en béton avec rampe basculante hydraulique (15 t) et grille de sécurité, broyeur bi-rotor à haut couple & broyeur fin à marteaux, séparateur magnétique over-belt en néodyme, convoyeur à bande auget inclinée à 18° et trémie doseuse à pesons. |
| **Zone B** | **Séchoir Continu Automatisé** | Tunnel calorifugé en acier inox (100 mm laine minérale), 3 étages de plateaux perforés agités, échangeur à tubes ailetés liquide-air, ventilateur centrifuge de circulation ($4\,500\,\text{m}^3/\text{h}$), sonde d'humidité capacitive et capteurs PT100, cheminée de buées avec dévésiculeur. |
| **Zone C** | **Unité de Pyrolyse & Biochar** | Réacteur horizontal cylindrique en Inconel à double paroi ($450 - 550^\circ\text{C}$), colliers chauffants en céramique, vis sans fin hélicoïdale interne, cyclone séparateur de particules, oxydateur thermique / chambre de combustion sans flamme pour le syngas (*zéro rejet atmosphérique de gaz non traité*), échangeur de récupération des fumées vers la batterie à sable, vis de refroidissement et poste de collecte hermétique du biochar sous azote ($\text{N}_2$). |
| **Zone D** | **Batterie Thermique à Sable** | Cuve verticale calorifugée ($\varnothing\,3,8\,\text{m} \times H\,4,8\,\text{m}$, 45 tonnes de sable de silice réfractaire, capacité $1,25\,\text{MWh}_{\text{th}}$ jusqu'à $500^\circ\text{C}$), faisceau de thermoplongeurs en Incoloy 800 (surplus PV), serpentins d'échange thermique en inox 316L, arbre vertical de 12 thermocouples stratifiés, skid de pompes de circulation d'huile thermique et vase d'expansion. |
| **Zone E** | **Énergies Renouvelables** | Canopée structurelle en acier galvanisé accueillant 16 modules photovoltaïques monocristallins bifaciaux ($50\,\text{kWp}$), champ de collecteurs thermiques à tubes sous vide ($40\,\text{m}^2$), onduleur centralisé IP66, conteneur de batteries LFP ($60\,\text{kWh}$) et gaine de puissance vers les thermoplongeurs. |
| **Zone F** | **Contrôle & Supervision SCADA / IA** | Cabine de commande préfabriquée avec vitrage panoramique, baies électriques industrielles IP55 avec automates programmables redondants (PLC Siemens S7-1500 / Modicon M580), pupitre opérateur triple écran HMI, colonne lumineuse de signalisation 3 couleurs et serveur IA d'optimisation énergétique (Gemini API). |

---

## 3. Logique des Circuits & Interverrouillage de Sécurité

### Flux Matière
$$\text{Résidus bruts} \longrightarrow \text{Broyage} \longrightarrow \text{Convoyeur} \longrightarrow \text{Séchoir (Zone B)} \longrightarrow \text{Pyrolyse (Zone C)} \longrightarrow \text{Biochar Collecté}$$

### Circuits Énergétiques Colorés
- **Jaune / Ambre** : Circuit fermé solaire thermique glycolé ($180^\circ\text{C}$) $\to$ Batterie à sable.
- **Rouge** : Récupération thermique des fumées de combustion du syngas ($350^\circ\text{C}$) $\to$ Batterie à sable.
- **Doré / Électrique** : Déviation directe du surplus de production photovoltaïque $\to$ Thermoplongeurs de la batterie à sable.
- **Cyan / Bleu clair** : Boucle de décharge d'huile thermique propre ($130^\circ\text{C}$) $\to$ Échangeur du séchoir de biomasse.
- **Bleu foncé** : Retour de fluide caloporteur refroidi ($70^\circ\text{C}$) $\to$ Batterie à sable.
- **Vert** : Ligne de transport de biomasse brute.
- **Anthracite** : Décharge du biochar stabilisé.

### Interverrouillage Automatisé (Dryer Interlock)
> **Règle de sécurité critique** : Le séchoir à biomasse ne fonctionne que si la température interne de la batterie à sable est $\ge 180^\circ\text{C}$ (SOC $\ge 35\%$). En deçà, l'automate engage l'interverrouillage de sécurité (**INHIBITED**) et coupe l'alimentation thermique du séchoir pour éviter toute rupture d'enthalpie.

---

## 4. Modes de Visualisation 3D

1. **Rendu Réaliste PBR Industriel** : Matériaux physiques haute fidélité (acier galvanisé, inox poli, béton armé avec joints de dilatation et zébras de sécurité, verre optique, isolation thermique matelassée).
2. **Mode Écorché (Cutaway X-Ray)** : Les parois externes des cuves et tunnels deviennent translucides afin d'observer :
   - Le massif interne de sable de quartz doré.
   - Les thermoplongeurs électriques submergés.
   - Les serpentins internes d'échange thermique.
   - La vis hélicoïdale interne du réacteur de pyrolyse.
   - Les plateaux perforés internes de séchage.
3. **Carte Thermique (Thermal Heatmap)** : Coloration dynamique des équipements selon leur température de service ($25^\circ\text{C}$ bleu ambiant $\to 85^\circ\text{C}$ séchage $\to 450^\circ\text{C}$ batterie à sable $\to 520^\circ\text{C}$ pyrolyse rouge incandescent).

---

## 5. Contrôles, Touches & Raccourcis Clavier

L'application supporte le clavier complet, la souris et les écrans tactiles :

| Touche / Commande | Fonction |
| :--- | :--- |
| **`H`** | Masquer / Afficher le panneau de commande inférieur (*Mode Zen*) |
| **`Espace`** | Pause / Reprise de l'animation des flux et particules |
| **`M`** | Changer de mode de rendu (*Réaliste $\to$ Écorché $\to$ Thermique*) |
| **`0` ou `I`** | Vue Isométrique $\frac{3}{4}$ globale |
| **`P`** | Vue en Plan orthogonale (Top-Down BIM) |
| **`1` ou `A`** | Caméra Zone A (Réception Biomasse) |
| **`2` ou `B`** | Caméra Zone B (Séchoir Industriel) |
| **`3` ou `C`** | Caméra Zone C (Unité de Pyrolyse) |
| **`4` ou `D`** | Caméra Zone D (Batterie Thermique à Sable) |
| **`5` ou `E`** | Caméra Zone E (Solaire PV & Thermique) |
| **`6` ou `F`** | Caméra Zone F (Poste de Contrôle & SCADA) |
| **`+` / `-`** *(ou `Z`/`X`)* | Zoom avant / Zoom arrière |
| **`Échap`** | Fermer les fenêtres modales ouvertes |
| **`?` ou `K`** | Ouvrir le Guide des Touches |
| **Clic / Touch 3D** | Cliquer ou toucher n'importe quel équipement 3D ouvre sa fiche technique P&ID |

---

## 6. Architecture Technique

- **Framework** : Next.js 15+ (App Router, Server Components & Client Leaf Nodes)
- **Moteur 3D** : Three.js (r187) avec WebGL2, détection automatique Software WebGL, tone-mapping ACESFilmic, et textures procédurales 100% autonomes (zéro dépendance externe, zéro erreur 404).
- **Styles & Interface** : Tailwind CSS v4, Lucide React, animations `motion`.
- **Moteur de Simulation** : Modèle thermodynamique réel calculant les débits massiques, l'évaporation de l'eau, le rendement en syngas et biochar, et la séquestration nette de $\text{CO}_2$.
- **Intelligence Artificielle** : SDK `@google/genai` (modèle `gemini-2.5-flash`) en Server Route sécurisée (`/api/gemini/optimize`) pour l'optimisation en temps réel des consignes de délestage énergétique.

---

## 7. Installation & Lancement

### Prérequis
- Node.js 18+ ou 20+
- Clé d'API Gemini (`GEMINI_API_KEY`) définie dans l'environnement

### Déploiement Local

```bash
# 1. Cloner ou ouvrir le projet
cd ecofarm-circular

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Renseigner GEMINI_API_KEY="votre_clé_ici"

# 4. Lancer le serveur de développement
npm run dev

# 5. Ouvrir dans le navigateur
# http://localhost:3000
```

### Build de Production

```bash
npm run build
npm run start
```

---

## 8. Paramètres de Simulation & Supervision IA

Dans l'onglet **"Thermodynamic Sim"** du panneau inférieur, vous pouvez modifier en temps réel :
- **Irradiation Solaire ($0 - 1\,000\,\text{W/m}^2$)** : influence directe sur la puissance PV générée et le circuit solaire thermique.
- **Débit d'Alimentation Biomasse ($20 - 200\,\text{kg/h}$)** : calcule la charge du broyeur, la demande d'évaporation du séchoir et la production de biochar.
- **SOC Batterie à Sable ($10 - 100\%$)** : déclenche ou inhibe dynamiquement le séchoir via l'interverrouillage automatique.
- **Température de Pyrolyse ($400 - 650^\circ\text{C}$)** : ajuste le ratio syngas combustible / biochar et la chaleur récupérée.

En cliquant sur **"AI Energy Dispatch"**, l'assistant Gemini analyse instantanément le bilan d'enthalpie globale et prescrit les consignes de dispatching optimales pour maximiser le COP de l'installation.

---

*Projet ECOFARM CIRCULAR — Conçu pour l'ingénierie énergétique industrielle et la compétition internationale d'architecture circulaire.*
