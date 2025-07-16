# Script PowerShell pour finaliser une feature branch
param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureName,
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "feat: implement $FeatureName functionality"
)

Write-Host "🎯 Finalisation de la feature: $FeatureName" -ForegroundColor Green

# Se positionner dans le projet
Set-Location "c:\xampp\htdocs\shop"

# S'assurer d'être sur la bonne branche feature
$currentBranch = git branch --show-current
if ($currentBranch -ne "feature/$FeatureName") {
    Write-Host "🔄 Basculement vers la branche feature/$FeatureName..." -ForegroundColor Yellow
    git checkout "feature/$FeatureName"
}

# Ajouter tous les fichiers modifiés
Write-Host "📁 Ajout des fichiers modifiés..." -ForegroundColor Cyan
git add .

# Commiter les changements
Write-Host "💾 Commit des changements..." -ForegroundColor Cyan
git commit -m $CommitMessage

# Pousser la branche vers le remote
Write-Host "☁️ Push vers GitHub..." -ForegroundColor Cyan
git push origin "feature/$FeatureName"

# Basculer vers develop
Write-Host "🔄 Basculement vers develop..." -ForegroundColor Yellow
git checkout develop

# Récupérer les dernières modifications de develop
Write-Host "📥 Récupération des dernières modifications..." -ForegroundColor Yellow
git pull origin develop

# Merger la feature branch dans develop
Write-Host "🔀 Merge de la feature dans develop..." -ForegroundColor Cyan
git merge "feature/$FeatureName"

# Pousser develop mise à jour
Write-Host "☁️ Push de develop..." -ForegroundColor Cyan
git push origin develop

# Demander si on veut supprimer la branche feature
$deleteFeature = Read-Host "🗑️ Supprimer la branche feature/$FeatureName ? (y/N)"
if ($deleteFeature -eq "y" -or $deleteFeature -eq "Y") {
    git branch -d "feature/$FeatureName"
    git push origin --delete "feature/$FeatureName"
    Write-Host "🗑️ Branche feature supprimée" -ForegroundColor Red
}

Write-Host "✅ Feature $FeatureName intégrée avec succès dans develop!" -ForegroundColor Green

# Afficher le statut final
git status
