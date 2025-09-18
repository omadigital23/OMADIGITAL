@echo off
echo.
echo ========================================
echo   OMA Digital Production Deployment
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Checking environment variables...
echo.

REM Check for required environment variables
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
    echo WARNING: NEXT_PUBLIC_SUPABASE_URL not set
    set /p NEXT_PUBLIC_SUPABASE_URL="Enter Supabase URL: "
)

if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
    echo WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY not set
    set /p NEXT_PUBLIC_SUPABASE_ANON_KEY="Enter Supabase Anon Key: "
)

if "%GOOGLE_AI_API_KEY%"=="" (
    echo WARNING: GOOGLE_AI_API_KEY not set
    set /p GOOGLE_AI_API_KEY="Enter Google AI API Key: "
)

if "%JWT_SECRET%"=="" (
    echo WARNING: JWT_SECRET not set
    set /p JWT_SECRET="Enter JWT Secret (32+ characters): "
)

echo.
echo Environment variables configured
echo.

REM Ask user for deployment type
echo Select deployment type:
echo 1. Full Production Deployment (recommended)
echo 2. Dry Run (test without changes)
echo 3. Production Checklist Only
echo 4. Security Validation Only
echo 5. Performance Testing Only
echo.
set /p choice="Enter your choice (1-5): "

echo.
echo Starting deployment...
echo.

if "%choice%"=="1" (
    echo Running full production deployment...
    node deploy-to-production.js
) else if "%choice%"=="2" (
    echo Running dry run deployment...
    node deploy-to-production.js --dry-run
) else if "%choice%"=="3" (
    echo Running production checklist...
    npm run production:checklist
) else if "%choice%"=="4" (
    echo Running security validation...
    npm run security:validate
) else if "%choice%"=="5" (
    echo Running performance testing...
    npm run performance:test
) else (
    echo Invalid choice. Running full deployment...
    node deploy-to-production.js
)

echo.
if errorlevel 1 (
    echo.
    echo ========================================
    echo   DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Please check the error messages above and:
    echo 1. Fix any configuration issues
    echo 2. Ensure all environment variables are set
    echo 3. Check network connectivity
    echo 4. Review the deployment logs
    echo.
    echo For help, see: PRODUCTION_DEPLOYMENT_GUIDE.md
    echo.
) else (
    echo.
    echo ========================================
    echo   DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Your application is now ready for production!
    echo.
    echo Next steps:
    echo 1. Monitor the application for the first 24 hours
    echo 2. Check monitoring dashboards regularly
    echo 3. Review performance metrics
    echo 4. Validate all functionality works as expected
    echo.
    echo Monitoring endpoints:
    echo - Health Check: /api/health
    echo - Admin Dashboard: /admin
    echo.
)

echo.
pause