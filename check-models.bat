@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo Checking available Vertex AI models
echo ==============================================
echo.

set PROJECT=omadigital23
set LOCATION=us-central1

REM Check if gcloud is available
where gcloud >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: gcloud command not found in PATH
    echo Please add Google Cloud SDK to your PATH or use the full path to gcloud.cmd
    echo.
    echo Example: "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    exit /b 1
)

REM Get access token
echo Getting access token...
for /f "tokens=*" %%i in ('gcloud auth print-access-token') do set TOKEN=%%i

if "%TOKEN%"=="" (
    echo ERROR: Failed to get access token
    exit /b 1
)

echo Successfully obtained access token
echo.

REM List available models
echo Listing publisher models...
echo.
curl -s -H "Authorization: Bearer %TOKEN%" "https://%LOCATION%-aiplatform.googleapis.com/v1/projects/%PROJECT%/locations/%LOCATION%/publishers/google/models" | findstr "name\|displayName"
echo.

echo Done.
echo.