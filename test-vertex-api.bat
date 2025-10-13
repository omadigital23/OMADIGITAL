@echo off
setlocal enabledelayedexpansion

:: Test Vertex AI API using curl
:: Make sure to set your actual values below

set PROJECT_ID=your-project-id
set LOCATION=us-central1
set ACCESS_TOKEN=

echo Getting access token...
for /f "delims=" %%a in ('gcloud auth print-access-token') do set ACCESS_TOKEN=%%a

echo Testing Vertex AI Gemini model...
curl ^
  -X POST ^
  -H "Authorization: Bearer %ACCESS_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{"""contents""": [{"""role""": """user""", """parts""": [{"""text""": """Explain how AI works in a few words"""}]}]}" ^
  "https://%LOCATION%-aiplatform.googleapis.com/v1/projects/%PROJECT_ID%/locations/%LOCATION%/publishers/google/models/gemini-1.5-flash:serverStreamingPredict"

pause