# 🚀 Script de Push Sécurisé vers GitHub
# OMA Digital Platform

Write-Host "🔐 Vérification de sécurité avant push..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier qu'on est sur la branche main
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "⚠️  Vous n'êtes pas sur la branche main (actuellement sur: $currentBranch)" -ForegroundColor Yellow
    $continue = Read-Host "Voulez-vous continuer? (o/n)"
    if ($continue -ne "o") {
        exit
    }
}

# 2. Vérifier qu'il n'y a pas de fichiers sensibles
Write-Host "🔍 Vérification des fichiers sensibles..." -ForegroundColor Yellow

$sensitivePatterns = @(
    ".env.local",
    ".env.development.local",
    ".env.production.local",
    "vertex-ai-credentials.json",
    "vertex-credentials-temp.json",
    "*credentials*.json",
    "service-account*.json",
    "*.pem",
    "*.key",
    "*.crt"
)

$foundSensitive = $false
foreach ($pattern in $sensitivePatterns) {
    $files = git ls-files $pattern 2>$null
    if ($files) {
        Write-Host "❌ ATTENTION: Fichier sensible trouvé: $files" -ForegroundColor Red
        $foundSensitive = $true
    }
}

if ($foundSensitive) {
    Write-Host ""
    Write-Host "❌ ARRÊT: Des fichiers sensibles sont trackés par Git!" -ForegroundColor Red
    Write-Host "   Exécutez: git rm --cached <fichier>" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Aucun fichier sensible détecté" -ForegroundColor Green
Write-Host ""

# 3. Vérifier les variables d'environnement dans le code
Write-Host "🔍 Recherche de secrets potentiels dans le code..." -ForegroundColor Yellow

$secretPatterns = @(
    "SUPABASE_SERVICE_ROLE_KEY\s*=\s*['\`"]eyJ",
    "JWT_SECRET\s*=\s*['\`"][^'\`"]{10,}",
    "ADMIN_PASSWORD\s*=\s*['\`"][^'\`"]{5,}",
    "private_key.*BEGIN PRIVATE KEY"
)

$foundSecrets = $false
foreach ($pattern in $secretPatterns) {
    $results = git grep -i -E $pattern 2>$null
    if ($results) {
        Write-Host "⚠️  Secret potentiel trouvé: $pattern" -ForegroundColor Yellow
        $foundSecrets = $true
    }
}

if ($foundSecrets) {
    Write-Host ""
    Write-Host "⚠️  ATTENTION: Des secrets potentiels ont été détectés dans le code!" -ForegroundColor Yellow
    $continue = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($continue -ne "o") {
        exit
    }
}

Write-Host "✅ Aucun secret détecté dans le code" -ForegroundColor Green
Write-Host ""

# 4. Afficher les fichiers qui seront commités
Write-Host "📝 Fichiers modifiés qui seront commités:" -ForegroundColor Cyan
git status --short
Write-Host ""

# 5. Demander confirmation
Write-Host "🚀 Prêt à pousser vers GitHub" -ForegroundColor Green
Write-Host ""
$confirm = Read-Host "Voulez-vous continuer? (o/n)"

if ($confirm -ne "o") {
    Write-Host "❌ Push annulé" -ForegroundColor Red
    exit
}

# 6. Ajouter tous les fichiers
Write-Host ""
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Cyan
git add .

# 7. Créer le commit
Write-Host ""
$commitMessage = Read-Host "Message de commit (ou Entrée pour message par défaut)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: Corrections et optimisations - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "💾 Création du commit..." -ForegroundColor Cyan
git commit -m "$commitMessage"

# 8. Pousser vers GitHub
Write-Host ""
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push réussi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "  1. Vérifier le repository sur GitHub" -ForegroundColor White
    Write-Host "  2. Configurer les variables d'environnement sur Vercel" -ForegroundColor White
    Write-Host "  3. Déployer sur Vercel" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Voir DEPLOYMENT_GUIDE.md pour plus de détails" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du push" -ForegroundColor Red
    Write-Host "   Vérifiez vos credentials GitHub" -ForegroundColor Yellow
}
