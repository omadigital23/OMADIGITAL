# Script PowerShell pour redémarrer le serveur de développement
Write-Host "🔧 REDEMARRAGE SERVEUR DEV - OMADIGITAL" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Arrêt des processus Node
Write-Host "🛑 Arrêt des processus Node existants..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe /T 2>$null
    Write-Host "✅ Processus Node arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun processus Node à arrêter" -ForegroundColor Gray
}

# Vérification port 3000
Write-Host ""
Write-Host "🔍 Vérification du port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3000
if ($portCheck) {
    Write-Host "⚠️ Port 3000 occupé, libération..." -ForegroundColor Yellow
    $pids = ($portCheck | ForEach-Object { ($_ -split '\s+')[-1] }) | Sort-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne "0") {
            taskkill /F /PID $pid 2>$null
        }
    }
    Write-Host "✅ Port 3000 libéré" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 libre" -ForegroundColor Green
}

# Attente
Write-Host ""
Write-Host "⏳ Attente 3 secondes..." -ForegroundColor Gray
Start-Sleep 3

# Redémarrage
Write-Host "🚀 Démarrage du serveur de développement..." -ForegroundColor Green
Write-Host ""
npm run dev