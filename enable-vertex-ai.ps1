# Enable Vertex AI API and set up permissions
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceAccountEmail
)

Write-Host "Enabling Vertex AI API for project omadigital23" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

try {
    # Enable Vertex AI API
    & "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" services enable aiplatform.googleapis.com --project=omadigital23
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully enabled Vertex AI API" -ForegroundColor Green
    } else {
        Write-Host "Failed to enable Vertex AI API" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error enabling Vertex AI API: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Adding IAM policy bindings" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

try {
    # Add Vertex AI User role
    & "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding omadigital23 --member="serviceAccount:$ServiceAccountEmail" --role="roles/aiplatform.user"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully added Vertex AI User role" -ForegroundColor Green
    } else {
        Write-Host "Failed to add Vertex AI User role" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error adding Vertex AI User role: $_" -ForegroundColor Red
    exit 1
}

try {
    # Add Service Account Token Creator role
    & "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding omadigital23 --member="serviceAccount:$ServiceAccountEmail" --role="roles/iam.serviceAccountTokenCreator"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully added Service Account Token Creator role" -ForegroundColor Green
    } else {
        Write-Host "Failed to add Service Account Token Creator role" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error adding Service Account Token Creator role: $_" -ForegroundColor Red
    exit 1
}

try {
    # Add Storage Object Viewer role
    & "C:\Users\fallp\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" projects add-iam-policy-binding omadigital23 --member="serviceAccount:$ServiceAccountEmail" --role="roles/storage.objectViewer"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully added Storage Object Viewer role" -ForegroundColor Green
    } else {
        Write-Host "Failed to add Storage Object Viewer role" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Error adding Storage Object Viewer role: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All commands completed successfully!" -ForegroundColor Green
Write-Host "Please wait 5-10 minutes for the changes to propagate, then test your application." -ForegroundColor Yellow