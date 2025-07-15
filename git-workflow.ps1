# 🚀 Script d'automatisation Git Workflow pour Ayoube Shop
# Usage: .\git-workflow.ps1 [commande] [nom-feature]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init", "feature", "commit", "merge", "release")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$FeatureName,
    
    [Parameter(Mandatory=$false)]
    [string]$Message
)

function Show-Help {
    Write-Host "🚀 GIT WORKFLOW AUTOMATISÉ - AYOUBE SHOP" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\git-workflow.ps1 init                     # Initialiser le workflow"
    Write-Host "  .\git-workflow.ps1 feature <nom>            # Créer une nouvelle feature"
    Write-Host "  .\git-workflow.ps1 commit '<message>'       # Commiter les changements"
    Write-Host "  .\git-workflow.ps1 merge <feature-name>     # Merger une feature dans develop"
    Write-Host "  .\git-workflow.ps1 release <version>        # Créer une release"
    Write-Host ""
    Write-Host "EXEMPLES:" -ForegroundColor Green
    Write-Host "  .\git-workflow.ps1 feature live-tracking"
    Write-Host "  .\git-workflow.ps1 commit 'feat: ajouter tracking temps réel'"
    Write-Host "  .\git-workflow.ps1 merge live-tracking"
}

function Initialize-Workflow {
    Write-Host "🔧 Initialisation du workflow Git..." -ForegroundColor Cyan
    
    # Créer .gitignore si n'existe pas
    if (!(Test-Path ".gitignore")) {
        @"
# Dependencies
node_modules/
vendor/

# Build outputs
.next/
dist/
build/

# Environment files
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*

# Cache
.cache/
.parcel-cache/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Laravel specific
/storage/*.key
/vendor
/node_modules
/public/hot
/public/storage
/storage/app/public
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log

# Temporary files
*.tmp
*.temp
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "✅ .gitignore créé" -ForegroundColor Green
    }
    
    # Sauvegarder les changements actuels dans une branche
    git add .
    git stash push -m "Sauvegarde avant initialisation workflow"
    
    # Créer la branche develop
    git checkout -b develop 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Branche develop créée" -ForegroundColor Green
    } else {
        git checkout develop
        Write-Host "ℹ️ Branche develop existe déjà" -ForegroundColor Yellow
    }
    
    # Restaurer les changements
    git stash pop 2>$null
    
    # Pousser develop
    git push -u origin develop 2>$null
    Write-Host "✅ Workflow initialisé avec succès!" -ForegroundColor Green
}

function Create-Feature {
    param([string]$Name)
    
    if (!$Name) {
        Write-Host "❌ Nom de feature requis" -ForegroundColor Red
        Show-Help
        return
    }
    
    Write-Host "🌟 Création de la feature: $Name" -ForegroundColor Cyan
    
    # Se placer sur develop
    git checkout develop
    git pull origin develop 2>$null
    
    # Créer la branche feature
    $branchName = "feature/$Name"
    git checkout -b $branchName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Branche $branchName créée" -ForegroundColor Green
        Write-Host "💡 Tu peux maintenant développer ta feature!" -ForegroundColor Yellow
        Write-Host "💡 Utilise: .\git-workflow.ps1 commit 'ton message' pour commiter" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Erreur lors de la création de la branche" -ForegroundColor Red
    }
}

function Commit-Changes {
    param([string]$CommitMessage)
    
    if (!$CommitMessage) {
        Write-Host "❌ Message de commit requis" -ForegroundColor Red
        Show-Help
        return
    }
    
    Write-Host "💾 Commit des changements..." -ForegroundColor Cyan
    
    # Ajouter tous les fichiers
    git add .
    
    # Commiter
    git commit -m $CommitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Changements commités" -ForegroundColor Green
        
        # Pousser la branche
        $currentBranch = git branch --show-current
        git push -u origin $currentBranch 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Changements poussés sur origin/$currentBranch" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    }
}

function Merge-Feature {
    param([string]$FeatureName)
    
    if (!$FeatureName) {
        Write-Host "❌ Nom de feature requis" -ForegroundColor Red
        Show-Help
        return
    }
    
    Write-Host "🔀 Merge de la feature: $FeatureName dans develop" -ForegroundColor Cyan
    
    # Se placer sur develop
    git checkout develop
    git pull origin develop 2>$null
    
    # Merger la feature
    $branchName = "feature/$FeatureName"
    git merge $branchName --no-ff -m "Merge feature/$FeatureName into develop"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Feature mergée dans develop" -ForegroundColor Green
        
        # Pousser develop
        git push origin develop
        
        # Demander si supprimer la branche
        $delete = Read-Host "🗑️ Supprimer la branche feature/$FeatureName? (y/N)"
        if ($delete -eq "y" -or $delete -eq "Y") {
            git branch -d $branchName
            git push origin --delete $branchName 2>$null
            Write-Host "✅ Branche supprimée" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Erreur lors du merge" -ForegroundColor Red
    }
}

function Create-Release {
    param([string]$Version)
    
    if (!$Version) {
        Write-Host "❌ Version requise (ex: v1.0.0)" -ForegroundColor Red
        Show-Help
        return
    }
    
    Write-Host "🚀 Création de la release: $Version" -ForegroundColor Cyan
    
    # Se placer sur develop
    git checkout develop
    git pull origin develop 2>$null
    
    # Créer branche release
    $releaseBranch = "release/$Version"
    git checkout -b $releaseBranch
    
    Write-Host "✅ Branche $releaseBranch créée" -ForegroundColor Green
    Write-Host "💡 Effectue tes tests finaux, puis utilise les commandes suivantes:" -ForegroundColor Yellow
    Write-Host "   git checkout main" -ForegroundColor White
    Write-Host "   git merge $releaseBranch" -ForegroundColor White
    Write-Host "   git tag -a $Version -m 'Release $Version'" -ForegroundColor White
    Write-Host "   git push origin main --tags" -ForegroundColor White
}

# Exécution principale
switch ($Action) {
    "init" { Initialize-Workflow }
    "feature" { Create-Feature -Name $FeatureName }
    "commit" { Commit-Changes -CommitMessage $Message }
    "merge" { Merge-Feature -FeatureName $FeatureName }
    "release" { Create-Release -Version $FeatureName }
    default { Show-Help }
}
