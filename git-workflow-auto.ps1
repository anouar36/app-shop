# 🔄 Script Git Workflow Automatisé - Projet E-commerce
# Usage: .\git-workflow-auto.ps1 [commande] [paramètres]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init", "feature", "commit", "merge", "release", "hotfix", "status", "clean")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Name,
    
    [Parameter(Mandatory=$false)]
    [string]$Message
)

# Configuration
$ProjectPath = "c:\xampp\htdocs\shop"

# Couleurs pour l'affichage
function Write-Success($message) { Write-Host "✅ $message" -ForegroundColor Green }
function Write-Info($message) { Write-Host "ℹ️  $message" -ForegroundColor Blue }
function Write-Warning($message) { Write-Host "⚠️  $message" -ForegroundColor Yellow }
function Write-Error($message) { Write-Host "❌ $message" -ForegroundColor Red }

# Se positionner dans le projet
Set-Location $ProjectPath

switch ($Action) {
    "init" {
        Write-Info "Initialisation du workflow Git..."
        
        # Vérifier si on est dans un repo Git
        if (-not (Test-Path ".git")) {
            Write-Error "Ce n'est pas un repository Git!"
            exit 1
        }
        
        # Créer la branche main si elle n'existe pas
        $branches = git branch -a
        if ($branches -notcontains "  main" -and $branches -notcontains "* main") {
            Write-Info "Création de la branche main..."
            git checkout -b main
            git push -u origin main
        }
        
        # S'assurer que develop existe
        if ($branches -notcontains "  develop" -and $branches -notcontains "* develop") {
            Write-Info "Création de la branche develop..."
            git checkout -b develop
            git push -u origin develop
        } else {
            git checkout develop
        }
        
        Write-Success "Workflow Git initialisé!"
    }
    
    "feature" {
        if (-not $Name) {
            Write-Error "Nom de la feature requis! Usage: .\git-workflow-auto.ps1 feature nom-de-la-feature"
            exit 1
        }
        
        Write-Info "Création de la feature branch: feature/$Name"
        
        # S'assurer d'être sur develop et à jour
        git checkout develop
        git pull origin develop
        
        # Créer la feature branch
        git checkout -b "feature/$Name"
        git push -u origin "feature/$Name"
        
        Write-Success "Branche feature/$Name créée et poussée!"
        Write-Info "Vous pouvez maintenant développer votre fonctionnalité."
    }
    
    "commit" {
        if (-not $Message) {
            Write-Error "Message de commit requis! Usage: .\git-workflow-auto.ps1 commit -Message 'votre message'"
            exit 1
        }
        
        Write-Info "Ajout et commit des modifications..."
        
        # Afficher les fichiers modifiés
        $status = git status --porcelain
        if ($status) {
            Write-Info "Fichiers modifiés:"
            $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
            
            # Ajouter tous les fichiers
            git add .
            
            # Commiter
            git commit -m $Message
            
            # Pousser vers la branche courante
            $currentBranch = git branch --show-current
            git push origin $currentBranch
            
            Write-Success "Modifications commitées et poussées sur $currentBranch!"
        } else {
            Write-Warning "Aucune modification à commiter."
        }
    }
    
    "merge" {
        if (-not $Name) {
            Write-Error "Nom de la feature requis! Usage: .\git-workflow-auto.ps1 merge nom-de-la-feature"
            exit 1
        }
        
        Write-Info "Merge de feature/$Name dans develop..."
        
        # Vérifier que la feature existe
        $branches = git branch -a
        $featureBranch = "feature/$Name"
        
        if ($branches -notcontains "  $featureBranch") {
            Write-Error "La branche $featureBranch n'existe pas!"
            exit 1
        }
        
        # Basculer sur develop et mettre à jour
        git checkout develop
        git pull origin develop
        
        # Merger la feature
        git merge $featureBranch --no-ff -m "feat: merge $featureBranch into develop"
        
        # Pousser develop
        git push origin develop
        
        # Demander si on veut supprimer la branche feature
        $response = Read-Host "Voulez-vous supprimer la branche $featureBranch? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            git branch -d $featureBranch
            git push origin --delete $featureBranch
            Write-Success "Branche $featureBranch supprimée."
        }
        
        Write-Success "Feature $Name mergée dans develop!"
    }
    
    "release" {
        if (-not $Name) {
            Write-Error "Version de release requise! Usage: .\git-workflow-auto.ps1 release v1.0.0"
            exit 1
        }
        
        Write-Info "Création de la release $Name..."
        
        # Basculer sur develop et mettre à jour
        git checkout develop
        git pull origin develop
        
        # Créer la branche release
        git checkout -b "release/$Name"
        git push origin "release/$Name"
        
        Write-Info "Tests et finalisation de la release..."
        Write-Info "Une fois prêt, la release sera mergée dans main et develop."
        
        # Merger dans main
        git checkout main
        git pull origin main
        git merge "release/$Name" --no-ff -m "release: version $Name"
        git tag -a $Name -m "Release $Name"
        git push origin main --tags
        
        # Merger dans develop
        git checkout develop
        git merge "release/$Name" --no-ff -m "release: back-merge $Name into develop"
        git push origin develop
        
        # Supprimer la branche release
        git branch -d "release/$Name"
        git push origin --delete "release/$Name"
        
        Write-Success "Release $Name créée et déployée!"
    }
    
    "hotfix" {
        if (-not $Name) {
            Write-Error "Nom du hotfix requis! Usage: .\git-workflow-auto.ps1 hotfix nom-du-fix"
            exit 1
        }
        
        Write-Info "Création du hotfix: hotfix/$Name"
        
        # Basculer sur main et mettre à jour
        git checkout main
        git pull origin main
        
        # Créer la branche hotfix
        git checkout -b "hotfix/$Name"
        git push origin "hotfix/$Name"
        
        Write-Success "Branche hotfix/$Name créée!"
        Write-Info "Effectuez vos corrections, puis utilisez 'commit' et un merge manuel."
    }
    
    "status" {
        Write-Info "État du repository Git:"
        
        # Branche courante
        $currentBranch = git branch --show-current
        Write-Host "📍 Branche courante: " -NoNewline
        Write-Host $currentBranch -ForegroundColor Yellow
        
        # Statut
        Write-Host "`n📋 Statut:"
        git status --short
        
        # Branches
        Write-Host "`n🌿 Branches:"
        git branch -a
        
        # Derniers commits
        Write-Host "`n📝 Derniers commits:"
        git log --oneline -5 --graph
    }
    
    "clean" {
        Write-Info "Nettoyage des branches obsolètes..."
        
        # Supprimer les branches mergées
        Write-Info "Suppression des branches locales mergées..."
        git branch --merged develop | Where-Object { $_ -notmatch "develop|main|\*" } | ForEach-Object {
            $branch = $_.Trim()
            git branch -d $branch
            Write-Success "Branche locale $branch supprimée"
        }
        
        # Nettoyer les références distantes
        Write-Info "Nettoyage des références distantes..."
        git remote prune origin
        
        Write-Success "Nettoyage terminé!"
    }
}

Write-Host "`n🔄 Workflow Git terminé!" -ForegroundColor Green
