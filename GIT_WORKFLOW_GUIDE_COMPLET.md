# 🔄 Guide Workflow Git Professionnel - Projet E-commerce

## 📋 Vue d'ensemble du Workflow

Ce workflow utilise le **Git Flow** adapté avec les branches suivantes :
- `main` : Version de production stable
- `develop` : Branche de développement principale 
- `feature/*` : Branches pour chaque nouvelle fonctionnalité
- `hotfix/*` : Corrections urgentes en production
- `release/*` : Préparation des versions

## 🚀 Étapes Détaillées

### 1. Configuration Initiale

```powershell
# Se positionner dans le projet
cd c:\xampp\htdocs\shop

# Vérifier les branches existantes
git branch -a

# Créer la branche main si elle n'existe pas
git checkout -b main
git push -u origin main

# Retourner sur develop
git checkout develop
```

### 2. Pour Chaque Nouvelle Fonctionnalité

#### A. Créer une branche feature

```powershell
# Depuis develop, créer une nouvelle branche
git checkout develop
git pull origin develop
git checkout -b feature/nom-de-la-fonctionnalite

# Exemples de noms de branches :
# feature/live-order-tracking
# feature/email-notifications
# feature/payment-integration
# feature/admin-dashboard
```

#### B. Développer et commiter

```powershell
# Ajouter les fichiers modifiés
git add fichier1.js fichier2.php

# Ou ajouter tous les fichiers liés à la feature
git add .

# Commiter avec un message descriptif
git commit -m "feat: ajouter le système de tracking en temps réel

- Implémentation du WebSocket server
- Création du composant LiveOrderTracking
- Configuration des événements Laravel Broadcasting"

# Pousser la branche sur le remote
git push -u origin feature/nom-de-la-fonctionnalite
```

#### C. Conventions de messages de commit

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, points-virgules manquants, etc.
refactor: refactorisation du code
test: ajout de tests
chore: maintenance, tâches diverses
```

### 3. Merger dans Develop

#### A. Une fois la feature terminée

```powershell
# Revenir sur develop
git checkout develop
git pull origin develop

# Merger la feature
git merge feature/nom-de-la-fonctionnalite

# Pousser develop mise à jour
git push origin develop

# Supprimer la branche feature locale
git branch -d feature/nom-de-la-fonctionnalite

# Supprimer la branche feature sur le remote
git push origin --delete feature/nom-de-la-fonctionnalite
```

#### B. Alternative avec Pull Request (recommandé)

```powershell
# Pousser la feature
git push origin feature/nom-de-la-fonctionnalite

# Ensuite créer une Pull Request sur GitHub/GitLab
# Après validation, merger via l'interface web
```

### 4. Créer une Release

```powershell
# Depuis develop, créer une branche release
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Finaliser la version (tests, documentation)
git add .
git commit -m "chore: préparation release v1.0.0"
git push origin release/v1.0.0

# Merger dans main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0 - Système e-commerce complet"
git push origin main --tags

# Merger dans develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Supprimer la branche release
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

### 5. Corrections Urgentes (Hotfix)

```powershell
# Depuis main, créer un hotfix
git checkout main
git pull origin main
git checkout -b hotfix/correction-urgente

# Faire la correction
git add .
git commit -m "fix: correction bug critique en production"
git push origin hotfix/correction-urgente

# Merger dans main
git checkout main
git merge hotfix/correction-urgente
git tag -a v1.0.1 -m "Correction urgente v1.0.1"
git push origin main --tags

# Merger dans develop
git checkout develop
git merge hotfix/correction-urgente
git push origin develop

# Supprimer le hotfix
git branch -d hotfix/correction-urgente
git push origin --delete hotfix/correction-urgente
```

## 🛠️ Commandes Utiles

### Vérification de l'état

```powershell
# Voir l'état actuel
git status

# Voir l'historique
git log --oneline --graph

# Voir les branches
git branch -a

# Voir les différences
git diff
```

### Gestion des conflits

```powershell
# En cas de conflit lors du merge
git status
# Résoudre manuellement les conflits dans les fichiers
git add .
git commit -m "resolve: résolution conflits merge"
```

### Annuler des modifications

```powershell
# Annuler les modifications non commitées
git checkout -- nom-fichier.js

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# Annuler le dernier commit (perdre les modifications)
git reset --hard HEAD~1
```

## 📁 Structure Recommandée des Branches

```
main (production)
├── develop (intégration)
│   ├── feature/live-order-tracking
│   ├── feature/email-notifications
│   ├── feature/payment-integration
│   └── feature/admin-dashboard
├── release/v1.0.0
└── hotfix/correction-critique
```

## 🎯 Bonnes Pratiques

1. **Toujours partir de develop** pour créer une feature
2. **Un commit par modification logique**
3. **Messages de commit descriptifs**
4. **Tester avant de merger**
5. **Supprimer les branches obsolètes**
6. **Utiliser les Pull Requests** pour la revue de code
7. **Taguer les versions** importantes

## 🚦 Workflow Quotidien

```powershell
# 1. Récupérer les dernières modifications
git checkout develop
git pull origin develop

# 2. Créer une nouvelle feature
git checkout -b feature/ma-nouvelle-feature

# 3. Développer et commiter régulièrement
git add .
git commit -m "feat: description de la modification"

# 4. Pousser régulièrement
git push origin feature/ma-nouvelle-feature

# 5. Une fois terminé, merger dans develop
git checkout develop
git pull origin develop
git merge feature/ma-nouvelle-feature
git push origin develop

# 6. Nettoyer
git branch -d feature/ma-nouvelle-feature
git push origin --delete feature/ma-nouvelle-feature
```

---

**Note :** Ce workflow est adapté à ton projet e-commerce avec toutes les fonctionnalités que nous avons développées (live order tracking, email notifications, admin dashboard, etc.).
