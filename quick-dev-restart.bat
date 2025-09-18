@echo off
echo 🔧 REDEMARRAGE SERVEUR DEV - OMADIGITAL
echo =====================================

echo 🛑 Arret processus Node existants...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Processus Node arretes
) else (
    echo ℹ️ Aucun processus Node a arreter
)

echo.
echo 🔍 Verification port 3000...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo ⚠️ Port 3000 encore occupe, liberation...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a >nul 2>&1
    )
) else (
    echo ✅ Port 3000 libre
)

echo.
echo 🚀 Demarrage serveur propre...
timeout /t 2 /nobreak >nul
npm run dev

pause