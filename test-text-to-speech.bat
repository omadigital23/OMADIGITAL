@echo off
setlocal enabledelayedexpansion

:: Test Google Cloud Text-to-Speech API using curl in CMD
:: Make sure to set your actual values below

echo ==========================================
echo Testing Google Cloud Text-to-Speech API
echo ==========================================

set PROJECT_ID=your-project-id
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

:: Create JSON request file
echo Creating request file...
(
echo {
echo   "input": {
echo     "text": "OK, so... tell me about this AI thing."
echo   },
echo   "voice": {
echo     "languageCode": "en-US",
echo     "name": "en-US-Standard-C"
echo   },
echo   "audioConfig": {
echo     "audioEncoding": "LINEAR16"
echo   }
echo }
) > tts-request.json

:: Test Text-to-Speech
echo.
echo Sending request to Text-to-Speech API...
echo.

curl.exe ^
  -X POST ^
  -H "Authorization: Bearer !ACCESS_TOKEN!" ^
  -H "x-goog-user-project: %PROJECT_ID%" ^
  -H "Content-Type: application/json" ^
  -d @tts-request.json ^
  "https://texttospeech.googleapis.com/v1/text:synthesize" ^
  -o tts-response.json

:: Check if response file was created
if not exist tts-response.json (
    echo Error: Failed to get response from Text-to-Speech API
    pause
    exit /b 1
)

echo Response received and saved to tts-response.json
echo.
echo To play the audio, you'll need to:
echo 1. Extract the base64 audio content from tts-response.json
echo 2. Decode it to a WAV file
echo 3. Play it with a media player
echo.
echo For example, in PowerShell you can run:
echo.
echo $json = Get-Content tts-response.json ^| ConvertFrom-Json
echo $bytes = [Convert]::FromBase64String($json.audioContent^)
echo [IO.File]::WriteAllBytes("output.wav", $bytes^)
echo.
echo Or use an online base64 decoder to convert the audioContent value to a WAV file.

:: Cleanup
del tts-request.json

echo.
echo Test completed.
pause