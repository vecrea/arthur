# 🇺🇸 Party in the USA — Road to D1

Application web pour aider **Arthur** (nageur belge 🏊‍♂️) à trouver l'**université américaine idéale** :
natation universitaire, **diplôme d'économie** et **soleil** ☀️.

Chaque université reçoit un **score de compatibilité (0-100)** calculé selon ton profil, plus une
catégorie de recrutement **Réaliste / Objectif / Ambitieux**.

> **MVP (Phase 1).** Recherche, score, filtres, comparaison et favoris. L'IA et le suivi des
> démarches arrivent dans les phases suivantes (voir la feuille de route).

## ✨ Ce que fait l'app

- **Profil nageur** : tes temps (50 m) convertis en yards US (SCY) + ton niveau de recrutement estimé.
- **Classement** des universités par score de compatibilité (sport / études / lifestyle / coût).
- **Filtres** : division (D1/D2/D3), catégorie de recrutement, « soleil ++ », recherche, tri.
- **Favoris** ⭐ (sauvegardés dans ton navigateur) + **comparaison** côte à côte.

## 🚀 Lancer en local

```bash
npm install
npm run dev      # ouvre l'URL affichée (http://localhost:5173)
```

Pour une version optimisée :

```bash
npm run build    # génère le dossier dist/
npm run preview  # sert le build en local
```

## 🌐 Mettre en ligne (URL publique gratuite)

Un workflow GitHub Actions est déjà prêt (`.github/workflows/deploy.yml`). Une fois le code poussé :

1. Sur GitHub → **Settings → Pages**
2. **Source : GitHub Actions**

L'app se déploiera automatiquement à chaque push, à l'adresse `https://<utilisateur>.github.io/arthur/`.

## ⚠️ Données

La sélection d'universités, les coûts, la sélectivité et la force des programmes de natation sont
des **estimations indicatives** (MVP), à vérifier sur les rosters/sites officiels 2025-26.
La conversion des temps (mètres → yards) utilise des **facteurs approchés**, pas la table officielle
USA Swimming — elle situe le niveau mais doit être affinée.

## 🛣️ Feuille de route

- **Phase 1 — MVP** ✅ : profil + base natation + score + filtres + comparaison + favoris.
- **Phase 2** : suivi des démarches (NCAA Eligibility Center, calendrier SAT/TOEFL), carnet de
  contacts coachs, fiche athlète / CV de natation.
- **Phase 3 — IA** : recommandations expliquées (API Claude) + générateur d'emails aux coachs.
- **Enrichissement données** : intégration de l'API College Scorecard (données officielles US).

## 🧱 Stack

React + Vite + Tailwind CSS v4. Aucune donnée envoyée à un serveur (tout tourne dans le navigateur).
