# Check available Vertex AI models
Write-Host "Checking available models in project omadigital23" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$PROJECT = "omadigital23"
$LOCATION = "us-central1"

Write-Host "Getting access token..." -ForegroundColor Yellow
try {
    $TOKEN = & "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" auth print-access-token
    Write-Host "Successfully obtained access token" -ForegroundColor Green
} catch {
    Write-Host "Error getting access token: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Listing publisher models..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://$LOCATION-aiplatform.googleapis.com/v1/projects/$PROJECT/locations/$LOCATION/publishers/google/models" -Headers @{ "Authorization" = "Bearer $TOKEN" }
    
    if ($response.models) {
        Write-Host "Found $($response.models.Count) models:" -ForegroundColor Green
        $response.models | ForEach-Object {
            Write-Host "  - $($_.name)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "No models found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error listing models: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green