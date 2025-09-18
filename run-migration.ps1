# PowerShell script to run the migration fix
Write-Host "Starting OMA Digital Database Migration Fix" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Change to the project directory
Set-Location "c:\wamp64\www\OMADIGITAL"

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Run the circular reference fix script
Write-Host "Running circular reference fix..." -ForegroundColor Yellow
try {
    npm run fix:circular
    Write-Host "Migration fix completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Migration fix failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Process completed!" -ForegroundColor Green