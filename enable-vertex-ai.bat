@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo Enabling Vertex AI API for project omadigital23
echo ==============================================
echo.

REM Check if gcloud is available
where gcloud >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: gcloud command not found in PATH
    echo Please add Google Cloud SDK to your PATH or use the full path to gcloud.cmd
    echo.
    echo Example: "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    exit /b 1
)

REM Enable Vertex AI API
echo Enabling Vertex AI API...
gcloud services enable aiplatform.googleapis.com --project=omadigital23
if %errorlevel% neq 0 (
    echo ERROR: Failed to enable Vertex AI API
    exit /b %errorlevel%
)
echo Successfully enabled Vertex AI API
echo.

echo ==============================================
echo Adding required IAM roles
echo ==============================================
echo.

REM You need to replace YOUR_SERVICE_ACCOUNT_EMAIL with your actual service account email
set SERVICE_ACCOUNT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL

if "%SERVICE_ACCOUNT_EMAIL%"=="YOUR_SERVICE_ACCOUNT_EMAIL" (
    echo ERROR: Please replace YOUR_SERVICE_ACCOUNT_EMAIL with your actual service account email
    echo.
    echo You can find your service account email by running:
    echo gcloud auth list
    echo.
    exit /b 1
)

echo Adding Vertex AI User role...
gcloud projects add-iam-policy-binding omadigital23 --member="serviceAccount:%SERVICE_ACCOUNT_EMAIL%" --role="roles/aiplatform.user"
if %errorlevel% neq 0 (
    echo ERROR: Failed to add Vertex AI User role
    exit /b %errorlevel%
)
echo Successfully added Vertex AI User role
echo.

echo Adding Service Account Token Creator role...
gcloud projects add-iam-policy-binding omadigital23 --member="serviceAccount:%SERVICE_ACCOUNT_EMAIL%" --role="roles/iam.serviceAccountTokenCreator"
if %errorlevel% neq 0 (
    echo ERROR: Failed to add Service Account Token Creator role
    exit /b %errorlevel%
)
echo Successfully added Service Account Token Creator role
echo.

echo Adding Storage Object Viewer role...
gcloud projects add-iam-policy-binding omadigital23 --member="serviceAccount:%SERVICE_ACCOUNT_EMAIL%" --role="roles/storage.objectViewer"
if %errorlevel% neq 0 (
    echo WARNING: Failed to add Storage Object Viewer role (this role is optional)
) else (
    echo Successfully added Storage Object Viewer role
)
echo.

echo ==============================================
echo Setup completed successfully!
echo ==============================================
echo.
echo Next steps:
echo 1. Go to Google Cloud Console Model Garden to enable models
echo 2. Wait 5-10 minutes for changes to propagate
echo 3. Test your application
echo.