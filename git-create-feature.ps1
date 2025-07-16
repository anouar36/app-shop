# Script PowerShell pour créer une nouvelle feature branch
param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureName
)

Write-Host "Creation d'une nouvelle feature: $FeatureName" -ForegroundColor Green

# Se positionner dans le projet
Set-Location "c:\xampp\htdocs\shop"

# S'assurer d'être sur develop et récupérer les dernières modifications
Write-Host "Recuperation des dernieres modifications..." -ForegroundColor Yellow
git checkout develop
git pull origin develop

# Créer et basculer sur la nouvelle branche feature
Write-Host "Creation de la branche feature/$FeatureName..." -ForegroundColor Cyan
git checkout -b "feature/$FeatureName"

Write-Host "Feature branch creee avec succes!" -ForegroundColor Green
Write-Host "Tu peux maintenant developper ta fonctionnalite." -ForegroundColor White
Write-Host "Quand tu auras termine, utilise: .\git-finish-feature.ps1 '$FeatureName'" -ForegroundColor Yellow

# Afficher le statut actuel
git status
