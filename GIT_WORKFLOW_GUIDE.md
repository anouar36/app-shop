# 🚀 WORKFLOW GIT PROFESSIONNEL - AYOUBE SHOP

## 📋 STRUCTURE DES BRANCHES

```
main (production)
├── develop (intégration)
├── feature/live-order-tracking
├── feature/email-notifications
├── feature/admin-dashboard
├── feature/customer-insights
├── hotfix/bug-fixes
└── release/v1.0.0
```

## 🔄 ÉTAPES DU WORKFLOW

### 1. CONFIGURATION INITIALE

```powershell
# Créer la branche develop
git checkout -b develop

# Pousser develop sur le remote
git push -u origin develop
```

### 2. CRÉER UNE NOUVELLE FEATURE

```powershell
# Se placer sur develop
git checkout develop

# Créer une nouvelle branche feature
git checkout -b feature/nom-de-la-feature

# Exemple concret
git checkout -b feature/live-order-tracking
```

### 3. DÉVELOPPER SUR LA BRANCHE FEATURE

```powershell
# Ajouter les fichiers modifiés
git add .

# Commiter avec un message descriptif
git commit -m "feat: ajouter le système de tracking en temps réel"

# Pousser la branche sur le remote
git push -u origin feature/live-order-tracking
```

### 4. MERGER LA FEATURE DANS DEVELOP

```powershell
# Retourner sur develop
git checkout develop

# Mettre à jour develop
git pull origin develop

# Merger la feature
git merge feature/live-order-tracking

# Pousser les changements
git push origin develop

# Supprimer la branche feature (optionnel)
git branch -d feature/live-order-tracking
git push origin --delete feature/live-order-tracking
```

### 5. RELEASE VERS MAIN

```powershell
# Créer une branche release
git checkout develop
git checkout -b release/v1.0.0

# Tests et corrections finales...
git add .
git commit -m "release: v1.0.0 - première version stable"

# Merger dans main
git checkout main
git merge release/v1.0.0

# Créer un tag
git tag -a v1.0.0 -m "Version 1.0.0 - E-commerce complet"
git push origin main --tags

# Merger aussi dans develop
git checkout develop
git merge release/v1.0.0
git push origin develop
```

## 🎯 CONVENTIONS DE NOMMAGE

### Branches
- `feature/nom-feature` : Nouvelles fonctionnalités
- `bugfix/nom-bug` : Corrections de bugs
- `hotfix/nom-hotfix` : Corrections urgentes
- `release/vX.X.X` : Préparation des releases

### Messages de commit
- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, style
- `refactor:` : Refactoring
- `test:` : Tests
- `chore:` : Maintenance

## 📦 FEATURES IDENTIFIÉES DANS TON PROJET

1. **feature/live-order-tracking** - Système de tracking temps réel
2. **feature/email-notifications** - Notifications par email
3. **feature/admin-dashboard** - Interface d'administration
4. **feature/customer-insights** - Analyses client
5. **feature/payment-integration** - Intégration paiement
6. **feature/websocket-integration** - WebSocket pour temps réel

## 🛠️ COMMANDES RAPIDES

```powershell
# Voir toutes les branches
git branch -a

# Voir l'état actuel
git status

# Voir l'historique
git log --oneline --graph

# Changer de branche
git checkout nom-branche

# Créer et changer de branche
git checkout -b nouvelle-branche

# Synchroniser avec le remote
git fetch --all
git pull origin develop
```

## ⚠️ BONNES PRATIQUES

1. **Toujours commiter sur une branche feature**
2. **Tester avant de merger**
3. **Messages de commit descriptifs**
4. **Petits commits fréquents**
5. **Synchroniser régulièrement avec develop**
6. **Ne jamais commiter directement sur main**

## 🔧 SCRIPTS D'AUTOMATISATION

Voir les fichiers .bat créés pour automatiser certaines tâches.
