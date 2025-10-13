# Script PowerShell pour activer l'API Generative AI
# Usage: .\scripts\activate-generative-ai-api.ps1

Write-Host "🔧 Activation de l'API Generative AI..." -ForegroundColor Cyan
Write-Host ""

# Activer l'API Generative Language
Write-Host "📡 Activation de generativelanguage.googleapis.com..." -ForegroundColor Yellow
gcloud services enable generativelanguage.googleapis.com --project=omadigital23

# Activer aussi Vertex AI API (si pas déjà fait)
Write-Host "📡 Activation de aiplatform.googleapis.com..." -ForegroundColor Yellow
gcloud services enable aiplatform.googleapis.com --project=omadigital23

Write-Host ""
Write-Host "✅ APIs activées!" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification..." -ForegroundColor Cyan
gcloud services list --enabled --project=omadigital23 | Select-String -Pattern "generativelanguage|aiplatform"

Write-Host ""
Write-Host "⏳ Attendre 30 secondes pour que les APIs soient complètement activées..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "🧪 Test des modèles disponibles..." -ForegroundColor Cyan
npm run list:models

Write-Host ""
Write-Host "✅ Activation terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Vérifier les modèles disponibles ci-dessus"
Write-Host "   2. Mettre à jour le code avec le bon modèle"
Write-Host "   3. Redémarrer: npm run dev"
Write-Host ""
