@echo off
echo 🚀 Démarrage du serveur de développement pour tester les traductions...
echo.
echo 📝 Instructions:
echo 1. Le serveur va démarrer sur http://localhost:3000
echo 2. Visitez http://localhost:3000/test-translations pour tester toutes les traductions
echo 3. Utilisez le sélecteur de langue pour basculer entre FR et EN
echo 4. Vérifiez que toutes les sections sont traduites correctement
echo.
echo ⏳ Démarrage en cours...
echo.

cd /d "%~dp0.."
npm run dev