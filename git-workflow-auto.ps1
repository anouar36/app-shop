# Script PowerShell pour automatiser le workflow Git complet
Write-Host "🚀 Git Workflow Automatisé - Projet E-commerce" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Menu principal
function Show-Menu {
    Write-Host "`n📋 Que veux-tu faire ?" -ForegroundColor Cyan
    Write-Host "1. ➕ Créer une nouvelle feature"
    Write-Host "2. ✅ Finaliser une feature existante"
    Write-Host "3. 🔀 Merger develop vers main (production)"
    Write-Host "4. 📊 Voir le statut Git"
    Write-Host "5. 🌿 Voir toutes les branches"
    Write-Host "6. 📜 Voir l'historique"
    Write-Host "7. ❌ Quitter"
    Write-Host ""
}

# Se positionner dans le projet
Set-Location "c:\xampp\htdocs\shop"

do {
    Show-Menu
    $choice = Read-Host "Choix (1-7)"
    
    switch ($choice) {
        "1" {
            $featureName = Read-Host "📝 Nom de la nouvelle feature (ex: payment-integration)"
            if ($featureName) {
                .\git-create-feature.ps1 $featureName
            }
        }
        "2" {
            # Afficher les branches feature existantes
            Write-Host "🌿 Branches feature existantes:" -ForegroundColor Yellow
            git branch | Where-Object { $_ -match "feature/" }
            
            $featureName = Read-Host "📝 Nom de la feature à finaliser (sans 'feature/')"
            if ($featureName) {
                $commitMsg = Read-Host "💬 Message de commit (optionnel)"
                if ($commitMsg) {
                    .\git-finish-feature.ps1 $featureName $commitMsg
                } else {
                    .\git-finish-feature.ps1 $featureName
                }
            }
        }
        "3" {
            Write-Host "🚀 Déploiement vers production (main)..." -ForegroundColor Green
            git checkout main
            git pull origin main
            git merge develop
            git push origin main
            
            $createTag = Read-Host "🏷️ Créer un tag de version ? (y/N)"
            if ($createTag -eq "y" -or $createTag -eq "Y") {
                $version = Read-Host "📋 Version (ex: v1.0.0)"
                if ($version) {
                    git tag -a $version -m "Version $version"
                    git push origin $version
                    Write-Host "✅ Tag $version créé" -ForegroundColor Green
                }
            }
        }
        "4" {
            Write-Host "📊 Statut Git:" -ForegroundColor Cyan
            git status
        }
        "5" {
            Write-Host "🌿 Toutes les branches:" -ForegroundColor Cyan
            git branch -a
        }
        "6" {
            Write-Host "📜 Historique Git:" -ForegroundColor Cyan
            git log --oneline --graph -10
        }
        "7" {
            Write-Host "👋 Au revoir!" -ForegroundColor Green
            break
        }
        default {
            Write-Host "❌ Choix invalide. Essaie encore." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "7") {
        Read-Host "`nAppuie sur Entrée pour continuer..."
        Clear-Host
    }
    
} while ($choice -ne "7")
