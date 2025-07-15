# 🚀 Démarrage Rapide - Workflow Git

## 1. Nettoyer l'état actuel

```powershell
# Se positionner dans le projet
cd c:\xampp\htdocs\shop

# Ajouter tous les fichiers de documentation et scripts
git add *.md *.html *.bat *.ps1 *.php *.sql *.json

# Commiter l'état actuel
git commit -m "docs: ajout documentation complète et scripts de test

- Guides d'implémentation de toutes les fonctionnalités
- Scripts de test et validation
- Configuration et fichiers de support
- Documentation du workflow Git"

# Pousser vers develop
git push origin develop
```

## 2. Initialiser le workflow

```powershell
# Utiliser le script automatisé
.\git-workflow-auto.ps1 init
```

## 3. Organiser les fonctionnalités en branches

### A. Live Order Tracking
```powershell
.\git-workflow-auto.ps1 feature live-order-tracking

# Ajouter les fichiers liés au tracking
git add shop-app/lib/orderTrackingWebSocket.js
git add shop-app/app/admin/dashboard/components/LiveOrderTracking.js
git add shop-backend/app/Events/
git add websocket-server.js

.\git-workflow-auto.ps1 commit -Message "feat: implémentation système de tracking en temps réel

- WebSocket server pour communications temps réel
- Composant React LiveOrderTracking
- Événements Laravel Broadcasting
- Interface admin avec notifications live"

.\git-workflow-auto.ps1 merge live-order-tracking
```

### B. Email Notifications
```powershell
.\git-workflow-auto.ps1 feature email-notifications

# Ajouter les fichiers email
git add shop-backend/app/Mail/
git add shop-backend/config/mail.php
git add *email* *gmail* *smtp*

.\git-workflow-auto.ps1 commit -Message "feat: système de notifications email complet

- Configuration SMTP/Gmail
- Templates d'emails pour commandes
- Notifications automatiques admin/client
- Tests et validation email"

.\git-workflow-auto.ps1 merge email-notifications
```

### C. Payment Integration
```powershell
.\git-workflow-auto.ps1 feature payment-integration

# Ajouter les fichiers de paiement
git add shop-backend/app/Http/Controllers/Api/OrderController.php
git add shop-app/app/checkout/
git add *payment* *order*

.\git-workflow-auto.ps1 commit -Message "feat: intégration complète système de paiement

- API de création de commandes
- Interface de checkout frontend
- Gestion des statuts de commande
- Validation et sécurité"

.\git-workflow-auto.ps1 merge payment-integration
```

### D. Admin Dashboard
```powershell
.\git-workflow-auto.ps1 feature admin-dashboard

# Ajouter les fichiers admin
git add shop-app/app/admin/
git add shop-backend/app/Http/Controllers/Api/AdminController.php
git add *admin* *dashboard*

.\git-workflow-auto.ps1 commit -Message "feat: tableau de bord administrateur avancé

- Interface de gestion des commandes
- Statistiques et métriques
- Gestion des utilisateurs
- Export et rapports"

.\git-workflow-auto.ps1 merge admin-dashboard
```

### E. Frontend Store
```powershell
.\git-workflow-auto.ps1 feature frontend-store

# Ajouter les fichiers du store
git add shop-app/app/page.js
git add shop-app/app/components/
git add shop-app/app/globals.css
git add shop-app/tailwind.config.mjs

.\git-workflow-auto.ps1 commit -Message "feat: interface e-commerce moderne

- Page d'accueil avec carousel
- Catalogue de produits
- Panier d'achats interactif
- Design responsive et animations"

.\git-workflow-auto.ps1 merge frontend-store
```

## 4. Créer une release

```powershell
.\git-workflow-auto.ps1 release v1.0.0
```

## 5. Commandes rapides pour le développement quotidien

```powershell
# Voir l'état
.\git-workflow-auto.ps1 status

# Nouvelle feature
.\git-workflow-auto.ps1 feature nom-de-ma-feature

# Commiter des changements
.\git-workflow-auto.ps1 commit -Message "feat: description de ma modification"

# Merger une feature terminée
.\git-workflow-auto.ps1 merge nom-de-ma-feature

# Nettoyer les branches obsolètes
.\git-workflow-auto.ps1 clean
```

## 6. Structure finale des branches

```
main (v1.0.0)
├── develop (toutes les features intégrées)
│   ├── feature/live-order-tracking (✅ mergée)
│   ├── feature/email-notifications (✅ mergée)
│   ├── feature/payment-integration (✅ mergée)
│   ├── feature/admin-dashboard (✅ mergée)
│   └── feature/frontend-store (✅ mergée)
└── hotfix/* (pour corrections urgentes)
```

## 🎯 Prochaines étapes

1. **Nettoyer** l'état actuel avec les commandes ci-dessus
2. **Organiser** les fonctionnalités en branches dédiées
3. **Tester** chaque feature individuellement
4. **Créer** la première release v1.0.0
5. **Continuer** le développement avec de nouvelles features

---

**Note :** Ce processus va organiser proprement tout le travail déjà effectué en branches logiques et permettre un développement futur structuré.
