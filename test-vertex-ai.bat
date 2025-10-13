@echo off
setlocal enabledelayedexpansion

:: Test Vertex AI using curl in CMD

echo ==========================================
echo Testing Vertex AI with curl
echo ==========================================

:: Get access token using gcloud
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

:: Create JSON request file
echo Creating request file...
(
echo {
echo   "contents": [{
echo     "parts": [{
echo       "text": "Explain how AI works in a few words [LANG:EN]"
echo     }]
echo   }],
echo   "generationConfig": {
echo     "temperature": 0.7,
echo     "maxOutputTokens": 1024,
echo     "topP": 0.8,
echo     "topK": 40
echo   }
echo }
) > vertex-request.json

:: Test Vertex AI with Gemini 1.0 Pro model
echo.
echo Sending request to Vertex AI Gemini 1.0 Pro model...
echo.

curl.exe ^
  -X POST ^
  -H "Authorization: Bearer !ACCESS_TOKEN!" ^
  -H "Content-Type: application/json" ^
  -d @vertex-request.json ^
  "https://us-central1-aiplatform.googleapis.com/v1/projects/omadigital23/locations/us-central1/publishers/google/models/gemini-1.0-pro:generateContent" ^
  -o vertex-response.json

:: Check if response file was created
if not exist vertex-response.json (
    echo Error: Failed to get response from Vertex AI
    del vertex-request.json
    pause
    exit /b 1
)

echo Response received and saved to vertex-response.json
echo.
echo To view the response, open vertex-response.json in a text editor
echo.

:: Cleanup
del vertex-request.json

echo.
echo Test completed.
pause