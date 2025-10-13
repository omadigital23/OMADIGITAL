$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    message = "Hello, how are you?"
    sessionId = "test-session-123"
} | ConvertTo-Json

try {
    Write-Host "Testing chat API..."
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/chat/gemini" -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}