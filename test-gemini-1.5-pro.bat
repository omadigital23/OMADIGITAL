@echo off
setlocal enabledelayedexpansion

:: Test Vertex AI Gemini 1.5 Pro using curl
:: Make sure to set your actual values below

echo ==========================================
echo Testing Vertex AI Gemini 1.5 Pro (gemini-1.5-pro-002)
echo ==========================================

set PROJECT_ID=your-project-id
set LOCATION=us-central1
set MODEL_ID=gemini-1.5-pro-002
set ACCESS_TOKEN=

:: Get access token
echo Getting access token...
for /f "delims=" %%a in ('gcloud auth print-access-token') do set ACCESS_TOKEN=%%a

:: Check if we got an access token
if "!ACCESS_TOKEN!"=="" (
    echo Error: Failed to get access token
    echo Please make sure you are authenticated with gcloud
    pause
    exit /b 1
)

echo Access token obtained successfully!

:: Test the model
echo.
echo Sending request to Gemini 1.5 Pro...
echo.

curl ^
  -X POST ^
  -H "Authorization: Bearer !ACCESS_TOKEN!" ^
  -H "Content-Type: application/json" ^
  "https://!LOCATION!-aiplatform.googleapis.com/v1/projects/!PROJECT_ID!/locations/!LOCATION!/publishers/google/models/!MODEL_ID!:streamGenerateContent" ^
  -d "{"""contents""": [{"""role""": """user""", """parts""": [{"""text""": """Explain how AI works in a few words"""}]}]}"

echo.
echo.
echo Test completed.
pause